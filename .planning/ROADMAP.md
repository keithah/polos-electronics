# Roadmap: Polos Electronics Website Enhancements

## Overview

This roadmap now tracks milestone-based delivery for the Hugo site. v1.0 foundation work is complete (phases 1-3), and v1.1 focuses on reliability and visibility so reviews and service-area signals remain consistently present in local and production output. The phase sequence follows dependency order: deterministic rendering first, then validation/deploy gates, then operations and recovery hardening.

## Milestones

- ✅ **v1.0 Foundation** - Phases 1-3 (shipped 2026-02-14)
- ✅ **v1.1 Reliability & Visibility** - Phases 4-6 (shipped 2026-02-14)
- ✅ **v1.2 Interactive Coverage Map** - Phase 7 (shipped 2026-02-14)
- ✅ **v1.3 SEO Enhancement** - Phase 8 (shipped 2026-02-14)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phases 1-3) - SHIPPED 2026-02-14</summary>

### Phase 1: Schema & Local SEO
**Goal**: Search engines understand Polos Electronics as a verified local electrical contractor with defined service areas
**Plans**: 3 plans

### Phase 2: Review Aggregation
**Goal**: Visitors see authentic customer reviews from multiple platforms, building trust before contact
**Plans**: 3 plans

### Phase 3: Service Area Mapping
**Goal**: Visitors instantly understand whether Polos Electronics serves their location
**Plans**: 3 plans

</details>

### ✅ v1.1 Reliability & Visibility (Shipped 2026-02-14)

**Milestone Goal:** Reviews and service-area credibility signals reliably render and remain visible across ingestion failures, build regressions, and deploy drift.

- [x] **Phase 4: Rendering Reliability** - Make reviews and service-area sections deterministic and always visible
- [x] **Phase 4.1: Restore Rendering Reliability** - Fix Phase 4 regressions (fallback logic, freshness metadata)
- [x] **Phase 5: Validation & CI Gates** - Block broken data/assets/build output before deploy
- [x] **Phase 6: Operations & Recovery** - Reduce outage duration with fallback data and operator recovery paths

### ✅ v1.2 Interactive Coverage Map (Shipped 2026-02-14)

**Milestone Goal:** Replace the static service-area image with an embedded interactive map for exploration while preserving a static SVG/image fallback for reliability.

- [x] **Phase 7: Interactive Service Map** - Embed an interactive map (iframe) with robust static fallback

### ✅ v1.3 SEO Enhancement (Shipped 2026-02-14)

**Milestone Goal:** Maximize search visibility and click-through rates through structured data enhancements, rich snippets, and technical SEO improvements.

- [x] **Phase 8: SEO Enhancement** - Add AggregateRating schema, Review schema, optimized social images, and technical SEO improvements

## Phase Details

### Phase 4: Rendering Reliability
**Goal**: Users consistently see credibility and coverage sections even when upstream data or primary assets are degraded
**Depends on**: Phase 3
**Requirements**: REND-01, REND-02, REND-03
**Success Criteria** (what must be TRUE):
  1. User always sees a Reviews section, even when live review ingestion is empty or stale
  2. User always sees a Service Area section with map context, even when the primary map asset fails
  3. User can see when review data was last updated and whether review data is stale
**Plans**: 3 plans (04-01 to 04-03)
**Status**: ✓ Complete (original), but regressions found in audit

### Phase 4.1: Restore Rendering Reliability
**Goal**: Fix Phase 4 regressions identified in milestone audit so REND-01 and REND-03 are fully satisfied
**Depends on**: Phase 4
**Requirements**: REND-01, REND-03
**Gap Closure**: Closes gaps from v1.1-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. Review fallback logic conditionally switches (not appends) when live reviews empty
  2. Freshness partial re-enabled with correct data contract fields
  3. `staleAfterDays` and `freshnessLabel` fields present in reviews.json
**Plans**: 1 plan
Plans:
- [x] 04.1-01-PLAN.md — Restore fallback logic and freshness metadata
**Status**: ✓ Complete (2026-02-14)

