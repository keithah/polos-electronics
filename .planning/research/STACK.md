# Stack Research

**Domain:** Review Aggregation, Service Area Mapping, and Local SEO for Static Sites
**Researched:** 2026-02-13
**Confidence:** MEDIUM-HIGH

## Executive Summary

This research covers the technology stack for adding multi-platform review aggregation, service area mapping, and enhanced local SEO to an existing Hugo static site. The existing project already has a solid foundation with Hugo 0.135.0, GitHub Actions deployment, and basic LocalBusiness Schema.org markup. The recommended approach emphasizes build-time data fetching, static map generation, and structured data enhancement rather than client-side widgets to maintain static site performance benefits.

## Recommended Stack

### Core Technologies (Existing - No Changes Needed)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Hugo | 0.155.3 (upgrade from 0.135.0) | Static site generator | Latest stable release (Feb 2026); existing project uses Hugo; `resources.GetRemote` available since v0.141.0 for build-time API fetching |
| GitHub Actions | N/A | CI/CD and scheduled data fetching | Already in use; supports cron schedules for automated review updates |
| GitHub Pages | N/A | Static hosting | Already in use; free, reliable, supports custom domains |

### Review Aggregation Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Google Places API | v1 (current) | Fetch Google reviews | **5 reviews max per request** - API limitation; existing workflow already uses this; $200/month free credit |
| Yelp Fusion API | v3 | Fetch Yelp reviews | **3 reviews max** (Plus plan), 5,000 calls/day free tier; official API with stable access |
| GitHub Actions (cron) | N/A | Scheduled review fetching | Already implemented for Google; extend pattern for multi-platform |
| JSON data files | N/A | Store fetched reviews at build time | Hugo data templates pattern; already structured in `data/reviews.json` |

### Service Area Mapping Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Geoapify Static Maps API | Current | Generate service area map images | **3,000 credits/day free tier**; no JavaScript required; supports polygons, markers, custom styling |
| Pre-generated PNG/SVG | N/A | Static map image served directly | Zero runtime cost; cacheable; already using static image approach |

**Alternative Considered:** Google Maps Static API
- Requires billing account even with $200 credit
- No free tier without credit card
- Better for interactive maps, overkill for static display

### Local SEO & Schema.org Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Schema.org JSON-LD | 2024 vocabulary | Structured data for search engines | Google-recommended format; already implemented in project |
| Hugo partial templates | N/A | Reusable Schema.org markup | Hugo best practice; enables component-based structured data |
| LocalBusiness + areaServed | Schema.org | Service area definition | Proper type for electrical contractors; supports GeoShape for multi-county coverage |

### Supporting Libraries/Tools

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jq | 1.7+ | JSON processing in GitHub Actions | Already used in fetch-reviews.yml; excellent for API response transformation |
| curl | 8.x | HTTP requests in GitHub Actions | Standard tool for API calls in CI |

## Installation

```bash
# No npm packages required - this is a pure Hugo + GitHub Actions solution

# Upgrade Hugo (in workflow):
HUGO_VERSION: 0.155.3

# API Keys needed (GitHub Secrets):
# - GOOGLE_API_KEY (existing)
# - GOOGLE_PLACE_ID (existing)
# - YELP_API_KEY (new - get from https://www.yelp.com/developers)
# - YELP_BUSINESS_ID (new - find via Yelp Fusion API search)
# - GEOAPIFY_API_KEY (new - get from https://myprojects.geoapify.com/)
```

## Alternatives Considered

### Review Aggregation

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Build-time API fetching (GitHub Actions) | Elfsight widget ($6-24/month) | When you need real-time review updates; when API rate limits are problematic; when you want zero maintenance |
| Build-time API fetching | Tagembed widget ($24-99/month) | When aggregating more than 4 platforms; when AI moderation is needed |
| Build-time API fetching | EmbedSocial ($29-64/month) | When you need team collaboration features; when analytics on reviews matter |
| Direct API calls | Review scraping services (Datashake, Local Data Exchange) | When HomeAdvisor/Nextdoor official APIs are unavailable; **legal/TOS considerations apply** |

