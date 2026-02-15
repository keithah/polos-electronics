# SEO Polish Research Summary

**Project:** Polos Electronics Hugo Site - SEO Polish
**Domain:** Static site SEO optimization
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

This milestone adds final SEO polish to an existing single-page Hugo site: robots.txt generation, canonical URL verification, and WebP image conversion. The research reveals this is largely a zero-dependency implementation using Hugo's built-in capabilities. Hugo 0.135.0+ (deployed) and 0.155.3+ (local) provide everything needed without external tools or libraries.

The recommended approach is straightforward: enable Hugo's native robots.txt template with minimal rules for a single-page site, verify the existing canonical URL implementation (already correct), and use Hugo's image processing pipeline to convert JPG/PNG images to WebP at build time. The most significant architectural change is migrating images from `static/images/` to `assets/images/` to enable Hugo's processing capabilities, which requires template refactoring but follows the same pattern already established for CSS processing.

The primary risks are configuration conflicts (robots.txt appearing in both template and static locations), WebP color profile corruption (use JPEG/PNG sources only, never WebP-to-WebP conversion), and build time increases (mitigated by resource caching). These are well-documented pitfalls with clear prevention strategies. The single-page architecture simplifies implementation significantly compared to multi-page sites.

## Key Findings

### Recommended Stack

No new dependencies required. Hugo 0.135.0+ (deployed) and 0.155.3+ (local) include all necessary features natively.

**Core technologies:**
- Hugo built-in robots.txt generation (`enableRobotsTXT = true`) - automatic template rendering with dynamic sitemap URL injection
- Hugo `.Permalink` variable (already in use) - generates absolute canonical URLs required by Google
- Hugo image processing with WebP output - converts images at build time with quality control, no external tools needed

**What NOT to add:**
- cwebp CLI - Hugo handles WebP conversion natively
- ImageMagick - not needed, overkill for this use case
- External optimization services - unnecessary for 11 images
- npm packages - Hugo handles everything in Go

**Version considerations:**
- Current CI: Hugo 0.135.0 extended (supports basic WebP)
- Current local: Hugo 0.155.3 extended (includes WebP-specific encoding options)
- Recommendation: Bump CI to 0.155.0+ for access to `hint`, `method`, and `useSharpYuv` options

### Expected Features

**Must have (table stakes):**
- robots.txt with sitemap reference - required for Google Search Console submission
- Self-referencing canonical URL with absolute URL - already implemented correctly, Google requires this even for single-page sites
- WebP conversion for hero image (LCP element) - directly impacts Core Web Vitals and PageSpeed score
- `fetchpriority="high"` on hero image - free LCP improvement, browser hint to prioritize critical asset

**Should have (competitive):**
- WebP for all images with JPEG fallback using `<picture>` element - 25-30% file size reduction across site
- `lastmod` in sitemap.xml - tells Google when content actually changed
- Image quality setting at 85 (not default 75) - prevents visible artifacts on team photos

**Defer (v2+):**
- AVIF format - 50% smaller than WebP but high implementation complexity, limited Hugo support
- Responsive srcset for different viewport sizes - marginal benefit for single-page site
- AI crawler policy decisions (GPTBot, CCBot) - requires stakeholder discussion on AI search visibility

