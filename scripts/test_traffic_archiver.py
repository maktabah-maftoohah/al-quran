#!/usr/bin/env python3
"""
Test Suite: GitHub Pages Traffic Archiver Merging Logic
"""

import sys
from pathlib import Path

# Add root directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from archive_traffic import merge_views, merge_referrers

passes = 0
fails = 0


def assert_test(cond, msg):
    global passes, fails
    if cond:
        print(f"  [PASS] {msg}")
        passes += 1
    else:
        print(f"  [FAIL] {msg}", file=sys.stderr)
        fails += 1


print("--- TEST 1: Historical Traffic Merging ---")
existing = {
    "daily": [
        {"date": "2026-10-20", "views": 10, "uniques": 4},
        {"date": "2026-10-21", "views": 20, "uniques": 8},
        {"date": "2026-10-22", "views": 15, "uniques": 5},  # Will be updated by new fetch
    ]
}

api_incoming = {
    "count": 45,
    "uniques": 18,
    "views": [
        # Updated counts for 2026-10-22
        {"timestamp": "2026-10-22T00:00:00Z", "count": 25, "uniques": 9},
        # New date 2026-10-23
        {"timestamp": "2026-10-23T00:00:00Z", "count": 30, "uniques": 12},
    ],
}

res = merge_views(existing, api_incoming)

assert_test(len(res["daily"]) == 4, "Total merged days is 4")
assert_test(res["daily"][2]["views"] == 25, "Date 2026-10-22 updated with newer count (25)")
assert_test(res["daily"][3]["date"] == "2026-10-23", "New date 2026-10-23 appended")
assert_test(res["lifetimeStats"]["totalViews"] == 85, "Total lifetime views accurately summed (10+20+25+30 = 85)")
assert_test(res["lifetimeStats"]["daysTracked"] == 4, "Days tracked count is 4")

print("\n--- TEST 2: Referrers Merging ---")
existing_refs = [
    {"referrer": "Google", "count": 50, "uniques": 20},
    {"referrer": "Facebook", "count": 10, "uniques": 4},
]
api_refs = [
    {"referrer": "Google", "count": 65, "uniques": 25},
    {"referrer": "Twitter", "count": 8, "uniques": 3},
]
merged_refs = merge_referrers(existing_refs, api_refs)

assert_test(len(merged_refs) == 3, "Total referrers is 3")
assert_test(merged_refs[0]["referrer"] == "Google" and merged_refs[0]["count"] == 65, "Google count updated to 65")
assert_test(any(r["referrer"] == "Twitter" for r in merged_refs), "Twitter added as new referrer")

print(f"\nTOTAL: {passes + fails}, PASSED: {passes}, FAILED: {fails}")
if fails > 0:
    sys.exit(1)
