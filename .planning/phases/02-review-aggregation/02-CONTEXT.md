# Phase 2: Review Aggregation - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Display authentic customer reviews from multiple platforms (Google Business Profile, Yelp, HomeAdvisor, Nextdoor) on the website, building trust before visitors contact Polos Electronics. Includes data normalization, platform attribution, TOS compliance, and deep links to review platforms.

</domain>

<decisions>
## Implementation Decisions

### Review display & layout
- All platforms mixed together in a single stream (not grouped by platform)
- Visual format: Claude's discretion (choose format matching site's design system)
- Full review text displayed (no truncation)
- Metadata per review: star rating, reviewer name, review date, platform logo/badge

### Data sourcing & updates
- GitHub Action automation: API fetch where possible, web scraping fallback for platforms without APIs
- Monthly update frequency (GitHub Action runs once per month)
- Display highest-rated reviews only (4-5 star reviews, filter out lower ratings)
- Data structure: flat array in data/reviews.json with platform field on each review

### Platform compliance & attribution
- Yelp: Official Yelp badge + required links (full compliance with Yelp TOS)
- Platform logos appear on each individual review (not just section headers)
- 'View on Platform' links go to business profile page on each platform (not individual review deep links)
- No disclaimers needed (platform badges and links provide sufficient attribution)

### Claude's Discretion
- Visual format choice (cards vs list vs quotes) based on site design system
- Review sorting within the mixed stream (by date, rating, or platform rotation)
- Error handling for API failures or scraping issues
- Handling reviews without star ratings (some platforms)

</decisions>

<specifics>
## Specific Ideas

- GitHub Action should prioritize API automation, fall back to web scraping only when necessary
- Focus on 4-5 star reviews to showcase credibility
- Monthly updates strike balance between freshness and maintenance

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-review-aggregation*
*Context gathered: 2026-02-14*
