# Reading data via structured data (JSON-LD)

> **This is the supported way to read Sites.Reviews data today.** There is no public
> JSON REST API yet (`/api/*` → 404). Every business page embeds schema.org JSON-LD,
> and that is what both this guide and the [MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp) consume.

## Where the data lives

```
https://sites.reviews/businesses/{domain}
```

- `{domain}` is the **website host, lowercased** (e.g. `1ps.ru`, `example.com`).
- The page returns `200 OK` for known businesses and embeds **multiple**
  `<script type="application/ld+json">` blocks (`Organization`, `WebSite`,
  `WebPage`, `BreadcrumbList`, …).
- Send a normal browser `User-Agent`; requests without one may be filtered.

> ⚠️ **There are two `Organization` blocks.** One describes the Sites.Reviews site
> itself (no rating). The business you want is the `Organization` node that carries an
> **`aggregateRating`** and a **`review`** array. Always select by "has `aggregateRating`",
> not by position.

## Verify it yourself

```bash
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" \
  https://sites.reviews/businesses/1ps.ru \
  | grep -o '"ratingValue":"[0-9.]*","reviewCount":[0-9]*'
# → "ratingValue":"4.8","reviewCount":34
```

## Field contract (verified)

The business `Organization` node has this shape (fields present as of 2026-06):

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Продвижение сайтов от 1PS.RU",
  "url": "https://sites.reviews/businesses/1ps.ru",
  "image": "…",
  "logo": "…",
  "mainEntityOfPage": "…",
  "additionalType": "…",
  "knowsAbout": ["…"],
  "sameAs": ["…"],

  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",     // string — parse to Number
    "reviewCount": 34,         // number
    "bestRating": 5,
    "worstRating": 1
  },

  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Владимир Путин" },
      "datePublished": "2026-05-31",       // ISO date (YYYY-MM-DD)
      "reviewBody": "1PS.ru — удобный сервис …",
      "name": "Продвижение сайтов для малого бизнеса …",  // review title
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",   // string — parse to Number
        "bestRating": 5,
        "worstRating": 1
      },
      "positiveNotes": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "удобный сервис" }
        ]
      }
    }
  ]
}
```

### Field reference

| Path | Type | Notes |
| --- | --- | --- |
| `name` | string | Business display name. |
| `url` | string | Canonical Sites.Reviews page for the business. |
| `aggregateRating.ratingValue` | string | Average rating. **Parse to Number.** |
| `aggregateRating.reviewCount` | number | Total number of reviews on record. |
| `aggregateRating.bestRating` / `worstRating` | number | Scale bounds (typically 5 / 1). |
| `review[]` | array | A **sample** of recent reviews (not the full set — `reviewCount` is the true total). |
| `review[].author.name` | string | Reviewer display name. |
| `review[].datePublished` | string | ISO date `YYYY-MM-DD`. |
| `review[].name` | string | Review title/headline. |
| `review[].reviewBody` | string | Full review text. |
| `review[].reviewRating.ratingValue` | string | Per-review stars. **Parse to Number.** |
| `review[].positiveNotes.itemListElement[]` | array | Extracted positive highlights, each `{ position, name }`. |

> **Caveat:** `review[]` is a recent sample for SEO, not the complete review set. Use
> `aggregateRating.reviewCount` as the authoritative count. The full list is not exposed
> via JSON-LD today — it will be when the [REST API](./roadmap.md) ships.

## Parsing recipe

1. `GET` the business page with a browser `User-Agent`.
2. Regex out every `<script type="application/ld+json">…</script>` payload.
3. `JSON.parse` each block; flatten any `@graph` / array wrappers.
4. Pick the node where `node.aggregateRating` exists.
5. Read `aggregateRating` and map `review[]`, parsing string ratings to numbers.

A complete, tested implementation is in [`examples/read-business.mjs`](../examples/read-business.mjs).

## Edge cases

- **Unknown / not-yet-indexed domain** → the page may 404 or omit the rating node;
  handle "no `aggregateRating` found" gracefully.
- **Subdomains / `www`** → use the exact host shown on the business's Sites.Reviews
  page; `www.` and the bare host can be distinct entries.
- **Rate limiting** → this is HTML scraping of a public page; be polite (cache, avoid
  hammering). For higher-volume or structured access, prefer the
  [MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp) or wait for the REST API.
