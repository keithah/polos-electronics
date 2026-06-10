# Local SEO Service Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Polos Electronics search visibility by updating homepage metadata, aligning local schema, and adding crawlable service pages for high-intent local searches.

**Architecture:** Keep the homepage as the broad LocalBusiness entry point. Add individual Hugo content pages under `content/services/` rendered by a reusable `layouts/services/single.html` template, with JSON-LD generated from front matter and shared business data.

**Tech Stack:** Hugo static site, TOML config, JSON data files, HTML templates, Markdown content.

---

### Task 1: Homepage Metadata

**Files:**
- Modify: `hugo.toml`
- Modify: `layouts/index.html`

- [ ] Update site title and description to include low voltage contractor, Battle Ground, Vancouver, Clark County, and Southwest Washington intent.
- [ ] Keep canonical URL and existing Open Graph/Twitter metadata wired to the updated values.

### Task 2: Business Data And Schema

**Files:**
- Modify: `data/business.json`
- Modify: `layouts/partials/schema/local-business.html`
- Modify: `layouts/partials/schema/services.html`
- Modify: `layouts/partials/schema/service-area-geo.html`

- [ ] Add Lewis County to `areaServed`.
- [ ] Replace short Google share URL with canonical Google Maps profile URL.
- [ ] Emit `legalName`, `founder`, `slogan`, and `knowsAbout` where available.
- [ ] Keep structured data aligned with visible text.

### Task 3: Service Pages

**Files:**
- Create: `layouts/services/single.html`
- Create: `content/services/starlink-installation-vancouver-wa.md`
- Create: `content/services/security-camera-installation-battle-ground-wa.md`
- Create: `content/services/home-theater-installation-vancouver-wa.md`
- Create: `content/services/network-cabling-vancouver-wa.md`
- Create: `content/services/access-control-systems-clark-county-wa.md`
- Create: `content/services/low-voltage-contractor-vancouver-wa.md`

- [ ] Add first-hand service copy, FAQs, proof points, and CTAs for each page.
- [ ] Add Service and FAQ structured data on each service page.
- [ ] Link service pages from the homepage service list.

### Task 4: Verification

**Files:**
- Generated: `public/`

- [ ] Run `hugo --gc --minify`.
- [ ] Confirm sitemap includes the new service URLs.
- [ ] Confirm generated homepage contains updated title/meta.
- [ ] Confirm generated service pages contain Service and FAQ JSON-LD.
