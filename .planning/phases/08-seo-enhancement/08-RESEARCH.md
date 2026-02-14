# Phase 8: SEO Enhancement - Research

**Researched:** 2026-02-14
**Domain:** Structured Data (Schema.org), Technical SEO, Image Optimization
**Confidence:** MEDIUM (critical findings impact requirement feasibility)

## Summary

This research covers the technical requirements for Phase 8 SEO Enhancement, focusing on structured data schemas (AggregateRating, Review, GeoCircle), social sharing images, sitemap configuration, image optimization, and internal linking.

**Critical Discovery:** Google does NOT display review star ratings in search results for LocalBusiness schema types when reviews are self-hosted. This means SEO-01 (AggregateRating for star ratings in SERPs) and SEO-02 (Review schema for rich snippets) will NOT produce visible star ratings in Google search results. However, implementing this schema still provides value for semantic understanding and potential future changes.

**Primary recommendation:** Implement all schemas correctly for semantic value and compliance, but set realistic expectations - star ratings will only appear via Google Business Profile, not from website schema markup. Focus energy on SEO-03 through SEO-07 which have direct, measurable impact.

## Standard Stack

### Core (No additional libraries needed)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Hugo built-in image processing | 0.131+ | WebP conversion, resizing | Native Hugo feature, no dependencies |
| JSON-LD Schema | Schema.org | Structured data markup | Google-preferred format |
| Native HTML lazy loading | HTML5 | `loading="lazy"` attribute | Browser-native, no JS required |

### Supporting

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| Hugo sitemap templates | Custom sitemap configuration | Exclude test pages, set priorities |
| Hugo image resources | Asset pipeline for WebP | Process images in layouts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hugo image processing | External build tool (Sharp, ImageMagick) | Hugo native is simpler, no extra deps |
| Native lazy loading | lazysizes.js library | Native has 95%+ browser support in 2026, JS not needed |

**No npm packages required - Hugo's built-in features handle all requirements.**

## Architecture Patterns

### Recommended Project Structure

```
layouts/
├── partials/
│   └── schema/
│       ├── local-business.html   # existing - add aggregateRating
│       ├── reviews.html          # NEW - individual Review schemas
│       ├── service-area-geo.html # NEW - GeoCircle schema
│       ├── faq.html              # existing - add internal links in answers
│       └── services.html         # existing
├── index.html                    # update OG image, lazy loading
└── _default/
    └── baseof.html               # sitemap front matter if needed
static/
└── images/
    └── og-share.jpg              # NEW - 1200x630 branded social image
data/
├── reviews.json                  # existing - add aggregate calculations
└── faq.json                      # existing - add HTML links in answers
hugo.toml                         # sitemap configuration
```

### Pattern 1: Nested Schema References

