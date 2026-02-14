# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**Form Processing:**
- Formspree (https://formspree.io) - Contact form handling
  - Form endpoint: `https://formspree.io/f/xjkeqgvl`
  - Method: POST via HTML form in `layouts/index.html` (line 404)
  - Fields submitted: firstName, lastName, phone, email, message
  - Success redirect: Back to contact section (`#contact`)
  - No API key required (form ID embedded)

**Maps & Location:**
- Google Maps - Location link in header and footer
  - Link: `https://maps.app.goo.gl/2puYhDM2pxiSJUPR7`
  - Shows business address in embedded Google Map
  - Used in: Header (line 160), Footer (line 470)

**Review Platforms (Links Only):**
- Google Business Profile - Review link in footer and reviews section
  - URL: `https://share.google/D3mexUt7VZzi7gvWZ`
- Yelp - Review platform link
  - URL: `https://www.yelp.com/biz/polos-electronics-battle-ground`
- Nextdoor - Community platform link
  - URL: `https://nextdoor.com/page/polos-electronics-battle-ground-wa`
- HomeAdvisor - Professional services link
  - URL: `https://www.homeadvisor.com/rated.PolosElectronicsInc.7529229.html`
- LinkedIn - Company profile
  - URL: `https://www.linkedin.com/company/polos-electronics/`

## Data Storage

**Databases:**
- None - Static site with no backend database
- All data stored in version-controlled files

**File Storage:**
- Local filesystem in `/static/` directory
  - Image assets: `static/images/`
  - Favicons: `static/favicon.ico`, `static/favicon-32x32.png`, `static/apple-touch-icon.png`
  - Custom domain: `static/CNAME`

**Content Files:**
- Markdown: `content/_index.md`
- JSON data files: `data/reviews.json`, `data/service-area.json`
- Static CSS: `assets/css/custom.css`

**Caching:**
- GitHub Pages provides edge caching via Akamai CDN
- No application-level caching configured

## Authentication & Identity

**Auth Provider:**
- None - Public static website
- No user accounts or authentication required
- Form submissions processed by Formspree (no authentication needed)

**Contact Information:**
- Phone: (360) 687-3543 (public contact only)
- Email: service@poloselectronics.com (public contact)

## Monitoring & Observability

**Analytics:**
- Google Analytics 4 (GA4)
  - Measurement ID: `G-TT7PTG1YW9`
  - Tracking code: Global Site Tag (gtag.js) from Google Tag Manager
  - Loaded via: `https://www.googletagmanager.com/gtag/js?id=G-TT7PTG1YW9`
  - Configured in: `layouts/index.html` (lines 141-150)
  - Tracks: Page views, user sessions, traffic sources, device types, location, form interactions

**Error Tracking:**
- None detected - No error tracking service integrated

**Logs:**
- GitHub Actions CI/CD logs for deployment (accessible via GitHub)
- No application-level logging

**Monitoring:**
- GitHub Pages deployment status monitoring via GitHub Actions
- Manual verification of GA4 real-time reports

## CI/CD & Deployment

**Hosting:**
- GitHub Pages
  - Repository: https://github.com/keithah/polos-electronics
  - Live URL: https://poloselectronics.com

**CI Pipeline:**
- GitHub Actions workflow file: `.github/workflows/hugo.yml`
- Trigger: Push to main branch or manual workflow dispatch
- Steps:
  1. Install Hugo CLI (version 0.135.0)
  2. Checkout repository with submodules
  3. Configure GitHub Pages environment
  4. Build with Hugo (`--gc --minify` flags)
  5. Upload artifact to GitHub Pages
  6. Deploy to GitHub Pages

**Deployment Permissions:**
- contents: read
- pages: write
- id-token: write

## Environment Configuration

**Required Environment Variables:**
- None - Site is completely static with hardcoded configuration

**Configuration Files:**
- `hugo.toml` - Hugo site configuration with site params
- `.github/workflows/hugo.yml` - CI/CD pipeline configuration

**Secrets & Credentials:**
- Formspree form ID: `xjkeqgvl` (hardcoded, public)
- Google Analytics ID: `G-TT7PTG1YW9` (hardcoded in hugo.toml, public)
- No private keys or secrets required

## Webhooks & Callbacks

**Incoming Webhooks:**
- None detected

**Outgoing Webhooks:**
- Formspree sends form submission confirmation email to `service@poloselectronics.com`
  - Reply-to field pulled from form submission email field
  - Redirect on success: `https://poloselectronics.com/#contact`

**GitHub Webhooks:**
- GitHub Pages automatically deploys on push to main branch
- No manual webhook configuration required

## CDN & Content Delivery

**Content Delivery:**
- GitHub Pages CDN (Akamai)
  - Automatically caches and serves static files from edge locations
  - Custom domain: poloselectronics.com via CNAME

**External Resources Loaded:**
- Google Fonts (https://fonts.googleapis.com) - Roboto Condensed, Josefin Sans
- Google Tag Manager (https://www.googletagmanager.com) - Analytics
- All other resources served locally

## Social Media & Integrations

**Social Sharing:**
- Open Graph meta tags configured for Facebook/social sharing
  - Og:image, og:title, og:description
  - Configured in: `layouts/index.html` (lines 19-28)

**Twitter Cards:**
- Twitter meta tags configured
  - Card type: summary_large_image
  - Configured in: `layouts/index.html` (lines 36-42)

**Social Links:**
- LinkedIn, Yelp, HomeAdvisor, Nextdoor links in footer
- All open in new tabs with noopener security

## Third-Party Services Summary

| Service | Purpose | Required | Configuration |
|---------|---------|----------|---|
| Formspree | Contact form processing | Yes | Endpoint URL hardcoded |
| Google Analytics 4 | Site analytics and tracking | Yes | ID in hugo.toml |
| Google Fonts | Typography | Yes | CDN links in HTML head |
| Google Maps | Location link | No | Public share link |
| GitHub Pages | Hosting & deployment | Yes | CNAME record, GitHub Actions |
| Google Tag Manager | Analytics script delivery | Yes | Loaded via gtag.js |
| Review platforms | Outbound links only | No | URLs in links |

---

*Integration audit: 2026-02-13*
