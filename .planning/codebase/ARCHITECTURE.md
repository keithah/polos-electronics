# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** Static Site Generator with Data-Driven Content

This is a Hugo-based static site architecture optimized for marketing/business website deployment. The site uses a single-page hero pattern with section-based scrollable navigation, combining static HTML generation with runtime JavaScript for interactivity.

**Key Characteristics:**
- Single-template architecture (one `index.html` serves all content)
- Data separation: Content in JSON files, markup in Hugo template
- Client-side interactivity with vanilla JavaScript (no frameworks)
- Hugo templating for server-side variable substitution and data loops
- Automated content updates via GitHub Actions workflow
- GitHub Pages deployment with custom domain

## Layers

**Hugo Build Layer:**
- Purpose: Convert source files into deployable HTML during build time
- Location: `hugo.toml` (configuration), `/layouts/` (templates), `/content/` (markdown)
- Contains: Hugo configuration, HTML templates, markdown source
- Depends on: Hugo CLI, GitHub Actions runner
- Used by: GitHub Pages deployment pipeline

**Content Layer:**
- Purpose: Store page content and metadata in structured format
- Location: `/content/_index.md`, `/data/*.json`
- Contains: Page frontmatter (title, description), review data, service area information
- Depends on: Hugo data processing
- Used by: Index template for rendering

**Styling Layer:**
- Purpose: Define responsive, mobile-first design matching WordPress original
- Location: `/assets/css/custom.css`
- Contains: CSS reset, layout grids, component styles, media queries, WordPress-style design system
- Depends on: Google Fonts API (remote stylesheet), Hugo asset pipeline for minification
- Used by: `index.html` template via Hugo resource handler

**Static Assets Layer:**
- Purpose: Store immutable files (images, favicons, configuration)
- Location: `/static/` directory
- Contains: Images (`/static/images/`), `CNAME` (GitHub Pages domain configuration), favicons
- Depends on: None (served as-is)
- Used by: HTML template via `relURL` Hugo function

**Data Processing Layer:**
- Purpose: Provide dynamic content injection and workflow automation
- Location: `/data/reviews.json`, `/data/service-area.json`, `.github/workflows/`
- Contains: Review records from Google API, service area definitions, GitHub Actions deployment/sync scripts
- Depends on: Google Places API (fetch-reviews workflow), Hugo data templating
- Used by: Index template loops and conditionals

## Data Flow

**Content Rendering (Build Time):**

1. Hugo reads `/content/_index.md` and `/hugo.toml` configuration
2. Hugo accesses data files in `/data/` (reviews.json, service-area.json)
3. Hugo substitutes variables from `hugo.toml` params (phone, email, address, google_analytics)
4. Hugo applies `/layouts/index.html` template with Hugo functions:
   - `{{ .Site.Params.* }}` - Site configuration variables
   - `{{ .Site.Data.service_area.* }}` - Data file content
   - `{{ range .Site.Data.reviews.reviews }}` - Loops for review cards
   - `{{ "images/logo.png" | relURL }}` - URL rewriting for GitHub Pages
5. Hugo minifies CSS from `/assets/css/custom.css`
6. Output written to `./public/index.html` and assets

**Review Update Flow (Nightly):**

1. GitHub Actions triggers fetch-reviews.yml workflow
2. Workflow runs `curl` to Google Places API with `GOOGLE_PLACE_ID` and `GOOGLE_API_KEY` secrets
3. Response piped through `jq` to extract and restructure review data
4. Transformed JSON written to `data/reviews.json`
5. Workflow checks for changes and commits/pushes if reviews differ
6. Next build picks up updated reviews.json

**Deployment Flow (Push to main):**

1. GitHub Actions triggers hugo.yml workflow
2. Hugo CLI installs (version 0.135.0)
3. Hugo builds with `--gc` (garbage collection) and `--minify` flags
4. Output artifact uploaded to GitHub Pages deployment service
5. Custom domain (poloselectronics.com) resolves via CNAME configuration

**Runtime Interaction (Browser):**

