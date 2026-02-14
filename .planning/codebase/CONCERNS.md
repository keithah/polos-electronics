# Codebase Concerns

**Analysis Date:** 2026-02-13

## Tech Debt

**Unused Google Reviews API Integration:**
- Issue: `static/js/google-reviews.js` implements a Google Places API client with CORS proxy fallback, but this code is not actively used on the site. Reviews are currently managed through static JSON data in `data/reviews.json`, maintained by the GitHub Actions workflow in `.github/workflows/fetch-reviews.yml`
- Files: `static/js/google-reviews.js`
- Impact: Dead code adds 195 lines of untested JavaScript that could cause confusion during maintenance. The CORS proxy dependency (cors-anywhere.herokuapp.com) is unreliable and rate-limited
- Fix approach: Either fully integrate the Google Reviews JS (remove `.js` reference from imports) or delete the file entirely. If keeping reviews via GitHub Actions + static JSON, remove the unused client library

**Single-File Monolithic Layout:**
- Issue: All HTML is in one 650-line template file (`layouts/index.html`) with no modular components or partial templates
- Files: `layouts/index.html`
- Impact: Difficult to maintain sections independently, hard to test individual components, no code reuse. Updating nav, footer, or any section requires touching the massive file
- Fix approach: Break into Hugo partials: `layouts/partials/header.html`, `layouts/partials/hero.html`, `layouts/partials/services.html`, etc. Call from base template

**Inline JavaScript in HTML Template:**
- Issue: 154 lines of JavaScript (carousel logic, mobile menu, CAPTCHA, form handling) embedded directly in `layouts/index.html` between `<script>` tags
- Files: `layouts/index.html` (lines 495-649)
- Impact: Not minified separately, difficult to test, no reusability, makes template harder to read, may be duplicated across page types
- Fix approach: Extract to `assets/js/main.js`, import via `resources.Get`, minify with Hugo pipeline like CSS

**Image Files Not Optimized:**
- Issue: Large uncompressed PNG file exists (`static/images/derick-steele.png` is 942KB) alongside smaller JPG version (139KB). Unoptimized JPEGs (hero-image.jpg 109KB, contact-image.jpg 44KB) sent as-is
- Files: `static/images/derick-steele.png`, `static/images/hero-image.jpg`, `static/images/contact-image.jpg`
- Impact: Page load performance degradation, especially on mobile networks. No responsive images via srcset
- Fix approach: Convert PNG to WebP/AVIF, compress JPEGs with tools like ImageOptim or Sharp. Add Hugo image processing pipeline to generate responsive variants

## Security Considerations

**XSS Risk in Google Reviews Rendering:**
- Risk: `static/js/google-reviews.js` line 169 uses template literals with unescaped user review data: `reviewCard.innerHTML = ` `` with review.text directly interpolated
- Files: `static/js/google-reviews.js` (line 167-172)
- Current mitigation: Google API data is trusted, substring truncation helps, but no explicit sanitization
- Recommendations: Use `textContent` for text fields or DOMPurify library. If keeping HTML, use template.content.cloneNode() instead of innerHTML

**API Key in CORS Proxy Fallback:**
- Risk: If Google Places API CORS restrictions fail, code falls back to public CORS proxy, but API key is included in the URL and visible to proxy service (`cors-anywhere.herokuapp.com`)
- Files: `static/js/google-reviews.js` (line 31)
- Current mitigation: None - API key exposed via CORS proxy
- Recommendations: Disable this fallback code or remove entirely. Use server-side proxy instead (fetch through `/api/reviews` endpoint that secures the key)

**Form CAPTCHA Implementation Weakness:**
- Risk: Simple math CAPTCHA (`captcha-question` shows "5 + 3 = ?") is easily bypassable by bots via JavaScript manipulation. No server-side verification
- Files: `layouts/index.html` (lines 530-567)
- Current mitigation: Client-side validation only; Formspree API handles actual submission
- Recommendations: Switch to reCAPTCHA v3 (invisible, no user friction) or Formspree's built-in honeypot. Remove simple math CAPTCHA

**Hardcoded Formspree Endpoint:**
- Risk: Formspree endpoint `https://formspree.io/f/xjkeqgvl` is visible in HTML source. While Formspree is legitimate, exposing form endpoint makes it target for automated spam submissions
- Files: `layouts/index.html` (line 404)
- Current mitigation: Formspree has spam filtering, CAPTCHA adds friction
- Recommendations: Formspree provides email notifications for validation. Consider adding rate limiting or moving to GitHub Issues form action for spam protection

