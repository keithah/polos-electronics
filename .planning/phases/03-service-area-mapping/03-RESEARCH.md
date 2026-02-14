# Phase 3: Service Area Mapping - Research

**Researched:** 2026-02-14
**Domain:** Static map generation, Hugo data templates, Schema.org areaServed, Local SEO
**Confidence:** MEDIUM

## Summary

This phase involves creating a static service area map image and comprehensive text listings for Polos Electronics' coverage areas. The user has decided on a flat illustration style (not interactive) with Washington state visible, Clark County highlighted in primary red (#fe3a46), and bordering counties (Cowlitz, Skamania) in a lighter tint.

Research reveals two viable approaches for the map image: (1) Using Geoapify's Static Maps API with POST requests for polygon rendering, or (2) Creating a custom SVG from existing open-source Washington county map resources. Given the flat illustration requirement and desire for clean vector aesthetics, the **SVG approach is recommended** as it provides exact control over colors, styling, and produces a scalable, lightweight image that matches the site's design system.

For the data structure, Hugo's `data/` directory with JSON files is well-suited. The existing `data/service-area.json` provides a foundation to expand with comprehensive city/community lists organized by tier (Primary, Secondary, Statewide).

**Primary recommendation:** Create a custom SVG map from open-source Washington county boundaries, style with CSS-defined colors, convert to optimized PNG for production use, and expand `data/service-area.json` with tiered city listings for comprehensive local SEO.

## Standard Stack

The established tools for this domain:

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Inkscape | 1.3+ | SVG editing/creation | Free, open-source, handles GeoJSON import |
| Hugo Data Files | N/A | JSON data storage | Native Hugo feature, already in use |
| CSS/HTML | N/A | Inline SVG styling | Zero dependencies, matches site design system |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Wikimedia Commons SVG | Source map data | Starting point for Washington county outlines |
| SVGO | SVG optimization | Minimize file size before production |
| ImageMagick | PNG conversion | Convert final SVG to PNG if needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom SVG | Geoapify Static Maps API | API dependency, requires API key, less control over flat illustration style |
| Custom SVG | MapSVG pre-made | Commercial licensing considerations |
| PNG output | SVG inline | PNG simpler for img tag, SVG allows CSS theming |

**No npm installation required** - this phase uses static image assets and Hugo data files.

## Architecture Patterns

### Recommended Data Structure

```
data/
└── service-area.json      # Comprehensive tiered service area data
static/
└── images/
    └── service-area-map.png   # Final map image (or .svg)
```

### Pattern 1: Tiered Service Area JSON

