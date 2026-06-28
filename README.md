<div align="center">

# Sites.Reviews — API &amp; Widgets

**Free, public, read-only JSON API for trust scores, business profiles and reviews from [sites.reviews](https://sites.reviews). Plus the embeddable reviews widget.**

[![API: Live](https://img.shields.io/badge/API-Live-brightgreen.svg)](https://sites.reviews/api/public/v1/check?domain=1ps.ru)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539.svg)](./openapi.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![No auth](https://img.shields.io/badge/Auth-none-blue.svg)](#authentication-cors--rate-limits)

</div>

---

## What is this?

The **Sites.Reviews Public API** lets any app, script or AI assistant read trust data from
[sites.reviews](https://sites.reviews) — a directory of businesses with crowd-sourced reviews
and a 0–10 **trust score** for each domain.

It's **live**, **free**, **read-only** and needs **no API key**. Point it at any domain and you
get back the trust score, an AI-written summary, and the underlying reviews.

- **Base URL:** `https://sites.reviews/api/public/v1`
- **Auth:** none · **Methods:** `GET` · **Format:** UTF-8 JSON · **CORS:** `*`
- **Rate limit:** 60 requests / minute / IP · **Cache:** `public, max-age=300`
- **Spec:** [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.1, validated) · **Reference:** [`docs/api-reference.md`](./docs/api-reference.md)

> `{domain}` is always the business website host, **lowercased**, with no scheme or path —
> e.g. `1ps.ru`, `ozon.ru`. `trust_score` is the 0–5 `avg_ratings` rescaled to **0–10**
> (`avg_ratings * 2`).

---

## Quickstart

Check the trust score for `1ps.ru` in your language of choice. No key, no signup.

### curl

```bash
curl -s "https://sites.reviews/api/public/v1/check?domain=1ps.ru"
```

```json
{
  "id": 1841,
  "name": "Продвижение сайтов от 1PS.RU",
  "slug": "1ps.ru",
  "website": "https://1ps.ru",
  "trust_score": 9.6,
  "avg_ratings": 4.8,
  "total_reviews": 34,
  "is_verified": false,
  "url": "https://sites.reviews/businesses/1ps.ru",
  "logo": null
}
```

### JavaScript (fetch)

Works in the browser (CORS is open) and in Node 18+.

```js
const BASE = 'https://sites.reviews/api/public/v1';

async function checkDomain(domain) {
  const res = await fetch(`${BASE}/check?domain=${encodeURIComponent(domain)}`);
  const data = await res.json();
  if (data.found === false) return `${domain} is not indexed yet — submit: ${data.submit_url}`;
  return `${data.name}: trust ${data.trust_score}/10 from ${data.total_reviews} reviews`;
}

checkDomain('1ps.ru').then(console.log);
// → Продвижение сайтов от 1PS.RU: trust 9.6/10 from 34 reviews
```

### Python (requests)

```python
import requests

BASE = "https://sites.reviews/api/public/v1"

def check_domain(domain: str) -> str:
    data = requests.get(f"{BASE}/check", params={"domain": domain}, timeout=15).json()
    if data.get("found") is False:
        return f"{domain} is not indexed yet — submit: {data['submit_url']}"
    return f"{data['name']}: trust {data['trust_score']}/10 from {data['total_reviews']} reviews"

print(check_domain("1ps.ru"))
# → Продвижение сайтов от 1PS.RU: trust 9.6/10 from 34 reviews
```

> **Tip:** if you call the API from a server-side script, send a regular browser `User-Agent`
> header. Some bare client UAs (e.g. `python-urllib`) are challenged at the edge.
> The runnable [`examples/`](./examples) already do this.

---

## Endpoints

| Method &amp; path | Purpose | Not-found behaviour |
| --- | --- | --- |
| `GET /check?domain={domain}` | Trust score + summary for a domain | **200** with `{ "found": false, … }` |
| `GET /business/{domain}` | Full profile (descriptions, AI summary, category) | **404** `{ "error": "not_found" }` |
| `GET /reviews/{domain}?page=&per_page=` | Paginated reviews (`per_page` ≤ 50) | **404** `{ "error": "not_found" }` |
| `GET /search?q={q}&limit=` | Search catalog by name/domain (`q` ≥ 3 chars, `limit` ≤ 50) | **200** with empty `results` |

Full request/response details, every field and error code: **[`docs/api-reference.md`](./docs/api-reference.md)**.
Machine-readable contract: **[`openapi.yaml`](./openapi.yaml)**.

### Runnable examples

Each takes a domain argument, calls the live API and prints the trust score + top reviews:

```bash
./examples/check.sh 1ps.ru       # curl + python3
node examples/check.mjs 1ps.ru   # Node 18+, no dependencies
python3 examples/check.py 1ps.ru # Python 3, standard library only
```

---

## Authentication, CORS &amp; rate limits

- **Authentication:** none. Every endpoint is public and read-only. There are no keys, tokens
  or signup.
- **CORS:** all responses send `Access-Control-Allow-Origin: *` (methods `GET, OPTIONS`), so
  you can call the API directly from front-end JavaScript.
- **Rate limit:** **60 requests per minute per IP.** Responses carry `X-RateLimit-Limit` and
  `X-RateLimit-Remaining`; exceeding the limit returns **HTTP 429**.
- **Caching:** successful `200` responses are sent with `Cache-Control: public, max-age=300`
  (5 minutes). Cache aggressively — it keeps you well under the rate limit.

Details and best practices: **[`docs/rate-limits.md`](./docs/rate-limits.md)**.

---

## 🧠 Use it from an AI assistant → MCP server

Building on Claude or another assistant? The **[Sites.Reviews MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp)**
wraps this API as ready-made [Model Context Protocol](https://modelcontextprotocol.io) tools —
your assistant can check a domain's trust score or pull its reviews without you writing any
HTTP code. It's the fastest path to "is this site legit?" inside an agent.

---

## 🧩 Embeddable reviews widget (Beta)

Host page-level reviews and threaded comments on your own site with a `<script>` loader and a
`<sr-reviews>` web component:

```html
<!-- 1) Load the widget runtime once per page -->
<script src="https://sites.reviews/widget/embed.js" async></script>

<!-- 2) Drop the component wherever reviews should render -->
<sr-reviews
  data-site="example.com"
  data-subject="/products/widget-42"
  data-mode="reviews"
  data-theme="auto"
  data-lang="en">
</sr-reviews>
```

> **🟠 Beta — the widget backend is still rolling out.** The embed contract may change, and the
> component requires the Sites.Reviews beta backend to be enabled for your `data-site`; until
> then it renders nothing. The **read API above is live/GA**; only the widget is in beta.

Full guide: **[`docs/widget.md`](./docs/widget.md)** · copy-paste starter: [`examples/embed.html`](./examples/embed.html).

---

## Structured data (JSON-LD) alternative

Every business page at `https://sites.reviews/businesses/{domain}` also embeds schema.org
JSON-LD (`Organization` + `aggregateRating` + `review[]`). The JSON API above is the
recommended path, but the JSON-LD is handy if you're already scraping pages for SEO data.
See **[`docs/structured-data.md`](./docs/structured-data.md)** and [`examples/read-business.mjs`](./examples/read-business.mjs).

---

## Repository layout

```
.
├── openapi.yaml              # OpenAPI 3.1 contract for the live API (validated)
├── README.md
├── CHANGELOG.md
├── docs/
│   ├── api-reference.md      # Per-endpoint reference with examples
│   ├── rate-limits.md        # Limits, headers, caching, backoff
│   ├── widget.md             # Embeddable widget (Beta)
│   ├── structured-data.md    # JSON-LD alternative
│   └── roadmap.md            # What's live + what's next
├── examples/
│   ├── check.sh              # curl + python3
│   ├── check.mjs             # Node 18+, no deps
│   ├── check.py              # Python 3 stdlib
│   ├── read-business.mjs     # JSON-LD reader
│   └── embed.html            # Widget embed (Beta)
└── .github/                  # CI, issue/PR templates
```

---

## Contributing &amp; support

- 🐛 Found a bug or wrong field? Open an [issue](https://github.com/SitesReviewsTrust/sites-reviews-api/issues).
- 🤝 Want to contribute? See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
- 🔒 Security issue? Please follow [`SECURITY.md`](./SECURITY.md) (private vulnerability reporting).

---

## 🔗 Sites.Reviews ecosystem
- 🌐 **Website** — https://sites.reviews
- 🔍 **Trust score / scam-check** — search any domain on [sites.reviews](https://sites.reviews)
- 🤖 **Telegram bot** — [@SitesReviews_bot](https://t.me/SitesReviews_bot)
- 🧩 **Browser extension** — [sites.reviews/extension](https://sites.reviews/extension) · [repo](https://github.com/SitesReviewsTrust/sites-reviews-extension)
- 📚 **Docs** — [sites-reviews-docs](https://github.com/SitesReviewsTrust/sites-reviews-docs)
- 🔌 **API & widgets** — [sites-reviews-api](https://github.com/SitesReviewsTrust/sites-reviews-api)
- 🧠 **MCP server** — [sites-reviews-mcp](https://github.com/SitesReviewsTrust/sites-reviews-mcp)
- 🏛 **All repositories** — https://github.com/orgs/SitesReviewsTrust/repositories

## License

[MIT](./LICENSE) © 2026 Sites.Reviews
