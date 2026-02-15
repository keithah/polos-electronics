---
phase: 04-rendering-reliability
plan: 03
subsystem: ui
tags: [hugo, templates, css, service-area, fallback, reliability]

requires:
  - phase: 04-rendering-reliability
    provides: deterministic reviews rendering and service-area fallback data contract
provides:
  - Service-area map failover chain (primary image -> fallback image -> inline context block)
  - Inline fallback context with call and contact CTAs for continuity-first UX
  - Styling for map fallback UI and low-emphasis reviews reliability metadata
affects: [05-validation-and-ci-gates, 06-operations-and-recovery]

tech-stack:
  added: []
  patterns:
    - progressive image failover using inline onerror fallback swap
    - always-present fallback DOM block revealed only after image failure
    - continuity-oriented fallback styling without warning-state visuals

key-files:
  created: []
  modified:
    - layouts/index.html
    - assets/css/custom.css

key-decisions:
  - "Kept service-area list and tier context as first-class content independent of map rendering success."
  - "Implemented two-step map failover (url to fallbackUrl) before revealing textual fallback context and CTAs."
  - "Styled reliability metadata and fallback container with neutral/muted presentation to avoid alarm messaging."

duration: 6m
completed: 2026-02-14
---

# Phase 4 Plan 3: Service-Area Map Failover Summary

**Implemented seamless service-area map failover so coverage context and conversion CTAs remain visible even when map assets fail to render.**

## Performance

- **Duration:** 6 min
- **Completed:** 2026-02-14
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added map failover chain in `layouts/index.html`: primary `map.url`, one retry via `map.fallbackUrl`, then inline `.service-area-map-fallback` reveal.
- Kept fallback context block in DOM by default (`hidden`) and toggled visibility only after image-render failure.
- Included fallback continuity content from data contract: `map.fallbackContext`, `fallbackCallCta`, and `fallbackContactCta`.
- Added fallback CTAs in map panel: direct `tel:` call action and `#contact` anchor.
- Wrapped reviews freshness partial in `.reviews-reliability-meta` container for low-emphasis reliability metadata styling.
- Added CSS for `.service-area-map-fallback` and CTA row to match existing card/button system with mobile-safe stacking.

## Verification
- `hugo --gc --minify` completed successfully.
- `grep "fallbackUrl|service-area-map-fallback|reviews-reliability-meta" layouts/index.html` returned expected matches.
- `grep "reviews-reliability-meta|service-area-map-fallback" assets/css/custom.css` returned expected matches.
- Existing Hugo warnings about missing taxonomy/page templates remain unchanged from previous plans.

## Files Created/Modified
- `layouts/index.html` - Added map failover rendering logic, fallback context/CTA block, and reviews metadata wrapper.
- `assets/css/custom.css` - Added fallback-state card styling, fallback CTA layout, and muted reliability metadata styles.

## Deviations from Plan

None - plan executed as specified for code changes.

## Issues Encountered

None

## Human Verification Gate (Blocking)

Pending manual check from plan checkpoint:

1. Run `hugo server` and load homepage.
2. Temporarily break `map.url` in `data/service_area.json` and refresh.
3. Confirm fallback image is attempted, then fallback context block appears if fallback image fails.
4. Confirm both fallback CTAs remain visible/readable on desktop and mobile (~375px).
5. Confirm tone remains non-alarmist in Reviews and Service Area sections.

Resume signal: type **"approved"** if behavior is seamless, or share adjustments needed.

## Next Phase Readiness
- REND-02 map failover behavior is implemented in template and CSS.
- Reliability metadata and map fallback visuals are aligned for Phase 4 continuity goals.
- Ready for checkpoint confirmation before advancing.

---
*Phase: 04-rendering-reliability*
*Completed: 2026-02-14*
