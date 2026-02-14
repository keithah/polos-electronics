# Pitfalls Research

**Domain:** Review aggregation, service area mapping, and local SEO for static sites
**Researched:** 2026-02-13
**Confidence:** HIGH (verified with Google official documentation and multiple authoritative sources)

## Critical Pitfalls

### Pitfall 1: Self-Serving Review Schema Markup

**What goes wrong:**
Adding `AggregateRating` or `Review` structured data for reviews displayed on your own business website. Google explicitly prohibits "self-serving reviews" — reviews about entity A placed on entity A's website are ineligible for rich result star ratings.

**Why it happens:**
Developers see competitors with star ratings in search results and assume adding review schema will achieve the same effect. They don't realize Google distinguishes between first-party (self-serving) and third-party review contexts.

**How to avoid:**
- Do NOT add `AggregateRating` schema to LocalBusiness reviews on poloselectronics.com
- Display reviews visually for users without schema markup
- Focus Schema.org markup on LocalBusiness details (address, phone, services, areaServed) where it IS eligible for rich results
- Consider reviews as "social proof for humans, not search engines"

**Warning signs:**
- Google Rich Results Test shows review markup is "valid" but you never see stars in SERPs
- Competitors using widgets from BrightLocal/Yotpo have stars but your custom implementation doesn't
- Google Search Console shows "review" structured data detected but no impressions for rich results

**Phase to address:**
Schema.org implementation phase — establish the rule early that reviews get NO schema markup for LocalBusiness sites

**Source:** [Google Search Central - Making Review Rich Results more helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)

---

### Pitfall 2: Yelp Display Requirements Violations

**What goes wrong:**
Displaying Yelp reviews without proper attribution, "Read More" links, or by mixing Yelp ratings with other sources. Yelp's API Terms of Service explicitly prohibit blending star ratings from Yelp with ratings from other platforms.

**Why it happens:**
Developers create a unified "overall rating" by averaging Google, Yelp, and other sources. Or they strip Yelp branding to match site design. Both violate Yelp TOS.

**How to avoid:**
- Display each platform's reviews in SEPARATE sections with clear attribution
- Include "Read more on Yelp" links to full reviews
- Use Yelp's required attribution badges
- Never calculate "combined average" across platforms
- Cache Yelp data for maximum 24 hours (TOS requirement)
- Contact api@yelp.com for display requirement exceptions if needed

**Warning signs:**
- "Overall rating: 4.8 stars (from 150 reviews)" combining multiple sources
- Missing Yelp logo or attribution on Yelp-sourced reviews
- Review excerpts without "Read more" links to Yelp
- Cached data older than 24 hours being displayed

**Phase to address:**
Review aggregation phase — design separate display components per platform from the start

