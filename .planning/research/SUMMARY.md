# Project Research Summary

**Project:** Polos Electronics Website Enhancements (Milestone v1.1 Reliability & Visibility)
**Domain:** Brownfield Hugo static site reliability hardening
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

This milestone is a reliability correction for an existing Hugo + GitHub Pages site where reviews and service-area map capabilities exist, but visibility is inconsistent in both local and production builds. The research is aligned: experts solve this class of issue by shifting from "best effort rendering" to contract-driven build inputs, deterministic fallback rendering, and strict CI gates that block deploys when critical sections are missing. The product remains a static marketing site, but reliability is treated as a first-class feature.

The recommended approach is to harden the current pipeline instead of redesigning it: pin toolchain versions (especially Hugo parity between local and CI), validate `data/reviews.json` and `data/service_area.json` before build, render reviews/map via guarded partials that never disappear, and add smoke assertions against generated output. Deploy should be gated on a dedicated reliability workflow so a green compile is not enough; sections must be verifiably present.

The key risk is silent success: workflows can pass while homepage credibility/coverage sections vanish due to data shape drift, unpublished assets, path bugs, or artifact miswiring. Mitigation is explicit and layered: fail-closed CI (`--panicOnWarning`, schema/asset checks, smoke tests), fail-open UX (fallback states + freshness indicators), and operational recovery paths (`workflow_dispatch`, last-known-good review snapshot, job summaries).

## Key Findings

### Recommended Stack

The stack recommendation is pragmatic hardening of the existing Hugo/GitHub Actions deployment path, not a platform change. Priority is deterministic parity across local and CI, explicit validation, and deploy-time safeguards.

**Core technologies:**
- `Hugo Extended 0.155.3`: deterministic rendering across environments — eliminates current local/CI version drift risk.
- GitHub Pages Actions (`checkout@v6`, `setup-node@v6`, `configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`): maintained CI/deploy runtime — reduces hidden workflow breakage.
- `Node.js 24.x LTS`: single runtime for validators/smoke checks — avoids tooling divergence.
- `ajv` + `ajv-formats`: schema contract enforcement for review/map data — blocks malformed deploy inputs.
- `@playwright/test`: post-build visibility assertions — catches "build passed but section missing" regressions.

**Critical version requirements:**
- Keep local and CI on the same Hugo version (`0.155.3` recommended).
- Use deterministic installs in CI (`npm ci`) with pinned lockfile.
- Keep deploy-critical action majors pinned and upgrade intentionally.

### Expected Features

v1.1 is a reliability-first feature set. The must-haves are visibility guarantees and operator recovery, not net-new UX complexity.

**Must have (table stakes):**
- Always-visible Reviews and Service Area sections with explicit fallback copy.
- Build-time data contract validation for `reviews.json` and `service_area.json`.
- Strict build failure behavior (`hugo --panicOnWarning --printPathWarnings`).
- Freshness visibility (`lastUpdated` + stale-state message threshold).
- Manual recovery path (`workflow_dispatch` + runbook) when scheduled sync fails.

**Should have (competitive):**
- Pre-deploy visual smoke tests for reviews/map presence in built homepage.
- CI diagnostics artifact/job summary with counts, age, missing keys/assets.
- Public reliability states (Live/Fallback/Stale) once fallback logic stabilizes.

**Defer (v2+):**
- Dual-source ingestion hardening per platform (API-first + enrichment fallback).
- Reliability analytics/alerting beyond baseline synthetic checks.

### Architecture Approach

The target architecture is a reliability pipeline with clear boundaries: ingestion validates candidate data then atomically updates canonical files (with last-known-good fallback), a dedicated reliability gate verifies schema/assets/rendered output, Hugo partials implement deterministic fallback rendering, and deploy runs only after the gate passes.

**Major components:**
1. `fetch-reviews.yml` (hardened) — fetch/normalize/validate and atomic write to `data/reviews.json` with `reviews.last-good.json` preservation.
2. `scripts/validate/*` + `reliability.yml` — schema checks, asset checks, strict Hugo build, smoke assertions, CI annotations/summary.
3. `layouts/index.html` + `layouts/partials/reliability/*` — centralized fail-open section rendering for reviews and map.
4. `hugo.yml` deploy orchestration — artifact upload/deploy only after reliability gate success.

### Critical Pitfalls

1. **Runtime fetch from Hugo `data/`** — browser calls to `/data/*.json` 404; render via `.Site.Data` or publish runtime JSON from `static/`.
2. **Assets never published from Hugo Pipes** — `resources.Get` without permalink/publish yields missing files; enforce standardized asset partial + output assertions.
3. **Path/baseURL drift** — hardcoded leading slashes break across environments; use Hugo URL helpers consistently and validate built links.
4. **Workflow artifact miswiring** — green deploy can ship wrong folder; upload only `./public`, verify artifact manifest, and keep strict job dependencies.
5. **Dev/prod build drift and silent remote failures** — `hugo server` success masks production issues; require production-mode parity checks plus freshness/synthetic verification.

