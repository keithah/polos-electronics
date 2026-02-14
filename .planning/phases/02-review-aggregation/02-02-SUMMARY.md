---
phase: 02-review-aggregation
plan: 02
subsystem: infra
tags: [github-actions, playwright, google-places-api, yelp-fusion, jq]

requires:
  - phase: 02-01
    provides: review data schema and platform metadata contract in data/reviews.json
provides:
  - monthly GitHub Actions automation for Google, Yelp, HomeAdvisor, and Nextdoor review ingestion
  - resilient per-platform fetch/scrape fallback behavior that avoids pipeline failure on source errors
  - metadata-preserving jq merge so platforms profile links remain intact for frontend rendering
affects: [02-03, phase-3-service-area]

tech-stack:
  added: [playwright]
  patterns: [metadata-first extraction and merge, per-source failure fallback to empty arrays]

key-files:
  created: []
  modified: [.github/workflows/fetch-reviews.yml]

key-decisions:
  - "Switched schedule to monthly cron (0 0 1 * *) while retaining workflow_dispatch for safe manual reruns."
  - "Preserved data/reviews.json platforms metadata before ingest so profileUrl and downstream template links are not lost."
  - "Used API-first ingestion (Google/Yelp) plus Playwright scraping fallbacks (HomeAdvisor/Nextdoor) in one workflow."

patterns-established:
  - "Workflow resilience: each external source writes a valid JSON fallback when unavailable."
  - "Stats enrichment: platform overallRating/totalReviews merged into platforms object before final write."

duration: 1m
completed: 2026-02-14
---

# Phase 2 Plan 2: Multi-Platform Workflow Summary

**Monthly multi-source review sync now combines Google and Yelp APIs with Playwright scraping for HomeAdvisor/Nextdoor while preserving platform metadata required by Hugo templates.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-14T09:56:01Z
- **Completed:** 2026-02-14T09:57:16Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced the Google-only daily workflow with a monthly, multi-platform review pipeline.
- Added Yelp API integration using secrets (`YELP_API_KEY`, `YELP_BUSINESS_ID`) with 4-5 star filtering.
- Added Playwright setup plus HomeAdvisor and Nextdoor scraping scripts with graceful error fallback.
- Preserved and enriched `platforms` metadata during merge to keep profile URLs and aggregate stats available.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update GitHub Actions workflow for multi-platform review fetching with Playwright scraping** - `cc2e3d4` (feat)

## Files Created/Modified
- `.github/workflows/fetch-reviews.yml` - Monthly multi-platform ingestion, filtering, merge, and commit workflow.

## Decisions Made
- Kept Nextdoor recommendations even when rating is null, while preserving 4-5 star filtering for platforms with numeric ratings.
- Captured Google and Yelp platform-level stats (`overallRating`, `totalReviews`) during fetch and merged into `platforms`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `yamllint` was unavailable in the local environment; YAML validity was verified by parsing with Ruby Psych.

## User Setup Required

External services require manual configuration in GitHub repository secrets:
- `YELP_API_KEY`
- `YELP_BUSINESS_ID`

Also create/manage the Yelp Fusion app in the Yelp Developers dashboard:
- `https://www.yelp.com/developers/v3/manage_app`

## Next Phase Readiness
- Review automation pipeline is in place and compatible with the `data/reviews.json` structure consumed by templates.
- No blockers identified for phase completion.

---
*Phase: 02-review-aggregation*
*Completed: 2026-02-14*
