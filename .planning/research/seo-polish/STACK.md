# Technology Stack: SEO Polish Features

**Project:** Polos Electronics Hugo Site
**Scope:** robots.txt, canonical URLs, WebP image conversion
**Researched:** 2026-02-14
**Overall Confidence:** HIGH

## Executive Summary

This milestone requires minimal stack additions. Hugo 0.135.0+ (deployed) and 0.155.3+ (local) have all necessary built-in capabilities. No external libraries or tools required for implementation.

| Feature | Stack Requirement | Confidence |
|---------|-------------------|------------|
| robots.txt | Hugo built-in (`enableRobotsTXT`) | HIGH |
| Canonical URLs | Already implemented | HIGH |
| WebP conversion | Hugo built-in image processing | HIGH |

---

## 1. robots.txt

### Recommendation: Hugo Built-in Template

**Use Hugo's native robots.txt generation.** Do not create a static file.

### Implementation

Add to `hugo.toml`:
```toml
enableRobotsTXT = true
```

### Default Output

Hugo generates:
```
User-agent: *
```

This permits all crawlers to index all content, which is correct for a local business site seeking maximum visibility.

### Custom Template (Optional)

If customization needed, create `layouts/robots.txt`:
```
User-agent: *
Sitemap: {{ .Site.BaseURL }}sitemap.xml
```

Adding the Sitemap directive is optional but recommended for explicit sitemap discovery.

### Why Not Static File

- Template approach integrates with Hugo's build system
- Can use Hugo variables (e.g., `{{ .Site.BaseURL }}`)
- Consistent with existing sitemap.xml generation
- Environment-aware (can vary by HUGO_ENV if needed later)

### Sources