**Anti-features (explicitly avoid):**
- `loading="lazy"` on hero image - delays LCP element, destroys Core Web Vitals score
- Canonical URLs with fragments (#section) - Google explicitly ignores fragments
- Multiple canonical tags - all tags get ignored if multiple present
- WebP-only without JPEG fallback - breaks 2-4% of users (IE, older Safari, email clients)

### Architecture Approach

The integration follows established Hugo patterns. robots.txt is a simple template addition to `layouts/robots.txt` with config flag enabled. Canonical URLs are already implemented correctly at line 17 of `layouts/index.html` using `.Permalink`. WebP conversion requires the most significant architectural change: migrating images from `static/images/` to `assets/images/` (Hugo only processes resources in `assets/`), creating a reusable `picture.html` partial for WebP+fallback rendering, and updating all image references in templates. This follows the same pattern already used for CSS processing (`assets/css/custom.css`).

**Major components:**
1. `layouts/robots.txt` template - generates minimal robots.txt with dynamic sitemap URL using Hugo variables
2. Existing canonical implementation - no changes needed, already using `.Permalink` with correct `baseURL`
3. `assets/images/` directory - relocated from `static/`, enables Hugo image processing pipeline
4. `layouts/partials/picture.html` - reusable WebP conversion partial using `resources.Get` and `.Resize`
5. CI resource caching - caches `resources/_gen/` directory to prevent build time explosion

**File migration impact:**
- 11 images move from `static/images/` to `assets/images/`
- All `<img>` tags in `layouts/index.html` update to use picture partial
- OG/Twitter meta images remain JPG (social crawler compatibility)
- Estimated 40-60% file size reduction (~733KB → ~365KB)

### Critical Pitfalls

Based on analysis of Hugo GitHub issues, discourse threads, and 2026 technical articles:

1. **robots.txt template vs static file conflict** - Site has both `static/robots.txt` AND `enableRobotsTXT = true`, causing unpredictable behavior where one overwrites the other. **Prevention:** Choose template approach only, verify no `static/robots.txt` exists, add CI check to fail if both present. **Current state:** No robots.txt exists yet, implement template approach to avoid this.

2. **Images in `/static/` cannot be processed for WebP** - Hugo's `resources.Get` only works with `assets/` directory. Files in `static/` are copied verbatim without processing. **Prevention:** Move all images to `assets/images/` before implementing WebP, update templates to use `resources.Get`. **Current state:** All 11 images currently in `static/images/`, migration required.

3. **WebP color profile corruption (sRGB images)** - Hugo strips color profiles during WebP-to-WebP conversion (known bug), causing faded/washed-out appearance. Grays shift toward brown/green, whites look yellowish. **Prevention:** Never use WebP as source format, always use JPEG/PNG originals and convert to WebP at build time only. **Current state:** All images are JPEG/PNG, maintain this as source format.

4. **baseURL mismatch with custom domain** - `hugo.toml` has GitHub Pages path (`keithah.github.io/polos-electronics/`) but CNAME uses custom domain, causing canonical URLs, OG tags, and sitemap to point to wrong domain. **Prevention:** Set `baseURL = 'https://poloselectronics.com'` with no trailing slash. **Current state:** Already correct, pitfall avoided.

5. **WebP without JPEG fallback breaks older browsers** - WebP-only breaks IE, iOS Safari <14, email clients, and some social media crawlers (2-4% of users). **Prevention:** Always use `<picture>` element with WebP source and JPEG/PNG fallback, keep OG images as JPEG. **Current state:** Must implement `<picture>` pattern when adding WebP.

## Implications for Roadmap

Based on research, this SEO polish milestone should be structured as **3 sequential sub-phases** to minimize risk and enable incremental verification:

### Phase 1: robots.txt Generation
**Rationale:** Lowest risk, independent of other changes, quick win for Google Search Console compliance. No template changes, only config addition.

**Delivers:**
- `public/robots.txt` with sitemap reference
- Google Search Console submission readiness
- Explicit crawler permissions

**Implementation:**
- Add `enableRobotsTXT = true` to `hugo.toml`
- Create `layouts/robots.txt` with minimal rules (no Disallow needed for single-page site)
- Include `Sitemap: {{ .Site.BaseURL }}sitemap.xml` directive
- Verify no `static/robots.txt` exists (conflict check)

**Avoids:** Template vs static file conflict (Critical Pitfall #1), sitemap misalignment

**Complexity:** LOW - configuration change only, well-documented pattern

### Phase 2: Canonical URL Verification
**Rationale:** Already implemented correctly, just needs verification and documentation. No code changes required.

**Delivers:**
- Documented canonical URL strategy
- Verification that existing implementation is correct
- Confidence for future template changes

**Implementation:**
- Verify line 17 of `layouts/index.html` uses `.Permalink` (not `.RelPermalink`)
- Verify `baseURL` in `hugo.toml` matches custom domain (already `https://poloselectronics.com`)
- Test deployed output for absolute URL format
- Document that single-page site = single canonical URL

**Avoids:** Relative canonical URLs (missing domain), fragment URLs, baseURL mismatch (Critical Pitfall #4)

**Complexity:** MINIMAL - verification only, no changes

### Phase 3: WebP Image Conversion
**Rationale:** Highest complexity, requires architectural changes (file migration, template refactoring). Do last after other SEO features verified. Delivers largest performance improvement.

**Delivers:**
- WebP versions of all 11 images (~365KB saved)
- `<picture>` element pattern with fallbacks
- Improved Core Web Vitals (LCP optimization)
- `fetchpriority="high"` on hero image

**Implementation:**
1. Add `[imaging]` config to `hugo.toml` (quality: 85, hint: "photo")
2. Create `assets/images/` directory
3. Move 11 images from `static/images/` to `assets/images/`
4. Create `layouts/partials/picture.html` reusable partial
5. Update all image references in `layouts/index.html` to use partial
6. Keep OG/Twitter meta images as JPG (social crawler compatibility)
7. Add `fetchpriority="high"` to hero image
8. Add CI resource caching for `resources/_gen/` directory
9. Test color accuracy on team photos across browsers

**Avoids:**
- Images in wrong folder (Critical Pitfall #2)
- Color profile corruption (Critical Pitfall #3)
- Missing fallback (Critical Pitfall #5)
- Build time explosion (cache resources)
- Default quality artifacts (use 85 not 75)

**Complexity:** HIGH - file migration, template refactoring, multiple integration points

**Uses stack elements:**
- Hugo image processing (`resources.Get`, `.Resize`)
- Hugo Extended 0.155.0+ for WebP encoding options
- `<picture>` element HTML pattern

**Implements architecture:**
- `assets/images/` resource directory
- Reusable picture partial
- Resource caching in CI

### Phase Ordering Rationale

- **robots.txt first:** Independent, no dependencies, enables Google Search Console submission immediately
- **Canonical verification second:** Quick check to confirm existing implementation, builds confidence before complex changes
- **WebP last:** Most complex, highest risk, requires template refactoring and migration - do after simpler features validated

This ordering allows incremental deployment and rollback. If WebP implementation encounters issues, robots.txt and canonical URL features are already live and working. The single-page architecture significantly simplifies WebP implementation compared to multi-page sites (no taxonomy pages, no pagination, no complex routing).

### Research Flags

**Phases with standard patterns (skip `/gsd:research-phase`):**
- **Phase 1 (robots.txt):** Well-documented Hugo feature, official docs comprehensive, no edge cases for single-page site
- **Phase 2 (canonical):** Already implemented, just verification, no new research needed
- **Phase 3 (WebP):** Standard Hugo image processing pattern, extensive community examples, pitfalls well-documented

**No additional research needed for any phase.** All implementation patterns are established and verified from official Hugo docs, GitHub issues, and 2026 community sources.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All capabilities verified in Hugo 0.135.0/0.155.3 official docs, no external dependencies |
| Features | HIGH | Validated with Google Search Console requirements, PageSpeed Insights criteria, and Hugo documentation |
| Architecture | HIGH | Pattern already established for CSS processing, migration from static to assets is standard Hugo practice |
| Pitfalls | HIGH | Verified from GitHub issues (color profile bug #39521), discourse threads (template conflict), and 2026 technical articles |

**Overall confidence:** HIGH

All findings verified from official Hugo documentation, GitHub issue confirmations (e.g., WebP color profile bug in v0.155.1 release notes), and multiple independent 2026 source confirmations. The single-page architecture eliminates many common pitfalls (no taxonomy conflicts, no multi-page canonical issues, simple robots.txt rules).

### Gaps to Address

**Hugo version alignment:** CI uses 0.135.0, local uses 0.155.3. While both support WebP conversion, updating CI to 0.155.0+ provides access to `hint`, `method`, and `useSharpYuv` encoding options. **Resolution:** Update `.github/workflows/hugo.yml` to `HUGO_VERSION: 0.155.0` during Phase 3 implementation.

**Build time impact:** WebP processing at build time may increase build duration. Research suggests caching `resources/_gen/` directory mitigates this, but actual impact unknown for this specific site. **Resolution:** Measure build time before/after WebP implementation, add caching preemptively.

**OG image format decision:** Research consensus suggests keeping OG/Twitter images as JPEG for social crawler compatibility, but 2026 data shows 97%+ browser support for WebP. **Resolution:** Keep as JPEG for safety (conservative approach), can reconsider post-deployment if needed.

**Logo optimization approach:** Current `logo.png` is 212KB. Research suggests SVG conversion if vector source available, or PNG optimization instead of WebP for logos (avoid lossy compression on sharp edges). **Resolution:** Attempt SVG conversion first, fallback to WebP if no vector source, quality setting 95+ if converting logo.

## Sources

### Primary (HIGH confidence)
- [Hugo robots.txt Template Documentation](https://gohugo.io/templates/robots/) - Configuration, template syntax, sitemap directive
- [Hugo Image Processing Documentation](https://gohugo.io/content-management/image-processing/) - WebP conversion methods, resource requirements
- [Hugo Imaging Configuration](https://gohugo.io/configuration/imaging/) - Quality settings, WebP-specific options
- [Hugo Directory Structure](https://gohugo.io/getting-started/directory-structure/) - assets/ vs static/ distinction
- [Google: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) - Absolute URL requirement, fragment behavior
- Local codebase inspection - Canonical URL verification, baseURL confirmation, current image inventory

### Secondary (MEDIUM confidence)
- [Hugo v0.155.1 Release Notes](https://discourse.gohugo.io/t/hugo-v0-155-1-released/56645) - WebP color profile fixes
- [GitHub Issue #8293: robots.txt override behavior](https://github.com/gohugoio/hugo/issues/8293) - Template vs static file conflict
- [GitHub Issue #39521: WebP color processing bug](https://discourse.gohugo.io/t/colour-issue-when-image-processing-applied-to-webp/39521) - Color profile corruption details
- [Hugo Discourse: Permalink vs RelPermalink](https://discourse.gohugo.io/t/permalink-vs-relpermalink/41638) - Canonical URL implementation
- [Hugo Discourse: Build timeout WebP processing](https://discourse.gohugo.io/t/build-timeout-jpeg-vs-webp-processing/32821) - Build time mitigation strategies
- [Hugo Discourse: WebP fallback patterns](https://discourse.gohugo.io/t/fallback-for-browsers-that-dont-support-webp/37661) - Picture element implementation
- [Dealing with color profiles - fplanque.com](https://www.fplanque.com/tech/web-dev/hugo-web-color-profiles-and-webp-issues/) - WebP color corruption analysis
- [Hugo Performance Optimization 2026 - dasroot.net](https://dasroot.net/posts/2026/01/hugo-performance-optimization-sub-second-load-times/) - Resource caching benchmarks
- [WebP and AVIF on Hugo - Pawel Grzybek](https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/) - Implementation patterns

### Tertiary (validation during implementation)
- [MDN: Fix LCP image loading](https://developer.mozilla.org/en-US/blog/fix-image-lcp/) - fetchpriority guidance
- [Search Engine Land: robots.txt SEO 2026](https://searchengineland.com/robots-txt-seo-453779) - Current best practices
- [Core Web Vitals 2026 - nitropack.io](https://nitropack.io/blog/core-web-vitals-strategy/) - LCP optimization benchmarks

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