**What:** Organize service areas by priority tier with comprehensive city listings
**When to use:** Local service businesses with multi-level geographic coverage
**Example:**
```json
{
  "heading": "Our Coverage Area",
  "tagline": "Proudly serving Clark County since 1979",
  "tiers": [
    {
      "level": "primary",
      "label": "Clark County",
      "description": "Our home base and primary service area",
      "counties": [
        {
          "name": "Clark County",
          "state": "WA",
          "sameAs": "https://en.wikipedia.org/wiki/Clark_County,_Washington",
          "cities": [
            {"name": "Battle Ground", "type": "city", "isHeadquarters": true},
            {"name": "Vancouver", "type": "city"},
            {"name": "Camas", "type": "city"},
            {"name": "Washougal", "type": "city"},
            {"name": "Ridgefield", "type": "city"},
            {"name": "La Center", "type": "city"},
            {"name": "Yacolt", "type": "city"},
            {"name": "Brush Prairie", "type": "unincorporated"},
            {"name": "Hockinson", "type": "unincorporated"},
            {"name": "Hazel Dell", "type": "unincorporated"},
            {"name": "Orchards", "type": "unincorporated"},
            {"name": "Salmon Creek", "type": "unincorporated"},
            {"name": "Five Corners", "type": "unincorporated"},
            {"name": "Felida", "type": "unincorporated"},
            {"name": "Minnehaha", "type": "unincorporated"},
            {"name": "Mill Plain", "type": "unincorporated"},
            {"name": "Meadow Glade", "type": "unincorporated"},
            {"name": "Amboy", "type": "unincorporated"}
          ]
        }
      ]
    },
    {
      "level": "secondary",
      "label": "Also Serving",
      "description": "Bordering counties we regularly serve",
      "counties": [
        {
          "name": "Cowlitz County",
          "state": "WA",
          "sameAs": "https://en.wikipedia.org/wiki/Cowlitz_County,_Washington",
          "cities": [
            {"name": "Longview", "type": "city"},
            {"name": "Kelso", "type": "city"},
            {"name": "Woodland", "type": "city"},
            {"name": "Kalama", "type": "city"},
            {"name": "Castle Rock", "type": "city"}
          ]
        },
        {
          "name": "Skamania County",
          "state": "WA",
          "sameAs": "https://en.wikipedia.org/wiki/Skamania_County,_Washington",
          "cities": [
            {"name": "Stevenson", "type": "city"},
            {"name": "North Bonneville", "type": "city"},
            {"name": "Carson", "type": "unincorporated"}
          ]
        }
      ]
    },
    {
      "level": "statewide",
      "label": "Licensed Statewide",
      "description": "Licensed to serve all of Washington State"
    }
  ],
  "outOfAreaCTA": "Not in our primary area? Call us - we may still be able to help!",
  "map": {
    "url": "/images/service-area-map.png",
    "alt": "Service area map showing Clark County highlighted in red, with Cowlitz and Skamania counties in lighter red, within Washington state"
  }
}
```

### Pattern 2: Hugo Template Iteration

**What:** Range over tiered data with conditional formatting
**When to use:** Displaying hierarchical service area information
**Example:**
```html
{{ $sa := .Site.Data.service_area }}
<section id="service-area" class="service-area-section">
  <div class="section-container">
    <h2 class="section-title">{{ $sa.heading }}</h2>
    <p class="service-area-tagline">{{ $sa.tagline }}</p>

    {{ range $sa.tiers }}
      {{ if eq .level "primary" }}
        <div class="service-area-primary">
          <h3>{{ .label }}</h3>
          {{ range .counties }}
            <div class="city-list">
              {{ range .cities }}
                <span class="city {{ if .isHeadquarters }}headquarters{{ end }}">
                  {{ .name }}
                </span>
              {{ end }}
            </div>
          {{ end }}
        </div>
      {{ else if eq .level "secondary" }}
        <div class="service-area-secondary">
          <h4>{{ .label }}</h4>
          <!-- Similar iteration pattern -->
        </div>
      {{ end }}
    {{ end }}
  </div>
</section>
```

### Anti-Patterns to Avoid

- **Don't use interactive JavaScript maps:** Contradicts user decision for static image
- **Don't hardcode cities in HTML:** Use data files for maintainability and schema integration
- **Don't create separate pages per city:** Single-page site structure; use anchor sections
- **Don't duplicate areaServed data:** Keep schema data in `data/business.json`, reference from service-area display

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Washington county SVG | Draw from scratch | Wikimedia Commons blank county map | Accurate boundaries already available |
| City/community list | Research manually | Census data, Wikipedia lists | Authoritative, comprehensive |
| Schema.org areaServed | Custom JSON-LD | Existing `data/business.json` pattern | Already implemented in Phase 1 |
| Responsive image handling | Custom CSS | Existing `.service-area-map img` styles | Already responsive in CSS |

**Key insight:** The existing site already has responsive service area section CSS and a schema.org areaServed implementation. The task is to enhance content quality, not rebuild infrastructure.

## Common Pitfalls

### Pitfall 1: URL Length Limits with Geoapify GET Requests