## Implications for Roadmap

Based on combined research, use a 4-phase sequence that prioritizes visibility restoration before deeper ingestion sophistication.

### Phase 1: Baseline Reliability Contracts
**Rationale:** Missing sections are usually data-shape and environment-parity issues; fix signal quality first.
**Delivers:** JSON schema validators, required-file preflight, production-mode local command parity.
**Addresses:** Table-stakes contract validation, strict build behavior foundation.
**Avoids:** `data/` misuse, dev/prod drift, silent malformed data deploys.

### Phase 2: Deterministic Rendering and Fallback UX
**Rationale:** Once inputs are trustworthy, make homepage sections impossible to "vanish".
**Delivers:** Reliability partials for reviews/map, explicit empty/stale fallback states, freshness labels.
**Addresses:** Always-visible sections, map fallback chain, review freshness visibility.
**Avoids:** Conditional section disappearance and trust loss during upstream outages.

### Phase 3: CI/CD Gate and Deployment Guardrails
**Rationale:** Reliability must be enforced before publish, not inspected after incidents.
**Delivers:** `reliability.yml` gate (schema + assets + strict Hugo + smoke), diagnostics summaries, hardened `hugo.yml` dependency and artifact checks.
**Uses:** Pinned Hugo/actions, Node 24, AJV validators, Playwright smoke tests.
**Avoids:** Wrong-artifact deploys, unpublished assets, green pipelines with broken homepage sections.

### Phase 4: Ingestion Resilience and Operational Monitoring
**Rationale:** After visibility is stable, reduce recurrence and mean-time-to-diagnosis.
**Delivers:** Atomic candidate-to-canonical writes, last-known-good retention, manual refresh runbook hardening, scheduled synthetic checks, optional public reliability chips.
**Addresses:** Manual recovery path, stale detection, operational transparency.
**Avoids:** Long-lived stale/empty states masked by fallback UI.

### Phase Ordering Rationale

- Start with contracts/parity before template changes so failures become diagnosable immediately.
- Implement fail-open rendering only after fail-closed input validation to avoid masking structural defects.
- Gate deployment after rendering logic is deterministic, then harden ingestion to reduce future incidents.
- This sequence maps directly to documented pitfall phases and minimizes risk of shipping another "works locally, missing in prod" release.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** Dual-source ingestion and source-specific fallback policy require platform-by-platform feasibility/TOS validation.
- **Phase 4:** Reliability analytics instrumentation depends on approved analytics stack and privacy constraints.

Phases with standard patterns (skip research-phase):
- **Phase 1:** JSON schema + required-file gates are mature, well-documented patterns.
- **Phase 2:** Hugo partial fallback rendering and freshness labels are straightforward within current architecture.
- **Phase 3:** GitHub Actions gating/artifact/deploy dependency patterns are well-established.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Recommendations are grounded in official Hugo, Node, Playwright, and GitHub Actions release/docs plus repo-specific version mismatch evidence. |
| Features | HIGH | v1.1 priorities are clear and directly tied to observed reliability/visibility failures; competitive add-ons are intentionally deprioritized. |
| Architecture | HIGH | Proposed boundaries align with existing brownfield structure and proven static-site reliability patterns. |
| Pitfalls | HIGH | Most pitfalls are validated by official Hugo/GitHub behavior; only a small set of operational heuristics remain environment-specific. |

**Overall confidence:** HIGH

### Gaps to Address

- **`service_area` naming consistency:** Research references both `data/service_area.json` and existing `data/service-area.json`; normalize naming and template access in Phase 1 to prevent false negatives.
- **Current workflow wiring baseline:** Confirm present `hugo.yml` artifact path/dependency wiring before refactor so guardrails do not regress deployment.
- **Selector contract for smoke tests:** Define stable IDs/classes for reviews and service-area assertions to avoid brittle CI tests.
- **Fallback freshness threshold policy:** Lock business-approved stale threshold (example: 45 days) and copy so reliability states are consistent.

## Sources

### Primary (HIGH confidence)
- Hugo docs (`data` sources, `errorf`/`warnf`, URL helpers, CLI flags, Pipes/resource publishing) — rendering and build behavior.
- GitHub Actions/Pages official docs and action repos (`checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`) — workflow/deploy guardrails.
- Node.js release schedule — runtime support policy.
- Playwright docs/releases — compatible Node versions and smoke-test tooling.
- Project-local artifacts (`.github/workflows/hugo.yml`, `.github/workflows/fetch-reviews.yml`, `layouts/index.html`, `data/reviews.json`, `data/service_area.json`) — brownfield constraints.

### Secondary (MEDIUM confidence)
- Action release/docs lag observations (not all repos update usage examples immediately by release timing).

### Tertiary (LOW confidence)
- Operational heuristic: case-sensitivity incidents between macOS local development and Linux CI runners; treat as test requirement, not guaranteed root cause.

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
