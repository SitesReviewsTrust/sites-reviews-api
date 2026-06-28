# Roadmap

## ✅ Live today

The **Sites.Reviews Public API** is live, free, public and read-only at
`https://sites.reviews/api/public/v1` — no API key required.

| Capability | Status | Endpoint |
| --- | --- | --- |
| Trust-score lookup for a domain | ✅ **Live** | `GET /check?domain={domain}` |
| Full business profile (descriptions, AI summary, category) | ✅ **Live** | `GET /business/{domain}` |
| Paginated reviews | ✅ **Live** | `GET /reviews/{domain}` |
| Catalog search | ✅ **Live** | `GET /search?q={q}` |
| schema.org JSON-LD on business pages | ✅ **Live** | `/businesses/{domain}` ([guide](./structured-data.md)) |
| MCP server (AI assistants) | ✅ **Live** | [`sites-reviews-mcp`](https://github.com/SitesReviewsTrust/sites-reviews-mcp) |
| Embeddable reviews/comments widget | 🟠 **Beta** | `<sr-reviews>` ([guide](./widget.md)) |

Full contract: [`../openapi.yaml`](../openapi.yaml) · reference: [`./api-reference.md`](./api-reference.md).

## 🟠 In beta

- **Embeddable widget backend.** The `<sr-reviews>` web component and `embed.js` loader exist,
  but the backend is still rolling out; the embed contract may change before GA. See
  [`widget.md`](./widget.md).

## 🗺️ Under consideration

These are **not committed** and have no ship date. They're listed so integrators know the
direction:

- **Optional API keys** for higher rate-limit tiers (the current limit is 60 req/min/IP for
  everyone).
- **Filtering/sorting on `/reviews`** (e.g. by star rating or date).
- **Webhooks** for new reviews on a watched domain.
- **Category endpoints** to browse the catalog by `category_id` / `sub_category_id`.

Have a use case that needs one of these? Open an
[issue](https://github.com/SitesReviewsTrust/sites-reviews-api/issues) describing it — it helps
us prioritize.
