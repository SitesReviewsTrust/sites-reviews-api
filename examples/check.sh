#!/usr/bin/env bash
#
# check.sh — look up a domain's trust score and top reviews on the
#            Sites.Reviews Public API (https://sites.reviews/api/public/v1).
#
# Usage:
#   ./check.sh <domain>
#   ./check.sh 1ps.ru
#
# Requires: curl, and python3 (only for parsing/formatting JSON).
# No API key needed — the API is public and read-only.

set -euo pipefail

API="https://sites.reviews/api/public/v1"
# Send a browser-like User-Agent: bare client UAs can be challenged at the edge.
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <domain>   e.g. $0 1ps.ru" >&2
  exit 1
fi

# Normalize: strip scheme / path, lowercase.
DOMAIN="$(printf '%s' "$DOMAIN" | sed -E 's#^https?://##; s#/.*$##' | tr '[:upper:]' '[:lower:]')"

# 1) Quick trust-score check.
CHECK="$(curl -fsS -A "$UA" "$API/check?domain=$DOMAIN")"

# 2) Reviews (only fetched/printed if the business exists).
REVIEWS="$(curl -fsS -A "$UA" "$API/reviews/$DOMAIN?per_page=3" 2>/dev/null || true)"

# Format everything with one python3 pass. JSON is passed via the environment
# (not stdin) so it can't collide with anything.
CHECK="$CHECK" REVIEWS="$REVIEWS" DOMAIN="$DOMAIN" python3 <<'PY'
import json, os

check = json.loads(os.environ["CHECK"])
domain = os.environ["DOMAIN"]

if check.get("found") is False:
    print(f'"{domain}" is not in the Sites.Reviews catalog yet.')
    print(f"Submit it: {check['submit_url']}")
    raise SystemExit(0)

print(f"Business     : {check['name']}")
print(f"Website      : {check['website']}")
print(f"Trust score  : {check['trust_score']}/10  ({check['avg_ratings']}/5 avg)")
print(f"Reviews      : {check['total_reviews']}")
print(f"Verified     : {'yes' if check['is_verified'] else 'no'}")
print(f"Sites.Reviews: {check['url']}")

try:
    reviews = json.loads(os.environ.get("REVIEWS") or "{}").get("reviews", [])
except json.JSONDecodeError:
    reviews = []

print("\nTop reviews:")
for r in reviews:
    print(f"  [{r['stars']}*] {r.get('title') or '(no title)'}")
    body = " ".join((r.get("body_en") or r.get("body") or "").split())
    if len(body) > 160:
        body = body[:157] + "..."
    if body:
        print(f"        {body}")
PY
