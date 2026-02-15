# Phase 10: WebP Image Conversion - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert site images to serve modern WebP to supporting browsers while preserving compatibility via JPG/PNG fallbacks (including Safari 13 and other non-WebP browsers). Hugo Pipes must process images from `assets/` (not `static/`), and builds should generate both WebP and original formats. Open Graph/Twitter images remain JPG for crawler compatibility.

</domain>

<decisions>
## Implementation Decisions

### Which images are included
- Generate WebP variants for all in-page raster images (JPG/PNG) used across the site (hero, team photos, logo, and any raster map/coverage fallback image).
- Convert PNG icons used on the page as well (serve WebP with PNG fallback).
- SVG assets stay as SVG (no conversion).

### Markup + URL stability
- Prefer WebP as the default format used in markup, with JPG/PNG fallback for non-WebP browsers.
- Keep public URLs stable and non-fingerprinted (no hashed filenames).
- Keep public paths consistent with today (same directory + base names where possible); WebP should exist as a sibling URL (e.g., `.../name.webp` alongside `.../name.jpg`).
- Include CSS background images in the WebP strategy as well (serve WebP with fallback).

### Quality vs file size targets
- Optimize for smallest files over visual fidelity.
- Slight compression artifacts are acceptable for photo-like images.
- Treat logos/text-heavy graphics the same as photos (byte savings over perfectly crisp edges).

### Fallback expectations
- Fallback must work for any browser that does not support WebP (not Safari-only).
- Fallback does not need to be visually identical to the current site; it just needs to render correctly.
- Keep Open Graph and Twitter card images as JPG (no WebP for social images).

### Claude's Discretion
- For assets that are directly linked/downloaded/embedded outside normal HTML ("canonical" direct-link format), choose the simplest rule that avoids surprises.
- Edge handling for favicon formats (since WebP favicons are not broadly standard).

</decisions>

<specifics>
## Specific Ideas

- Prefer WebP as the default requested asset, but keep existing original URLs stable as fallback.
- Apply WebP + fallback to CSS background images too (not HTML-only).

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 10-webp-image-conversion*
*Context gathered: 2026-02-15*