### Phase 5: Validation & CI Gates
**Goal**: Users are protected from silent homepage regressions because invalid inputs and broken output are blocked before publish
**Depends on**: Phase 4.1
**Requirements**: VALD-01, VALD-02, VALD-03, VALD-04
**Gap Closure**: Closes gaps from v1.1-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. Invalid review data contracts are rejected before site build, preventing malformed review content from reaching production
  2. Invalid service-area data or missing required map assets are rejected before deploy
  3. Hugo build/deploy pipeline fails on warnings and path issues instead of publishing risky output
  4. Built homepage output is automatically checked for reviews and service-area/map presence before deployment can continue
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md — Pre-build validation gates (data contracts, asset existence)
- [x] 05-02-PLAN.md — Build hardening and smoke checks (strict mode, error messages)
**Status**: ✓ Complete (2026-02-14)

### Phase 6: Operations & Recovery
**Goal**: Users continue seeing credible review/service visibility while operators can quickly diagnose and recover reliability incidents
**Depends on**: Phase 5
**Requirements**: OPER-01, OPER-02, OPER-03
**Gap Closure**: Closes gaps from v1.1-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. Users still see credible review content from last-known-good data when ingestion fails
  2. Operators can trigger a documented manual recovery run that restores review/map reliability without code changes
  3. CI runs provide review/map health diagnostics that make reliability incidents faster to identify and resolve
**Plans**: 1 plan
Plans:
- [x] 06-01-PLAN.md — Create OPERATIONS.md recovery runbook
**Status**: ✓ Complete (2026-02-14)

### Phase 7: Interactive Service Map
**Goal**: Users can explore coverage context via an embedded interactive map while the Service Area section remains reliable through a static fallback
**Depends on**: Phase 4
**Requirements**: IMAP-01, IMAP-02
**Success Criteria** (what must be TRUE):
  1. Service Area section renders with an interactive embedded map when available (no paid JS API required)
  2. If the embed is blocked/unavailable, a static SVG/image fallback renders automatically so users still see map context
  3. Users have a clear "Open in Google Maps" link as an escape hatch
**Status**: ✓ Complete (2026-02-14)

### Phase 8: SEO Enhancement
**Goal**: Maximize search visibility through rich snippets, structured data, and technical SEO so Polos Electronics stands out in local search results
**Depends on**: Phase 7
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07
**Success Criteria** (what must be TRUE):
  1. AggregateRating schema is present (semantic value - note: Google does not display stars for self-hosted LocalBusiness reviews)
  2. Individual reviews are marked up with Review schema for semantic understanding
  3. Service area coverage uses GeoCircle schema for local SEO
  4. Social share image is a designed branded image (not just logo)
  5. Sitemap.xml exists and is properly configured
  6. Images are optimized for page speed (lazy loading, proper sizing)
  7. FAQ answers include internal links to relevant sections
**Plans**: 3 plans
**Status**: ✓ Complete (2026-02-14)
Plans:
- [x] 08-01-PLAN.md — Schema enhancement (AggregateRating, Review, GeoCircle)
- [x] 08-02-PLAN.md — Social image, sitemap config, FAQ internal links
- [x] 08-03-PLAN.md — Image lazy loading optimization

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 4.1 > 5 > 6 > 7 > 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Schema & Local SEO | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 2. Review Aggregation | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 3. Service Area Mapping | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 4. Rendering Reliability | v1.1 | 3/3 | ✓ Complete (regressed) | 2026-02-14 |
| 4.1. Restore Rendering Reliability | v1.1 | 1/1 | ✓ Complete | 2026-02-14 |
| 5. Validation & CI Gates | v1.1 | 2/2 | ✓ Complete | 2026-02-14 |
| 6. Operations & Recovery | v1.1 | 1/1 | ✓ Complete | 2026-02-14 |
| 7. Interactive Service Map | v1.2 | 1/1 | ✓ Complete | 2026-02-14 |
| 8. SEO Enhancement | v1.3 | 3/3 | ✓ Complete | 2026-02-14 |
