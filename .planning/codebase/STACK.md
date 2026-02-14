# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**
- HTML5 - Used for page templates and layout
- CSS3 - Custom stylesheet for styling and responsive design
- JavaScript (vanilla/ES6) - Client-side interactivity, form validation, carousel, CAPTCHA

**Secondary:**
- Go (embedded) - Hugo templating language for dynamic page generation
- TOML - Configuration format for `hugo.toml`

## Runtime

**Environment:**
- Hugo static site generator (no server runtime required)
- Deploys to GitHub Pages (static hosting)

**Package Manager:**
- Not applicable - no dependency management required

## Frameworks

**Core:**
- Hugo 0.135.0 - Static site generator
  - Config: `hugo.toml`
  - Templating: Go templates in `layouts/`
  - Markup: Goldmark for Markdown rendering with HTML support

**CSS:**
- Vanilla CSS3 with custom design (no framework like Bootstrap or Tailwind)
- Custom responsive grid system implemented in `assets/css/custom.css`

**JavaScript:**
- Vanilla JavaScript (no framework)
- Features: smooth scrolling, mobile menu toggle, form validation, carousel pagination, CAPTCHA generation

**Google Fonts:**
- Roboto Condensed (weights: 300, 400, 700)
- Josefin Sans (weights: 300, 400, 600, 700)

## Key Dependencies

**External CDN/Libraries:**
- Google Fonts API (https://fonts.googleapis.com) - Typography
- Google Analytics 4 (gtag.js) - Site tracking and user behavior analysis
- Formspree - Contact form processing (https://formspree.io/f/xjkeqgvl)
- Google Maps API - Embedded map link in header
- SVG Icons - Inline SVG icons for social media (LinkedIn, Yelp, HomeAdvisor, Nextdoor)

**No npm/Node dependencies** - Static site with no build pipeline

## Configuration

**Environment:**
- Base URL: `https://poloselectronics.com`
- Language code: `en-us`
- Site title: `Polos Electronics`
- Contact info configured in `hugo.toml` params:
  - Phone: (360) 687-3543
  - Email: service@poloselectronics.com
  - Address: 20810 NE 267th St, Battle Ground, WA 98604
  - Google Analytics ID: G-TT7PTG1YW9

**Hugo Configuration File:** `hugo.toml`
```toml
baseURL = 'https://poloselectronics.com'
languageCode = 'en-us'
title = 'Polos Electronics'

[params]
  description = "Locally owned and operated Low Voltage Electrical Contractor since 1979"
  phone = "(360) 687-3543"
  email = "service@poloselectronics.com"
  address = "20810 NE 267th St, Battle Ground, WA 98604"
  google_analytics = "G-TT7PTG1YW9"

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
```

## Content Structure

**Markdown Files:**
- `content/_index.md` - Homepage front matter and metadata

**Data Files (JSON):**
- `data/reviews.json` - Customer review data with ratings and testimonials
- `data/service-area.json` - Geographic service area information and cities served

**Layout Templates:**
- `layouts/index.html` - Single page template for entire site

## Build & Deployment

**Build Tool:**
- Hugo CLI with optimization flags:
  - `--gc` - Garbage collection (removes unused resources)
  - `--minify` - Minifies HTML, CSS, JavaScript output

**Asset Processing:**
- CSS minification: `resources.Minify` (Hugo built-in)
- No JavaScript bundling (loaded inline or as static files)

**Deployment:**
- GitHub Pages (static hosting via `gh-pages` branch)
- GitHub Actions workflow: `.github/workflows/hugo.yml`
- Runs on: Ubuntu latest
- Trigger: Push to main branch

## Production Output

**Build Target:**
- Output directory: `./public/`
- Static files only (no server required)
- Total site: Minified HTML, CSS, images, JavaScript

**Performance Optimizations:**
- Static site generation (no database queries)
- Asset minification
- Image optimization
- Lazy loading ready (images in static/)
- CDN delivery via GitHub Pages

## Platform Requirements

**Development:**
- Hugo 0.135.0+ (extended version for SCSS support, though not currently used)
- No Node.js or additional package managers required
- Text editor/IDE only

**Production:**
- GitHub Pages (deployed at https://poloselectronics.com)
- Custom domain configuration via CNAME record
- DNS A records pointing to GitHub Pages IP addresses:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

## Local Development Commands

```bash
# Start development server with live reload
hugo server

# Build production site with optimization
hugo --gc --minify

# Build with production environment variables
HUGO_ENVIRONMENT=production HUGO_ENV=production hugo --gc --minify
```

---

*Stack analysis: 2026-02-13*
