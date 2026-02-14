# Architecture Research

**Domain:** Local Business Static Site with Review Aggregation, Service Area Mapping, and Local SEO
**Researched:** 2026-02-13
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUILD-TIME LAYER                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Review Fetcher │  │ Service Area   │  │ Schema         │                 │
│  │ (GitHub Action)│  │ Data Manager   │  │ Generator      │                 │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘                 │
│          │                   │                   │                          │
│          ▼                   ▼                   ▼                          │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                     DATA LAYER (/data/)                            │     │
│  │  reviews.json  │  service-area.json  │  seo-config.json            │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                  │                                          │
├──────────────────────────────────┼──────────────────────────────────────────┤
│                          HUGO BUILD                                         │
│                                  │                                          │
│          ┌───────────────────────┼───────────────────────┐                  │
│          ▼                       ▼                       ▼                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Templates      │  │ Partials       │  │ Assets         │                 │
│  │ (layouts/)     │  │ (layouts/      │  │ (assets/css/)  │                 │
│  │                │  │  partials/)    │  │                │                 │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘                 │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              ▼                                              │
│                    ┌────────────────┐                                       │
│                    │ hugo --minify  │                                       │
│                    └───────┬────────┘                                       │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                    OUTPUT LAYER                                             │
│                            ▼                                                │
│                    ┌────────────────┐                                       │
│                    │ /public/       │                                       │
│                    │ (Static HTML)  │                                       │
│                    └────────────────┘                                       │
│                            │                                                │
└────────────────────────────┼────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT-SIDE LAYER                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Reviews        │  │ Interactive    │  │ Schema.org     │                 │
│  │ Carousel (JS)  │  │ Map (Leaflet)  │  │ JSON-LD        │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Review Fetcher** | Scheduled GitHub Action that fetches reviews from Google Places API (and potentially Yelp, etc.) | GitHub Secrets, External APIs, data/reviews.json |
| **Service Area Data** | Static JSON defining service regions, cities, and geographic boundaries | Hugo templates, Map component |
| **Schema Generator** | Hugo partial generating JSON-LD structured data at build time | Hugo config, data files, HTML output |
| **Hugo Templates** | Main layout templates consuming data files | Data layer, partials, static output |
| **Partials** | Reusable template fragments (reviews section, schema block, map embed) | Parent templates, data files |
| **Map Component** | Client-side interactive map using Leaflet/Mapbox | Static tile CDN, service-area.json (embedded) |
| **Reviews Carousel** | Client-side JS for paginated review display | Rendered HTML (reviews baked in at build) |

## Recommended Project Structure

```
polos-electronics/
├── .github/
│   └── workflows/
│       ├── hugo.yml                 # Deploy workflow
│       └── fetch-reviews.yml        # Review aggregation workflow
├── data/
│   ├── reviews.json                 # Aggregated reviews (all platforms)
│   ├── service-area.json            # Service area definitions
│   └── seo.json                     # Optional: centralized SEO config
├── layouts/
│   ├── index.html                   # Main single-page template
│   └── partials/
│       ├── schema/
│       │   ├── local-business.html  # LocalBusiness JSON-LD
│       │   ├── service.html         # Service schema with areaServed
│       │   └── breadcrumb.html      # BreadcrumbList (if multi-page)
│       ├── reviews/
│       │   └── carousel.html        # Reviews display component
│       └── service-area/
│           └── map.html             # Map embed partial
├── assets/
│   ├── css/
│   │   └── custom.css               # Site styles (extend for map/reviews)
│   └── js/
│       └── map.js                   # Optional: map initialization
├── static/
│   ├── images/
│   │   └── service-area-map.png     # Static fallback map image
│   └── CNAME
├── content/
│   └── _index.md                    # Homepage content
└── hugo.toml                        # Hugo configuration
```

### Structure Rationale