**What:** Use `@id` references to connect schema entities without duplication
**When to use:** When AggregateRating references the LocalBusiness entity
**Example:**
```json
// In local-business.html schema - add aggregateRating
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "@id": "https://poloselectronics.com#organization",
  "name": "Polos Electronics",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.95",
    "reviewCount": "33",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### Pattern 2: GeoCircle for Service Area

**What:** Define service radius using GeoCircle schema
**When to use:** Complement areaServed with precise geographic coverage
**Example:**
```json
{
  "@type": "GeoCircle",
  "geoMidpoint": {
    "@type": "GeoCoordinates",
    "latitude": 45.7844,
    "longitude": -122.5375
  },
  "geoRadius": "80000"  // 80km radius in meters
}
```

### Pattern 3: HTML in FAQ Answers for Internal Links

**What:** Store FAQ answers with HTML anchor tags for internal linking
**When to use:** SEO-07 requires contextual links in FAQ answers
**Example:**
```json
{
  "question": "How do I get a free estimate?",
  "answer": "Contact us by phone at (360) 687-3543 or use the <a href=\"#contact\">contact form</a> on our website."
}
```

### Anti-Patterns to Avoid

- **Self-serving review schema expecting SERP stars:** Google explicitly does not show stars for LocalBusiness self-hosted reviews
- **Duplicate schema blocks:** Use `@id` references instead of repeating full entities
- **WebP without JPEG fallback:** Some older browsers may not support WebP
- **Priority/changeFreq in sitemap without clear strategy:** These are hints Google often ignores; focus on content quality instead

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image format conversion | Custom bash scripts | Hugo `.Resize` with format | Hugo has built-in WebP support |
| Lazy loading | Custom IntersectionObserver | Native `loading="lazy"` | Browser support now at 95%+ |
| Schema validation | Manual JSON checking | Google Rich Results Test | Official validator catches errors |
| Social share image creation | Code-generated images | Design tool (Figma, Canva) | Branded design requires human touch |

**Key insight:** Hugo 0.131+ provides robust image processing - use its native features rather than external tools.

## Common Pitfalls

### Pitfall 1: Expecting LocalBusiness Review Stars in SERPs

**What goes wrong:** Implementing AggregateRating schema expecting Google to show stars in search results
**Why it happens:** Schema.org documentation shows aggregateRating as valid; Google's policy restricts display
**How to avoid:** Implement for semantic value only; set stakeholder expectations correctly
**Warning signs:** Searching for your business and not seeing stars despite correct markup

### Pitfall 2: Mismatched Review Counts

**What goes wrong:** Schema shows different count than visible on page
**Why it happens:** Pulling aggregate from API but displaying subset of reviews
**How to avoid:** Calculate aggregateRating from the SAME reviews displayed on page
**Warning signs:** Google Search Console structured data warnings

### Pitfall 3: WebP Without Fallback

**What goes wrong:** Images fail to load on older browsers
**Why it happens:** Assuming universal WebP support
**How to avoid:** Use `<picture>` element with WebP source and JPEG fallback
**Warning signs:** Broken images in Safari 13 or older browsers

### Pitfall 4: OG Image Wrong Dimensions

**What goes wrong:** Social shares crop image awkwardly or show thumbnail
**Why it happens:** Using 1:1 logo instead of 1.91:1 share image
**How to avoid:** Create dedicated 1200x630px image, test with Facebook debugger
**Warning signs:** Broken previews in social share testing tools

### Pitfall 5: Sitemap Includes Test/Draft Content

**What goes wrong:** Search engines index test pages
**Why it happens:** Hugo includes all content by default
**How to avoid:** Set `draft: true` or use custom sitemap template to exclude
**Warning signs:** Searching site:domain.com shows test-data pages

### Pitfall 6: FAQ Answer Links Not Crawlable

**What goes wrong:** Internal links in FAQ answers stored as plain text, not rendered as HTML
**Why it happens:** Hugo template escapes HTML in JSON data
**How to avoid:** Use `safeHTML` pipe when rendering FAQ answers with links
**Warning signs:** Link text visible but not clickable

## Code Examples

### AggregateRating in LocalBusiness Schema

```html
{{/* Calculate aggregate from reviews data */}}
{{- $reviews := .Site.Data.reviews.reviews -}}
{{- $totalRating := 0.0 -}}
{{- $ratingCount := 0 -}}
{{- range $reviews -}}
  {{- if .rating -}}
    {{- $totalRating = add $totalRating .rating -}}
    {{- $ratingCount = add $ratingCount 1 -}}
  {{- end -}}
{{- end -}}
{{- $avgRating := div $totalRating $ratingCount -}}

{{- $aggregateRating := dict
  "@type" "AggregateRating"
  "ratingValue" (printf "%.2f" $avgRating)
  "reviewCount" $ratingCount
  "bestRating" "5"
  "worstRating" "1"
-}}
```

### Individual Review Schema

```html
{{/* reviews.html partial */}}
{{- range .Site.Data.reviews.reviews -}}
{{- if .rating -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@id": "{{ $.Site.BaseURL }}#organization"
  },
  "author": {
    "@type": "Person",
    "name": "{{ .author }}"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "{{ .rating }}",
    "bestRating": "5",
    "worstRating": "1"
  },
  "reviewBody": "{{ .text }}"
}
</script>
{{- end -}}
{{- end -}}
```

### GeoCircle Service Area Schema

```html
{{/* service-area-geo.html partial */}}
{{- $b := .Site.Data.business -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "provider": {
    "@id": "{{ .Site.BaseURL }}#organization"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": {{ $b.geo.latitude }},
      "longitude": {{ $b.geo.longitude }}
    },
    "geoRadius": "80000"
  }
}
</script>
```

### Hugo Image Processing for WebP

```html
{{/* Responsive image with WebP and lazy loading */}}
{{ $image := resources.Get "images/hero-image.jpg" }}
{{ $webp := $image.Resize "800x webp q85" }}
{{ $fallback := $image.Resize "800x jpg q85" }}

<picture>
  <source srcset="{{ $webp.RelPermalink }}" type="image/webp">
  <img
    src="{{ $fallback.RelPermalink }}"
    alt="Hero image"
    width="{{ $fallback.Width }}"
    height="{{ $fallback.Height }}"
    loading="lazy">
