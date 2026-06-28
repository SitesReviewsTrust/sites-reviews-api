# API reference — Sites.Reviews Public API

Complete reference for the **live**, public, read-only Sites.Reviews JSON API. The
machine-readable contract is [`../openapi.yaml`](../openapi.yaml) (OpenAPI 3.1).

- **Base URL:** `https://sites.reviews/api/public/v1`
- **Authentication:** none (public, read-only)
- **Methods:** `GET` (plus `OPTIONS` for CORS preflight)
- **Response format:** UTF-8 JSON
- **Rate limit:** 60 requests / minute / IP (see [`rate-limits.md`](./rate-limits.md))
- **CORS:** `Access-Control-Allow-Origin: *`
- **Caching:** `200` responses send `Cache-Control: public, max-age=300, s-maxage=300`

### Conventions

- **`{domain}`** is the business website host, **lowercased**, with no scheme or path
  (e.g. `1ps.ru`, `ozon.ru`).
- **`trust_score`** is `avg_ratings * 2` — the 0–5 average rating rescaled to **0–10**.
- Text fields may be in any language; review objects include an English translation in
  `body_en`.
- Send a regular browser `User-Agent`; bare client UAs (e.g. `python-urllib`) may be
  challenged at the edge.

---

## `GET /check`

Quick trust-score lookup. Unlike the other endpoints, an unknown domain returns **HTTP 200**
with a `{ "found": false, … }` body (not a 404), so one request tells you both existence and
score.

### Query parameters

| Name | In | Required | Description |
| --- | --- | --- | --- |
| `domain` | query | ✅ | Business host, lowercased (e.g. `1ps.ru`). |

### Request

```bash
curl -s "https://sites.reviews/api/public/v1/check?domain=1ps.ru"
```

### Response `200` — found ([`BusinessShort`](#schema-businessshort))

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

### Response `200` — not in catalog

```json
{
  "found": false,
  "domain": "example-not-indexed.com",
  "submit_url": "https://sites.reviews/businesses/add?website=example-not-indexed.com"
}
```

> Detect this case by checking `data.found === false` before reading the business fields.

---

## `GET /business/{domain}`