**Rationale for recommended approach:** Build-time fetching maintains static site benefits (no client-side JavaScript, faster loads, better SEO), is free, and gives full control over display. Widget services add monthly costs and load external JavaScript.

### Service Area Maps

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Geoapify Static Maps | Google Maps Static API | When Google Maps styling/branding is required; when using other Google Maps APIs |
| Pre-generated static image | Mapbox Static API | When premium cartography is needed; complex map styling |
| Static image | Interactive Google Maps embed | When users need to zoom/pan; when directions are needed |

**Rationale:** Geoapify has generous free tier (3,000 credits/day), no credit card required, and produces high-quality static images perfect for showing service coverage.

### Schema.org Implementation

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Hugo partial templates | Yoast/RankMath plugins | WordPress only - not applicable |
| Manual JSON-LD | Schema App | When managing multiple locations; enterprise requirements |
| LocalBusiness type | HomeAndConstructionBusiness | More specific type available in Schema.org but less recognized by search engines |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Interactive JavaScript maps | Adds weight, requires consent banners in EU, overkill for showing service area | Static map image from Geoapify |
| Client-side review widgets (Elfsight, Tagembed) | Monthly cost, external JavaScript, slower page loads, GDPR concerns | Build-time API fetching with Hugo data templates |
| Google My Business API for reviews | Being consolidated into Places API; complex OAuth requirements | Google Places API (already working) |
| Web scraping for reviews | Terms of service violations; unreliable; legal risk | Official APIs where available; manual updates for unsupported platforms |
| HomeAdvisor official API | No public API for reviews; requires Pro Network membership for leads only | Manual review curation or scraping service (with caution) |
| Nextdoor API for reviews | No public review access API; business API focused on advertising | Manual review curation; link to Nextdoor profile |
| `getJSON` Hugo function | Deprecated in favor of `resources.GetRemote` + `transform.Unmarshal` | `resources.GetRemote` (v0.141.0+) for build-time fetching |

## Stack Patterns by Variant

**If budget allows for zero-maintenance:**
- Use Elfsight All-in-One Reviews widget ($12-24/month)
- Aggregates Google, Yelp, Facebook automatically
- Trade-off: external JavaScript, less control over styling

**If maximum performance is critical:**
- Use build-time API fetching (recommended approach)
- Pre-generate static map image during deployment
- All content is static HTML, no runtime dependencies

**If real-time reviews matter:**
- Consider hybrid: build-time fetch for main content, client-side widget for "live" badge
- Or increase GitHub Actions cron frequency to hourly (within free tier limits)

## API Access Summary

| Platform | API Available | Reviews Accessible | Limitation | Cost |
|----------|---------------|-------------------|------------|------|
| Google Business | Yes (Places API) | Yes | **5 reviews max per request** | $200/month free credit |
| Yelp | Yes (Fusion API) | Yes | **3 reviews max** (free), 7 with Enterprise | Free tier: 5,000 calls/day |
| HomeAdvisor | No public API | No | Pro Network only for leads | N/A |
| Nextdoor | No public review API | No | Business API for ads only | N/A |

**Implication:** For HomeAdvisor and Nextdoor, options are:
1. Manual curation (add reviews to JSON file manually)
2. Link to platform profiles (current approach)
3. Third-party scraping service (legal/TOS risk)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Hugo 0.155.x | `resources.GetRemote` | Available since 0.141.0; safe to use |
| Hugo 0.155.x | GitHub Actions ubuntu-latest | Fully compatible; .deb package available |
| Google Places API | API key auth | Legacy API; stable for foreseeable future |
| Yelp Fusion API v3 | Bearer token auth | Current stable version |
| Geoapify API | API key in URL | Simple integration; no SDK required |

## Schema.org Implementation Details

