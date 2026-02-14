---
phase: 04-rendering-reliability
plan: 02
subsystem: ui
tags: [hugo, templates, reviews, fallback, reliability]

requires:
  - phase: 04-rendering-reliability
    provides: reliability review data contracts from 04-01
provides:
  - Deterministic review card rendering from live or fallback datasets
  - Reusable reviews freshness metadata partial with stale threshold handling
  - Per-review attribution fallback to review-level profile links
affects: [04-03-map-failover-ui, 05-validation-and-ci-gates]

tech-stack:
  added: []
  patterns:
    - deterministic template selection with live-first and fallback review slices
    - low-emphasis freshness metadata rendered via shared partial

key-files:
  created:
    - layouts/partials/reviews-reliability-meta.html
  modified:
    - layouts/index.html

key-decisions:
  - "Applied the same review inclusion rule (4+ stars or Nextdoor) to both live and fallback arrays for consistent card quality."
  - "Removed review empty-state copy so section behavior is always card-first and deterministic."
  - "Used platform config first and per-review profileUrl as fallback to preserve attribution links in every rendered card."

duration: 8m
completed: 2026-02-14
---

# Phase 4 Plan 2: Deterministic Reviews Rendering Summary

**Reviews now always render as cards from live or fallback data, with visible low-emphasis freshness metadata under the section title.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-14T17:54:00Z
- **Completed:** 2026-02-14T18:02:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced conditional empty-state flow with deterministic `$displayReviews` selection in `layouts/index.html`.
- Added fallback pass over `.Site.Data.reviews.fallbackReviews` when live review ingestion is empty.
- Preserved review-card shell and platform CTA block across all rendering states.
- Ensured attribution links remain available by falling back to per-review `profileUrl` when platform map metadata is absent.
- Added reusable `layouts/partials/reviews-reliability-meta.html` using `time.AsTime`, `time.Now`, and `staleAfterDays` (default 45).
- Integrated freshness metadata directly beneath the reviews heading with neutral copy (`Updated <date>`, optional `Refresh in progress`).

## Verification
- `grep -n "fallbackReviews" layouts/index.html` returned a match.
- `grep -n "reviews-reliability-meta" layouts/index.html` returned a partial include match.
- No review empty-state paragraph remains in `layouts/index.html`.
- `hugo --gc --minify` completed successfully (existing unrelated Hugo taxonomy/page layout warnings persist).
- `rg "Updated|Refresh in progress" public/index.html` confirmed freshness metadata renders in built output.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace review empty-state branch with deterministic card fallback** - `fd3a4bc` (feat)
2. **Task 2: Add freshness metadata partial and integrate under reviews title** - `227f21c` (feat)

## Files Created/Modified
- `layouts/index.html` - Added deterministic live/fallback review selection and preserved attribution fallback behavior.
- `layouts/partials/reviews-reliability-meta.html` - Added reusable review freshness metadata block with stale-threshold logic.

## Decisions Made
- Used a single review card rendering path for live and fallback sources to avoid visual drift.
- Kept stale messaging neutral and low-emphasis (`Refresh in progress`) to match trust-preserving tone guidance.
- Kept platform badge/source links visible by falling back to review-level profile URLs when needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Requirement coverage for REND-01 and REND-03 is implemented in homepage template rendering.
- Reviews section now remains card-based even with empty live ingestion.
- Freshness metadata now renders from data contracts established in `04-01`.
- Ready for `04-03-PLAN.md`.

---
*Phase: 04-rendering-reliability*
*Completed: 2026-02-14*
