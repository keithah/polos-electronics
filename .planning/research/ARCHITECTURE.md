# Architecture: SEO Polish Integration

**Domain:** SEO polish (robots.txt, canonical URLs, WebP images) for existing Hugo static site
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

This document details how robots.txt, canonical URLs, and WebP image conversion integrate with the existing Polos Electronics Hugo architecture. The site is a single-page layout with images currently in `static/images/` as JPG/PNG files. Each SEO component has distinct integration patterns and build order considerations.

## Current Architecture Overview

```
polos-electronics/
├── hugo.toml                     # Site config (baseURL, sitemap settings)
├── layouts/
│   └── index.html                # Main template (already has canonical link)
├── assets/
│   └── css/custom.css            # Processed via Hugo Pipes (minified)
├── static/
│   ├── images/                   # Current image location (JPG/PNG)
│   │   ├── hero-image.jpg        # 109KB
│   │   ├── andy-polos.jpg        # 74KB
│   │   ├── john-polos.jpg        # 32KB
│   │   ├── derick-steele.jpg     # 139KB
│   │   ├── services-image.jpg    # 123KB
│   │   ├── contact-image.jpg     # 44KB
│   │   └── logo.png              # 212KB
│   └── CNAME                     # Custom domain config
├── data/
│   ├── reviews.json              # Dynamic review data
│   └── service_area.json         # Service area config
└── .github/workflows/hugo.yml    # CI/CD pipeline
```

## Integration Patterns

### 1. robots.txt Integration

**Where it goes:** `layouts/robots.txt` (templated) OR `static/robots.txt` (static file)

**Recommended approach:** Templated file at `layouts/robots.txt`

**Rationale:**
- Hugo generates robots.txt automatically when `enableRobotsTXT = true` in config
- Template approach allows dynamic sitemap URL injection
- Single-page site needs minimal directives

**Integration steps:**
1. Add `enableRobotsTXT = true` to `hugo.toml`
2. Create `layouts/robots.txt` template
3. Reference sitemap dynamically: `Sitemap: {{ .Site.BaseURL }}sitemap.xml`

**File structure change:**
```
layouts/
├── index.html                    # Existing
└── robots.txt                    # NEW: robots.txt template
```

**Template example:**
```go-html-template
User-agent: *
Allow: /

Sitemap: {{ .Site.BaseURL }}sitemap.xml
```

**Build order:** Independent of other SEO changes. Can be added first.

**Configuration addition to hugo.toml:**
```toml
enableRobotsTXT = true
```

### 2. Canonical URL Integration

**Current state:** Already implemented correctly.

**Existing implementation in `layouts/index.html` (line 17):**
```html
<link rel="canonical" href="{{ .Permalink }}">
```

**Verification:**
- Uses Hugo's `.Permalink` which resolves to the full canonical URL
- `baseURL` in `hugo.toml` is set to `https://poloselectronics.com`
- Single-page site means only one canonical URL needed

**No changes required.** The canonical URL implementation is complete.

**Potential enhancement (optional):**
- Add front matter override capability for future multi-page expansion:
```go-html-template
{{- if isset .Params "canonical" -}}
<link rel="canonical" href="{{ .Params.canonical }}" />
{{- else -}}
<link rel="canonical" href="{{ .Permalink }}" />
{{- end }}
```

### 3. WebP Image Integration

**Critical architectural decision:** Images must move from `static/images/` to `assets/images/`.

**Why this is required:**
- Hugo image processing (resize, format conversion) only works on resources in `assets/`
- Files in `static/` are copied as-is without processing
- `resources.Get` function only accesses `assets/` directory

**Current image inventory:**

| Image | Current Size | Location | Used In |
|-------|-------------|----------|---------|
| hero-image.jpg | 109KB | static/images/ | Hero section, OG image |
| andy-polos.jpg | 74KB | static/images/ | Team section |
| john-polos.jpg | 32KB | static/images/ | Team section |
| derick-steele.jpg | 139KB | static/images/ | Team section |
| services-image.jpg | 123KB | static/images/ | Services section |
| contact-image.jpg | 44KB | static/images/ | Contact section |
| logo.png | 212KB | static/images/ | Header, footer |

