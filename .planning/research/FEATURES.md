# Feature Research

**Domain:** Local Service Business Website (Electrical Contractor) - Review Aggregation, Service Area Mapping, Local SEO
**Researched:** 2026-02-13
**Confidence:** MEDIUM (verified against multiple sources including Google documentation, FTC guidelines, and industry best practices)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or search engines penalize.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Google Business Profile Schema** | Google requires LocalBusiness structured data for rich results; 20-30% higher CTR with proper schema | LOW | Use `ElectricalContractor` or `ProfessionalService` subtype, not generic `LocalBusiness` |
| **NAP Consistency** | Inconsistent Name/Address/Phone fragments citation profile; search engines treat as trust signal | LOW | Must match exactly: site, schema, and GBP - even minor variations (St vs Street) hurt rankings |
| **Mobile-Responsive Design** | 84% of "near me" searches on mobile in 2026; Google's mobile-first indexing | LOW | Already implemented - verify continued compliance |
| **Contact Information Visible** | Users expect phone, email, address easily findable; reduces bounce | LOW | Already implemented - ensure on every page |
| **Reviews Display** | 41% of consumers "always" read reviews; 31% only consider 4.5+ stars | MEDIUM | Currently empty reviews.json; must populate with real reviews |
| **Service List with Location Keywords** | Users search "electrician near [city]" not just "electrician" | LOW | Add location modifiers to service descriptions |
| **Basic Meta Tags (Title, Description)** | Search engines need these for SERP display | LOW | Already implemented - verify optimization |
| **GeoCoordinates in Schema** | Required for map pack placement | LOW | Already implemented - verify accuracy |
| **Opening Hours in Schema** | Users filter by "open now"; Google displays prominently | LOW | Already implemented |
| **Service Area Definition** | Service-area businesses must specify coverage for local pack eligibility | LOW | Basic version exists; needs enhancement with specific cities/counties |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-Platform Review Aggregation** | Consumers use 6+ review sites in 2026; displaying aggregated reviews shows volume and breadth | MEDIUM | Aggregate from Google, Yelp, Nextdoor, HomeAdvisor; home service buyers check industry-specific platforms |
| **AggregateRating Schema** | Stars appear in SERPs, 20-30% higher CTR; differentiates from competitors without structured reviews | LOW | Requires actual reviews to avoid spam flags; must match visible content |
| **Interactive Service Area Map** | Users can verify coverage for their location; reduces "do you serve my area?" calls | MEDIUM | Current static image; upgrade to clickable/interactive |
| **City/Location Landing Pages** | 23% higher conversion with geo-targeted pages; captures "[service] in [city]" searches | HIGH | Create pages for Vancouver, Camas, Woodland, Longview, etc. with unique content |
| **Review Platform Deep Links** | Direct CTA to leave reviews increases review velocity; competitors often hide this | LOW | Already have links; ensure prominent placement |
| **"Since 1979" Trust Signal Schema** | `foundingDate` in schema; 45+ years establishes credibility search engines value | LOW | Already implemented - could expand to include awards/certifications |
| **Service-Specific Schema** | Detailed Service schema with areaServed, provider, etc. for each service | MEDIUM | Current implementation uses basic Offer; expand to full Service markup |
| **Response Time/Availability Claims** | "Same-day service" or "24/7 emergency" in schema attracts urgent buyers | LOW | Only if actually offered; must be truthful |
| **Real Customer Photos in Reviews** | Authenticity signal; generic stock photos hurt credibility | MEDIUM | Depends on review platform API capabilities |
| **Video Testimonials** | VideoObject schema + YouTube embeds; higher engagement than text | HIGH | Production cost; defer unless customer-generated |
| **FAQ Schema** | Captures voice search; appears as rich results | LOW | Address common questions: pricing, service area, response time |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Review Gating** | Want to show only positive reviews | FTC Consumer Review Rule violation; $53K+ per violation penalties; Dec 2025 enforcement wave | Display all reviews transparently; respond professionally to negative ones |
| **Fake/Incentivized Reviews** | Build review volume quickly | FTC prohibits; Google detects and penalizes; destroys credibility if discovered | Legitimate review request campaigns post-service |
| **Auto-Generated Location Pages** | Scale SEO quickly across 50+ cities | Google's 2026 "helpful content" update penalizes thin/duplicate location pages; "listing 20 cities doesn't mean Google believes you serve them" | Create 3-5 high-quality location pages for primary service areas |
| **Third-Party Review Widget (Heavy)** | Easy implementation | Performance impact; some inject tracking; free tiers limited to 200 views/month | Build lightweight custom display from JSON; use widgets only for aggregation backend |
| **Real-Time Review Sync** | Always current | API rate limits; complexity; most businesses get 1-2 reviews/month; overkill | Weekly/daily cron job sufficient; manual refresh option |
| **Review Star Overlay on Map** | Looks professional | Google ToS restricts modifying map displays; can trigger policy violations | Show stars separately from embedded map |
| **Schema Markup for Ratings Without Visible Reviews** | Get stars in SERP | Google explicitly flags as spam; "If you mark up a 5-star rating but there are no actual reviews visible to a human visitor, you're asking for trouble" | Only add AggregateRating when reviews are visible on page |
| **Claiming Reviews From Multiple Unverified Sources** | Inflate numbers | FTC compliance issues; if reviews can't be verified as authentic, liability exists | Only display reviews from platforms where business is verified |
| **Pop-up Review Requests** | Maximize review capture | Annoys users; increases bounce; mobile-unfriendly | Post-service email/SMS review requests |