</picture>
```

### Sitemap Configuration (hugo.toml)

```toml
[sitemap]
  changefreq = "monthly"
  priority = 0.5
  filename = "sitemap.xml"

# Exclude draft/test content by setting draft: true in front matter
# Or use custom sitemap template to filter
```

### FAQ Answer with Internal Links

```json
{
  "question": "How do I get a free estimate?",
  "answer": "Contact us by phone at (360) 687-3543 or use the <a href=\"#contact\">contact form</a> on our website. We will discuss your project needs and schedule a convenient time to provide a free estimate."
}
```

```html
{{/* In template, use safeHTML */}}
<p>{{ .answer | safeHTML }}</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LocalBusiness review stars in SERP | Stars only via Google Business Profile | 2019 | SEO-01/02 won't show stars |
| External lazy loading libraries | Native `loading="lazy"` | 2020+ | Simpler, no JS dependency |
| JPEG-only images | WebP with JPEG fallback | 2020+ | 25-30% smaller file sizes |
| Generic OG images | Designed 1200x630 share images | Standard | Better click-through on social |

**Deprecated/outdated:**
- Review stars for self-hosted LocalBusiness reviews: Google stopped showing these in 2019
- JavaScript-based lazy loading: Native HTML attribute now has broad support

## Open Questions

1. **SEO-01/02 Feasibility**
   - What we know: Google does NOT show stars for self-hosted LocalBusiness reviews
   - What's unclear: Whether stakeholders want to proceed knowing stars won't display
   - Recommendation: Implement for semantic value; document limitation clearly

2. **OG Image Creation**
   - What we know: Need 1200x630 branded image, not auto-generated
   - What's unclear: Design assets available, brand guidelines for social
   - Recommendation: Create simple branded image with logo + tagline + photo

3. **GeoCircle Radius Value**
   - What we know: Polos serves Clark, Cowlitz, Skamania, Lewis counties
   - What's unclear: Exact preferred radius in meters
   - Recommendation: Use ~80km (50mi) radius from Battle Ground coordinates

## Sources

### Primary (HIGH confidence)
- [Google Search Central: Review Snippet Structured Data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) - AggregateRating/Review requirements
- [Google Search Central: LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) - LocalBusiness schema properties
- [Schema.org: GeoCircle](https://schema.org/GeoCircle) - GeoCircle properties
- [Hugo: Image Processing](https://gohugo.io/content-management/image-processing/) - WebP conversion syntax
- [Hugo: Sitemap Templates](https://gohugo.io/templates/sitemap/) - Sitemap customization

### Secondary (MEDIUM confidence)
- [BrightLocal: LocalBusiness Review Schema Policy](https://www.brightlocal.com/learn/review-schema/) - Confirms Google policy on self-serving reviews
- [Whitespark: AggregateRating for Local Business](https://whitespark.ca/blog/how-to-use-aggregate-review-schema-to-get-stars-in-the-serps/) - Confirms stars not shown for LocalBusiness
- [OG Image Size Guide](https://omgimg.co/blog/open-graph-image-size-for-maximum-engagement/) - 1200x630 recommendation

### Tertiary (LOW confidence)
- WebSearch results on Hugo WebP/lazy loading - general patterns, should verify with Hugo docs

## Metadata

**Confidence breakdown:**
- AggregateRating/Review feasibility: HIGH - Google documentation explicit
- GeoCircle implementation: MEDIUM - schema.org clear, Google behavior less documented
- Image optimization: HIGH - Hugo docs + standard web practices
- Sitemap configuration: HIGH - Hugo official documentation
- FAQ internal linking: HIGH - standard HTML/Hugo patterns

**Research date:** 2026-02-14
**Valid until:** 30 days (schema.org stable, Google policies may update)

---

## Requirement Feasibility Assessment

| Requirement | Feasible? | Notes |
|-------------|-----------|-------|
| SEO-01 | PARTIAL | Schema valid, but stars will NOT show in Google SERPs |
| SEO-02 | PARTIAL | Schema valid, but rich snippets unlikely for self-hosted reviews |
| SEO-03 | YES | GeoCircle/GeoShape well-supported in schema.org |
| SEO-04 | YES | Standard OG image implementation |
| SEO-05 | YES | Hugo native sitemap, needs configuration |
| SEO-06 | YES | Hugo image processing supports WebP, native lazy loading |
| SEO-07 | YES | HTML in FAQ answers + safeHTML in templates |

**Recommendation:** Proceed with all requirements but document that SEO-01/02 provide semantic value without visible SERP star ratings. Consider updating requirement wording to reflect this limitation.
