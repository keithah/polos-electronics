# Project Research Summary

**Project:** Polos Electronics - Review Aggregation, Service Area Mapping, and Local SEO Enhancement
**Domain:** Local Service Business Website Enhancement (Static Site)
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

This project enhances an existing Hugo static site for an electrical contractor business by adding multi-platform review aggregation, service area mapping, and enhanced local SEO structured data. Based on research, the recommended approach leverages **build-time data fetching** rather than client-side widgets, maintaining the performance benefits of static site generation while adding dynamic review content through GitHub Actions cron jobs.

The optimal path forward uses the existing Hugo 0.135.0 foundation (upgraded to 0.155.3), extends the current GitHub Actions workflow pattern for review aggregation, and enhances the already-implemented LocalBusiness schema with service area definitions and proper review display. Critical success factors include avoiding Google's self-serving review schema prohibition, maintaining strict NAP (Name/Address/Phone) consistency across all platforms, and adhering to Yelp's display requirements for multi-platform aggregation.

The primary risk is schema markup violations that prevent rich results in search. Google explicitly prohibits AggregateRating schema on LocalBusiness reviews displayed on your own site. This means reviews must be displayed for human social proof only, without schema markup. The architecture must prioritize schema enhancement first to establish correct patterns, then build review aggregation and mapping features on that foundation.

## Key Findings

### Recommended Stack

**Core approach:** Extend the existing Hugo + GitHub Actions deployment pattern with scheduled review fetching and enhanced structured data. The project already has solid infrastructure (Hugo 0.135.0, GitHub Pages deployment, basic LocalBusiness schema), so the focus is enhancement rather than rebuild.

**Core technologies:**
- **Hugo 0.155.3** (upgrade from 0.135.0) — Latest stable release with `resources.GetRemote` for build-time API fetching; maintains static site benefits
- **GitHub Actions cron schedules** — Already used for deployment; extend for daily/weekly review fetching from Google Places API and Yelp Fusion API
- **JSON data files** (`data/reviews.json`, `data/service-area.json`) — Single source of truth consumed by Hugo templates at build time; existing pattern already established with `data/reviews.json` (currently empty)
- **Geoapify Static Maps API** — 3,000 credits/day free tier for service area map generation without JavaScript overhead or Google Maps billing requirements
- **Schema.org JSON-LD partials** — Reusable template components for LocalBusiness, Service, and areaServed structured data; project already has basic implementation

**Key limitation:** Google Places API returns maximum 5 reviews per request, Yelp Fusion API returns 3 reviews (free tier). For platforms without public APIs (HomeAdvisor, Nextdoor), manual curation or third-party aggregation services are required.

### Expected Features

**Must have (table stakes):**
- **LocalBusiness Schema with specific subtype** — Change from generic `LocalBusiness` to `ElectricalContractor` or `ProfessionalService` for better rich result eligibility
- **NAP consistency across site and schema** — Exact match between displayed contact info, schema markup, Google Business Profile, and review platforms (even minor variations like "St." vs "Street" fragment citation profile)
- **Populated reviews from Google Business Profile** — Currently `data/reviews.json` is empty; minimum 5 reviews required for credibility
- **Service area definition in schema** — `areaServed` property with specific counties/cities for local pack eligibility
- **Reviews display with platform attribution** — Visual display for users (not schema markup) showing platform badges and timestamps

**Should have (competitive):**
- **Multi-platform review aggregation** — Display reviews from Google, Yelp, Nextdoor, and HomeAdvisor to show volume and breadth (consumers use 6+ review sites in 2026)
- **Service area map (static initially)** — Visual representation of coverage area; reduces "do you serve my area?" calls
- **FAQ section with Schema.org markup** — Captures voice search queries; addresses common questions about pricing, service area, response time
- **Review platform deep links** — Direct CTAs to leave reviews increase review velocity

**Defer (v2+):**
- **City-specific landing pages** — High effort requiring unique content per location; defer until traffic data justifies investment
- **Interactive service area map** — Client-side JavaScript adds complexity; static map sufficient for initial launch
- **Video testimonials** — Production cost and complexity; only if customers provide video content
- **Real-time review sync** — Complexity overhead; weekly/daily refresh sufficient for typical review volume (1-2 reviews/month)

