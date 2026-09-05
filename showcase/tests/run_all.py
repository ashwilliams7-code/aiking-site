#!/usr/bin/env python3
"""Canonical self-hosted ARA QA gate; no pre-existing server is trusted or stopped."""
import functools
import http.server
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = Path(os.environ.get("ARA_QA_OUTPUT", "/tmp/ara-multisuite-qa"))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def main():
    if set(sys.argv[1:]) - {"landing", "product", "extension"}:
        raise SystemExit("Valid optional lanes: landing product extension; default runs all.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}/showcase"
    results = []
    try:
        assert urllib.request.urlopen(base + "/suite-registry.json", timeout=5).status == 200
        for script, variable, lane in (
            ("qa_showcase.py", "ARA_SHOWCASE_QA_OUTPUT", "landing"),
            ("qa_product.py", "ARA_PRODUCT_QA_OUTPUT", "product"),
            ("qa_extension.py", "ARA_EXTENSION_QA_OUTPUT", "extension"),
        ):
            if len(sys.argv) > 1 and lane not in sys.argv[1:]:
                continue
            env = dict(os.environ, ARA_SHOWCASE_URL=base)
            env[variable] = str(OUTPUT / lane)
            completed = subprocess.run([sys.executable, str(Path(__file__).parent / script)], cwd=ROOT, env=env, capture_output=True, text=True)
            (OUTPUT / f"{lane}.log").write_text(completed.stdout + completed.stderr)
            print(lane, "PASS" if completed.returncode == 0 else "FAIL", flush=True)
            print((completed.stdout + completed.stderr)[-2500:], flush=True)
            results.append({"lane": lane, "exitCode": completed.returncode})
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    (OUTPUT / "gate.json").write_text(json.dumps(results, indent=2))
    return int(any(result["exitCode"] for result in results))

if __name__ == "__main__":
    raise SystemExit(main())