**Total current size:** ~733KB

**Estimated WebP savings:** ~50% reduction = ~365KB saved

**Two implementation approaches:**

#### Approach A: Build-Time Hugo Conversion (Recommended)

**Pattern:** Use Hugo Pipes to convert images at build time.

**File structure change:**
```
assets/
├── css/custom.css                # Existing
└── images/                       # NEW: Move images here
    ├── hero-image.jpg
    ├── andy-polos.jpg
    └── ...
```

**Template pattern (partial for reuse):**
```go-html-template
{{/* layouts/partials/picture.html */}}
{{ $src := .src }}
{{ $alt := .alt }}
{{ $class := .class | default "" }}
{{ $lazy := .lazy | default true }}

{{ $image := resources.Get (printf "images/%s" $src) }}
{{ if $image }}
  {{ $webp := $image.Resize (printf "%dx%d webp q85" $image.Width $image.Height) }}
  {{ $fallback := $image }}
  <picture>
    <source srcset="{{ $webp.RelPermalink }}" type="image/webp">
    <img
      src="{{ $fallback.RelPermalink }}"
      alt="{{ $alt }}"
      {{ if $class }}class="{{ $class }}"{{ end }}
      {{ if $lazy }}loading="lazy"{{ end }}
      width="{{ $image.Width }}"
      height="{{ $image.Height }}">
  </picture>
{{ else }}
  {{ errorf "Image not found: %s" $src }}
{{ end }}
```

**Usage in templates:**
```go-html-template
{{ partial "picture.html" (dict "src" "hero-image.jpg" "alt" "Electrical work and installation") }}
```

**Pros:**
- Automatic WebP generation at build time
- Cache handled by Hugo (fast rebuilds)
- Width/height extracted automatically (prevents CLS)
- Single source of truth (original image only)

**Cons:**
- Requires Hugo Extended edition (already using v0.135.0 extended)
- Build time increases slightly (cached after first build)

#### Approach B: Pre-Generated WebP Files

**Pattern:** Generate WebP versions manually or via script, serve both from `static/`.

**File structure:**
```
static/images/
├── hero-image.jpg                # Original
├── hero-image.webp               # Pre-generated
└── ...
```

**Template pattern (render hook):**
```go-html-template
{{/* layouts/_default/_markup/render-image.html */}}
{{ $src := .Destination }}
{{ $webp := replace $src ".jpg" ".webp" | replace ".png" ".webp" }}
<picture>
  <source srcset="{{ $webp | relURL }}" type="image/webp">
  <img src="{{ $src | relURL }}" alt="{{ .Text }}" loading="lazy">
</picture>
```

**Pros:**
- No build-time processing
- Works with `static/` directory (no migration)

**Cons:**
- Manual WebP generation required
- Two files to maintain per image
- Easy to forget updating WebP when original changes

**Recommendation:** Approach A (Hugo Pipes) for reliability and maintainability.

## Build Order and Dependencies

```
Phase structure for SEO Polish:

1. robots.txt (independent)
   └── Add enableRobotsTXT config
   └── Create layouts/robots.txt template
   └── Verify in build output

2. Canonical URL (already complete)
   └── No work needed
   └── Optional: Add front matter override capability

3. WebP Images (most complex, do last)
   └── Step 1: Create assets/images/ directory
   └── Step 2: Move images from static/images/ to assets/images/
   └── Step 3: Create picture partial
   └── Step 4: Update all image references in layouts/index.html
   └── Step 5: Update OG/Twitter meta images (special handling)
   └── Step 6: Verify build output has both formats
```

**Dependency graph:**
```
robots.txt ─────────────────────────────────────┐
                                                │
canonical (no-op) ──────────────────────────────┤
                                                │
WebP: migrate images ──┐                        │
                       │                        │
WebP: create partial ──┼─> WebP: update refs ───┼─> Final verification
                       │                        │
WebP: OG image fix ────┘                        │
                                                │
                                          ──────┴──> Deploy
```