- [Hugo robots.txt Template Documentation](https://gohugo.io/templates/robots/)

### Confidence: HIGH

Verified directly from official Hugo documentation.

---

## 2. Canonical URLs

### Status: ALREADY IMPLEMENTED

Line 17 of `layouts/index.html`:
```html
<link rel="canonical" href="{{ .Permalink }}">
```

### Assessment

- Correct implementation using Hugo's `.Permalink` variable
- Outputs full URL including baseURL from `hugo.toml`
- For single-page site, this points to `https://poloselectronics.com/`

### No Action Required

Canonical URL tag is already present and correctly implemented. This feature is complete.

### Confidence: HIGH

Verified by reading existing source code.

---

## 3. WebP Image Conversion

### Recommendation: Hugo Built-in Image Processing

**Use Hugo's native image processing pipeline.** Requires moving images from `static/images/` to `assets/images/`.

### Why Hugo Built-in (Not External Tools)

| Approach | Pros | Cons |
|----------|------|------|
| Hugo built-in | No dependencies, build-time processing, automatic caching, template integration | Requires assets directory |
| cwebp CLI | Available locally (v1.6.0), simple batch conversion | Manual process, not integrated with build, duplicate maintenance |
| ImageMagick | Powerful, many options | Not installed, overkill for this use case |

**Verdict:** Hugo built-in is the correct choice. It integrates with the existing build pipeline and requires no external dependencies in CI.

### Implementation Requirements

#### 1. Directory Structure Change

Move images from `static/images/` to `assets/images/`:

**Why:** Hugo image processing only works on resources in the `assets/` directory. Files in `static/` are copied verbatim without processing.

```
# Before
static/images/hero-image.jpg
static/images/andy-polos.jpg

# After
assets/images/hero-image.jpg
assets/images/andy-polos.jpg
```

#### 2. Template Changes

Current (static file):
```html
<img src="{{ "images/hero-image.jpg" | relURL }}" alt="...">
```

Updated (processed resource):
```html
{{ $img := resources.Get "images/hero-image.jpg" }}
{{ $webp := $img.Resize "x webp q85" }}
<img src="{{ $webp.RelPermalink }}" alt="...">
```

#### 3. Hugo Version Requirement

- **Minimum:** Hugo 0.83.0 (WebP output support)
- **Recommended:** Hugo 0.155.0+ (WebP-specific options: hint, method, useSharpYuv)
- **Current local:** Hugo 0.155.3 (fully compatible)
- **Current CI:** Hugo 0.135.0 (compatible for basic WebP)

CI workflow should be updated to 0.155.0+ to access all WebP options.

### WebP Processing Options

Available in resize/process string:

| Option | Syntax | Default | Notes |
|--------|--------|---------|-------|
| Format | `webp` | source format | Required for conversion |
| Quality | `q75` | 75 | 1-100, lower = smaller file |
| Compression | `lossy` or `lossless` | lossy | lossless only for WebP |

Hugo 0.155.0+ configuration options in `hugo.toml`:
```toml
[imaging]
  quality = 85

  [imaging.webp]
    hint = "photo"      # photo, picture, drawing, icon, text
    method = 4          # 0-6, compression effort
    useSharpYuv = true  # sharper color conversion
```

### Images to Convert

Current images in `static/images/`:

| File | Size | Recommendation |
|------|------|----------------|
| hero-image.jpg | 109KB | Convert to WebP, significant savings |
| andy-polos.jpg | 74KB | Convert to WebP |
| john-polos.jpg | 32KB | Convert to WebP |
| derick-steele.jpg | 139KB | Convert to WebP, significant savings |
| contact-image.jpg | 44KB | Convert to WebP |
| services-image.jpg | 123KB | Convert to WebP, significant savings |
| service-area-preview.jpg | 108KB | Convert to WebP |
| logo.png | 212KB | Convert to WebP, significant savings (PNG with alpha) |
| derick-steele.png | 942KB | Remove (duplicate of JPG) |
| service-area-map.png | 16KB | Keep PNG (fallback), consider WebP version |
| service-area-map.svg | 4KB | Keep SVG (vector, already optimal) |

**Estimated savings:** 40-60% file size reduction based on typical WebP compression.

### Picture Element Pattern (Optional Enhancement)

For maximum compatibility, use `<picture>` with WebP + fallback:

```html
{{ $img := resources.Get "images/hero-image.jpg" }}
{{ $webp := $img.Resize "x webp q85" }}
{{ $jpg := $img.Resize "x jpg q90" }}
<picture>
  <source srcset="{{ $webp.RelPermalink }}" type="image/webp">
  <img src="{{ $jpg.RelPermalink }}" alt="..." loading="lazy" width="{{ $img.Width }}" height="{{ $img.Height }}">
</picture>
```

**Note:** All modern browsers support WebP (Chrome 17+, Firefox 65+, Safari 14+, Edge 18+). For a local business site, WebP-only is acceptable.

### Sources

- [Hugo Image Processing Documentation](https://gohugo.io/content-management/image-processing/)
- [Hugo Imaging Configuration](https://gohugo.io/configuration/imaging/)
- [Hugo Resize Method](https://gohugo.io/methods/resource/resize/)

### Confidence: HIGH

Verified from official Hugo documentation. Local Hugo version (0.155.3) confirmed to support all WebP features.

---

## Stack Summary

### What to Add

| Addition | Where | Purpose |
|----------|-------|---------|
| `enableRobotsTXT = true` | `hugo.toml` | Enable robots.txt generation |
| `[imaging.webp]` config | `hugo.toml` | WebP quality settings |
| Hugo version bump | `.github/workflows/hugo.yml` | Access WebP options in CI |

### What to Move

| From | To | Reason |
|------|-----|--------|
| `static/images/*` | `assets/images/*` | Enable Hugo image processing |

### What NOT to Add

| Tool | Reason to Skip |
|------|----------------|
| cwebp | Hugo handles WebP natively |
| ImageMagick | Not needed, Hugo has built-in processing |
| External image optimization service | Overkill for 10 images |
| WebP polyfill | All target browsers support WebP natively |
| npm packages | Hugo handles everything in Go |

### What Already Works

| Feature | Status |
|---------|--------|
| Canonical URLs | Implemented in layouts/index.html line 17 |
| sitemap.xml | Configured in hugo.toml |
| Image lazy loading | Already using `loading="lazy"` |

---

## CI/CD Considerations

### Hugo Version Update

Update `.github/workflows/hugo.yml`:
```yaml
env:
  HUGO_VERSION: 0.155.0  # Was 0.135.0
```

**Why:** Hugo 0.155.0 introduced WebP-specific encoding options (`hint`, `method`, `useSharpYuv`). While 0.135.0 supports basic WebP conversion, the newer version provides better optimization control.

### No Additional CI Dependencies

Hugo extended (already used) includes:
- Built-in WebP encoding (via libwebp)
- SCSS compilation
- Image processing

No apt packages or npm dependencies required.

---

## Implementation Order

1. **robots.txt** - Configuration change only, no risk
2. **Canonical URLs** - Already done, verify and document
3. **WebP conversion** - Requires template changes, test locally first

---

## Verification Checklist

After implementation:

- [ ] `hugo server` builds without errors
- [ ] `public/robots.txt` exists with correct content
- [ ] `public/robots.txt` includes Sitemap directive
- [ ] Canonical tag still present in HTML output
- [ ] WebP images generated in `public/` directory
- [ ] Image file sizes reduced vs original JPG/PNG
- [ ] All images display correctly in browser
- [ ] GitHub Actions build succeeds

---

## Sources Summary

| Source | Type | Used For |
|--------|------|----------|
| [gohugo.io/templates/robots/](https://gohugo.io/templates/robots/) | Official docs | robots.txt implementation |
| [gohugo.io/content-management/image-processing/](https://gohugo.io/content-management/image-processing/) | Official docs | WebP conversion methods |
| [gohugo.io/configuration/imaging/](https://gohugo.io/configuration/imaging/) | Official docs | WebP quality settings |
| [gohugo.io/methods/resource/resize/](https://gohugo.io/methods/resource/resize/) | Official docs | Resize syntax for format conversion |
| Local codebase inspection | Primary | Canonical URL verification |
