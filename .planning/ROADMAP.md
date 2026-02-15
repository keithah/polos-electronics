# Roadmap: Polos Electronics Website Enhancements

## Overview

This roadmap tracks milestone-based delivery for the Hugo site. Phase numbering continues across milestones (never resets).

## Milestones

- ✅ **v1.0 Foundation** - Phases 1-3 (shipped 2026-02-14)
- ✅ **v1.1 Reliability & Visibility** - Phases 4-6 (shipped 2026-02-14)
- ✅ **v1.2 Interactive Coverage Map** - Phase 7 (shipped 2026-02-14)
- ✅ **v1.3 SEO Enhancement** - Phase 8 (shipped 2026-02-14)
- ✅ **v1.4 Performance & SEO Polish** - Phases 9-11 (shipped 2026-02-15)

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

<details>
<summary>✅ v1.1 Reliability & Visibility (Phases 4-6) - SHIPPED 2026-02-14</summary>

**Milestone Goal:** Reviews and service-area credibility signals reliably render and remain visible across ingestion failures, build regressions, and deploy drift.

- [x] **Phase 4: Rendering Reliability** - Make reviews and service-area sections deterministic and always visible
- [x] **Phase 4.1: Restore Rendering Reliability** - Fix Phase 4 regressions (fallback logic, freshness metadata)
- [x] **Phase 5: Validation & CI Gates** - Block broken data/assets/build output before deploy
- [x] **Phase 6: Operations & Recovery** - Reduce outage duration with fallback data and operator recovery paths

**Archive:** See `.planning/milestones/v1.1-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.2 Interactive Coverage Map (Phase 7) - SHIPPED 2026-02-14</summary>

**Milestone Goal:** Replace the static service-area image with an embedded interactive map for exploration while preserving a static SVG/image fallback for reliability.

- [x] **Phase 7: Interactive Service Map** - Embed an interactive map (iframe) with robust static fallback

</details>

<details>
<summary>✅ v1.3 SEO Enhancement (Phase 8) - SHIPPED 2026-02-14</summary>

**Milestone Goal:** Maximize search visibility and click-through rates through structured data enhancements, rich snippets, and technical SEO improvements.

- [x] **Phase 8: SEO Enhancement** - Add AggregateRating schema, Review schema, optimized social images, and technical SEO improvements

</details>

<details>
<summary>✅ v1.4 Performance & SEO Polish (Phases 9-11) - SHIPPED 2026-02-15</summary>

**Milestone Goal:** Improve PageSpeed Performance score from 51 to 80+ and fix SEO crawling issues.

### Phase 9: Crawling & Quick Wins
**Goal**: Search engines can crawl efficiently while images load faster with proper prioritization
**Dependencies**: None
**Requirements**: CRAWL-01, CRAWL-02, IMG-02, IMG-03, CLS-01, CLS-02
**Plans**: 1 plan

Plans:
- [x] 09-01-PLAN.md — robots.txt template + image dimensions + hero fetchpriority

**Success Criteria:**
1. robots.txt validates without errors and includes sitemap.xml reference
2. All images have explicit width and height attributes in HTML
3. Hero image loads with high priority (visible in network waterfall before other images)
4. Map embed container reserves space before iframe loads (no layout shift)

**Notes:**
- IMG-02 and CLS-01 are the same requirement (image dimensions prevent CLS)
- robots.txt uses Hugo template; only add sitemap directive (Cloudflare manages rest)
- CLS-02 already satisfied (map container has fixed 400px/350px height)

---

### Phase 10: WebP Image Conversion
**Goal**: Images load faster with modern WebP format while maintaining compatibility with older browsers
**Dependencies**: Phase 9 (image dimensions must be in place first)
**Requirements**: IMG-01

**Plans**: 1 plan

Plans:
- [x] 10-01-PLAN.md — Move raster images into assets/, generate WebP + fallbacks, and wire HTML/CSS

**Success Criteria:**
1. All site images served as WebP to browsers that support it
2. JPG/PNG fallback works in Safari 13 and older browsers
3. Hugo Pipes processes images from assets/ directory (not static/)
4. Build generates both WebP and original formats

**Notes:**
- Requires moving images from static/ to assets/ for Hugo Pipes
- Keep OG/Twitter images as JPG for social crawler compatibility

---

### Phase 11: CSS/JS Optimization
**Goal**: Page renders quickly by loading only critical styles immediately and deferring the rest
**Dependencies**: Phase 9 (layout must be stable before CSS changes)
**Requirements**: PERF-01, PERF-02, PERF-03
**Plans**: 1 plan

Plans:
- [x] 11-01-PLAN.md — Split CSS into critical/deferred, inline critical, async-load fonts

**Success Criteria:**
1. Above-fold content styles are inlined in HTML head (no external CSS blocks initial render)
2. Non-critical CSS loads after initial paint (deferred via media or rel="preload")
3. No render-blocking JavaScript in document head
4. PageSpeed Performance score reaches 80+

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Schema & Local SEO | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 2. Review Aggregation | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 3. Service Area Mapping | v1.0 | 3/3 | ✓ Complete | 2026-02-14 |
| 4. Rendering Reliability | v1.1 | 3/3 | ✓ Complete | 2026-02-14 |
| 4.1. Restore Rendering Reliability | v1.1 | 1/1 | ✓ Complete | 2026-02-14 |
| 5. Validation & CI Gates | v1.1 | 2/2 | ✓ Complete | 2026-02-14 |
| 6. Operations & Recovery | v1.1 | 1/1 | ✓ Complete | 2026-02-14 |
| 7. Interactive Service Map | v1.2 | 1/1 | ✓ Complete | 2026-02-14 |
| 8. SEO Enhancement | v1.3 | 3/3 | ✓ Complete | 2026-02-14 |
| 9. Crawling & Quick Wins | v1.4 | 1/1 | ✓ Complete | 2026-02-15 |
| 10. WebP Image Conversion | v1.4 | 1/1 | ✓ Complete | 2026-02-15 |
| 11. CSS/JS Optimization | v1.4 | 1/1 | ✓ Complete | 2026-02-15 |

**All phases complete.** Run `/gsd:audit-milestone` to verify milestone completion.
