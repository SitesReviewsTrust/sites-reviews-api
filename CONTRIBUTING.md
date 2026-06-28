# Contributing to Sites.Reviews API &amp; Widgets

Thanks for your interest in improving the Sites.Reviews developer platform! This repository
holds the **public API contract, documentation and examples** — not the API server itself.
That shapes what's most useful to contribute.

## What lives here

| Path | What it is |
| --- | --- |
| [`openapi.yaml`](./openapi.yaml) | OpenAPI 3.1 contract for the live API. |
| [`docs/`](./docs) | Reference, rate limits, widget, JSON-LD, roadmap. |
| [`examples/`](./examples) | Runnable snippets (curl, Node, Python). |
| [`README.md`](./README.md) | Developer landing page. |

The live API is hosted at `https://sites.reviews/api/public/v1`. This repo **documents** it;
it does not run it.

## Great ways to contribute

- **Fix docs** — typos, unclear wording, broken links, out-of-date examples.
- **Improve examples** — new languages, clearer code, better error handling.
- **Sharpen the spec** — if a field or status code is documented incorrectly, fix
  `openapi.yaml` and the matching prose. Please include the real response that proves it.
- **Report API bugs** — if the live API returns something other than what's documented, open a
  [bug report](https://github.com/SitesReviewsTrust/sites-reviews-api/issues/new/choose) with
  the exact request and response.

> **Document only what the live API actually returns.** Don't add speculative fields or
> endpoints. If it isn't in a real response, it doesn't belong in the spec.

## Development setup

You only need Node (for the OpenAPI linter) and optionally Python 3 for the examples.

```bash
# Validate the OpenAPI spec (CI runs this on every PR)
npx @redocly/cli@latest lint openapi.yaml

# Try the examples against the live API
./examples/check.sh 1ps.ru
node examples/check.mjs 1ps.ru
python3 examples/check.py 1ps.ru
```

## Pull request checklist

Before opening a PR:

1. **`openapi.yaml` lints clean** — `npx @redocly/cli@latest lint openapi.yaml` passes.
2. **Examples still run** — if you touched `examples/`, run them and confirm output.
3. **Docs and spec agree** — a change to a field/endpoint updates both `openapi.yaml` and the
   relevant `docs/` page (and the README if user-facing).
4. **Changes are backed by real responses** — paste the `curl` you used to verify.
5. **Update [`CHANGELOG.md`](./CHANGELOG.md)** under an `## [Unreleased]` heading if the change
   is user-facing.

Open the PR using the [template](./.github/PULL_REQUEST_TEMPLATE.md); CI will validate the spec
automatically.

## Style

- Keep prose tight and example-first.
- Prefer `1ps.ru` / `ozon.ru` as canonical example domains (they're in our fixtures).
- Markdown: one sentence per idea, wrap around ~100 columns where practical.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating you
agree to uphold it.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
