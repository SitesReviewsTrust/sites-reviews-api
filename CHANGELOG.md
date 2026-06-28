# Changelog

All notable changes to the Sites.Reviews API documentation, contract and examples are recorded
here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-28

### Added

- **OpenAPI 3.1 contract** ([`openapi.yaml`](./openapi.yaml)) for the live public API, covering
  all four endpoints with reusable schemas (`BusinessShort`, `BusinessFull`, `Review`,
  `ReviewsResponse`, `SearchResponse`, `NotFound`, `ValidationError`), `200` / `404` / `422`
  responses, and realistic examples. Validates clean under `@redocly/cli`.
- **`docs/api-reference.md`** — per-endpoint reference with request and response examples for
  `/check`, `/business/{domain}`, `/reviews/{domain}` and `/search`.
- **`docs/rate-limits.md`** — rate-limit headers, caching, CORS and backoff guidance.
- **Runnable examples** — `examples/check.sh` (curl), `examples/check.mjs` (Node, no deps) and
  `examples/check.py` (Python stdlib), each printing trust score + top reviews for a domain.
- **Community health files** — `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, GitHub
  issue forms, a pull-request template, and a CI workflow that validates `openapi.yaml` on every
  pull request.

### Changed

- **The public REST API is now LIVE.** Documentation across the repo was updated from
  "planned / beta" to reflect the live, public, read-only API at
  `https://sites.reviews/api/public/v1` (no auth, 60 req/min/IP, open CORS, 5-minute cache).
- **`README.md`** rewritten as a developer landing page with Live/OpenAPI/License badges, a
  multi-language quickstart (curl / JavaScript / Python), an endpoint table, an MCP callout and
  an honest "widget backend is Beta" note.
- **`docs/roadmap.md`** replaced the "planned REST API" content with the live reality and a
  short forward-looking roadmap.
- **`docs/structured-data.md`** reframed as an alternative to the now-live JSON API rather than
  the only way to read data.

[Unreleased]: https://github.com/SitesReviewsTrust/sites-reviews-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SitesReviewsTrust/sites-reviews-api/releases/tag/v1.0.0
