# Pitfalls Research

**Domain:** Reliability hardening for existing Hugo + GitHub Actions static pipeline (missing data/assets)
**Researched:** 2026-02-14
**Confidence:** HIGH (Hugo docs + GitHub official docs), with a few LOW confidence operational heuristics called out

## Critical Pitfalls

### Pitfall 1: Treating `data/` as a Public Runtime Endpoint

**What goes wrong:**
Teams move map/review JSON into `data/*.json` and then try to fetch it in browser JS (`/data/reviews.json`). In Hugo, `data/` is template input, not a published static directory, so runtime fetches 404 and widgets render empty.

**Why it happens:**
During hardening, teams centralize data quickly and forget that Hugo only exposes `data` through `.Site.Data` at build time.

**How to avoid:**
- If browser must fetch JSON at runtime, store it in `static/` or publish a built resource to `public/`.
- If build-time rendering is enough, read from `.Site.Data` in templates and render HTML directly.
- Add a CI check that fails if frontend code references `/data/` URLs.

**Warning signs:**
- Network tab shows `404` for `/data/*.json`.
- Local `hugo server` and production both show missing widgets with no template errors.
- Built `public/` has no `data/` directory.

**Phase to address:**
Phase 1 - Data and Asset Audit Baseline

---

### Pitfall 2: Asset Pipeline Files Never Published

**What goes wrong:**
Map/review JS or CSS sits in `assets/` and is transformed, but template never calls `.RelPermalink`, `.Permalink`, or `.Publish`, so file is never emitted to `public/`.

**Why it happens:**
In existing sites, teams refactor to Hugo Pipes incrementally and assume `resources.Get` alone publishes output.

**How to avoid:**
- Standardize one partial for asset inclusion that always emits `RelPermalink`.
- Add a build assertion script that checks expected files exist in `public/` after `hugo --minify`.
- For critical assets (map/reviews), keep an integration test that requests emitted URLs from built output.

**Warning signs:**
- No build failure, but 404 on `/js/map.js` or `/css/reviews.css` in deployed site.
- `public/` missing expected hashed files after successful build.
- Feature works only when manually loading source file in dev.

**Phase to address:**
Phase 2 - Build Output Integrity Gates

---

### Pitfall 3: Base URL and Leading Slash Path Bugs

**What goes wrong:**
Hardcoded leading-slash links (`/images/...`, `/js/...`) work in one environment and fail in another (project path, preview URL, or custom-domain transition), causing selective missing assets.

**Why it happens:**
Reliability fixes often patch one broken path at a time instead of normalizing URL generation site-wide.

**How to avoid:**
- Use Hugo URL helpers (`relURL`/`RelPermalink`) consistently instead of hardcoded absolute paths.
- Build with the same `--baseURL` strategy as deployment workflow.
- Add link checking against built `public/` and reject unresolved local assets.

**Warning signs:**
- Asset URLs differ between local and production HTML.
- Broken assets are concentrated on nested routes.
- Changing domain or path prefix causes sudden map/review breakage.

**Phase to address:**
Phase 2 - Build Output Integrity Gates

---

### Pitfall 4: Workflow Artifact Miswiring (Deploying Wrong Folder)

**What goes wrong:**
GitHub Actions succeeds, but deploys wrong directory (repo root instead of `public/`, or stale/empty artifact). Site goes live without map/review assets despite green pipeline.

**Why it happens:**
Teams retrofit reliability into an existing workflow and accidentally change `upload-pages-artifact` path or `deploy` job dependency wiring.

**How to avoid:**
- Build job must upload `path: ./public` only.
- Deploy job must `needs: build`, and have `pages: write` + `id-token: write`.
- Keep a post-build manifest (`public/_integrity.json`) and verify it before artifact upload.

**Warning signs:**
- Workflow is green, but deployed HTML is old or missing newly added files.
- Pages artifact contains source files (`layouts/`, `content/`) instead of static output.
- Deploy job logs show retries waiting for artifact.

**Phase to address:**
Phase 3 - CI/CD Hardening and Deployment Guardrails

---

### Pitfall 5: Checkout Defaults Dropping Required Files (Submodules/LFS)

**What goes wrong:**
Build runner checks out repo without submodules or LFS objects, so images/data files referenced by map/review features are missing only in CI.