## Special Considerations

### Open Graph and Twitter Card Images

**Current implementation (lines 25, 41):**
```html
<meta property="og:image" content="{{ "images/hero-image.jpg" | absURL }}">
<meta name="twitter:image" content="{{ "images/hero-image.jpg" | absURL }}">
```

**Challenge:** Social media crawlers may not support WebP format.

**Recommended solution:** Keep JPG for social meta images, use WebP only for in-page images.

```go-html-template
{{/* For OG/Twitter, keep JPG: */}}
{{ $ogImage := resources.Get "images/hero-image.jpg" }}
<meta property="og:image" content="{{ $ogImage.Permalink }}">

{{/* For page content, use WebP with fallback: */}}
{{ partial "picture.html" (dict "src" "hero-image.jpg" ...) }}
```

### Logo PNG Handling

**Current:** `logo.png` (212KB) used in header and footer.

**WebP for PNG:** Hugo supports PNG to WebP conversion, but logos often benefit from SVG instead.

**Recommendation:**
- Convert logo to SVG if vector source available (smallest, scalable)
- Otherwise convert to WebP (lossy acceptable for photos, not logos)
- For logos, consider keeping PNG and just optimizing (e.g., `pngquant`)

### Existing CSS Processing

**Current pattern (line 45):**
```go-html-template
{{ $style := resources.Get "css/custom.css" | resources.Minify }}
<link rel="stylesheet" href="{{ $style.Permalink }}">
```

**Impact:** This pattern already uses `assets/` directory for CSS. Adding images to `assets/` follows the same established pattern.

### CI/CD Impact

**Current workflow** (`hugo.yml` line 80):
```yaml
hugo --gc --minify --panicOnWarning
```

**No workflow changes needed.** Hugo Extended (already in use) handles WebP conversion automatically. The `--gc` flag cleans unused resources.

**Optional addition:** Cache `resources/_gen/images/` directory between builds for faster CI:
```yaml
- name: Cache Hugo resources
  uses: actions/cache@v4
  with:
    path: resources/_gen
    key: ${{ runner.os }}-hugo-${{ hashFiles('assets/images/**') }}
```

## File Location Summary

| Component | Location | Type |
|-----------|----------|------|
| robots.txt template | `layouts/robots.txt` | NEW |
| robots.txt config | `hugo.toml` | MODIFY |
| Canonical URL | `layouts/index.html` | EXISTS (no change) |
| Source images | `assets/images/` | MIGRATE from static/ |
| Picture partial | `layouts/partials/picture.html` | NEW |
| Main template | `layouts/index.html` | MODIFY (use partial) |

## Verification Checklist

After implementation, verify:

- [ ] `public/robots.txt` exists and contains `Sitemap:` directive
- [ ] `public/sitemap.xml` is reachable and valid
- [ ] Canonical URL in HTML matches `https://poloselectronics.com/`
- [ ] `public/images/` (or `public/` root) contains `.webp` versions
- [ ] `<picture>` elements in HTML have both `<source type="image/webp">` and `<img>` fallback
- [ ] OG/Twitter meta images remain JPG (social crawler compatibility)
- [ ] PageSpeed Insights shows "Serve images in next-gen formats" passed
- [ ] No broken images in browser (check console for 404s)

## Sources

- Hugo Image Processing: https://gohugo.io/content-management/image-processing/ (HIGH)
- Hugo robots.txt Template: https://gohugo.io/templates/robots/ (HIGH)
- Hugo URL Management (canonicals): https://gohugo.io/content-management/urls/ (HIGH)
- Hugo Directory Structure (assets vs static): https://gohugo.io/getting-started/directory-structure/ (HIGH)
- WebP/AVIF Implementation Pattern: https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/ (MEDIUM)
- Hugo WebP Conversion Guide: https://devnodes.in/blog/hugo/image-convert-to-webp/ (MEDIUM)

---
*Architecture research for: Polos Electronics SEO Polish milestone*
*Researched: 2026-02-14*
