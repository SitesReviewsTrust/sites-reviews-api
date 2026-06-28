#!/usr/bin/env python3
"""
check.py — look up a domain's trust score and top reviews on the
           Sites.Reviews Public API (https://sites.reviews/api/public/v1).

Usage:
    python3 check.py <domain>
    python3 check.py 1ps.ru

Standard library only (urllib + json). No dependencies, no API key —
the API is public and read-only.
"""

import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://sites.reviews/api/public/v1"

# Send a browser-like User-Agent: the default "Python-urllib" UA is blocked at the edge.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


def get_json(path):
    """GET {API}{path} and return (status, parsed_json)."""
    url = f"{API}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        # 404 / 422 carry a useful JSON body too.
        return err.code, json.loads(err.read().decode("utf-8"))


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print("Usage: python3 check.py <domain>   e.g. python3 check.py 1ps.ru", file=sys.stderr)
        sys.exit(1)

    # Normalize: strip scheme / path, lowercase.
    domain = re.sub(r"^https?://", "", sys.argv[1].strip())
    domain = domain.split("/")[0].lower()

    # 1) Quick trust-score check.
    _, check = get_json(f"/check?domain={urllib.parse.quote(domain)}")

    if check.get("found") is False:
        print(f'"{domain}" is not in the Sites.Reviews catalog yet.')
        print(f"Submit it: {check['submit_url']}")
        return

    print(f"Business     : {check['name']}")
    print(f"Website      : {check['website']}")
    print(f"Trust score  : {check['trust_score']}/10  ({check['avg_ratings']}/5 avg)")
    print(f"Reviews      : {check['total_reviews']}")
    print(f"Verified     : {'yes' if check['is_verified'] else 'no'}")
    print(f"Sites.Reviews: {check['url']}")

    # 2) Top reviews.
    _, reviews = get_json(f"/reviews/{urllib.parse.quote(domain)}?per_page=3")

    print("\nTop reviews:")
    for r in reviews.get("reviews", []):
        print(f"  [{r['stars']}*] {r.get('title') or '(no title)'}")
        text = " ".join((r.get("body_en") or r.get("body") or "").split())
        if len(text) > 160:
            text = text[:157] + "..."
        if text:
            print(f"        {text}")


if __name__ == "__main__":
    main()
