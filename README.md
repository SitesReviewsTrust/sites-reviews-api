<div align="center">

# Sites.Reviews — API &amp; Widgets

**Programmatic access to Sites.Reviews trust data, plus the embeddable reviews widget.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Status: Beta](https://img.shields.io/badge/Status-Beta-orange.svg)](#-on-the-roadmap)
[![Data: schema.org JSON-LD](https://img.shields.io/badge/Data-schema.org%20JSON--LD-blue.svg)](./docs/structured-data.md)

</div>

---

> **Honesty note.** This repo documents what is *actually* available today. There is currently **no public JSON REST API** on `sites.reviews` — the `/api/*` paths return 404 and the Telegram-facing API is auth-gated. The supported, public way to read review data right now is the **schema.org structured data (JSON-LD)** embedded in every business page. A planned REST API is sketched in [the roadmap](#-on-the-roadmap) and clearly marked *not live*.

## TL;DR

| Capability | Status | How |
| --- | --- | --- |
| Read a business's rating + reviews | ✅ **Available today** | Parse the JSON-LD on `/businesses/{domain}` ([guide](./docs/structured-data.md)) |
| Programmatic access for AI assistants | ✅ **Available today** | [MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp) (wraps the same JSON-LD) |
| Embeddable reviews/comments widget | 🟠 **Beta / rollout in progress** | `<script>` loader + `<sr-reviews>` web component ([guide](./docs/widget.md)) |
| Public JSON REST API | 🗺️ **Planned, not live** | Intended shape in [the roadmap](./docs/roadmap.md) |

---

## ✅ What's available today

### Read data via structured data (JSON-LD)

Every business page at `https://sites.reviews/businesses/{domain}` embeds schema.org
JSON-LD. `{domain}` is the website host, lowercased (e.g. `1ps.ru`). The block you
want is the `Organization` node that contains an `aggregateRating` and a `review` array.

**Quick check with curl:**

```bash
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" \
  https://sites.reviews/businesses/1ps.ru \
  | grep -o '"ratingValue":"[0-9.]*"' | head -1
```

**Minimal Node/JS reader** (Node 18+, no dependencies — uses the built-in `fetch`):

```js
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function getBusiness(domain) {
  const url = `https://sites.reviews/businesses/${domain.toLowerCase()}`;
  const html = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();

  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);

  // The right Organization node is the one carrying an aggregateRating.
  const biz = blocks.find((b) => b && b.aggregateRating);
  if (!biz) throw new Error('No rating data found');

  return {
    name: biz.name,
    rating: Number(biz.aggregateRating.ratingValue),
    reviewCount: biz.aggregateRating.reviewCount,
    reviews: (biz.review || []).map((r) => ({
      author: r.author?.name,
      rating: Number(r.reviewRating?.ratingValue),
      date: r.datePublished,
      title: r.name,
      body: r.reviewBody,
    })),
  };
}

getBusiness('1ps.ru').then((b) => console.log(b.rating, b.reviewCount)); // → 4.8 34
```

A full, runnable version lives at [`examples/read-business.mjs`](./examples/read-business.mjs):

```text
$ node examples/read-business.mjs 1ps.ru
Business : Продвижение сайтов от 1PS.RU
URL      : https://sites.reviews/businesses/1ps.ru
Rating   : 4.8 / 5
Reviews  : 34
```

📖 Full field contract: [`docs/structured-data.md`](./docs/structured-data.md)

### Easiest programmatic access: the MCP server

If you're building on an AI assistant (Claude, etc.), the **[Sites.Reviews MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp)**
is the simplest path — it exposes the trust data as MCP tools and reads the same
JSON-LD documented here, so you don't have to parse HTML yourself.

---

## 🟠 Beta: the embeddable reviews widget

> **Beta — rollout in progress. The embed contract below may change.** The widget
> requires the Sites.Reviews beta backend to be enabled for your site; if it isn't,
> the component renders nothing. Do not treat this as GA yet.

Drop a loader script and a web component into any page:

```html
<!-- 1. Load the widget runtime once (anywhere on the page) -->
<script src="https://sites.reviews/widget/embed.js" async></script>

<!-- 2. Place the component where reviews should appear -->
<sr-reviews
  data-site="example.com"
  data-subject="/products/widget-42"
  data-mode="reviews"
  data-theme="auto"
  data-lang="en">
</sr-reviews>
```

The widget uses **SEO-friendly dual-render** (server-rendered content for crawlers,
hydrated for users) and supports both page-level **reviews** and threaded **comments**.

**Options**

| Attribute | Required | Values | Default | Description |
| --- | --- | --- | --- | --- |
| `data-site` | ✅ | domain (host) | — | The site the widget belongs to. |
| `data-subject` | — | any string / path / id | page URL path | The thing being reviewed (product, article, page). Group reviews by this key. |
| `data-mode` | — | `reviews` \| `comments` | `reviews` | Star reviews vs. threaded comments. |
| `data-theme` | — | `light` \| `dark` \| `auto` | `auto` | Color theme; `auto` follows the OS preference. |
| `data-lang` | — | `en` \| `ru` \| … | site default | UI language (ISO 639-1). |

📖 Full guide: [`docs/widget.md`](./docs/widget.md) · live snippet: [`examples/embed.html`](./examples/embed.html)

---

## 🗺️ On the roadmap

> **Planned — not live.** None of the endpoints below exist yet; `/api/*` returns 404 today.

A public JSON REST API is planned so you won't have to parse JSON-LD. Intended shape:

```http
GET /api/public/v1/business/{domain}
```

```jsonc
{
  "domain": "1ps.ru",
  "name": "Продвижение сайтов от 1PS.RU",
  "rating": 4.8,
  "reviewCount": 34,
  "reviews": [
    { "author": "…", "rating": 5, "date": "2026-05-31", "title": "…", "body": "…" }
  ]
}
```

Full sketch + OpenAPI draft: [`docs/roadmap.md`](./docs/roadmap.md).

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
