---
phase: 10-webp-image-conversion
plan: 01
subsystem: perf
tags: [webp, hugo, hugo-pipes, picture, resources-copy, image-set]

# Dependency graph
requires:
  - phase: 09-crawling-quick-wins
    provides: explicit image dimensions and hero fetchpriority foundation
provides:
  - WebP siblings for all in-page raster assets with stable /images/* URLs
  - Reusable Hugo <picture> partial (WebP first, JPG/PNG fallback)
  - CSS background WebP strategy via image-set with JPG fallback
affects: [11-css-js-optimization, performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Publish stable image URLs via Hugo Pipes resources.Copy (no fingerprinting)"
    - "Render raster assets via a shared picture partial"

key-files:
  created:
    - layouts/partials/img/picture.html
  modified:
    - assets/images/
    - layouts/index.html
    - assets/css/custom.css
    - .github/workflows/hugo.yml
    - scripts/svg-to-png.js
    - hugo.toml

key-decisions:
  - "Keep OpenGraph/Twitter meta images as JPG for crawler compatibility"
  - "Prefer WebP for in-page raster assets with JPG/PNG fallbacks"

patterns-established:
  - "Use partial img/picture.html for any in-template raster image"
  - "Use publish_only to ensure required sibling assets exist in public/"

# Metrics
duration: 7min
completed: 2026-02-15
---

# Phase 10 Plan 01: WebP Image Conversion Summary

**Hugo Pipes now publishes stable `/images/*.webp` siblings and renders WebP-first `<picture>` markup with JPG/PNG fallbacks.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-15T19:46:14Z
- **Completed:** 2026-02-15T19:53:31Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Moved in-page raster sources to `assets/images/` so Hugo Pipes can generate optimized variants.
- Added `layouts/partials/img/picture.html` to publish stable fallback + WebP URLs and render `<picture>` consistently.
- Updated homepage templates to use the partial for all raster images (logo, hero, team, services, contact, service-area preview) and to always publish the map PNG fallback.
- Switched CTA background styling to `image-set(...)` to prefer WebP while keeping JPG fallback behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Move raster images to assets/ and align CI/script checks** - `53201e9` (chore)
2. **Task 2: Implement Hugo WebP publish + <picture> partial and wire all raster images** - `22e72ca` (feat)
3. **Task 3: Add WebP strategy for CSS background images** - `515ce9a` (perf)

**Plan metadata:** (see docs commit after SUMMARY/STATE update)

## Files Created/Modified

- `assets/images/` - Raster image sources for Hugo Pipes (JPG/PNG) used in-page.
- `layouts/partials/img/picture.html` - Publishes WebP + fallback siblings to stable targets and renders `<picture>` markup.
- `layouts/index.html` - Uses `partial "img/picture.html"` for all raster images; publish-only call ensures map fallback assets exist.
- `assets/css/custom.css` - CTA background uses WebP via `image-set(...)` with JPG baseline fallback.
- `.github/workflows/hugo.yml` - CI validates moved assets (SVG stays in static/, raster fallback PNG lives in assets/).
- `scripts/svg-to-png.js` - Generates `assets/images/service-area-map.png` from the static SVG source.
- `hugo.toml` - Keeps HTML minifier quotes to stabilize CI greps.

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] WebP variants were not being written to stable targets**

- **Found during:** Task 2 (verification)
- **Issue:** The initial partial produced WebP `srcset` paths that did not match intended stable `/images/*.webp` targets.
- **Fix:** Corrected WebP target path derivation so `resources.Copy` publishes `images/name.webp` siblings.
- **Files modified:** `layouts/partials/img/picture.html`
- **Verification:** `test -f public/images/hero-image.webp` and homepage `type="image/webp"` sources
- **Committed in:** `22e72ca` (Task 2 commit)

**2. [Rule 3 - Blocking] Hugo minifier removed attribute quotes, breaking planned greps**

- **Found during:** Task 2 (verification)
- **Issue:** `hugo --minify` removed quotes from `type="image/webp"`, causing the plan's `grep` verification to fail.
- **Fix:** Enabled `minify.tdewolff.html.keepQuotes = true`.
- **Files modified:** `hugo.toml`
- **Verification:** `grep -q 'type="image/webp"' public/index.html` succeeds
- **Committed in:** `22e72ca` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes were required to satisfy stable URL + CI verification requirements. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- IMG-01 satisfied: modern browsers get WebP and legacy browsers render JPG/PNG fallbacks.
- Public image URLs remain stable (`/images/foo.jpg|png` plus sibling `/images/foo.webp`).
- Ready for Phase 11: CSS/JS Optimization.

---
*Phase: 10-webp-image-conversion*
*Completed: 2026-02-15*
