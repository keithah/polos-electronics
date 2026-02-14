# Stack Research

**Domain:** Hugo static site reliability hardening (reviews + service-area map)
**Researched:** 2026-02-14
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Hugo Extended | 0.155.3 | Deterministic local + CI site builds | Current upstream latest (release 2026-02-08). Your repo currently builds locally on 0.155.3 but CI deploy workflow is pinned to 0.135.0; this mismatch is a direct reliability risk for data/template behavior. |
| GitHub Actions Pages actions | `checkout@v6`, `setup-node@v6`, `configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4` | Stable build/deploy runtime on GitHub Pages | Official action repos show newer majors than currently used in this repo for checkout/setup-node/upload-pages-artifact. Moving to maintained majors reduces runner/runtime drift and hidden breakage. |
| Node.js (tooling runtime) | 24.x LTS | Validation scripts + smoke tests in CI and local | Node 24 is current Active LTS. Use one runtime for local scripts and CI checks to eliminate "works local but not in Actions" tooling divergence. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ajv` | 8.18.0 | Validate `data/reviews.json` and `data/service_area.json` against explicit JSON Schemas | Run in both local pre-build check and CI build job; fail fast if required keys/shape for review cards or map references are missing. |
| `ajv-formats` | 3.0.1 | Strict date/URI/format validation for review metadata | Pair with `ajv` when validating fields like timestamps, profile URLs, CTA URLs. |
| `@playwright/test` | 1.58.2 | Post-build smoke test of rendered homepage sections | Run against built output (`public/`) in CI and optional local check; assert reviews section renders and map image/path resolves. |
| `rhysd/actionlint` | 1.7.11 | Validate workflow syntax/expressions before merge | Add as a dedicated CI job so workflow regressions do not silently break review fetch or deploy pipelines. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `hugo --panicOnWarning --printPathWarnings --gc --minify` | Treat template/data warnings as build blockers | Add to CI build step; this catches bad data key usage and path collisions before deploy. |
| `npm ci` (not `npm install`) | Deterministic dependency install in CI | Required for reproducible validation/smoke-test behavior from lockfile. |
| `node scripts/validate-content.js` | Single command gate for data + file prerequisites | Should verify: non-empty `reviews[]` fallback policy, map image exists at expected path, and template-required keys are present. |

## Installation

```bash
# Dev dependencies for reliability gates
npm install -D ajv@8.18.0 ajv-formats@3.0.1 @playwright/test@1.58.2

# Optional local workflow linting
brew install actionlint
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Schema validation via `ajv` in repo scripts | `check-jsonschema` CLI | Use if your team prefers Python tooling across multiple repos; otherwise `ajv` keeps this project single-runtime (Node) and simpler for Hugo + Actions. |
| HTML smoke tests with Playwright | Pure grep/string checks on generated HTML | Use grep-only checks for very small repos; for this milestone, DOM-level assertions are safer and catch regressions in conditional rendering. |
| Pinned Hugo binary version | Floating "latest" Hugo in CI | Use floating only in experimental branches; for production reliability, pin exact Hugo and update intentionally. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Runtime browser fetch of Google reviews via public CORS proxy (`cors-anywhere`) | Unreliable/blocked in production; introduces client-side dependency for core credibility content | Pre-build static data generation into `data/reviews.json` plus CI validation and template fallback rendering. |
| Making deploy success depend on live scraping of HomeAdvisor/Nextdoor | Scraping selectors and anti-bot behavior are brittle; can cause empty-content deploys | Keep external fetches in a separate refresh workflow and always retain validated fallback review data in-repo. |
| Interactive JS map widget/API as a prerequisite for map visibility | Adds key/quota/network failure modes for content that can be static | Keep static map asset in `static/images/` and validate existence/path in CI. |
| Unpinned major tool/action versions in production workflows | Silent upstream changes can break rendering/deploy behavior | Pin majors for actions and exact versions for build-critical CLIs/libs. |

## Stack Patterns by Variant

**If running local verification before commit:**
- Use `npm ci && node scripts/validate-content.js && hugo --panicOnWarning --printPathWarnings && npx playwright test tests/smoke/reviews-map.spec.ts`
- Because this reproduces the same reliability gates used in CI.

**If running production CI (PR + main):**
- Use ordered jobs: workflow lint -> content/schema validation -> Hugo build (warnings as errors) -> smoke test on built output -> Pages artifact upload/deploy.
- Because map/review regressions should fail before artifact publication.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@playwright/test@1.58.2` | Node 20/22/24 | Official Playwright docs list 20.x/22.x/24.x system requirements; choose 24.x for consistency. |
| `ajv@8.18.0` + `ajv-formats@3.0.1` | Node 24.x | Standard pairing for schema + format validation in one Node runtime. |
| Hugo Extended 0.155.3 | GitHub Pages Actions pipeline | Keep local + CI on same Hugo version to avoid behavior drift. |

## Integration Plan (Hugo + GitHub Actions)

1. Update `.github/workflows/hugo.yml` toolchain pins: Hugo `0.155.3`, Pages actions current majors listed above, `setup-node@v6` with `node-version: 24` for validation/test steps.
2. Add a pre-build validation step in `hugo.yml`: run `npm ci` then `node scripts/validate-content.js` (AJV + file existence assertions).
3. Change Hugo build command in CI to include `--panicOnWarning --printPathWarnings` so template/data mismatches fail loudly.
4. Add smoke test step using Playwright against built output to verify review block and service-area map render paths.
5. Keep `fetch-reviews.yml` non-blocking for deploy reliability: if upstream APIs/scrapers fail, preserve last known-valid `data/reviews.json` and never publish invalid/empty shape.

## Sources

- Hugo releases: https://github.com/gohugoio/hugo/releases (latest `v0.155.3`, 2026-02-08) — HIGH
- Repo local Hugo binary: `hugo version` in workspace (`v0.155.3`) — HIGH
- Current deploy workflow (repo): `.github/workflows/hugo.yml` (currently `HUGO_VERSION: 0.135.0`) — HIGH
- GitHub Actions official repos:
  - https://github.com/actions/checkout (`v6` usage, latest release `v6.0.2`) — HIGH
  - https://github.com/actions/setup-node (`v6` usage, latest release `v6.2.0`) — HIGH
  - https://github.com/actions/configure-pages (latest release `v5.0.0`) — HIGH
  - https://github.com/actions/upload-pages-artifact (recommends `@v3`, latest release `v4.0.0`) — MEDIUM (docs lag vs release)
  - https://github.com/actions/deploy-pages (`@v4`, latest release `v4.0.5`) — HIGH
- Node release schedule: https://nodejs.org/en/about/previous-releases (Node 24 Active LTS) — HIGH
- Playwright docs/system requirements: https://playwright.dev/docs/intro (Node 20/22/24 support) — HIGH
- Playwright releases: https://github.com/microsoft/playwright/releases (latest `v1.58.2`) — HIGH
- npm registry package versions (queried): `npm view ajv version`, `npm view ajv-formats version`, `npm view @playwright/test version` — HIGH

---
*Stack research for: Hugo reliability hardening for reviews and service-area map rendering*
*Researched: 2026-02-14*
