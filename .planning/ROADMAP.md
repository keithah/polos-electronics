# Roadmap: Polos Electronics Website Enhancements

## Overview

This roadmap delivers three enhancement areas to the existing Polos Electronics Hugo site: enhanced schema markup and local SEO, multi-platform review aggregation with display, and visual service area mapping. The phasing prioritizes schema foundation first (to avoid deploying invalid markup), then review aggregation (the primary credibility driver), then service area mapping (can proceed independently).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Schema & Local SEO** - Establish correct schema patterns and NAP consistency before adding review content
- [ ] **Phase 2: Review Aggregation** - Fetch reviews from multiple platforms and display with proper attribution
- [ ] **Phase 3: Service Area Mapping** - Visual map and text listing of coverage areas

## Phase Details

### Phase 1: Schema & Local SEO
**Goal**: Search engines understand Polos Electronics as a verified local electrical contractor with defined service areas
**Depends on**: Nothing (first phase)
**Requirements**: SCHM-01, SCHM-02, SCHM-03, SCHM-04, SCHM-05
**Success Criteria** (what must be TRUE):
  1. Google Rich Results Test validates LocalBusiness schema with ElectricalContractor subtype
  2. Schema includes areaServed property listing Clark, Cowlitz, and Skamania counties
  3. NAP (Name/Address/Phone) matches exactly across website, schema, and external listings
  4. Each electrical service has corresponding Service schema visible in page source
  5. FAQ section displays on page with FAQPage schema markup validated
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Review Aggregation
**Goal**: Visitors see authentic customer reviews from multiple platforms, building trust before contact
**Depends on**: Phase 1 (schema foundation established)
**Requirements**: REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07
**Success Criteria** (what must be TRUE):
  1. Reviews from Google Business Profile display on the website with platform attribution
  2. Reviews from Yelp display with required badges and "Read More" links (TOS compliance)
  3. HomeAdvisor and Nextdoor reviews appear via manual curation process
  4. Review data stored in normalized format in data/reviews.json with platform source field
  5. Deep links to each review platform allow customers to leave new reviews
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Service Area Mapping
**Goal**: Visitors instantly understand whether Polos Electronics serves their location
**Depends on**: Nothing (can run parallel to Phase 2 after Phase 1 complete)
**Requirements**: AREA-01, AREA-02, AREA-03, AREA-04
**Success Criteria** (what must be TRUE):
  1. Static map image displays showing Washington state with Battle Ground starred and Clark County highlighted
  2. Bordering counties (Cowlitz, Skamania) show in lighter color with visual hierarchy
  3. Text listing organizes service areas by priority: Clark County primary, bordering counties secondary, statewide coverage tertiary
  4. data/service-area.json contains comprehensive county and city data consumed by templates
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 (Phase 3 can optionally run parallel to Phase 2)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema & Local SEO | 0/TBD | Not started | - |
| 2. Review Aggregation | 0/TBD | Not started | - |
| 3. Service Area Mapping | 0/TBD | Not started | - |
