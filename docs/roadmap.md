# Roadmap — planned public REST API

> 🗺️ **Everything on this page is PLANNED and NOT LIVE.** As of today, `https://sites.reviews/api/*`
> returns **404**, and the Telegram-facing API is auth-gated and not for public use. Until
> the API below ships, read data via [structured data (JSON-LD)](./structured-data.md) or the
> [MCP server](https://github.com/SitesReviewsTrust/sites-reviews-mcp).

## Why

Today, reading a business's rating means parsing the JSON-LD embedded in its page. That
works and is documented, but a first-class JSON API would be simpler, faster, and would
expose the **full** review set (JSON-LD only carries a recent sample plus the aggregate
count).

## Intended shape (subject to change)

### Get a business summary

```http
GET /api/public/v1/business/{domain}
```

```jsonc
// 200 OK  (PLANNED — illustrative, not live)
{
  "domain": "1ps.ru",
  "name": "Продвижение сайтов от 1PS.RU",
  "url": "https://sites.reviews/businesses/1ps.ru",
  "rating": 4.8,
  "reviewCount": 34,
  "ratingScale": { "best": 5, "worst": 1 },
  "reviews": [
    {
      "author": "Владимир Путин",
      "rating": 5,
      "date": "2026-05-31",
      "title": "Продвижение сайтов для малого бизнеса …",
      "body": "1PS.ru — удобный сервис …",
      "positiveNotes": ["удобный сервис", "комплексные инструменты"]
    }
  ]
}
```

### List reviews (paginated)

```http
GET /api/public/v1/business/{domain}/reviews?page=1&limit=20
```

```jsonc
// 200 OK  (PLANNED — illustrative, not live)
{
  "domain": "1ps.ru",
  "page": 1,
  "limit": 20,
  "total": 34,
  "reviews": [ /* … review objects … */ ]
}
```

### Conventions (planned)

- **Auth:** public read endpoints unauthenticated but rate-limited; higher quotas via an
  API key.
- **Versioning:** path-versioned (`/v1/`).
- **Errors:** standard HTTP status codes + a JSON `{ "error": { "code", "message" } }` body.
- **Caching:** `ETag` / `Cache-Control` so clients can cache cheaply.

## OpenAPI sketch (planned, not live)

```yaml
openapi: 3.1.0
info:
  title: Sites.Reviews Public API (PLANNED — NOT LIVE)
  version: 0.0.0-draft
  description: >
    Draft only. No endpoint below is implemented yet. Read data via schema.org
    JSON-LD on /businesses/{domain} until this API ships.
servers:
  - url: https://sites.reviews/api/public/v1
paths:
  /business/{domain}:
    get:
      summary: Get a business's rating summary and recent reviews
      parameters:
        - name: domain
          in: path
          required: true
          schema: { type: string, example: "1ps.ru" }
      responses:
        "200":
          description: Business summary
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Business" }
        "404": { description: Unknown or not-yet-indexed domain }
  /business/{domain}/reviews:
    get:
      summary: List a business's reviews (paginated)
      parameters:
        - { name: domain, in: path, required: true, schema: { type: string } }
        - { name: page,  in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 20, maximum: 100 } }
      responses:
        "200":
          description: Paginated reviews
          content:
            application/json:
              schema: { $ref: "#/components/schemas/ReviewPage" }
components:
  schemas:
    Business:
      type: object
      properties:
        domain:      { type: string }
        name:        { type: string }
        url:         { type: string, format: uri }
        rating:      { type: number, format: float }
        reviewCount: { type: integer }
        ratingScale:
          type: object
          properties:
            best:  { type: integer }
            worst: { type: integer }
        reviews:
          type: array
          items: { $ref: "#/components/schemas/Review" }
    ReviewPage:
      type: object
      properties:
        domain:  { type: string }
        page:    { type: integer }
        limit:   { type: integer }
        total:   { type: integer }
        reviews:
          type: array
          items: { $ref: "#/components/schemas/Review" }
    Review:
      type: object
      properties:
        author:        { type: string }
        rating:        { type: integer }
        date:          { type: string, format: date }
        title:         { type: string }
        body:          { type: string }
        positiveNotes:
          type: array
          items: { type: string }
```

## Status & feedback

There is no committed ship date. If a public API matters to your integration, open an
issue on [`sites-reviews-api`](https://github.com/SitesReviewsTrust/sites-reviews-api)
describing your use case — it helps prioritize.