- **data/:** Single source of truth for all dynamic content (reviews, service areas). GitHub Actions write here; Hugo reads at build time. This separation keeps external data isolated from templates.
- **layouts/partials/schema/:** Centralized schema markup generation. Each schema type in its own partial prevents monolithic templates and enables independent testing.
- **layouts/partials/reviews/:** Encapsulates review rendering logic, making it easy to swap carousel implementations or add filtering.
- **assets/js/:** Client-side JavaScript for interactive features (map) kept separate from Hugo's template rendering.

## Architectural Patterns

### Pattern 1: Build-Time Data Aggregation

**What:** External data (reviews from APIs) is fetched by scheduled GitHub Actions and committed to the repository as JSON data files. Hugo consumes these files at build time.

**When to use:** When data changes infrequently (daily/weekly) and you want to maintain static site benefits (no runtime API calls, fast TTFB, works offline).

**Trade-offs:**
- Pros: No API keys exposed to client, no CORS issues, data cached in repo history, site works even if API is down
- Cons: Data staleness (up to 24h with daily fetch), requires commit/deploy cycle for updates

**Example:**
```yaml
# .github/workflows/fetch-reviews.yml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
jobs:
  fetch-reviews:
    steps:
      - name: Fetch from multiple platforms
        run: |
          # Fetch Google reviews
          curl -s "https://maps.googleapis.com/maps/api/place/details/json?..." > /tmp/google.json
          # Combine into unified format
          jq -s '{ reviews: [.[0].reviews[], .[1].reviews[]] | sort_by(.date) | reverse }' \
            /tmp/google.json /tmp/yelp.json > data/reviews.json
      - name: Commit if changed
        run: git add data/reviews.json && git diff --staged --quiet || git commit -m "Update reviews"
```

### Pattern 2: Hugo Data Template Consumption

**What:** Hugo templates access data files via `.Site.Data.filename` syntax, iterating over arrays and rendering HTML at build time.

**When to use:** For all structured data that needs to appear in HTML output.

**Trade-offs:**
- Pros: Zero runtime overhead, SEO-friendly (content in HTML), type-safe with Hugo's templating
- Cons: Requires rebuild for data changes, limited dynamic filtering

**Example:**
```html
<!-- layouts/partials/reviews/carousel.html -->
{{ $reviews := .Site.Data.reviews.reviews }}
{{ range first 10 $reviews }}
  {{ if ge .rating 4 }}
    <div class="review-card" data-platform="{{ .source }}">
      <div class="review-rating">{{ .rating }}/5</div>
      <p class="review-text">{{ .text }}</p>
      <cite class="review-author">{{ .author }}</cite>
    </div>
  {{ end }}
{{ end }}
```

### Pattern 3: Entity-First Schema Architecture

**What:** Treat your LocalBusiness entity as the canonical "@id" anchor. All related schema (Services, areaServed, Reviews) reference this ID via `@id` references.

**When to use:** For any site requiring rich structured data and local SEO.

**Trade-offs:**
- Pros: Clean entity graph, avoids duplicate/conflicting schema, future-proof for knowledge graph
- Cons: Requires upfront planning, more complex template logic

**Example:**
```html
<!-- layouts/partials/schema/local-business.html -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "{{ .Site.BaseURL }}#business",
  "name": "{{ .Site.Title }}",
  "areaServed": [
    {{ range $i, $area := .Site.Data.service_area.counties }}
    {{ if $i }},{{ end }}
    {
      "@type": "AdministrativeArea",
      "name": "{{ $area }}"
    }
    {{ end }}
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [
      {{ range $i, $svc := .Site.Data.services }}
      {{ if $i }},{{ end }}
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "@id": "{{ $.Site.BaseURL }}#service-{{ $svc.id }}",
          "name": "{{ $svc.name }}",
          "areaServed": { "@id": "{{ $.Site.BaseURL }}#service-area" }
        }
      }
      {{ end }}
    ]
  }
}
</script>
```

## Data Flow

### Review Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Google API  │     │  Yelp API   │     │ Other APIs  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  GitHub Action        │
               │  (fetch-reviews.yml)  │
               │  - Fetch from APIs    │
               │  - Normalize format   │
               │  - Filter/validate    │
               │  - Merge & dedupe     │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  data/reviews.json    │
               │  {                    │
               │    "lastUpdated": "", │
               │    "sources": [],     │
               │    "reviews": [...]   │
               │  }                    │
               └───────────┬───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Hugo Build  │   │ Hugo Build  │   │ Hugo Build  │