Full business profile: every [`BusinessShort`](#schema-businessshort) field plus descriptions,
the AI summary, social links, address, category and creation time.

### Path parameters

| Name | In | Required | Description |
| --- | --- | --- | --- |
| `domain` | path | ✅ | Business host, lowercased (e.g. `1ps.ru`). |

### Request

```bash
curl -s "https://sites.reviews/api/public/v1/business/1ps.ru"
```

### Response `200` ([`BusinessFull`](#schema-businessfull))

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
  "logo": null,
  "short_description": "Продвижение сайтов от 1PS.RU",
  "description": null,
  "ai_about": "Компания «Продвижение сайтов от 1PS.RU» предлагает услуги по SEO-оптимизации …",
  "ai_summary": {
    "verdict": "Компания 1PS вызывает в целом положительные отзывы …",
    "pros": ["Качественное выполнение работ", "Профессиональная команда"],
    "cons": ["Высокая стоимость услуг для малого бизнеса"]
  },
  "social_links": null,
  "address": [],
  "category_id": 15,
  "sub_category_id": null,
  "tags": null,
  "created_at": "2026-05-18T05:20:42+03:00"
}
```

### Response `404` — unknown / not indexed

```json
{ "error": "not_found" }
```

> **Note on nullable fields.** `description`, `ai_about`, `ai_summary`, `social_links`, `tags`,
> `sub_category_id`, `category_id` and `logo` can all be `null`. `ai_summary`, when present, is
> an object with `verdict`, `pros` and `cons`. `address` is an object whose keys depend on the
> data on file; when empty it serializes as `[]`, so treat both `[]` and `{}` as "no address".

---

## `GET /reviews/{domain}`

Paginated reviews for a business, plus a [`BusinessShort`](#schema-businessshort) summary of the
business itself.

### Parameters

| Name | In | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `domain` | path | ✅ | — | Business host, lowercased. |
| `page` | query | — | `1` | 1-based page number. |
| `per_page` | query | — | `20` | Page size, **max 50**. |

### Request

```bash
curl -s "https://sites.reviews/api/public/v1/reviews/1ps.ru?page=1&per_page=20"
```

### Response `200` ([`ReviewsResponse`](#schema-reviewsresponse))

```json
{
  "business": {
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
  },
  "page": 1,
  "per_page": 20,
  "total": 34,
  "reviews": [
    {
      "id": 23000,
      "title": "Продвижение сайтов для малого бизнеса с комплексными инструментами",
      "body": "1PS.ru — удобный сервис для продвижения сайтов …",
      "body_en": "1PS.ru is a convenient service for website promotion …",
      "stars": 5,
      "pros": ["удобный сервис", "комплексные инструменты", "чёткие отчёты"],
      "cons": [],
      "author": null,
      "created_at": "2026-05-31T23:41:07+03:00"
    }
  ]
}
```

### Response `404` — unknown / not indexed

```json
{ "error": "not_found" }
```

> Use `total` (not `reviews.length`) as the authoritative review count, and paginate with
> `page` / `per_page` to walk the full set.

---

## `GET /search`

Full-text search over the catalog by business name or domain.

### Parameters

| Name | In | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `q` | query | ✅ | — | Search term, **min 3 characters**. |
| `limit` | query | — | `10` | Max results, **max 50**. |

### Request

```bash
curl -s "https://sites.reviews/api/public/v1/search?q=ozon&limit=10"
```

### Response `200` ([`SearchResponse`](#schema-searchresponse))

```json
{
  "count": 2,
  "results": [
    {
      "id": 1101,
      "name": "OZON — интернет-магазин. Миллионы товаров по выгодным ценам",
      "slug": "ozon.ru",
      "website": "https://ozon.ru",
      "trust_score": 10,
      "avg_ratings": 5,
      "total_reviews": 4,
      "is_verified": false,
      "url": "https://sites.reviews/businesses/ozon.ru",
      "logo": null
    },
    {
      "id": 6696,
      "name": "Интернет-магазин велозапчастей и велоаксессуаров — SportResort.ru",
      "slug": "sportozon.ru",
      "website": "https://sportozon.ru",
      "trust_score": 10,
      "avg_ratings": 5,
      "total_reviews": 1,
      "is_verified": false,
      "url": "https://sites.reviews/businesses/sportozon.ru",
      "logo": null
    }
  ]
}
```

### Response `422` — query too short (`q` < 3 chars)

```json
{ "error": "query_too_short" }
```

A valid query with no matches returns `200` with `{ "count": 0, "results": [] }`.

---

## Schemas

### Schema: `BusinessShort`

Compact business summary, returned by `/check` and `/search` and embedded in `/reviews`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Internal business id. |
| `name` | string | Display name. |
| `slug` | string | URL slug — usually the domain. |
| `website` | string (uri) | The business's own website. |
| `trust_score` | number | 0–10 (`avg_ratings * 2`). |
| `avg_ratings` | number | 0–5 average rating. |
| `total_reviews` | integer | Total reviews on record. |
| `is_verified` | boolean | Verified on Sites.Reviews. |
| `url` | string (uri) | Canonical Sites.Reviews page. |
| `logo` | string \| null | Logo URL, or `null`. |

### Schema: `BusinessFull`

All `BusinessShort` fields, plus:

| Field | Type | Notes |
| --- | --- | --- |
| `short_description` | string \| null | Short tagline. |
| `description` | string \| null | Long description. |
| `ai_about` | string \| null | AI-generated description. |
| `ai_summary` | object \| null | `{ verdict, pros[], cons[] }`. |
| `social_links` | object \| null | Map of network → URL. |
| `address` | object | May serialize as `[]` when empty. |
| `category_id` | integer \| null | Primary category. |
| `sub_category_id` | integer \| null | Sub-category. |
| `tags` | array \| null | Free-form tags. |
| `created_at` | string (date-time) | ISO 8601. |

### Schema: `Review`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Review id. |
| `title` | string \| null | Headline. |
| `body` | string | Original-language text. |
| `body_en` | string \| null | English translation. |
| `stars` | integer | 1–5. |
| `pros` | array \| null | Positive highlights. |
| `cons` | array \| null | Negative highlights. |
| `author` | string \| null | Display name, or `null` if anonymous. |
| `created_at` | string (date-time) | ISO 8601. |

### Schema: `ReviewsResponse`

| Field | Type | Notes |
| --- | --- | --- |
| `business` | `BusinessShort` | The business being reviewed. |
| `page` | integer | Current page. |
| `per_page` | integer | Page size in effect (≤ 50). |
| `total` | integer | Total reviews available. |
| `reviews` | `Review[]` | The page of reviews. |

### Schema: `SearchResponse`

| Field | Type | Notes |
| --- | --- | --- |
| `count` | integer | Number of results returned. |
| `results` | `BusinessShort[]` | Matching businesses. |

---

## Error responses

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ "found": false, "domain", "submit_url" }` | `/check` on an unindexed domain. |
| `404` | `{ "error": "not_found" }` | `/business` or `/reviews` on an unknown domain. |
| `422` | `{ "error": "query_too_short" }` | `/search` with `q` shorter than 3 characters. |
| `429` | — | More than 60 requests/minute from one IP. |

All error responses keep the open CORS header (`Access-Control-Allow-Origin: *`).
