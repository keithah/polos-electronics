---
phase: 01-schema-and-local-seo
plan: 03
subsystem: seo
tags: [schema.org, json-ld, hugo-templates, faq-accordion, nap-consistency]

# Dependency graph
requires:
  - phase: 01-01
    provides: business.json, services.json, faq.json data files
  - phase: 01-02
    provides: schema partials for local-business, services, faq
provides:
  - Schema partials integrated into main template
  - Visible FAQ section with accordion UI
  - Centralized NAP in footer from data files
affects: [02-reviews-section]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hugo partial includes for schema markup"
    - "Site.Data.* for centralized business data"
    - "CSS accordion with aria-expanded accessibility"

key-files:
  created: []
  modified:
    - layouts/index.html
    - assets/css/custom.css

key-decisions:
  - "FAQ positioned between CTA and Contact sections"
  - "Accordion uses pure CSS + minimal JS (no library)"
  - "Footer uses Site.Data.business for NAP consistency with schema"

patterns-established:
  - "Schema inclusion: {{ partial 'schema/*.html' . }} in head"
  - "Data-driven content: {{ .Site.Data.business.* }} for NAP"
  - "Accessible accordion: aria-expanded + CSS .active toggling"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 01 Plan 03: Template Integration Summary

**Schema partials integrated into main template with visible FAQ accordion and centralized NAP sourced from data files**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-14T07:55:00Z
- **Completed:** 2026-02-14T07:58:34Z
- **Tasks:** 4 (including human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- Replaced 85 lines of hardcoded JSON-LD schema with 3 partial includes
- Added visible FAQ section with 7 questions and accordion interaction
- Updated footer and header to use centralized business data for NAP consistency
- Successfully verified all schema markup and FAQ functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace hardcoded schema with partial includes** - `9516ccf` (feat)
2. **Task 2: Add visible FAQ section to page** - `3c9b1d5` (feat)
3. **Task 3: Update footer and header to use centralized data** - `34c449e` (feat)
4. **Task 4: Checkpoint verification** - (human approval, no commit)

## Files Created/Modified
- `layouts/index.html` - Removed hardcoded schema, added partial includes, FAQ section HTML/JS, centralized NAP in footer/header
- `assets/css/custom.css` - Added FAQ section styling with accordion transitions

## Decisions Made
- Positioned FAQ section after CTA section and before Contact section for natural content flow
- Used pure CSS + minimal JavaScript for accordion (no external library dependency)
- Footer NAP now reads from Site.Data.business ensuring schema and display match exactly
- Kept Site.Params.phone for simple phone CTA links (user-facing, not schema-critical)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 core schema implementation complete
- All JSON-LD schemas (Electrician, Service, FAQPage) generating correctly
- FAQ visible and functional on page
- NAP consistent across footer display and schema markup
- Ready for Google Rich Results Test validation after deployment
- Phase 2 (Reviews Section) can proceed independently

---
*Phase: 01-schema-and-local-seo*
*Completed: 2026-02-14*