**Why it happens:**
`actions/checkout` defaults (`submodules: false`, `lfs: false`) are fine until hardening introduces external asset repos or LFS-managed media.

**How to avoid:**
- Explicitly set checkout options needed by repo (`submodules: recursive`, `lfs: true` when applicable).
- Add a CI "required files" step to assert presence of known critical files before running Hugo.
- Document repository storage expectations in pipeline README.

**Warning signs:**
- Local build works, CI build misses only large images or submodule content.
- Build logs reference missing files that do exist locally.
- Missing assets are concentrated in one directory tree.

**Phase to address:**
Phase 3 - CI/CD Hardening and Deployment Guardrails

---

### Pitfall 6: Dev/Prod Build Drift (`hugo server` != `hugo`)

**What goes wrong:**
Map/review components appear in dev preview but disappear in production build due to environment/config differences (draft/future content, environment-specific params, minification side effects).

**Why it happens:**
Teams validate fixes in `hugo server` only and skip parity checks with production build flags.

**How to avoid:**
- Make `hugo --gc --minify` (same flags as CI) the required pre-merge verification command.
- Add snapshot checks over built `public/index.html` and map/review partial output.
- Keep environment-sensitive params explicit and tested in both `development` and `production`.

**Warning signs:**
- "Works locally" but fails only after deploy.
- Missing sections correlate with draft/future or env-driven conditions.
- Production HTML differs materially from local server output.

**Phase to address:**
Phase 1 - Data and Asset Audit Baseline

---

### Pitfall 7: Silent Remote Data Failure and Stale Caches

**What goes wrong:**
Remote review/map data fetch fails (network, 404, schema change), but template fallback hides error, resulting in empty UI or stale content for long periods.

**Why it happens:**
In hardening projects, teams optimize for "site always builds" and downgrade all fetch errors to warnings without observability.

**How to avoid:**
- Use `try` with explicit error handling around `resources.GetRemote`.
- Fail build for critical data sources; warn only for non-critical enrichments.
- Stamp rendered output with `last_updated` and source status.
- Add scheduled synthetic checks that verify map/review selectors have data in published HTML.

**Warning signs:**
- Build remains green while map/review blocks are empty.
- Same review count/date persists across many deploys.
- Logs contain repeated remote fetch warnings ignored by team.

**Phase to address:**
Phase 4 - Observability and Synthetic Verification

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hotfixing broken paths inline in templates | Fast restoration | Path logic fragments and regresses on next deploy | Only as emergency patch; refactor same sprint |
| Swallowing all remote fetch errors | Fewer broken builds | Silent data outages, stale reviews | Never for critical homepage widgets |
| Keeping dual asset locations (`static/` and `assets/`) without rules | Team flexibility | Ambiguous source of truth, accidental 404s | Acceptable only with documented ownership matrix |
| Deploying without artifact content check | Simpler workflow | Green pipeline, broken site | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Hugo `data/` + browser JS | Fetching `/data/*.json` at runtime | Render via `.Site.Data` or publish JSON through `static/`/resources |
| Hugo Pipes + templates | Using `resources.Get` without publish/permalink call | Always emit `.RelPermalink`/`.Permalink`/`.Publish` |
| GitHub Pages actions | Uploading wrong artifact path | Upload only `./public` and deploy that artifact |
| `actions/checkout` | Relying on default `submodules`/`lfs` behavior | Declare required checkout settings explicitly |
| GitHub Pages custom domain | Assuming `CNAME` file alone updates domain settings | Configure domain in Pages settings/API and rebuild |

## Performance Traps (Reliability-Relevant)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Artifact near Pages size/time limits | Partial deploys, timeouts | Keep site and artifact under limits; optimize assets | Near 1 GB site or long deploy step |
| Expensive remote fetch during build | Intermittent missing sections | Pre-fetch/cache data and gate freshness | During network/API instability |
| Excessive image processing in critical path | Builds fail sporadically | Cache image pipeline and pin cache dir in CI | During high-commit bursts |

