# Rate limits, headers &amp; caching

The Sites.Reviews Public API is free and unauthenticated, so it's protected by a simple
**per-IP rate limit** plus generous caching. Designing around both keeps your integration fast
and well-behaved.

## The limit

- **60 requests per minute, per IP address.**
- Applies across all four endpoints combined (`/check`, `/business`, `/reviews`, `/search`).
- No API keys or higher tiers today — the limit is the same for everyone.

## Rate-limit headers

Every response includes:

| Header | Example | Meaning |
| --- | --- | --- |
| `X-RateLimit-Limit` | `60` | Requests allowed per minute. |
| `X-RateLimit-Remaining` | `59` | Requests left in the current window. |

```bash
curl -sD - -o /dev/null "https://sites.reviews/api/public/v1/check?domain=1ps.ru" \
  | grep -i x-ratelimit
# x-ratelimit-limit: 60
# x-ratelimit-remaining: 59
```

## When you exceed it

Requests over the limit get **HTTP 429 Too Many Requests**. Back off and retry after a short
delay (the window is per minute, so waiting a few seconds to ~60s is enough). A simple,
respectful retry:

```js
async function getWithBackoff(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    if (res.status !== 429) return res;
    const wait = Math.min(2 ** i, 30) * 1000; // 1s, 2s, 4s, 8s …
    await new Promise((r) => setTimeout(r, wait));
  }
  throw new Error('Rate limited: giving up after retries');
}
```

## Caching

Successful `200` responses are sent with:

```
Cache-Control: public, max-age=300, s-maxage=300
```

That means responses are cacheable for **5 minutes** by both browsers and shared caches/CDNs.
Lean on it:

- **In the browser**, the platform cache handles repeat `fetch`es automatically.
- **On a server**, cache responses for up to 5 minutes (in-memory, Redis, or a CDN in front)
  instead of re-requesting. Trust data changes slowly; 5-minute staleness is fine for almost
  every use case.
- Caching is the easiest way to stay far under 60 req/min even under load.

## CORS

All endpoints send `Access-Control-Allow-Origin: *` and allow `GET, OPTIONS`, so you can call
the API directly from front-end JavaScript without a proxy. Preflight (`OPTIONS`) is supported.

## Etiquette

- Send a regular browser `User-Agent`. Some bare client UAs (e.g. `python-urllib`) are
  challenged at the edge and may receive `403`.
- Don't poll in a tight loop — cache, and only refetch when you actually need fresh data.
- For high-volume or agent use cases, prefer the
  [MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp), which wraps these
  endpoints with sensible defaults.
