# Feature Research

**Domain:** Hugo static marketing site reliability and visibility (reviews + service-area map)
**Researched:** 2026-02-14
**Confidence:** HIGH for Hugo/GitHub/Google platform behavior, MEDIUM for competitive patterns

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = sections look broken, even if the rest of the site works.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Deterministic section rendering with empty states** | Users should always see Reviews and Service Area sections, even when upstream data is empty | LOW | Never conditionally remove entire section; show explicit fallback copy + platform/map links. Depends on existing review display and service-area section templates. |
| **Build-time data contract validation** | Static sites fail silently if JSON shape drifts; users only see missing content in production | MEDIUM | Validate required keys in `data/reviews.json` and `data/service_area.json` before deploy. Depends on existing normalized review and map/text data files. |
| **Build fails loudly on warnings/errors** | Reliability requires catching template/data regressions before publish | LOW | Use strict build flags (`hugo --panicOnWarning`) plus CI checks. Depends on existing GitHub Actions deployment path. |
| **Review freshness visibility** | Users expect confidence that reviews are current, not stale snapshots | LOW | Display `lastUpdated` and show stale-state message if threshold exceeded (for example, >45 days). Depends on existing review fetch workflow output. |
| **Map fallback chain** | Embeds can fail due key restrictions, blockers, or network; users still need location context | LOW | Keep static map image + text list + direct Google Maps link as baseline. Optional embed is enhancement only. Depends on existing service-area text + map asset. |
| **Manual recovery path for failed sync** | Scheduled jobs are not guaranteed to run exactly on time; operators need recovery without code changes | LOW | Keep `workflow_dispatch` and document one-click refresh runbook. Depends on existing scheduled review workflow. |
| **Platform attribution and source links per review** | Users expect proof/traceability for aggregated testimonials | LOW | Keep per-platform badge + "view on source" links on each card/CTA. Depends on existing attribution UI and platform metadata. |

### Differentiators (Competitive Advantage)

Features that improve trust and operational clarity beyond baseline expectations.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Public reliability states (Live/Fallback/Stale)** | Makes reliability explicit, reducing ambiguity when content is degraded | MEDIUM | Add lightweight state labels per section driven by data age and availability. Depends on table-stakes empty-state + freshness checks. |
| **Pre-deploy visual assertions for key sections** | Prevents "it built but disappeared" regressions on homepage sections | MEDIUM | CI smoke test verifies Reviews heading/cards and Service Area heading/map are present in built HTML. Depends on stable selectors and Hugo build output. |
| **Operator diagnostics artifact in CI** | Fast root-cause isolation when content vanishes locally or in production | MEDIUM | Upload parsed health summary (counts, lastUpdated age, missing keys/assets) as workflow artifact. Depends on validation scripts and workflow updates. |
| **Dual-source review ingestion strategy** | Reduces fragility from one API/scraper path failing | HIGH | Use API-first where available, fallback to last-known-good data + manual import path. Depends on current multi-platform aggregation pipeline. |
| **Section-level analytics for degraded states** | Turns reliability issues into measurable events instead of anecdotal bug reports | MEDIUM | Track when fallback/stale modes are shown (privacy-safe aggregate only). Depends on whichever analytics stack is already present/approved. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem attractive but usually create reliability or compliance problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Hide Reviews/Map sections when data is empty** | Avoid showing "incomplete" UI | Looks like a broken site and removes user trust signals exactly when needed | Keep sections visible with explicit fallback copy and source links |
| **Client-side direct Google Places calls from browser via public CORS proxy** | Appears faster to implement than server/workflow ingestion | Fragile (proxy outages/CORS), key exposure risk, inconsistent local vs prod behavior | Ingest server-side in CI/workflow and ship static JSON with last-known-good fallback |
| **Relying only on scheduled refresh with no manual override** | Simpler operations model | Scheduled workflows can be delayed or dropped under load; stale data persists | Keep schedule + manual dispatch + stale detection banner |
| **Schema ratings without matching visible review content** | Attempt to force stars in search | Violates Google review snippet guidelines and can trigger manual action/ineligibility | Only emit rating markup that is visible and attributable on-page |
| **Scraper-only critical path for all platforms** | Captures more sources quickly | DOM changes routinely break scrapers, causing sudden empty sections | Prefer official APIs when possible; isolate scraping as best-effort enrichment |

## Feature Dependencies