**Content Security Policy Missing:**
- Risk: No CSP headers defined; site loads Google Fonts, Google Analytics, Formspree externally without restrictions
- Files: All (needs `.github/workflows/` config or GitHub Pages settings)
- Current mitigation: HTTPS enforced by GitHub Pages
- Recommendations: Add CSP meta tag: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' www.googletagmanager.com; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com; form-action https://formspree.io;">` (adjust as needed)

## Performance Bottlenecks

**Single CSS File Not Code-Split:**
- Problem: All 1,377 lines of CSS in one file. No media query-based splitting. CSS is minified but not optimized for critical path rendering
- Files: `assets/css/custom.css`
- Cause: Monolithic stylesheet with all component styles (header, hero, services, contact, footer, responsive) in one file
- Improvement path: Extract critical above-fold CSS (header, hero, hero buttons) to inline `<style>` tag in `<head>`. Defer non-critical CSS. Use Hugo asset pipeline to split by media query

**Google Fonts Blocking Render:**
- Problem: `<link>` to `fonts.googleapis.com` in `<head>` is render-blocking. No font-display optimization
- Files: `layouts/index.html` (lines 48-51)
- Cause: Default font-display behavior causes FOUT/FOIT delays
- Improvement path: Add `&display=swap` to Google Fonts URL. Preload the WOFF2 file. Cache fonts in service worker

**No Service Worker or Caching:**
- Problem: Static assets (CSS, images, JS) are not cached for offline use or repeat visits
- Files: None (missing)
- Cause: No service worker implementation
- Improvement path: Create `static/js/service-worker.js` to cache static assets with versioned filenames. Register in main.js

## Fragile Areas

**Review Carousel Logic:**
- Files: `layouts/index.html` (lines 569-648)
- Why fragile: Complex state management (currentPage, totalPages, cards array) handled in vanilla JS. Hard to debug; no tests. Assumes specific DOM structure (`.reviews-grid`, `.review-card` selectors). Changes to review data format in `data/reviews.json` could break carousel
- Safe modification: Add data attributes to elements (`data-review-id`) instead of relying on array index. Extract carousel logic to separate `assets/js/carousel.js` with unit tests
- Test coverage: No tests; manual testing only

**Mobile Menu Toggle:**
- Files: `layouts/index.html` (lines 510-527)
- Why fragile: Uses class toggling to show/hide menu. No focus management for accessibility. If CSS classes change, menu breaks. No keyboard navigation (Escape key closes menu)
- Safe modification: Test against `.nav-toggle` and `.nav-menu` selectors. Add `aria-expanded` attribute updates. Handle Escape key and focus trap
- Test coverage: No tests; visual inspection only

**Responsive Images Missing srcset:**
- Files: All `<img>` tags in `layouts/index.html`
- Why fragile: Uses fixed image sources. If image needs different resolution for mobile, entire image asset must be updated. No fallback for WebP support
- Safe modification: Add `srcset` attributes with 1x/2x variants. Use picture element for art direction (different crop for mobile vs desktop)
- Test coverage: No automated responsive image tests

**Hugo Markup Configuration:**
- Files: `hugo.toml` (line 15: `unsafe = true`)
- Why fragile: `unsafe = true` in Goldmark renderer allows any HTML in Markdown. If content files are user-editable, XSS is possible
- Safe modification: Set `unsafe = false` (default). If HTML needed in markdown (like embedded video), use shortcodes instead
- Test coverage: No content validation

## Scaling Limits

**Single HTML Page:**
- Current capacity: All content on one page; works fine for current site
- Limit: If Polos Electronics adds blog, service pages, gallery, or FAQ, single-page model breaks
- Scaling path: Add `content/blog/`, `content/services/`, `content/team/` directories. Create per-section layouts. Update nav to link to section pages. Use Hugo sections and taxonomies for organization

**Google Reviews API Rate Limit:**
- Current capacity: GitHub Actions runs daily (~30 requests/month)
- Limit: Free tier quota is 25,000 requests/month; with multiple sites, this could approach limits
- Scaling path: Move from daily cron to on-demand trigger. Cache reviews for 7+ days to reduce API calls

