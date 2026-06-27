# Embeddable reviews widget (Beta)

> 🟠 **Beta — rollout in progress.** The embed contract on this page may change before
> general availability. The widget needs the **Sites.Reviews beta backend enabled for
> your site**; until it is, the component renders nothing (no error, just empty). Don't
> treat this as GA.

The widget lets any website host **page-level reviews and threaded comments** served by
Sites.Reviews, with **SEO-friendly dual-render**: crawlers get server-rendered content,
visitors get a hydrated interactive component.

## Install

Two parts: a one-time loader script and one or more web components.

```html
<!-- 1) Load the runtime once per page (place in <head> or before </body>) -->
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

The loader registers the `<sr-reviews>` custom element and hydrates every instance on
the page. You can place multiple `<sr-reviews>` elements (e.g. one per product) on the
same page.

## Options

| Attribute | Required | Values | Default | Description |
| --- | --- | --- | --- | --- |
| `data-site` | ✅ | domain (host) | — | The site the widget belongs to. Must match a registered Sites.Reviews site. |
| `data-subject` | — | any string / path / id | current page URL path | Identifies the thing being reviewed (product, article, page). Reviews are grouped by this key — keep it stable. |
| `data-mode` | — | `reviews` \| `comments` | `reviews` | `reviews` = star ratings + review text; `comments` = threaded discussion without stars. |
| `data-theme` | — | `light` \| `dark` \| `auto` | `auto` | Visual theme. `auto` follows the visitor's OS color-scheme preference. |
| `data-lang` | — | ISO 639-1 (`en`, `ru`, …) | site default | UI language for labels and controls. |

## Modes

- **`reviews`** — Star reviews tied to a `data-subject`. Renders the aggregate score and
  individual reviews; emits the same schema.org structured data documented in
  [`structured-data.md`](./structured-data.md), so the reviews are crawlable.
- **`comments`** — Threaded comments for a `data-subject`, without star ratings. Useful
  for articles, docs, or discussion sections.

## SEO / dual-render

The widget renders review content server-side for crawlers and hydrates it client-side
for users, so embedded reviews can contribute to your page's rich results without a
client-only "empty div" SEO penalty. No extra configuration is required.

## Theming

`data-theme="auto"` respects `prefers-color-scheme`. Force a theme with `light` or
`dark`. Finer-grained CSS custom-property theming hooks are planned but not finalized
during beta — track [the roadmap](./roadmap.md).

## Beta limitations

- Requires the beta backend to be enabled for `data-site`; otherwise renders empty.
- The embed attribute names and the loader URL may change before GA.
- No stable JS event/callback API yet — don't build automation against internals.
- See [`examples/embed.html`](../examples/embed.html) for a copy-paste starting point.