### Architecture Approach

**Pattern:** Build-time data aggregation with static HTML generation. External data (reviews) is fetched by scheduled GitHub Actions and committed to repository as JSON data files. Hugo consumes these files at build time, generating static HTML with embedded review content. This maintains static site benefits (no runtime API calls, fast TTFB, works offline) while keeping data reasonably fresh through automated schedules.

**Major components:**
1. **Review Fetcher (GitHub Action)** — Scheduled workflow that fetches reviews from Google Places API and Yelp Fusion API, normalizes format, merges into `data/reviews.json`, and commits changes
2. **Service Area Data Manager** — Static JSON file (`data/service-area.json`) defining coverage regions, cities, and geographic boundaries consumed by both templates and schema generation
3. **Schema Generator (Hugo partials)** — Modular template components for each schema type (LocalBusiness, Service, areaServed) that read from config and data files to generate JSON-LD
4. **Reviews Display Component** — Hugo partial template that renders reviews from `data/reviews.json` with platform attribution, pagination, and timestamps (no schema markup)
5. **Map Component** — Initially static image from Geoapify API; optional progressive enhancement with Leaflet/OpenStreetMap for interactivity

**Component boundaries:** GitHub Actions write to data files but never directly to templates. Hugo templates read from data files and config but never make external API calls. Schema partials are isolated by type to enable independent testing and conditional inclusion.

### Critical Pitfalls

1. **Self-serving review schema markup** — Adding `AggregateRating` or `Review` schema to reviews displayed on your own business website. Google prohibits this for LocalBusiness since 2019; will not show stars and may result in manual action. **Prevention:** Display reviews visually for users without schema markup; focus schema on LocalBusiness details (address, phone, services, areaServed) where it IS eligible for rich results.

2. **Yelp display requirements violations** — Displaying Yelp reviews without proper attribution, "Read More" links, or by mixing Yelp ratings with other sources. Yelp's API TOS explicitly prohibits blending star ratings from Yelp with ratings from other platforms. **Prevention:** Display each platform's reviews in separate sections with clear attribution; include required badges; never calculate "combined average" across platforms; cache data maximum 24 hours.

3. **Hugo JSON-LD escaping issues** — Hugo escapes special characters in JSON-LD output, producing invalid structured data. URLs become `https:\/\/example.com` instead of `https://example.com`. **Prevention:** Use Hugo's `dict` function to build data structures in memory; pipe final output through `jsonify` with the `safeJS` filter; test with Schema.org Validator AND Google Rich Results Test.

4. **NAP inconsistency across schema and review platforms** — Business Name, Address, and Phone differ between website schema, Google Business Profile, Yelp listing, and other platforms. **Prevention:** Create single source of truth (`data/business-info.json`); audit all platform listings for exact match; use EXACT format consistently (e.g., "St." vs "Street", phone formatting).

5. **API rate limits breaking GitHub Actions builds** — Scheduled review-fetching workflow makes too many API calls, hits rate limits, and fails. **Prevention:** Fetch reviews in separate scheduled workflow (not during Hugo build); store reviews in data files committed to repo; implement exponential backoff for rate-limited APIs.

## Implications for Roadmap

Based on research, suggested phase structure emphasizes **schema foundation first**, then **review content**, then **mapping enhancements**. This order avoids deploying invalid schema patterns and ensures compliance with Google/Yelp requirements from the start.

### Phase 1: Schema Enhancement & NAP Audit
**Rationale:** Schema foundation must be correct before adding reviews. NAP consistency is a hard requirement for local SEO effectiveness. This phase establishes the correct patterns that all subsequent phases build upon.

**Delivers:**
- Upgraded LocalBusiness schema with `ElectricalContractor` or `ProfessionalService` subtype
- Enhanced `areaServed` property with specific counties and cities
- Service-specific schema for each offering
- NAP audit across all platforms (site, schema, GBP, Yelp) with corrections
- Hugo partial templates for schema generation using `dict` pattern (avoiding JSON-LD escaping issues)