**GitHub Pages Build Limits:**
- Current capacity: Hugo builds in ~2 seconds
- Limit: GitHub Actions jobs timeout at 6 hours. Current setup has 5-minute limit
- Scaling path: As content grows (100+ blog posts, high-res image galleries), build time increases. May need to migrate to self-hosted Hugo on Netlify/Vercel for faster builds and better caching

## Missing Critical Features

**No Analytics Beyond Google Analytics:**
- Problem: No error tracking (Sentry, Rollbar), no session recording, no heatmaps. Can't see if form submissions fail silently
- Blocks: Understanding user behavior, debugging JavaScript errors in production
- Recommendation: Add Sentry to `layouts/index.html` header to catch JS errors. Monitor form submission success rate via Formspree webhooks

**No Email Validation Feedback:**
- Problem: Contact form has no server-side validation feedback. User submits and waits for redirect; if Formspree fails, they never know
- Blocks: Users think their message was sent when it actually failed
- Recommendation: Add Formspree webhook handler to send confirmation email. Or use AJAX form submission with client-side error feedback

**No Mobile App or PWA:**
- Problem: Site is web-only; can't send push notifications or work offline
- Blocks: Engagement beyond passive browsing
- Recommendation: Add service worker, manifest.json, install prompts to enable PWA capability (far future)

## Test Coverage Gaps

**No JavaScript Tests:**
- What's not tested: Carousel pagination logic, mobile menu toggle, CAPTCHA generation, form submission handling
- Files: `layouts/index.html` (lines 495-649), `static/js/google-reviews.js`
- Risk: Updates to carousel logic could break pagination. Mobile menu state could get out of sync. CAPTCHA answer validation could fail for edge cases (0+0)
- Priority: **High** - carousel and form are critical user interactions

**No HTML Validation:**
- What's not tested: Semantic HTML, ARIA attributes, heading hierarchy, alt text on images
- Files: `layouts/index.html`
- Risk: Accessibility issues (screen readers can't navigate), SEO impact (h1 appears twice), form labels missing, images missing alt text
- Priority: **High** - blocks ADA compliance

**No CSS Regression Tests:**
- What's not tested: Responsive breakpoints at 768px, 1024px, 480px; button hover states; form focus states
- Files: `assets/css/custom.css`
- Risk: CSS changes could break responsive layout. Hero buttons might misalign on mobile
- Priority: **Medium** - affects user experience but can be caught with visual QA

**No Lighthouse CI:**
- What's not tested: Performance score, Accessibility score, Best Practices score, SEO score
- Files: None (missing GitHub Actions workflow)
- Risk: Performance regressions (unoptimized images, blocking scripts) go unnoticed. Accessibility issues accumulate
- Priority: **Medium** - proactive quality gates needed

## Dependencies at Risk

**Google Analytics Tracking ID in Config:**
- Risk: `hugo.toml` contains `google_analytics = "G-TT7PTG1YW9"`. While not a secret, it's visible in the source code
- Impact: Anyone can track analytics or replace with different ID. Public GA measurement ID can be spoofed
- Migration plan: Move to GitHub secret; inject via GitHub Actions environment variable during build

**Google Fonts CDN Dependency:**
- Risk: Fonts loaded from `fonts.googleapis.com` and `fonts.gstatic.com`. If Google CDN is down, fonts fail to load (fallback to system fonts works)
- Impact: Performance degradation and visual design shifts if CDN is slow
- Migration plan: Self-host fonts by downloading WOFF2 files to `static/fonts/` and referencing locally

**Formspree Service Dependency:**
- Risk: Contact form entirely depends on `formspree.io` uptime. No local fallback
- Impact: If Formspree is down, contact form fails silently (no error message to user)
- Migration plan: Implement serverless function (Netlify Functions, GitHub Actions) to send email directly; keep Formspree as fallback

**Hugo Version Pinning:**
- Risk: `.github/workflows/hugo.yml` pins Hugo to specific version (`0.135.0`). If security vulnerability found in that version, no automatic updates
- Impact: Site builds with outdated Hugo; potential security vulnerabilities in Hugo itself
- Migration plan: Update `HUGO_VERSION` quarterly. Add Dependabot to auto-create PRs for version updates

---

*Concerns audit: 2026-02-13*
