# Security Policy

We take the security of the Sites.Reviews platform seriously and appreciate responsible
disclosure.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, use GitHub's **private vulnerability reporting**:

1. Go to the **[Security tab](https://github.com/SitesReviewsTrust/sites-reviews-api/security)**
   of this repository.
2. Click **"Report a vulnerability"**.
3. Fill in the advisory form with as much detail as you can.

This opens a private channel visible only to you and the maintainers. If private reporting is
not available to you, open a minimal public issue that says only *"security report — please
enable private reporting / contact me"* without any vulnerability details, and a maintainer will
follow up.

### What to include

- A clear description of the issue and its impact.
- Steps to reproduce (the exact request/response, if it concerns the API).
- Any affected endpoint, parameter, or version.
- Your assessment of severity, if you have one.

### What to expect

- **Acknowledgement** of your report as we triage it.
- **Updates** as we investigate and work on a fix.
- **Credit** for the discovery once the issue is resolved, if you'd like it.

## Scope

This repository contains the **public API contract, documentation and example code**. Relevant
reports include:

- Documentation or examples that could lead users into an insecure integration.
- Discrepancies that could be abused (e.g. the live API leaking data the docs say it shouldn't).
- Vulnerabilities in the example scripts in [`examples/`](./examples).

Issues with the **live API service or the sites.reviews website** are also welcome here — we'll
route them to the right place internally.

## Out of scope

- Volumetric denial-of-service testing against the live API. The API is rate-limited
  (60 req/min/IP); please do not attempt to overwhelm it.
- Findings that require physical access, social engineering, or a compromised user device.

Thank you for helping keep Sites.Reviews and its users safe.
