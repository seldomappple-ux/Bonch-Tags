#!/usr/bin/env python3
"""Encode a Bonch Tags AI sheet payload and open it directly in Bonch Tags."""

import argparse
import base64
import json
import os
import socket
import subprocess
import sys
import time
import webbrowser

LOCAL_URL = "http://127.0.0.1:5178/"
WEB_URL = "https://seldomappple-ux.github.io/Bonch-Tags/"


def is_port_open(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=0.3):
            return True
    except OSError:
        return False


def ensure_local_server() -> None:
    if is_port_open("127.0.0.1", 5178):
        return
    # Locate repo root scripts/start-bonch-tags.ps1 relative to this script if present
    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(here, "..", "..", "..", "scripts", "start-bonch-tags.ps1")),
        r"D:\Code\VS Code\Bonch Tags\scripts\start-bonch-tags.ps1",
    ]
    for ps_path in candidates:
        if os.path.exists(ps_path):
            subprocess.Popen(
                ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", ps_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            for _ in range(25):
                time.sleep(0.25)
                if is_port_open("127.0.0.1", 5178):
                    return
            break


def main() -> None:
    parser = argparse.ArgumentParser(description="Load a JSON label sheet directly into Bonch Tags.")
    parser.add_argument("--json", dest="json_str", help="Inline JSON payload string")
    parser.add_argument("--file", dest="json_file", help="Path to a JSON payload file")
    parser.add_argument("--web", action="store_true", help="Open on GitHub Pages instead of localhost")
    parser.add_argument("--base-url", dest="base_url", help="Override target Bonch Tags base URL")
    parser.add_argument("--no-open", action="store_true", help="Only print the import URL without opening browser")
    args = parser.parse_args()

    if args.json_str:
        raw = args.json_str
    elif args.json_file:
        with open(args.json_file, "r", encoding="utf-8") as f:
            raw = f.read()
    else:
        raw = sys.stdin.read()

    payload = json.loads(raw)
    if not isinstance(payload, dict) or not isinstance(payload.get("items"), list):
        raise SystemExit("Error: JSON payload must be an object containing an 'items' array.")

    compact = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    b64 = base64.urlsafe_b64encode(compact).decode("ascii").rstrip("=")

    base = args.base_url or (WEB_URL if args.web else LOCAL_URL)
    if not base.endswith("/"):
        base += "/"
    url = f"{base}#import={b64}"

    if not args.web and not args.base_url and not args.no_open:
        ensure_local_server()

    print(url)
    if not args.no_open:
        webbrowser.open(url)


if __name__ == "__main__":
    main()