**Addresses:** Table stakes features (LocalBusiness schema, NAP consistency, service area definition)

**Avoids:** Pitfall #3 (Hugo JSON-LD escaping), Pitfall #4 (NAP inconsistency)

**Complexity:** LOW (days) — Editing existing schema and config files

**Research needed:** NO — Standard Schema.org patterns well-documented

### Phase 2: Review Aggregation System
**Rationale:** With schema foundation correct, reviews can be added safely. This phase builds the data pipeline that subsequent display features depend on. Building fetch-and-store workflow separately from display ensures data freshness strategy is established early.

**Delivers:**
- GitHub Actions workflow for scheduled review fetching (weekly)
- Multi-platform aggregation (Google Places API, Yelp Fusion API)
- Normalized `data/reviews.json` format with platform attribution
- Manual curation process for platforms without APIs (HomeAdvisor, Nextdoor)
- "Reviews last updated" date tracking
- Workflow failure notifications

**Uses:** Existing GitHub Actions pattern (extend `fetch-reviews.yml`)

**Implements:** Review Fetcher component from architecture

**Addresses:** Must-have features (populated reviews from GBP), Should-have features (multi-platform aggregation)

**Avoids:** Pitfall #5 (API rate limits), Pitfall #6 (stale review data)

**Complexity:** MEDIUM (1-2 weeks) — API integration, normalization logic, error handling

**Research needed:** MAYBE — If HomeAdvisor/Nextdoor scraping is required; legal/TOS implications need validation

### Phase 3: Review Display Component
**Rationale:** Reviews data exists (Phase 2), now display for users. This phase implements platform-specific display requirements and ensures no schema violations occur.

**Delivers:**
- Hugo partial template for reviews carousel
- Platform-specific display sections (Google, Yelp separate with attribution)
- Required Yelp badges and "Read More" links
- Review filtering (minimum 4+ stars)
- Pagination/lazy loading for performance
- "Review us" CTAs linking to platform review pages

**Implements:** Reviews Display Component from architecture

**Addresses:** Table stakes features (reviews display with platform attribution), Should-have features (review platform deep links)

**Avoids:** Pitfall #1 (self-serving review schema), Pitfall #2 (Yelp display violations)

**Complexity:** MEDIUM (1 week) — Display components, carousel logic, platform compliance

**Research needed:** NO — Display requirements explicitly documented by Google and Yelp

### Phase 4: Service Area Mapping
**Rationale:** Can be built in parallel with Phase 3 (no dependencies on review system). Starts with simple static map approach, leaves door open for future interactivity.

**Delivers:**
- `data/service-area.json` with cities and counties
- Static service area map image from Geoapify API
- Map generation in GitHub Actions (optional: regenerate when service area changes)
- Fallback image for accessibility
- Text list of service areas alongside map

**Uses:** Geoapify Static Maps API (3,000 credits/day free tier)

**Implements:** Service Area Data Manager and Map Component from architecture

**Addresses:** Should-have features (service area map)

**Complexity:** LOW (days) — Static map generation, data file creation

**Research needed:** NO — Geoapify API well-documented

### Phase 5: FAQ Section & Additional SEO
**Rationale:** Final polish that enhances discoverability and captures voice search. Can be done after core features stable.

**Delivers:**
- FAQ section with Schema.org markup
- Questions addressing "do you serve X", "what areas", "pricing"
- Open Graph images for social sharing
- Meta descriptions with location keywords
- Service list with location modifiers

**Addresses:** Should-have features (FAQ schema)

**Complexity:** LOW (days) — Content creation, schema markup

**Research needed:** NO — Standard Schema.org patterns

### Phase Ordering Rationale

**Why this order:**
- **Schema first** — Foundation must be correct to avoid deploying invalid markup that prevents rich results
- **Review data before display** — Data pipeline (Phase 2) must exist before building display components (Phase 3)
- **Mapping parallel-ready** — Phase 4 can run alongside Phase 3 (no dependencies)
- **FAQ last** — Polish feature that doesn't block core functionality