**What goes wrong:** Complex polygon GeoJSON exceeds URL character limits
**Why it happens:** County boundaries have many coordinate points
**How to avoid:** Use POST requests for Geoapify, or better, use pre-rendered SVG/PNG
**Warning signs:** API returns 414 URI Too Long errors

### Pitfall 2: Misaligned Schema.org and Display Data

**What goes wrong:** Schema markup shows different areas than visible content
**Why it happens:** Maintaining two separate data sources
**How to avoid:** Both schema and display should read from same `data/` files
**Warning signs:** Rich results show counties not mentioned on page

### Pitfall 3: Missing Unincorporated Communities

**What goes wrong:** Customers in Brush Prairie, Hockinson, etc. don't find themselves listed
**Why it happens:** Only listing incorporated cities
**How to avoid:** Include census-designated places (CDPs) and named unincorporated communities
**Warning signs:** Local searches don't match service area page

### Pitfall 4: Over-optimized Local SEO

**What goes wrong:** Page looks spammy with keyword-stuffed city lists
**Why it happens:** Listing every possible location name
**How to avoid:** Organize visually with tiers, use natural copy, focus on real service areas
**Warning signs:** Excessive city repetition, unreadable content

### Pitfall 5: Static Map Without Battle Ground Pin

**What goes wrong:** User requirement for pin/marker on Battle Ground not implemented
**Why it happens:** Forgetting the headquarters marker requirement
**How to avoid:** Include explicit pin icon on Battle Ground in SVG
**Warning signs:** Map shows counties but no specific location marker

## Code Examples

Verified patterns from official sources:

### Hugo JSON Data Access

```html
{{/* Source: Hugo documentation - gohugo.io/content-management/data-sources */}}
{{ $serviceArea := .Site.Data.service_area }}
{{ with $serviceArea }}
  <h2>{{ .heading }}</h2>
  {{ range .tiers }}
    <h3>{{ .label }}</h3>
    {{ range .counties }}
      <strong>{{ .name }}, {{ .state }}</strong>
      <ul>
        {{ range .cities }}
          <li>{{ .name }}</li>
        {{ end }}
      </ul>
    {{ end }}
  {{ end }}
{{ end }}
```

### Schema.org areaServed with AdministrativeArea

```json
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "areaServed": [
    {
      "@type": "AdministrativeArea",
      "@id": "https://poloselectronics.com#area-clark-county",
      "name": "Clark County, Washington",
      "sameAs": "https://en.wikipedia.org/wiki/Clark_County,_Washington"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Cowlitz County, Washington",
      "sameAs": "https://en.wikipedia.org/wiki/Cowlitz_County,_Washington"
    }
  ]
}
```

### SVG Map with CSS Styling