### Current State (Existing)
The project already has LocalBusiness markup with:
- Name, address, phone, email
- GeoCoordinates
- OpeningHoursSpecification
- hasOfferCatalog with services
- sameAs links to review platforms

### Enhancements Needed

**1. Add `areaServed` for service area definition:**
```json
"areaServed": [
  {
    "@type": "State",
    "name": "Washington",
    "sameAs": "https://en.wikipedia.org/wiki/Washington_(state)"
  },
  {
    "@type": "AdministrativeArea",
    "name": "Clark County, Washington"
  },
  {
    "@type": "AdministrativeArea",
    "name": "Cowlitz County, Washington"
  },
  {
    "@type": "AdministrativeArea",
    "name": "Skamania County, Washington"
  }
]
```

**2. Add `aggregateRating` from fetched reviews:**
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "47",
  "bestRating": "5",
  "worstRating": "1"
}
```

**3. Consider more specific type:**
While `LocalBusiness` works, `ElectricalContractor` (pending Schema.org adoption) or using `additionalType` could be beneficial. For now, use `LocalBusiness` with detailed `hasOfferCatalog`.

## Build-Time Review Fetching Pattern

Extend the existing `fetch-reviews.yml` pattern:

```yaml
# Multi-platform review aggregation
- name: Fetch All Reviews
  run: |
    # Google (existing)
    GOOGLE_REVIEWS=$(curl -s "https://maps.googleapis.com/maps/api/place/details/json?...")

    # Yelp (new)
    YELP_REVIEWS=$(curl -s -H "Authorization: Bearer ${YELP_API_KEY}" \
      "https://api.yelp.com/v3/businesses/${YELP_BUSINESS_ID}/reviews")

    # Merge into unified format
    jq -s '...' > data/reviews.json
```

## Static Map Generation Pattern

Option 1: **Pre-generate and commit** (recommended for infrequent changes)
```bash
# Generate once, commit to repo
curl "https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=600&center=lonlat:-122.5,45.7&zoom=9&marker=lonlat:-122.5375,45.7844;color:red&apiKey=YOUR_KEY" -o static/images/service-area-map.png
```

Option 2: **Generate at build time** (for dynamic markers)
```yaml
# In GitHub Actions
- name: Generate Service Area Map
  run: |
    curl "https://maps.geoapify.com/v1/staticmap?..." -o static/images/service-area-map.png
```

## Sources

### HIGH Confidence (Official Documentation)
- [Hugo releases - v0.155.3 latest](https://github.com/gohugoio/hugo/releases) - verified Feb 2026
- [Hugo resources.GetRemote](https://gohugo.io/functions/resources/getremote/) - build-time remote data fetching
- [Google LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) - required/recommended properties
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness) - areaServed property documentation
- [Google Maps Static API](https://developers.google.com/maps/documentation/maps-static/overview) - static map generation
- [Yelp Fusion API Reviews](https://docs.developer.yelp.com/reference/v3_business_reviews) - 3 reviews per business
- [Geoapify Pricing](https://www.geoapify.com/pricing/) - 3,000 credits/day free tier

### MEDIUM Confidence (Verified with Multiple Sources)
- [Google Places API 5 review limit](https://featurable.com/blog/google-places-more-than-5-reviews) - confirmed by multiple developer sources
- [Elfsight Pricing](https://elfsight.com/google-reviews-widget/pricing/) - $6-24/month for review widgets
- [Hugo JSON-LD implementation patterns](https://weitzel.dev/post/hugo-structured-data/) - community best practices

### LOW Confidence (Needs Validation)
- HomeAdvisor and Nextdoor do not appear to have public review APIs - could not find official documentation confirming or denying; assume manual curation needed
- Review scraping services exist but legality/TOS compliance varies by jurisdiction

---
*Stack research for: Review Aggregation, Service Area Mapping, Local SEO on Hugo Static Site*
*Researched: 2026-02-13*