**Dependencies discovered:**
- Review display requires review data (Phase 2 → Phase 3)
- Schema enhancement blocks nothing (Phase 1 can complete independently)
- Service area map uses service area data (Phase 4 internal dependency only)

**Pitfall avoidance:**
- Phase 1 establishes correct schema patterns before reviews added (avoids Pitfall #1)
- Phase 2 builds fetch workflow separate from display (avoids Pitfall #5)
- Phase 3 implements platform-specific display (avoids Pitfall #2)
- NAP audit in Phase 1 before schema enhancement (avoids Pitfall #4)

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2** — If HomeAdvisor/Nextdoor API access unavailable, need to research scraping services (legal/TOS implications)
- **Phase 3** — Verify exact Yelp display requirements compliance (checklist audit)

**Phases with standard patterns (skip research-phase):**
- **Phase 1** — Schema.org patterns well-documented; NAP audit straightforward
- **Phase 4** — Geoapify API documented; static map generation simple
- **Phase 5** — FAQ schema standard pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Hugo + GitHub Actions pattern already proven in existing project; API documentation verified |
| Features | MEDIUM-HIGH | Table stakes clear from Google documentation; competitive features verified from multiple sources; some anti-features based on inference |
| Architecture | HIGH | Build-time data aggregation pattern matches existing project structure; component boundaries clear |
| Pitfalls | HIGH | Self-serving review schema confirmed from Google official blog; Yelp TOS verified; Hugo escaping issues documented in community |

**Overall confidence:** HIGH

### Gaps to Address

**HomeAdvisor and Nextdoor review access:** No public APIs for reviews confirmed through research. Options are:
1. Manual curation (low effort, requires ongoing maintenance)
2. Link to platform profiles without displaying reviews (current approach)
3. Third-party scraping service (legal/TOS risk needs validation)

**Resolution:** Phase 2 planning should include decision on whether to pursue scraping services or stick with manual curation. Recommend starting with manual curation for MVP, defer scraping research to v2.

**Yelp display requirements compliance:** Research identified requirements (attribution, badges, no blending, 24h cache limit) but exact implementation checklist needs validation against Yelp's official documentation during Phase 3 planning.

**Resolution:** Phase 3 kickoff should include compliance audit against Yelp Display Requirements documentation with checklist.

**API rate limit handling:** Research confirmed rate limits exist (Google 600 calls/min, Yelp 5,000 calls/day) but exact retry logic and error handling strategy needs definition.

**Resolution:** Phase 2 should include exponential backoff implementation and workflow failure notification setup.

## Sources

### Primary (HIGH confidence)
- [Google LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) — Required/recommended properties verified
- [Google Making Review Rich Results More Helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful) — Self-serving review prohibition confirmed
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness) — areaServed property documentation
- [Yelp Display Requirements](https://terms.yelp.com/developers/display_requirements/) — Attribution and blending prohibitions verified
- [Yelp Fusion API Reviews](https://docs.developer.yelp.com/reference/v3_business_reviews) — 3 reviews per business limit confirmed
- [Hugo Data Sources Documentation](https://gohugo.io/content-management/data-sources/) — Template patterns verified
- [Geoapify Pricing](https://www.geoapify.com/pricing/) — 3,000 credits/day free tier confirmed

### Secondary (MEDIUM confidence)
- [BrightLocal Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/) — Review usage statistics (41% always read reviews)
- [FTC Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers) — Review gating prohibition
- [Hugo discourse - JSON-LD markup](https://discourse.gohugo.io/t/marking-up-json-ld/1154) — Escaping issues and `dict` pattern solution
- [Google Places API 5 review limit](https://featurable.com/blog/google-places-more-than-5-reviews) — Confirmed by multiple developer sources

### Tertiary (LOW confidence)
- HomeAdvisor and Nextdoor public review API availability — Could not find official documentation confirming or denying; assume manual curation needed based on absence of public API docs

---
*Research completed: 2026-02-13*
*Ready for roadmap: yes*
