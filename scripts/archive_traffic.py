#!/usr/bin/env python3
"""
Maktabah Maftoohah Al-Quran - GitHub Pages Traffic Archiver (archive_traffic.py)
Automated zero-tracking traffic archiver that queries GitHub's Traffic API and
preserves lifetime visitor stats beyond GitHub's default 14-day limit.
Strictly UTF-8 without BOM, zero external dependencies.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
TRAFFIC_DIR = ROOT_DIR / "data" / "traffic"


def fetch_github_api(endpoint: str, token: str):
    """Fetches a JSON payload from the GitHub REST API using urllib."""
    url = f"https://api.github.com{endpoint}"
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Maktabah-Traffic-Archiver",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[WARN] HTTP {e.code} error fetching {endpoint}: {e.reason}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[WARN] Failed to fetch {endpoint}: {e}", file=sys.stderr)
        return None


def merge_views(existing_data: dict, api_views: dict) -> dict:
    """Merges newly fetched 14-day traffic views with historical daily records."""
    history = {}
    for entry in existing_data.get("daily", []):
        d = entry.get("date")
        if d:
            history[d] = {
                "date": d,
                "views": entry.get("views", 0),
                "uniques": entry.get("uniques", 0),
            }

    # Merge in new daily records from GitHub Traffic API
    for view in api_views.get("views", []):
        ts = view.get("timestamp", "")
        if not ts:
            continue
        date_str = ts[:10]  # Format: YYYY-MM-DD
        views_count = view.get("count", 0)
        uniques_count = view.get("uniques", 0)

        # Update or record
        history[date_str] = {
            "date": date_str,
            "views": views_count,
            "uniques": uniques_count,
        }

    # Sort chronological
    sorted_daily = [history[d] for d in sorted(history.keys())]

    total_views = sum(item["views"] for item in sorted_daily)
    total_uniques = sum(item["uniques"] for item in sorted_daily)

    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "lifetimeStats": {
            "totalViews": total_views,
            "totalUniques": total_uniques,
            "daysTracked": len(sorted_daily),
        },
        "latest14Days": {
            "views": api_views.get("count", 0),
            "uniques": api_views.get("uniques", 0),
        },
        "daily": sorted_daily,
    }


def merge_referrers(existing_referrers: list, api_referrers: list) -> list:
    """Merges top referral sources."""
    ref_map = {}
    for r in existing_referrers:
        name = r.get("referrer")
        if name:
            ref_map[name] = {"referrer": name, "count": r.get("count", 0), "uniques": r.get("uniques", 0)}

    for r in api_referrers:
        name = r.get("referrer")
        if not name:
            continue
        current = ref_map.get(name, {"referrer": name, "count": 0, "uniques": 0})
        # Keep maximum observed or add
        current["count"] = max(current["count"], r.get("count", 0))
        current["uniques"] = max(current["uniques"], r.get("uniques", 0))
        ref_map[name] = current

    return sorted(ref_map.values(), key=lambda x: x["count"], reverse=True)


def main():
    token = os.environ.get("TRAFFIC_TOKEN") or os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY") or "maktabah-maftoohah/al-quran"

    TRAFFIC_DIR.mkdir(parents=True, exist_ok=True)
    views_file = TRAFFIC_DIR / "views.json"
    referrers_file = TRAFFIC_DIR / "referrers.json"

    # Load existing history if present
    existing_views = {}
    if views_file.exists():
        try:
            with open(views_file, "r", encoding="utf-8") as f:
                existing_views = json.load(f)
        except Exception:
            existing_views = {}

    existing_referrers = []
    if referrers_file.exists():
        try:
            with open(referrers_file, "r", encoding="utf-8") as f:
                existing_referrers = json.load(f)
        except Exception:
            existing_referrers = []

    if not token:
        print("[INFO] No GITHUB_TOKEN or TRAFFIC_TOKEN detected.")
        print("[INFO] If running locally, you can pass GITHUB_TOKEN to fetch live traffic.")
        if not views_file.exists():
            # Create starter seed file
            starter = {
                "updatedAt": datetime.now(timezone.utc).isoformat(),
                "lifetimeStats": {"totalViews": 0, "totalUniques": 0, "daysTracked": 0},
                "latest14Days": {"views": 0, "uniques": 0},
                "daily": [],
            }
            with open(views_file, "w", encoding="utf-8") as f:
                json.dump(starter, f, ensure_ascii=False, indent=2)
            print(f"[OK] Initialized empty archive: {views_file}")
        return 0

    print(f"[INFO] Fetching traffic metrics for repository: {repo}...")
    api_views = fetch_github_api(f"/repos/{repo}/traffic/views", token)
    api_referrers = fetch_github_api(f"/repos/{repo}/traffic/popular/referrers", token) or []

    if not api_views:
        print("[WARN] Traffic views API did not return data. Check token permissions.")
        return 0

    merged_views = merge_views(existing_views, api_views)
    merged_refs = merge_referrers(existing_referrers, api_referrers)

    with open(views_file, "w", encoding="utf-8") as f:
        json.dump(merged_views, f, ensure_ascii=False, indent=2)
    print(f"[OK] Updated {views_file} ({merged_views['lifetimeStats']['daysTracked']} days tracked)")

    if merged_refs:
        with open(referrers_file, "w", encoding="utf-8") as f:
            json.dump(merged_refs, f, ensure_ascii=False, indent=2)
        print(f"[OK] Updated {referrers_file} ({len(merged_refs)} referrers tracked)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
