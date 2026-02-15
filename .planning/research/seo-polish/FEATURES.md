# Feature Landscape: SEO Polish (robots.txt, Canonical URLs, WebP Images)

**Domain:** Static business site SEO polish
**Researched:** 2026-02-14
**Confidence:** HIGH (verified with official documentation)

## Table Stakes

Features users and search engines expect. Missing = incomplete SEO foundation.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| robots.txt file | Google Search Console requires it; defines crawler access rules | Low | Hugo generates automatically with `enableRobotsTXT = true` |
| Sitemap reference in robots.txt | Best practice per Google; helps crawlers discover sitemap | Low | Single line addition: `Sitemap: https://poloselectronics.com/sitemap.xml` |
| Self-referencing canonical URL | Google confirms this clarifies preferred URL even without duplicates | Low | Already implemented in `layouts/index.html` line 17 |
| Absolute canonical URL | Google requires full URL starting with https:// | Low | Already correct: `<link rel="canonical" href="{{ .Permalink }}">` |
| WebP format for hero image (LCP element) | Core Web Vitals 2026: LCP images determine page speed score | Medium | Hero image is LCP element; WebP reduces load time 18-25% |
| `fetchpriority="high"` on LCP image | Hints browser to load hero immediately; critical for LCP score | Low | Add attribute to hero-image.jpg `<img>` tag |

## Differentiators

Features that improve SEO beyond baseline. Not expected, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| WebP for all images with JPEG fallback | 25-30% smaller file sizes, improved Core Web Vitals | Medium | Use `<picture>` element with `<source type="image/webp">` |
| AVIF format (in addition to WebP) | 50% smaller than WebP per Netflix benchmarks | High | Limited Hugo support; requires pre-conversion tooling |
| Responsive `srcset` for images | Proper image sizing per viewport; reduces mobile bandwidth | Medium | Hugo image processing can generate multiple sizes |
| AI crawler directives in robots.txt | Control visibility in ChatGPT, Perplexity, AI Overviews | Low | Decide whether to allow/block GPTBot, CCBot, Anthropic-AI |
| `lastmod` in sitemap.xml | Tells Google when content actually changed | Low | Configure in hugo.toml sitemap settings |

## Anti-Features