1. Page loads and renders with all Hugo-substituted content
2. JavaScript initializes on DOMContentLoaded:
   - Mobile menu toggle (nav-toggle button)
   - Smooth scroll anchors (#home, #about, #services, etc.)
   - CAPTCHA generation (simple math problem)
   - Review carousel pagination
3. User interactions trigger:
   - Form submission to Formspree (external service)
   - Carousel navigation (prev/next buttons)
   - Mobile menu toggle

**State Management:**

- **Build-time state:** Managed by Hugo templates; all content static once deployed
- **Runtime state:** Minimal; stored in DOM elements and JavaScript variables:
  - Current carousel page (reviews)
  - Mobile menu open/closed state
  - Form submission state (button disabled, text changed)
  - CAPTCHA answer validation
- **Persistent state:** None (stateless static site); review updates persist in repo only

## Key Abstractions

**Section Components:**

Pattern: Reusable HTML sections with consistent structure (container, heading, content)

Examples:
- Hero section: `<section id="home" class="hero-section">` - Full-width background image with overlay text
- Team members: `.team-member` cards in grid layout - Individual profile cards with circular images
- Services: Two-column layout with left text content, right sidebar image
- Contact form: Split layout with image left, form right

Pattern: Each section uses semantic HTML5 (`<section>`, `<h2>`, `<div class="section-container">`) and can be scrolled to via anchor links

**Layout Grid System:**

- `.section-container` - Max-width 1200px, centered, padding 20px sides (CSS handles responsive)
- `.hero-container`, `.team-grid`, `.services-layout` - Section-specific flex/grid layouts
- Responsive breakpoints: Media queries adjust column counts, font sizes, spacing for mobile

**Navigation System:**

- Fixed header (`.site-header`) with two layers:
  - `.header-top` - Address, hours, contact button (light background)
  - `.navbar` - Logo, menu links, phone CTA (white background)
- Mobile menu toggle via `.nav-toggle` button (hamburger icon)
- Smooth scroll to sections via anchor links in nav menu
- Sticky positioning allows header to remain visible while scrolling

**Form Handling:**

- Client-side CAPTCHA validation (simple addition math problem)
- Formspree integration for email delivery (external service)
- Form state management (submit button disabled during submission)
- Redirect-after-submit configured via hidden `_next` field

**Data Loop Pattern (Hugo Templating):**

```html
{{ range .Site.Data.reviews.reviews }}
  {{ if eq (int .rating) 5 }}
    <!-- Review card markup -->
  {{ end }}
{{ end }}
```

Filters reviews to show only 5-star ratings. Demonstrates conditional logic and data access.

## Entry Points

**Index Template:**
- Location: `/layouts/index.html`
- Triggers: Every Hugo build; outputs to `./public/index.html`
- Responsibilities:
  - Renders complete HTML document
  - Substitutes Hugo variables (site params, data)
  - Includes inline JavaScript for interactivity
  - Links to minified CSS from `/assets/`
  - Embeds structured data (Schema.org JSON-LD)
  - Configures Google Analytics

**GitHub Pages Deployment:**
- Location: `.github/workflows/hugo.yml`
- Triggers: Push to main branch or manual workflow_dispatch
- Responsibilities:
  - Installs Hugo CLI
  - Runs `hugo --gc --minify` build
  - Uploads build artifact to GitHub Pages
  - Serves site from custom domain

**Review Sync Automation:**
- Location: `.github/workflows/fetch-reviews.yml`
- Triggers: Daily at midnight UTC or manual workflow_dispatch
- Responsibilities:
  - Fetches latest reviews from Google Places API
  - Transforms API response into site-compatible JSON
  - Commits changes to `data/reviews.json`
  - Triggers rebuild if data changed

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**

- **Reviews section:** Entire section hidden if `.Site.Data.reviews` is nil/empty (Hugo `{{ if }}` conditional)
  - Prevents broken carousel if API fetch fails
  - Falls back to text CTA: "See our reviews on: [platforms]"

- **Images:** `alt` attributes required on all `<img>` tags for accessibility
  - Example: `<img src="{{ "images/logo.png" | relURL }}" alt="Polos Electronics Logo">`
  - Ensures page remains usable if images fail to load

- **Forms:** CAPTCHA validation on client side before submission
  - User sees alert if answer incorrect, CAPTCHA regenerates
  - Prevents accidental blank form submission

- **JavaScript:** All interactive features wrapped in conditional element checks
  ```javascript
  if (navToggle && navMenu) {
    // Menu toggle only if elements exist
  }
  ```
  Ensures site remains functional if JavaScript fails or elements are missing

## Cross-Cutting Concerns

**Logging:** No application logging. Build logs visible in GitHub Actions interface.

**Validation:**
- Client-side HTML5 validation on form inputs (`required`, `type="email"`, etc.)
- CAPTCHA validation before form submission
- No server-side validation (form posts to Formspree external service)

**Authentication:** Not applicable (public website, no user accounts)

**SEO Optimization:**
- Meta tags in `<head>`: description, keywords, robots, canonical URL
- Open Graph tags for social sharing (og:title, og:description, og:image)
- Twitter Card tags for Twitter sharing
- Schema.org structured data (LocalBusiness, OpeningHoursSpecification, OfferCatalog)
- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)

**Performance:**
- CSS minified via Hugo asset pipeline
- Static file serving (no server-side computation)
- Google Fonts preconnect hints
- Font loading: `font-display=swap` allows text render before font loads
- Image optimization: JPEG compression (images optimized externally)
- No JavaScript frameworks (vanilla JS only)

**Accessibility:**
- `aria-label` attributes on icon buttons (nav toggle, carousel controls)
- `alt` text on all images
- Semantic HTML structure
- Keyboard navigation for carousel (ArrowLeft/ArrowRight keys)
- Color contrast maintained throughout (meeting WCAG standards visually)

---

*Architecture analysis: 2026-02-13*