## Security/Operational Mistakes That Cause Reliability Incidents

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing fallback API keys client-side to "fix" missing data | Key abuse + forced shutdown of integration | Keep fetch/build-time server-side only |
| Skipping domain/DNS verification during outage response | Intermittent 404 and mixed-content errors | Use a fixed runbook for DNS + domain checks |
| Manual emergency edits on `gh-pages` output | Drift from source and repeat outages | Treat generated output as immutable artifact |

## "Looks Done But Isn't" Checklist

- [ ] **Map data:** `public/` contains expected map data or rendered HTML markers, not just source JSON in `data/`.
- [ ] **Review block:** Synthetic check confirms non-zero rendered review cards on deployed URL.
- [ ] **Critical assets:** `public/` contains map/review JS and CSS paths referenced by HTML.
- [ ] **Workflow wiring:** `deploy` job depends on `build` and uses Pages permissions (`pages: write`, `id-token: write`).
- [ ] **Path safety:** No hardcoded root-relative asset paths that bypass Hugo URL helpers.
- [ ] **Parity:** `hugo --gc --minify` output tested locally before merge.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `data/` runtime fetch misuse | LOW | Move JSON to `static/` or switch to `.Site.Data` rendering; redeploy |
| Missing published asset from pipes | LOW | Add permalink/publish call in partial; rebuild; verify emitted files |
| Wrong artifact deployed | MEDIUM | Fix artifact path/wiring, re-run workflow, validate deployed manifest |
| CI missing submodule/LFS assets | MEDIUM | Update checkout config and add file presence preflight |
| Silent remote data failure | MEDIUM | Promote critical fetch failures to hard errors; add freshness monitor |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| `data/` treated as public endpoint | Phase 1 - Data and Asset Audit Baseline | No browser requests to `/data/*`; widgets render from built output |
| Asset not published from `assets/` | Phase 2 - Build Output Integrity Gates | Expected files exist in `public/` and load with 200 status |
| Base URL/path regressions | Phase 2 - Build Output Integrity Gates | Link checker passes across nested routes and production baseURL |
| Pages artifact miswiring | Phase 3 - CI/CD Hardening and Deployment Guardrails | Artifact contains only built site and deploy job consumes it |
| Checkout missing submodule/LFS files | Phase 3 - CI/CD Hardening and Deployment Guardrails | Required-file preflight passes in CI |
| Dev/prod drift | Phase 1 - Data and Asset Audit Baseline | Local production-mode build matches CI behavior |
| Silent remote data failure | Phase 4 - Observability and Synthetic Verification | Freshness and non-empty-content checks alert within one run |

## Sources

### HIGH confidence (official)
- Hugo Data Sources: https://gohugo.io/content-management/data-sources/
- Hugo Pipes introduction (asset publishing behavior): https://gohugo.io/hugo-pipes/introduction/
- Hugo `Resource.Publish`: https://gohugo.io/methods/resource/publish/
- Hugo URL helper `urls.RelURL`: https://gohugo.io/functions/urls/relurl/
- Hugo host on GitHub Pages workflow reference: https://gohugo.io/host-and-deploy/host-on-github-pages/
- Hugo configuration defaults (`baseURL`, `buildDrafts`, `environment`, etc.): https://gohugo.io/configuration/all/
- Hugo `hugo server` flags: https://gohugo.io/commands/hugo_server/
- Hugo `resources.GetRemote` error handling/caching: https://gohugo.io/functions/resources/getremote/
- GitHub Pages custom workflows requirements: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages publishing source behavior and `.nojekyll` notes: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages limits (1 GB, 10-minute deploy timeout): https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Pages 404 troubleshooting (entry file location, case sensitivity): https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites
- GitHub Pages creation/static generator behavior: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- `actions/upload-pages-artifact` validation constraints: https://github.com/actions/upload-pages-artifact
- `actions/deploy-pages` requirements and behavior: https://github.com/actions/deploy-pages
- `actions/checkout` defaults (`lfs`, `submodules`): https://github.com/actions/checkout

### LOW confidence (validate in implementation)
- Case-sensitive path incidents between macOS local development and Linux runners are common in practice, but not documented in one canonical Hugo/GitHub source; keep this as an operational test requirement.

---
*Pitfalls research for: Reliability hardening of existing Hugo + GitHub Actions map/review pipeline*
*Researched: 2026-02-14*
