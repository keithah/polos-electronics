# Polos Electronics Website Enhancements

## What This Is

A series of targeted improvements to the existing Polos Electronics Hugo static site to enhance credibility through multi-platform review aggregation, clarify service coverage with visual and text-based mapping, and improve search visibility through enhanced SEO and structured data markup.

## Core Value

Potential customers can quickly verify Polos Electronics' credibility through authentic reviews and understand whether they're in the service area — before picking up the phone.

## Current State

**Shipped:** v1.1 Reliability & Visibility (2026-02-14)

Reviews and service-area credibility signals now reliably render with fallback protection, CI validation gates, and operator recovery documentation.

**Next Milestone:** TBD (use `/gsd:new-milestone` to start planning)

## Requirements

### Validated

Capabilities working in production:

**Existing (pre-project):**
- ✓ Hugo static site deployed to GitHub Pages with custom domain (poloselectronics.com)
- ✓ Single-page responsive layout with hero, about, team, services, and contact sections
- ✓ Contact form integration via Formspree
- ✓ Team member profiles for Andy & John Polos
- ✓ Basic SEO meta tags (description, keywords, Open Graph, Twitter Cards)
- ✓ Google Analytics 4 tracking integrated
- ✓ Basic Schema.org LocalBusiness structured data
- ✓ Mobile-responsive design system
- ✓ Automated deployment via GitHub Actions

**v1.0 Foundation:**
- ✓ Multi-platform review aggregation workflow and normalized review data model
- ✓ Unified review display with platform attribution and CTA links
- ✓ Tiered service-area map and listing experience
- ✓ Enhanced schema coverage for business, services, FAQ, and service areas

**v1.1 Reliability & Visibility:**
- ✓ REND-01: User always sees Reviews section, even when review data is empty or stale
- ✓ REND-02: User always sees Service Area section with map context, even when primary map fails
- ✓ REND-03: User can see when reviews were last updated and whether data is stale
- ✓ VALD-01: Validated review data contracts before site build
- ✓ VALD-02: Validated service-area data and required map assets before deploy
- ✓ VALD-03: Strict Hugo build checks fail on warnings/path issues
- ✓ VALD-04: Smoke checks assert reviews/map presence in built output
- ✓ OPER-01: Documented manual recovery run for operators
- ✓ OPER-02: CI diagnostics for review/map health
- ✓ OPER-03: Last-known-good fallback data when ingestion fails

### Active

No active requirements. Start next milestone with `/gsd:new-milestone`.

### Out of Scope

- Real-time review synchronization — One-time/periodic manual updates acceptable
- Multi-page site expansion — Maintaining single-page architecture
- Blog or content marketing — Focus on core business site enhancements
- Progressive Web App features — Static site serves current needs
- User accounts or authentication — Public business site only
- Live chat or customer portal — Contact form is sufficient

## Context

**Current Codebase:**
- Hugo 0.135.0 static site generator
- ~6,000 lines (HTML, CSS, JSON, YAML)
- Deployed to GitHub Pages via GitHub Actions
- CI pipeline with data validation, strict build, smoke checks

**Technical Stack:**
- Hugo templates with conditional fallback rendering
- reviews.json with live reviews + fallbackReviews arrays
- service_area.json with tiered coverage + map fallback config
- OPERATIONS.md runbook for incident recovery

**Business Context:**
- Polos Electronics: Low voltage electrical contractor since 1979
- Headquarters: Battle Ground, WA (Clark County)
- Primary service area: Clark County and bordering counties
- Licensed coverage: Entire Washington state

## Constraints

- **Platform**: Hugo static site generator
- **Hosting**: GitHub Pages with custom domain
- **Design**: Maintain existing visual design system
- **Architecture**: Static site only, no backend server
- **Build Time**: Under 5-minute GitHub Actions timeout

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-platform review aggregation over single source | Diverse review sources build more credibility | ✓ Good (v1.0) |
| Static map image with interactive embed option | SEO benefits + fallback reliability | ✓ Good (v1.0, v1.2) |
| Conditional fallback (not append) for reviews | Clean UX when data missing | ✓ Good (v1.1) |
| 45-day stale threshold for freshness indicator | Balance between alert fatigue and data freshness | — Pending |
| --panicOnWarning for strict Hugo builds | Catch regressions early in CI | ✓ Good (v1.1) |
| Documentation-only operations (OPERATIONS.md) | Simple, no automation needed for rare incidents | ✓ Good (v1.1) |

---
*Last updated: 2026-02-14 after shipping v1.1 milestone*
