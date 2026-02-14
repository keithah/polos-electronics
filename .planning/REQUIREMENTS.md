# Requirements: Polos Electronics Website Enhancements

**Defined:** 2026-02-13
**Core Value:** Potential customers can quickly verify Polos Electronics' credibility through authentic reviews and understand whether they're in the service area — before picking up the phone.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Schema & SEO Foundation

- [x] **SCHM-01**: Upgrade LocalBusiness schema to ElectricalContractor subtype
- [x] **SCHM-02**: Add areaServed property with Clark, Cowlitz, and Skamania counties
- [x] **SCHM-03**: Conduct NAP (Name/Address/Phone) consistency audit across website, schema, Google Business Profile, Yelp, and review platforms
- [x] **SCHM-04**: Add Service schema for each electrical service offering
- [x] **SCHM-05**: Create FAQ section with Schema.org FAQPage markup

### Review Aggregation

- [ ] **REVW-01**: Extend GitHub Actions workflow to fetch Google reviews via Places API
- [ ] **REVW-02**: Add GitHub Actions workflow to fetch Yelp reviews via Fusion API (free tier)
- [ ] **REVW-03**: Implement web scraping automation for HomeAdvisor reviews
- [ ] **REVW-04**: Implement web scraping automation for Nextdoor reviews
- [ ] **REVW-05**: Create unified review display component with platform-specific attribution
- [ ] **REVW-06**: Add deep links to review platforms for customers to leave reviews
- [ ] **REVW-07**: Normalize review data structure across all platforms in data/reviews.json

### Service Area Mapping

- [ ] **AREA-01**: Generate static map image using Geoapify API showing Washington state
- [ ] **AREA-02**: Implement visual hierarchy on map (Battle Ground starred, Clark County highlighted, bordering counties lighter color)
- [ ] **AREA-03**: Create text-based service area listing organized by priority (Clark County primary, bordering counties secondary, statewide coverage)
- [ ] **AREA-04**: Populate data/service-area.json with comprehensive county and city data

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Interactivity

- **MAP-01**: Interactive map widget with pan/zoom functionality
- **MAP-02**: Client-side JavaScript overlay for service area boundaries

### Content Expansion

- **CITY-01**: City-specific landing pages with unique content for major service areas
- **VIDO-01**: Video testimonials from customers
- **SYNC-01**: Real-time review synchronization instead of scheduled fetching

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| AggregateRating schema for reviews | Google prohibits self-serving review schema; will not show stars and may cause penalties |
| Combined review ratings across platforms | Yelp TOS prohibits blending their ratings with other sources |
| Backend server or database | Static site architecture is a project constraint and design choice |
| Mobile app or PWA | Static website serves current business needs; no identified user demand |
| Blog or content marketing | Focus on core business site; content strategy is separate initiative |
| Multi-page site structure | Single-page architecture works well for local service business |
| Real-time chat or customer portal | Contact form is sufficient; no identified need for live chat |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHM-01 | Phase 1 | Complete |
| SCHM-02 | Phase 1 | Complete |
| SCHM-03 | Phase 1 | Complete |
| SCHM-04 | Phase 1 | Complete |
| SCHM-05 | Phase 1 | Complete |
| REVW-01 | Phase 2 | Pending |
| REVW-02 | Phase 2 | Pending |
| REVW-03 | Phase 2 | Pending |
| REVW-04 | Phase 2 | Pending |
| REVW-05 | Phase 2 | Pending |
| REVW-06 | Phase 2 | Pending |
| REVW-07 | Phase 2 | Pending |
| AREA-01 | Phase 3 | Pending |
| AREA-02 | Phase 3 | Pending |
| AREA-03 | Phase 3 | Pending |
| AREA-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-14 after Phase 1 completion*