```
[Data Contract Validation]
    └──requires──> [Existing reviews.json + service_area.json]

[Deterministic Section Rendering]
    └──requires──> [Existing Reviews Template + Service Area Template]

[Review Freshness Indicator]
    └──requires──> [Existing Fetch Workflow lastUpdated]
        └──requires──> [Scheduled + Manual Workflow Triggers]

[Pre-Deploy Visual Assertions]
    └──requires──> [Deterministic Section Rendering]

[Public Reliability States]
    └──requires──> [Freshness Indicator]
    └──requires──> [Fallback UX]

[Schema Rating Output]
    └──requires──> [Visible Review Content]
        └──conflicts──> [Hidden/Conditional Review Section]
```

### Dependency Notes

- **Validation before rendering:** If data validation is missing, template conditions can pass locally but fail in CI/production due malformed data.
- **Freshness depends on workflow reliability:** The `lastUpdated` signal only helps if scheduled jobs and manual triggers are both available.
- **Schema depends on visible content:** Rating markup must match what users can see on-page, otherwise eligibility risk increases.

## MVP Definition

### Launch With (v1.1)

Minimum viable reliability upgrade for an already-launched site.

- [ ] **Always-visible Reviews/Service Area sections with explicit fallback states** — fixes "missing section" perception first
- [ ] **JSON schema/data contract checks in CI for review/map data** — prevents bad deploys
- [ ] **Stale-data detection + on-page freshness indicator** — improves trust and support triage
- [ ] **Manual refresh runbook + workflow dispatch path** — operational recovery without code changes
- [ ] **Build strictness (`--panicOnWarning`) in deploy workflow** — fails fast on regressions

### Add After Validation (v1.1.x)

- [ ] **Pre-deploy visual smoke tests for homepage key sections** — add after baseline reliability is stable
- [ ] **CI diagnostics artifact (health report JSON/markdown)** — add when team needs faster incident triage
- [ ] **Public reliability status chips (Live/Fallback/Stale)** — add once fallback logic is proven

### Future Consideration (v2+)

- [ ] **Dual-source ingestion with API-first + managed fallbacks per platform** — higher reliability, higher ops overhead
- [ ] **Section-level reliability analytics and alerting** — useful after baseline incidents are reduced

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Always-visible sections with fallback copy | HIGH | LOW | P1 |
| Data contract validation in CI | HIGH | MEDIUM | P1 |
| Freshness indicator + stale state | HIGH | LOW | P1 |
| Manual refresh operational path | HIGH | LOW | P1 |
| Strict Hugo build settings | MEDIUM | LOW | P1 |
| Pre-deploy visual smoke tests | MEDIUM | MEDIUM | P2 |
| CI diagnostics artifact | MEDIUM | MEDIUM | P2 |
| Public reliability status chips | MEDIUM | MEDIUM | P2 |
| Dual-source ingestion hardening | MEDIUM | HIGH | P3 |
| Reliability analytics instrumentation | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for this milestone (fixes missing/fragile behavior)
- P2: Should have once baseline is stable
- P3: Strategic hardening for later

## Competitor Feature Analysis

| Feature | Typical Local Service Site | Best-in-Class Local Service Site | Our Approach |
|---------|----------------------------|----------------------------------|--------------|
| Reviews reliability | Static testimonials, no freshness signal | Aggregated reviews + clear source + fallback messaging | Keep aggregated attribution and add deterministic fallback + freshness |
| Service-area visibility | Static list only, map may be decorative | Text list + map + direct map link if embed fails | Text list + static map as baseline; embed only as enhancement |
| Failure handling | Section disappears or shows blank area | Explicit empty/stale states with operator diagnostics | Add visible state handling + CI diagnostics |
| Update operations | Manual ad-hoc edits only | Scheduled sync with manual override and monitoring | Keep scheduled sync and strengthen manual recovery + alerts |

## Sources

- Hugo data sources and template data behavior: https://gohugo.io/content-management/data-sources/ (HIGH)
- Hugo CLI strict build options (`--panicOnWarning`): https://gohugo.io/commands/hugo/ (HIGH)
- GitHub Actions schedule behavior and caveats (delay/drop/default branch/60-day disable): https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule (HIGH)
- Google Maps Embed API fallback-capable iframe approach and key restrictions: https://developers.google.com/maps/documentation/embed/embedding-map (HIGH)
- Google Places details API behavior (field selection, legacy/new differences): https://developers.google.com/maps/documentation/places/web-service/place-details and https://developers.google.com/maps/documentation/places/web-service/legacy/details (HIGH)
- Google review snippet guidelines (visible review content, local-business self-serving restrictions): https://developers.google.com/search/docs/appearance/structured-data/review-snippet (HIGH)
- Current project implementation review (`layouts/index.html`, `data/reviews.json`, `data/service_area.json`, `.github/workflows/fetch-reviews.yml`) (HIGH)

---
*Feature research for: Polos Electronics v1.1 reliability and visibility fixes*
*Researched: 2026-02-14*