## Feature Dependencies

```
[LocalBusiness Schema]
    |--requires--> [NAP Consistency across all pages]
    |--requires--> [GeoCoordinates accuracy]
    |--enhances--> [Service Area Definition]

[AggregateRating Schema]
    |--requires--> [Visible Reviews on Page] (CRITICAL: violating causes spam flags)
    |--requires--> [Review Aggregation System]
    |--requires--> [Minimum review count (5+)]

[Review Aggregation]
    |--requires--> [API Access or Manual Data Entry]
    |--enhances--> [AggregateRating Schema]
    |--enhances--> [Trust Signals]

[Service Area Map (Interactive)]
    |--requires--> [Google Maps API Key]
    |--enhances--> [GeoCoordinates in Schema]
    |--enhances--> [Service Area Definition]

[City Landing Pages]
    |--requires--> [Unique Content per Location] (no duplicates)
    |--requires--> [Service Area Definition]
    |--enhances--> [Location Keywords]
    |--conflicts-with--> [Auto-Generated Thin Content] (Google penalty)

[FAQ Schema]
    |--enhances--> [Voice Search Capture]
    |--requires--> [Visible FAQ Content on Page]
```

### Dependency Notes

- **AggregateRating requires Visible Reviews:** Google will penalize sites with schema ratings that don't match visible page content. The reviews must be displayed first, then schema added.
- **City Landing Pages conflict with Auto-Generated Content:** Quality pages require unique, location-specific content. Thin pages with just city name swapped will be penalized.
- **Review Aggregation requires API access:** Google Places API, Yelp Fusion API have terms of service and rate limits. Alternative: manual periodic updates.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept and improve search visibility.

- [x] **LocalBusiness Schema with specific subtype** — Change from generic `LocalBusiness` to `ElectricalContractor` or `ProfessionalService`
- [ ] **Populate reviews.json with real reviews** — Currently empty; source from Google Business Profile
- [ ] **AggregateRating schema tied to visible reviews** — Only after reviews display correctly
- [ ] **Service area data enrichment** — Add more cities, counties, ZIP codes to data file
- [ ] **FAQ section with Schema** — Answer "do you serve X" / "what areas" / "pricing" questions
- [ ] **NAP audit and consistency** — Verify exact match across site, schema, GBP

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Interactive Google Maps embed** — When review system stable; API key setup and quota monitoring
- [ ] **Multi-platform review aggregation** — Add Yelp, Nextdoor, HomeAdvisor reviews after Google reviews working
- [ ] **Review freshness indicator** — "Last updated X days ago" to show reviews are current
- [ ] **Service-specific schema enhancement** — Expand Offer to full Service markup

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **City-specific landing pages** — High effort, requires unique content per location; defer until traffic justifies
- [ ] **Video testimonials** — Production cost; only if customers provide video
- [ ] **Real-time review sync via API** — Complexity overhead; weekly/manual refresh sufficient for review volume
- [ ] **Review sentiment analysis display** — "Customers praise our response time" - nice but optional

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Populate Real Reviews | HIGH | LOW | P1 |
| LocalBusiness Schema Upgrade (subtype) | MEDIUM | LOW | P1 |
| AggregateRating Schema | HIGH | LOW | P1 |
| Service Area Data Enrichment | MEDIUM | LOW | P1 |
| FAQ Section + Schema | MEDIUM | LOW | P1 |
| NAP Consistency Audit | HIGH | LOW | P1 |
| Interactive Service Area Map | MEDIUM | MEDIUM | P2 |
| Multi-Platform Review Aggregation | MEDIUM | MEDIUM | P2 |
| Service-Specific Schema | LOW | MEDIUM | P2 |
| City Landing Pages | HIGH | HIGH | P3 |
| Video Testimonials | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (low effort, high/medium SEO impact)
- P2: Should have, add when possible (medium effort)
- P3: Nice to have, future consideration (high effort or low impact)

## Competitor Feature Analysis