Features to explicitly NOT implement. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Canonical URL with fragment (#section) | Google explicitly ignores fragments in canonical URLs | Use clean URL without hash: `https://poloselectronics.com/` not `https://poloselectronics.com/#home` |
| `loading="lazy"` on hero image | Intentionally delays LCP element; destroys Core Web Vitals | Remove lazy loading from hero; use only on below-fold images |
| Blocking important content in robots.txt | Pages can still appear in search results via external links | Use `noindex` meta tag if you truly want to hide pages |
| Multiple canonical tags on same page | All canonical tags get ignored | Single canonical tag only |
| robots.txt to hide sensitive pages | Doesn't prevent indexing, only crawling | Use password protection or server-side auth |
| Over-compressing WebP images | Visible artifacts harm user experience | Use quality setting 75-85 for photos; Hugo default is good |
| Blocking all AI crawlers reflexively | Reduces visibility in AI search tools (ChatGPT, Perplexity) | Make intentional decision based on business goals |

## Feature Dependencies

```
robots.txt → requires sitemap.xml exists (already done)
WebP images → requires Hugo image processing OR pre-converted assets
Picture element → requires both WebP and JPEG versions of images
fetchpriority → requires identifying which image is LCP element
```

## Current State Assessment

**Already Implemented (confirmed in codebase):**
- Self-referencing canonical URL (line 17 of layouts/index.html)
- sitemap.xml generation (hugo.toml configured)
- `loading="lazy"` on below-fold images (correct placement)
- OG/Twitter meta tags
- Schema.org structured data

**Missing (table stakes):**
- robots.txt file (not in static/ or public/)
- Sitemap reference in robots.txt
- WebP versions of images (all images are JPEG/PNG)
- `fetchpriority="high"` on hero image

**Image Inventory (in static/images/):**

| Image | Size | Format | LCP? |
|-------|------|--------|------|
| hero-image.jpg | 109KB | JPEG | YES - critical |
| logo.png | 212KB | PNG | Above fold |
| andy-polos.jpg | 74KB | JPEG | Below fold, lazy ok |
| john-polos.jpg | 32KB | JPEG | Below fold, lazy ok |
| derick-steele.jpg | 139KB | JPEG | Below fold, lazy ok |
| services-image.jpg | 123KB | JPEG | Below fold, lazy ok |
| contact-image.jpg | 44KB | JPEG | Below fold, lazy ok |
| service-area-preview.jpg | 108KB | JPEG | Below fold, lazy ok |

## MVP Recommendation

For SEO polish MVP, prioritize:

1. **robots.txt with sitemap reference** - Required for Google Search Console submission
2. **WebP conversion for hero-image.jpg** - Directly impacts LCP/Core Web Vitals
3. **`fetchpriority="high"` on hero image** - Free LCP improvement

Defer to post-MVP:
- WebP for all images: Lower priority, below-fold images already lazy-loaded
- AVIF format: High complexity, marginal gain over WebP
- Responsive srcset: Site already loads reasonably, not critical for single-page
- AI crawler decisions: Requires stakeholder discussion

## Implementation Notes

### robots.txt for Hugo

Two options:

**Option A: Hugo template (recommended)**
```toml
# hugo.toml
enableRobotsTXT = true
```

Then create `layouts/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: {{ .Site.BaseURL }}sitemap.xml
```

**Option B: Static file**
Set `enableRobotsTXT = false` and create `static/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://poloselectronics.com/sitemap.xml
```

### WebP Conversion

**For static assets (recommended for this site):**
Pre-convert images and use `<picture>` element:
```html
<picture>
  <source srcset="/images/hero-image.webp" type="image/webp">
  <img src="/images/hero-image.jpg" alt="..." fetchpriority="high">
</picture>
```

**For Hugo image processing (if images were in assets/):**
```hugo
{{ $original := resources.Get "images/hero-image.jpg" }}
{{ $webp := $original.Resize "1500x webp" }}
```

### fetchpriority Implementation

Add to hero image:
```html
<img src="/images/hero-image.jpg"
     alt="Electrical work and installation"
     fetchpriority="high">
```

Remove any `loading="lazy"` from hero image (currently not present, which is correct).

## Feature Prioritization Matrix

| Feature | User/SEO Value | Implementation Cost | Priority |
|---------|----------------|---------------------|----------|
| robots.txt with sitemap | HIGH | LOW | P1 |
| WebP hero image | HIGH | MEDIUM | P1 |
| fetchpriority on hero | MEDIUM | LOW | P1 |
| WebP for all images | MEDIUM | MEDIUM | P2 |
| logo.png to WebP | MEDIUM | LOW | P2 |
| AI crawler policy | LOW | LOW | P3 |
| AVIF format | LOW | HIGH | P3 |
| Responsive srcset | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Required for Google Search Console readiness
- P2: Good to have for Core Web Vitals improvement
- P3: Future optimization

## Sources

**Official Documentation (HIGH confidence):**
- [Hugo robots.txt template](https://gohugo.io/templates/robots/) - Configuration and template options
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) - Official best practices
- [Hugo image processing](https://gohugo.io/content-management/image-processing/) - WebP conversion syntax

**Industry Best Practices (MEDIUM confidence):**
- [Search Engine Land: Canonicalization and SEO 2026](https://searchengineland.com/canonicalization-seo-448161) - GEO and canonical importance
- [Search Engine Land: Robots.txt SEO 2026](https://searchengineland.com/robots-txt-seo-453779) - Current best practices
- [MDN: Fix LCP image loading](https://developer.mozilla.org/en-US/blog/fix-image-lcp/) - fetchpriority guidance
- [WebP and AVIF on Hugo](https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/) - Implementation examples
- [Core Web Vitals 2026](https://nitropack.io/blog/core-web-vitals-strategy/) - LCP optimization benchmarks

---
*Feature research for: Polos Electronics SEO polish milestone*
*Researched: 2026-02-14*
