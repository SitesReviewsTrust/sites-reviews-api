# Pull request

## What does this change?

<!-- A short summary of the change and why it's needed. -->

## Type of change

- [ ] 📝 Documentation (README / docs)
- [ ] 🔧 OpenAPI spec (`openapi.yaml`)
- [ ] 💡 Example code (`examples/`)
- [ ] 🐛 Fix (doc/spec/example was wrong)
- [ ] 🧩 Widget
- [ ] Other:

## Verification

<!-- How did you confirm this is correct against the LIVE API? Paste the request you ran. -->

```bash
# e.g. curl -s "https://sites.reviews/api/public/v1/check?domain=1ps.ru"
```

## Checklist

- [ ] `npx @redocly/cli@latest lint openapi.yaml` passes (CI also checks this).
- [ ] If I changed a field or endpoint, I updated **both** `openapi.yaml` and the relevant
      `docs/` page (and the README if user-facing).
- [ ] If I touched `examples/`, I ran them and confirmed the output.
- [ ] Changes reflect **only what the live API actually returns** (no invented fields).
- [ ] I updated `CHANGELOG.md` under `## [Unreleased]` if this is user-facing.
