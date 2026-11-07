#!/usr/bin/env python3
"""
scripts/serve.py
Local Development Web Server for Maktabah Maftoohah Al-Quran.
Runs a zero-dependency HTTP server with no-cache headers and automatically launches the browser.
"""

import argparse
import http.server
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent


class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with no-cache headers for smooth local development."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        # Extract relative path without query or hash
        req_path = self.path.split("?")[0].split("#")[0].strip("/")
        if req_path.startswith("al-quran"):
            req_path = req_path[len("al-quran"):].strip("/")

        file_path = ROOT_DIR / req_path if req_path else ROOT_DIR / "index.html"
        if not file_path.exists() and (ROOT_DIR / "404.html").exists():
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write((ROOT_DIR / "404.html").read_bytes())
            return

        super().do_GET()

    def log_message(self, fmt, *args):
        # Format clean, readable access logs
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]} -> {args[2]}\n")


def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> int:
    """Find the first available port starting from start_port."""
    for p in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:
                return p
    return start_port


def main():
    parser = argparse.ArgumentParser(description="Serve Maktabah Maftoohah Al-Quran locally")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    args = parser.parse_args()

    port = find_available_port(args.port)
    url = f"http://localhost:{port}/index.html"

    print("\n" + "=" * 65)
    print("   Maktabah Maftoohah - Al-Quran Local Development Server")
    print("=" * 65)
    print(f" Serving root    : {ROOT_DIR}")
    print(f" Web Application : {url}")
    print(" Press Ctrl+C in this terminal to stop the server.")
    print("=" * 65 + "\n")

    if not args.no_browser:

        def open_browser():
            time.sleep(0.6)
            print(f"Opening default browser to {url} ...\n")
            webbrowser.open(url)

        threading.Thread(target=open_browser, daemon=True).start()

    class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True

    try:
        with ThreadedTCPServer(("", port), NoCacheHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully.")
        sys.exit(0)


if __name__ == "__main__":
    main()