```html
<!-- Inline SVG approach for CSS theming -->
<svg viewBox="0 0 800 600" class="service-area-map-svg">
  <style>
    .county-primary { fill: #fe3a46; stroke: #fff; stroke-width: 1; }
    .county-secondary { fill: #fe8a91; stroke: #fff; stroke-width: 1; }
    .county-default { fill: #e0e0e0; stroke: #fff; stroke-width: 0.5; }
    .pin-marker { fill: #323232; }
  </style>
  <!-- County paths with IDs -->
  <path id="clark-county" class="county-primary" d="..." />
  <path id="cowlitz-county" class="county-secondary" d="..." />
  <path id="skamania-county" class="county-secondary" d="..." />
  <!-- Other counties with default styling -->
  <!-- Battle Ground pin marker -->
  <g class="pin-marker" transform="translate(...)">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"/>
    <circle cx="12" cy="10" r="4" fill="#fff"/>
  </g>
</svg>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Maps embed | Static maps/SVG | 2020+ | Privacy, performance, no API costs |
| City-per-page | Single service area section | 2023+ | Better UX, consolidated SEO signals |
| Text-only service areas | Visual map + text | Standard | Improved user comprehension |
| Manual city lists | Data-driven templates | Hugo standard | Maintainability, schema integration |

**Deprecated/outdated:**
- Google Maps JavaScript API for simple coverage display (overkill, privacy concerns)
- Separate location pages for service area businesses without physical presence there

## Open Questions

Things that couldn't be fully resolved:

1. **Exact SVG source file**
   - What we know: Wikimedia Commons has CC-licensed Washington county SVG maps
   - What's unclear: Exact file to use, whether it includes all 39 counties as separate paths
   - Recommendation: Download and evaluate `File:Map_of_Washington_counties,_blank.svg` from Wikimedia

2. **Pin icon design specifics**
   - What we know: User wants pin/marker icon on Battle Ground (cleaner than star)
   - What's unclear: Exact pin style, size relative to map
   - Recommendation: Use standard map pin SVG icon, test at multiple sizes

3. **Geoapify API key requirement**
   - What we know: Geoapify requires API key even for free tier
   - What's unclear: Whether to use Geoapify at all given SVG approach is cleaner
   - Recommendation: Skip Geoapify, use SVG approach for full design control

4. **Complete unincorporated community list**
   - What we know: Major CDPs include Brush Prairie, Hockinson, Hazel Dell, Orchards, Salmon Creek
   - What's unclear: Full authoritative list of all unincorporated areas
   - Recommendation: Use Census CDP list + well-known community names, don't over-optimize

## Sources

### Primary (HIGH confidence)
- Hugo Documentation - Data Sources: https://gohugo.io/content-management/data-sources/
- Schema.org areaServed property: https://schema.org/areaServed
- Existing `data/business.json` and `data/service-area.json` in project

### Secondary (MEDIUM confidence)
- Geoapify Static Maps Tutorial: https://www.geoapify.com/tutorial/how-to-use-static-maps/
- Geoapify POST Requests: https://www.geoapify.com/tutorial/how-to-use-post-requests-with-the-static-maps-api/
- Wikimedia Commons WA County Maps: https://commons.wikimedia.org/wiki/Category:SVG_maps_of_Washington_(state)
- Washington State Geospatial Portal: https://geo.wa.gov/datasets/wadnr::wa-county-boundaries/
- Clark County Official: https://clark.wa.gov/county-manager/places-live
- Cowlitz County Official: https://www.co.cowlitz.wa.us/107/Cities-Towns-in-Cowlitz-County

### Tertiary (LOW confidence)
- SVG Map Creation Tutorials: https://www.smashingmagazine.com/2015/09/making-svg-maps-from-natural-earth-data/
- Local SEO Service Area Best Practices: https://searchengineland.com/guide/service-area-pages

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - SVG approach well-documented but specific Washington county SVG needs verification
- Architecture: HIGH - Hugo data patterns are well-established, existing site structure confirmed
- Pitfalls: HIGH - Common issues documented across multiple sources
- Code examples: HIGH - Based on Hugo official docs and Schema.org specifications

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - stable domain, geographic data doesn't change)

## Implementation Summary

### Map Image Creation Steps
1. Download Washington county SVG from Wikimedia Commons
2. Open in Inkscape, identify county path IDs
3. Apply fill colors: Clark=#fe3a46, Cowlitz/Skamania=#fe8a91, others=#e0e0e0
4. Add Battle Ground pin marker SVG icon
5. Export as optimized PNG at appropriate dimensions
6. Save to `static/images/service-area-map.png`

### Data File Enhancement Steps
1. Expand `data/service-area.json` with tiered structure
2. Add comprehensive Clark County cities (7 incorporated + major unincorporated)
3. Add Cowlitz County cities (5 incorporated)
4. Add Skamania County cities (2 incorporated + Carson)
5. Add welcoming tagline and out-of-area CTA

### Template Updates
1. Update service area section in `layouts/index.html`
2. Iterate over tiered data structure
3. Display cities with visual hierarchy
4. Ensure schema.org areaServed stays consistent with `data/business.json`