Based on research of electrician websites and home service best practices:

| Feature | Typical Competitors | Best-in-Class | Our Approach |
|---------|---------------------|---------------|--------------|
| Review Display | Show 3-5 testimonials, often outdated | Dynamic carousel with platform attribution + star ratings | Carousel with real reviews, source attribution, recency |
| Service Area | Text list or static image | Interactive map with clickable regions | Start with enhanced static map, upgrade to interactive later |
| Schema Markup | Basic or none | Full LocalBusiness with AggregateRating + Service | Full implementation with correct subtype |
| Location Pages | Generic "we serve [city]" one-liners | Unique content per location with local references | P3 - only if traffic warrants |
| Review Platforms | Google-only or none | Multi-platform with verification badges | Multi-platform (Google, Yelp, Nextdoor, HomeAdvisor) |
| Trust Signals | "Licensed & Insured" text | Verifiable badges + years in business | "Since 1979" + license display |

## Implementation Complexity Notes

### Low Complexity Features (Days)
- Schema subtype change: Edit existing JSON-LD
- NAP audit: Verify and update strings
- FAQ schema: Add section to page + structured data
- Service area data: Update JSON file

### Medium Complexity Features (Weeks)
- Review aggregation system: API integration or manual process + JSON structure + display component
- Interactive map: Google Maps JavaScript API setup, polygon drawing, event handlers
- Multi-platform reviews: Multiple API integrations with different auth methods

### High Complexity Features (Months)
- City landing pages: Requires unique content creation for each location (SEO copywriting)
- Real-time sync: Requires server-side processing, cron jobs, error handling

## Compliance Requirements

### FTC Consumer Review Rule (Effective Oct 2024)
- **No review gating:** Cannot filter or suppress negative reviews before publication
- **No fake reviews:** $53,088 per violation
- **No undisclosed incentives:** If offering discount for review, must disclose
- **Aggregation exemption:** Simply hosting/aggregating reviews is permitted if not manipulating

### Google API Terms
- **Attribution required:** Must display "Powered by Google" when using Places API data
- **No modification:** Cannot alter review content or ratings
- **Rate limits:** Free tier has query limits; must handle gracefully

### Schema.org Best Practices
- **Match visible content:** Schema ratings must reflect what user sees
- **Use specific types:** `ElectricalContractor` > `ProfessionalService` > `LocalBusiness`
- **@id consistency:** Use same @id across pages to link entity

## Sources

### Review Aggregation
- [BrightLocal Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)
- [Whitespark Guide to Reputation Management](https://whitespark.ca/guides/whitesparks-ultimate-guide-to-local-business-reputation-management/)
- [Tagembed Review Aggregator Platforms Guide](https://tagembed.com/blog/review-aggregator-platforms/)
- [Elfsight Review Aggregators](https://elfsight.com/blog/best-review-aggregators/)

### FTC Compliance
- [FTC Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)
- [Arnold & Porter FTC Warning Letters Analysis (Jan 2026)](https://www.arnoldporter.com/en/perspectives/blogs/consumer-products-and-retail-navigator/2026/01/ftc-warning-letters-over-consumer-review-rule)
- [FTC Attorney Guide to Consumer Review Rules](https://ftcattorney.com/guide-to-ftc-consumer-review-and-testimonial-rule/)

### Google API & Schema
- [Google Local Business Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Review Snippet Documentation](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Schema.org AggregateRating](https://schema.org/AggregateRating)
- [Trustmary Google Business Reviews API](https://trustmary.com/reviews/google-business-reviews-api/)

### Service Area & Local SEO
- [Search Engine Land: Service Area Pages Guide](https://searchengineland.com/guide/service-area-pages)
- [BrightLocal Service Area Page SEO](https://www.brightlocal.com/learn/service-area-pages/)
- [Google Business Profile Service Areas](https://support.google.com/business/answer/9157481)
- [LocalMighty Local SEO Best Practices 2026](https://www.localmighty.com/blog/local-seo-best-practices/)

### Local SEO Mistakes to Avoid
- [LocalMighty Top Local SEO Mistakes 2026](https://www.localmighty.com/blog/top-local-seo-mistakes-killing-your-local-seo-rankings/)
- [ConnecticaLLC 18 Local SEO Mistakes](https://www.connecticallc.com/local-seo-mistakes/)
- [Hook Agency Home Services SEO Guide](https://hookagency.com/blog/local-seo-for-home-service-businesses/)

### Widget Comparison
- [Trustmary vs Elfsight](https://trustmary.com/alternatives/elfsight/)
- [SociableKIT Widget Alternatives](https://www.sociablekit.com/alternatives/best-elfsight-alternatives/)

---
*Feature research for: Polos Electronics - Review Aggregation, Service Area, Local SEO*
*Researched: 2026-02-13*