**Source:** [Yelp Display Requirements](https://terms.yelp.com/developers/display_requirements/)

---

### Pitfall 3: Hugo JSON-LD Escaping Issues

**What goes wrong:**
Hugo escapes special characters in JSON-LD output, producing invalid structured data. URLs become `https:\/\/example.com` instead of `https://example.com`. Forward-slashes get backslash-escaped, breaking JSON-LD validation.

**Why it happens:**
Hugo's templating system automatically escapes output for HTML safety. When building JSON-LD in templates using string interpolation, these escaping rules corrupt the JSON structure.

**How to avoid:**
- Use Hugo's `dict` function to build data structures in memory
- Pipe final output through `jsonify` with the `safeJS` filter
- Test JSON-LD output with Schema.org Validator AND Google Rich Results Test
- Avoid string interpolation for URLs in JSON-LD templates

**Warning signs:**
- Backslashes appearing in URL strings in page source
- JSON-LD validates in code but fails in validators
- Schema.org validator shows "Invalid JSON" errors
- URLs in structured data don't match actual page URLs

**Phase to address:**
Schema.org implementation phase — create reusable JSON-LD partials using `dict` pattern from the start

**Source:** [Hugo discourse - JSON-LD markup](https://discourse.gohugo.io/t/marking-up-json-ld/1154)

---

### Pitfall 4: NAP Inconsistency Across Schema and Review Platforms

**What goes wrong:**
Business Name, Address, and Phone (NAP) differ between website Schema.org markup, Google Business Profile, Yelp listing, and other platforms. Example: "St." in schema but "Street" in GBP, or "(360) 687-3543" vs "360-687-3543".

**Why it happens:**
Information was entered separately on each platform over years. Website displays "pretty" formatted address while schema uses different format. Phone number formatting varies.

**How to avoid:**
- Create a single source of truth (`data/business-info.json`) for NAP
- Use Hugo partials to render NAP from this single source everywhere
- Audit all platform listings (GBP, Yelp, HomeAdvisor, Nextdoor) for exact match
- Use EXACT format: "20810 NE 267th St" not "Street", "(360) 687-3543" not "360.687.3543"
- Include in Schema.org: exact NAP matching GBP listing

**Warning signs:**
- Google Business Profile shows "Suggest an edit" for address/phone
- Different formats in footer vs structured data vs review platforms
- AI search engines show wrong or conflicting business information
- Local pack ranking drops unexpectedly

**Phase to address:**
Local SEO phase — NAP audit and standardization BEFORE implementing enhanced schema

**Source:** [BrightLocal - What is NAP?](https://www.brightlocal.com/learn/what-is-nap/)

---

### Pitfall 5: API Rate Limits Breaking GitHub Actions Builds

**What goes wrong:**
Scheduled review-fetching workflow makes too many API calls, hits rate limits, and fails. Or API response times cause GitHub Actions timeout (10-minute deployment limit). Build artifacts exceed size limits.

**Why it happens:**
Fetching fresh reviews from Google Places API (600 calls/minute limit), Yelp, and other platforms during every build. No caching between builds. Large image assets in repository.

**How to avoid:**
- Fetch reviews in SEPARATE scheduled workflow (not during Hugo build)
- Store reviews in `data/reviews-*.json` files committed to repo
- Use GitHub Actions cache for API responses between runs
- Implement exponential backoff for rate-limited APIs
- Set `timeout: 20000` in Hugo config for slow API shortcodes (if any)
- Keep build artifacts under deployment limits

**Warning signs:**
- "Page build timed out" errors in GitHub Actions
- 429 (rate limited) errors in workflow logs
- Build times increasing significantly
- Intermittent deployment failures

**Phase to address:**
Review aggregation phase — design fetch-and-store workflow SEPARATE from Hugo build

**Source:** [Hugo GitHub Issue #1604](https://github.com/gohugoio/hugo/issues/1604)

---

### Pitfall 6: Stale Review Data Without Refresh Strategy

**What goes wrong:**
Reviews fetched once during initial implementation become months old. New reviews never appear. Old negative reviews persist after being resolved. Displayed review counts don't match platform counts.

**Why it happens:**
No automated refresh workflow. Manual "fetch reviews" step forgotten. Scheduled workflow fails silently. No monitoring for freshness.

**How to avoid:**
- Create GitHub Actions workflow scheduled for weekly review refresh
- Add "Reviews last updated: {date}" visible on site
- Set up workflow failure notifications
- Keep `reviewCount` in schema matching actual displayed reviews
- Document manual refresh procedure as fallback

**Warning signs:**
- "Reviews last updated" date is months old
- Visible reviews don't match what customers see on Google/Yelp
- Schema `reviewCount` doesn't match displayed review count
- Customers mention reviews that aren't showing

**Phase to address:**
Review aggregation phase — build refresh workflow WITH the initial fetch workflow

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding review data | No API complexity | Manual updates required forever; data becomes stale | Never for active business |
| Single combined rating | "Cleaner" display | Yelp TOS violation; misleading aggregate | Never |
| Skipping validation | Faster development | Invalid schema goes live; no rich results | Never |
| Copy-paste location pages | Quick multi-location support | Duplicate content penalty; thin content | Never |
| Embedding Google Maps API | Interactive map | API costs; requires key management; slows page load | Only if interactivity required |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Places API | Making calls during Hugo build | Pre-fetch in separate workflow; store in data files |
| Yelp Fusion API | Missing attribution/badges | Follow Display Requirements exactly; include "Read more" links |
| Google Business Profile | Using deprecated GMB API | Use Google Business Profile API; consider manual export if API access restricted |
| HomeAdvisor/Angi | Expecting public API | No public API; manual export or screenshot approach required |
| Nextdoor | Expecting review API | No review API; display Nextdoor badge/link instead of reviews |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Large inline Schema.org | Works fine initially | Schema in external `.json` linked via `<link>` | >50KB of structured data |
| All reviews on single page | Loads quickly with 10 reviews | Pagination or "Show more" button | >50 reviews |
| Static map as huge PNG | Looks good | Optimize image; use SVG where possible | Image >500KB slows mobile |
| Fetching all platforms in one Action | Simple workflow | Separate workflows per platform; independent failure | Any single platform outage breaks all |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing API keys to repo | Keys exposed in git history; quota abuse | Use GitHub Secrets; never commit `.env` files |
| Displaying reviewer email addresses | Privacy violation; spam risk | Strip PII from review data before storing |
| Client-side API calls | API keys visible in browser | Server-side/build-time only; never client-side |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Reviews without dates | Can't tell if reviews are recent | Show "Posted [date]" on each review |
| No indication of review source | Confusion about authenticity | Clear platform badges (Google, Yelp icons) |
| Service area as text-only list | Hard to visualize coverage | Static map WITH text list; visual + accessible |
| Missing "Review us" CTAs | Lost opportunity for new reviews | Add "Review us on Google" buttons linking to review pages |
| Reviews carousel auto-advancing | Users can't read at their pace | Manual navigation; pause on hover |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Schema.org:** Often missing `areaServed` — verify GeoShape or AdministrativeArea for service coverage
- [ ] **Reviews:** Often missing reviewer name/date — verify each review has attribution and timestamp
- [ ] **NAP:** Often differs between footer and schema — verify EXACT match character-by-character
- [ ] **Service area map:** Often missing alt text — verify descriptive alt for accessibility
- [ ] **Meta descriptions:** Often generic — verify location-specific keywords in each page's meta
- [ ] **Open Graph images:** Often missing for service area — verify social sharing shows correct preview
- [ ] **Mobile review display:** Often truncated poorly — verify reviews readable on 320px width
- [ ] **Schema validation:** Often skips Google test — verify Rich Results Test (not just schema.org validator)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Self-serving review schema deployed | LOW | Remove `AggregateRating`/`Review` schema; redeploy; no penalty |
| Yelp TOS violation | MEDIUM | Redesign display components; re-fetch with proper attribution; potential API access revocation |
| NAP inconsistencies indexed | HIGH | Update ALL platforms simultaneously; request re-crawl; wait for propagation (weeks) |
| API keys committed to repo | HIGH | Rotate keys immediately; add to `.gitignore`; consider repo history cleanup |
| Hugo JSON-LD invalid | LOW | Fix template; redeploy; request reindexing in Search Console |
| Review data 6+ months stale | MEDIUM | Re-run fetch workflows; verify data; redeploy; add monitoring to prevent recurrence |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Self-serving review schema | Schema.org implementation | Rich Results Test shows NO review warnings for LocalBusiness |
| Yelp display violations | Review aggregation | Manual audit against Yelp Display Requirements checklist |
| Hugo JSON-LD escaping | Schema.org implementation | Valid JSON-LD in page source; passes both validators |
| NAP inconsistency | Local SEO (BEFORE schema) | Audit spreadsheet comparing all platforms matches 100% |
| API rate limits | Review aggregation | Workflow logs show no 429 errors over 1-week period |
| Stale review data | Review aggregation | "Last updated" date less than 7 days old after scheduled refresh |

## Sources

- [Google Search Central - Review Snippet Structured Data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google Search Central - LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google - Making Review Rich Results more helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)
- [BrightLocal - Can local businesses use review schema?](https://www.brightlocal.com/learn/review-schema/)
- [Yelp Display Requirements](https://terms.yelp.com/developers/display_requirements/)
- [Yelp API Terms of Use](https://terms.yelp.com/developers/api_terms/20190327_en_us/)
- [Hugo JSON-LD Discussion](https://discourse.gohugo.io/t/marking-up-json-ld/1154)
- [Whitespark - LocalBusiness AggregateRating Schema](https://whitespark.ca/blog/how-to-use-aggregate-review-schema-to-get-stars-in-the-serps/)
- [BrightLocal - What is NAP?](https://www.brightlocal.com/learn/what-is-nap/)
- [Google Places API Usage and Billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [GitHub Hugo Issue #1604 - Build Timeouts](https://github.com/gohugoio/hugo/issues/1604)
- [Agile Digital - Service Area Business SEO Mistakes](https://www.agiledigitalagency.com/blog/service-area-businesses-seo-mistakes/)
- [Connectica - 18 Local SEO Mistakes 2026](https://www.connecticallc.com/local-seo-mistakes/)

---
*Pitfalls research for: Review aggregation, service area mapping, and local SEO on static Hugo sites*
*Researched: 2026-02-13*
