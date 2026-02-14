---
phase: 03-service-area-mapping
plan: 01
subsystem: data
tags: [json, service-area, local-seo, geographic]

# Dependency graph
requires:
  - phase: 01-schema-and-local-seo
    provides: business.json with areaServed counties
provides:
  - Tiered service area data structure (primary/secondary/statewide)
  - Comprehensive Clark County city/community listings (18 locations)
  - Cowlitz and Skamania county city listings
  - Service area metadata (tagline, outOfAreaCTA, map config)
affects: [03-02, 03-03, local-seo-templates]

# Tech tracking
tech-stack:
  added: []
  patterns: [tiered-data-hierarchy, county-city-nesting]

key-files:
  created: []
  modified: [data/service-area.json]

key-decisions:
  - "18 locations in Clark County: 7 incorporated cities + 11 unincorporated communities"
  - "Battle Ground marked as isHeadquarters: true for template identification"
  - "sameAs links to Wikipedia for county disambiguation"

patterns-established:
  - "Tiered service area: primary (home county), secondary (neighboring), statewide (licensed)"
  - "City objects with name, type (city/unincorporated), optional isHeadquarters flag"

# Metrics
duration: 1min
completed: 2026-02-14
---

# Phase 3 Plan 1: Service Area Data Summary

**Tiered service area JSON with 26 total locations across 3 Washington counties**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-14T16:48:44Z
- **Completed:** 2026-02-14T16:49:36Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created 3-tier service area hierarchy (primary, secondary, statewide)
- Listed 18 Clark County locations (7 cities, 11 unincorporated communities)
- Added 5 Cowlitz County and 3 Skamania County cities
- Ensured county names match business.json areaServed for schema consistency

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand service-area.json with tiered structure** - `667e0f9` (feat)

**Plan metadata:** See below

## Files Created/Modified
- `data/service-area.json` - Comprehensive tiered service area data with cities, metadata, and map config

## Decisions Made
- Included 11 unincorporated Clark County communities (Brush Prairie, Hockinson, Hazel Dell, etc.) for better local SEO coverage
- Marked Battle Ground with `isHeadquarters: true` to enable template differentiation
- Used Wikipedia sameAs links for counties matching existing business.json pattern

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Service area data ready for template integration in 03-02 (interactive map)
- Data structure supports iteration over tiers, counties, and cities
- No blockers

---
*Phase: 03-service-area-mapping*
*Completed: 2026-02-14*