│ reviews.html│   │ schema.html │   │ stats calc  │
│ (display)   │   │ (metadata)  │   │ (counts)    │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Service Area Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  data/service-area.json                                         │
│  {                                                              │
│    "primary": { "name": "Clark County", "type": "county" },     │
│    "counties": ["Clark", "Cowlitz", "Skamania"],               │
│    "cities": ["Vancouver", "Camas", "Longview", ...],          │
│    "geojson": "/data/service-area.geojson"                      │
│  }                                                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Hugo Template   │ │ Hugo Schema     │ │ Client-Side JS  │
│ (text listing)  │ │ (areaServed)    │ │ (Leaflet map)   │
│                 │ │                 │ │                 │
│ "We serve:      │ │ "areaServed": [ │ │ L.geoJson(      │
│  Vancouver..."  │ │   {...},        │ │   serviceArea   │
└─────────────────┘ │   {...}         │ │ ).addTo(map)    │
                    │ ]               │ └─────────────────┘
                    └─────────────────┘
```

### Schema.org Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│  INPUT SOURCES                                                │
├──────────────────────────────────────────────────────────────┤
│ hugo.toml          data/reviews.json    data/service-area.json│
│ [params]           {reviews: [...]}     {counties: [...]}    │
│ phone, email,                                                 │
│ address, etc.                                                 │
└────────────┬───────────────┬───────────────┬─────────────────┘
             │               │               │
             └───────────────┼───────────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │  Hugo Build - Schema Partials  │
            │                                │
            │  partials/schema/              │
            │  ├── local-business.html       │
            │  ├── service.html              │
            │  └── (organization.html)       │
            └───────────────┬────────────────┘
                            │
                            ▼
            ┌────────────────────────────────┐
            │  OUTPUT: <head> section        │
            │                                │
            │  <script type="ld+json">       │
            │  {                             │
            │    "@context": "schema.org",   │
            │    "@type": "LocalBusiness",   │
            │    "@id": "...#business",      │
            │    "areaServed": [...],        │
            │    "hasOfferCatalog": {...}    │
            │  }                             │
            │  </script>                     │
            └────────────────────────────────┘
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Places API | Build-time fetch via GitHub Action | Rate limits: 5 reviews max per request. Requires API key stored in GitHub Secrets. |
| Yelp Fusion API | Build-time fetch via GitHub Action | Rate limits: 3 reviews per business. OAuth required. |
| Mapbox/OpenStreetMap | Client-side tile loading | Free tier available. Mapbox requires access token (can be public for read-only). |
| Formspree | Client-side POST | Already integrated for contact form. No changes needed. |
| Google Analytics | Client-side tracking | Already integrated. Consider adding event tracking for reviews/map interactions. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| GitHub Action -> Data Files | File write (JSON) | Action commits directly to repo, triggering site rebuild |
| Data Files -> Hugo Templates | `.Site.Data` accessor | Hugo loads all JSON/YAML/TOML from data/ at build start |
| Hugo Templates -> Partials | `{{ partial }}` includes | Partials receive context via `.` or explicit dict |
| Hugo Output -> Client JS | Embedded data in HTML | For interactive features, bake data into script tags or data attributes |
| Static Map Image -> Interactive Map | Progressive enhancement | Show static image by default, enhance with JS if available |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (single location) | Current architecture is optimal. Single-page site with one LocalBusiness entity. |
| 2-5 locations | Add location data file. Generate location-specific schema per location. Consider multi-page layout. |
| 10+ locations | Move to Hugo sections (content/locations/). Generate city landing pages from data. Implement taxonomy for service areas. |

### Scaling Priorities

1. **First bottleneck:** Review volume. If reviews grow beyond 100, implement pagination or lazy loading in carousel. Solved by adding client-side pagination (already present) or limiting displayed reviews.

2. **Second bottleneck:** Build time for many pages. If adding 50+ city landing pages, consider Hugo's cache features and parallel builds. GitHub Actions can handle this with current free tier limits.

## Anti-Patterns

### Anti-Pattern 1: Client-Side API Fetching

**What people do:** Fetch reviews directly from Google/Yelp APIs in browser JavaScript.

**Why it's wrong:** Exposes API keys, violates API ToS (no client-side calls allowed), fails if API is down, causes layout shift, poor SEO (content not in HTML).

**Do this instead:** Fetch at build time via GitHub Actions. Bake review content into HTML. API keys stay in GitHub Secrets.

### Anti-Pattern 2: Monolithic Schema Block

**What people do:** Put all JSON-LD in a single massive script tag in the layout.

**Why it's wrong:** Hard to maintain, difficult to test, impossible to conditionally include schema types.

**Do this instead:** Use Hugo partials for each schema type. Conditionally include based on page context. Centralize @id references in hugo.toml params.

### Anti-Pattern 3: Self-Serving Review Schema

**What people do:** Add AggregateRating/Review schema to LocalBusiness hoping for star snippets in search.

**Why it's wrong:** Google explicitly prohibits this for LocalBusiness since 2019. Will not show stars and may result in manual action.

**Do this instead:** Display reviews for social proof (humans reading). Use Product/Service schema for offerings if you want potential rich results. Focus on Google Business Profile for star ratings in search.

### Anti-Pattern 4: Copy-Paste City Pages

**What people do:** Create near-duplicate pages for each city by swapping city names.

**Why it's wrong:** Thin content, may be flagged as doorway pages by Google, provides no unique value.

**Do this instead:** Generate city pages from data with unique content sections. Include city-specific service details, testimonials from that area, or local landmarks. Use Hugo's data-driven page generation with meaningful differentiation.

## Build Order Implications

Based on component dependencies, features should be built in this order:

### Phase 1: Schema Enhancement (No Dependencies)
- Can be implemented immediately
- Only requires hugo.toml params (already exists)
- Output: Enhanced JSON-LD in `<head>`

### Phase 2: Review Aggregation (Requires Schema Foundation)
- Depends on understanding how schema will structure review data
- May need to extend data/reviews.json format
- GitHub Action modifications for multi-platform

### Phase 3: Service Area Mapping (Independent, Parallel OK)
- Can be built in parallel with Phase 2
- Requires client-side JS additions
- Depends on service-area.json structure decisions

### Phase 4: Local SEO City Pages (Requires All Above)
- Needs service area data finalized (Phase 3)
- Benefits from schema patterns established (Phase 1)
- May want to show reviews per city (Phase 2)

```
  Phase 1: Schema    ────────────────────────────►

  Phase 2: Reviews   ──────────────────────────────────────►

  Phase 3: Map       ──────────────────────────────────────►

  Phase 4: City SEO                              ────────────────────►

  ─────────────────────────────────────────────────────────────────►
                                             Time
```

## Sources

- [Hugo Data Sources Documentation](https://gohugo.io/content-management/data-sources/)
- [Google Review Snippet Structured Data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) - LocalBusiness review restrictions
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness) - areaServed, geo properties
- [Schema.org Service](https://schema.org/Service) - Service area schema patterns
- [Leaflet Quick Start](https://leafletjs.com/examples/quick-start/) - Client-side mapping
- [Mapbox Static Maps](https://www.mapbox.com/static-maps) - Map integration options
- [GitHub Actions Schedule Events](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule) - Cron-based workflow triggers
- [Local SEO City Landing Pages Guide 2026](https://daltonluka.com/blog/local-landing-pages) - City page best practices
- [Schema Markup Best Practices 2026](https://geneo.app/blog/schema-markup-best-practices-2026-json-ld-audit/) - Entity-first schema approach
- [BrightLocal Schema Templates](https://www.brightlocal.com/learn/local-seo-schema-templates/) - Local business schema examples

---
*Architecture research for: Polos Electronics Hugo Static Site Enhancement*
*Researched: 2026-02-13*
