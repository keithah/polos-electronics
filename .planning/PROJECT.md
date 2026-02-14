# Polos Electronics Website Enhancements

## What This Is

A series of targeted improvements to the existing Polos Electronics Hugo static site to enhance credibility through multi-platform review aggregation, clarify service coverage with visual and text-based mapping, and improve search visibility through enhanced SEO and structured data markup.

## Core Value

Potential customers can quickly verify Polos Electronics' credibility through authentic reviews and understand whether they're in the service area — before picking up the phone.

## Current Milestone: v1.1 Reliability & Visibility

**Goal:** Restore reliable production and local rendering for reviews and service-area map so credibility and coverage signals are consistently visible.

**Target features:**
- End-to-end review ingestion and template rendering reliability
- Service-area map asset generation and rendering reliability
- Runtime/build-time safeguards so missing data/assets fail loudly instead of silently

## Requirements

### Validated

Existing capabilities already working in production:

- ✓ Hugo static site deployed to GitHub Pages with custom domain (poloselectronics.com) — existing
- ✓ Single-page responsive layout with hero, about, team, services, and contact sections — existing
- ✓ Contact form integration via Formspree — existing
- ✓ Team member profiles for Andy & John Polos — existing
- ✓ Basic SEO meta tags (description, keywords, Open Graph, Twitter Cards) — existing
- ✓ Google Analytics 4 tracking integrated — existing
- ✓ Basic Schema.org LocalBusiness structured data — existing
- ✓ Mobile-responsive design system — existing
- ✓ Automated deployment via GitHub Actions — existing
- ✓ Data structure for service areas (`data/service-area.json`) — existing
- ✓ Sample reviews section with placeholder content — existing
- ✓ Multi-platform review aggregation workflow and normalized review data model — v1.0
- ✓ Unified review display with platform attribution and CTA links — v1.0
- ✓ Tiered service-area map and listing experience — v1.0
- ✓ Enhanced schema coverage for business, services, FAQ, and service areas — v1.0

### Active

New capabilities to build:

- [ ] Ensure review data fetch jobs produce deployable `data/reviews.json` content on schedule
- [ ] Ensure reviews render in both local Hugo builds and production deploys
- [ ] Ensure service-area map asset is generated/resolved and always renders in local and production
- [ ] Add validation checks that fail CI when reviews or map prerequisites are missing
- [ ] Add visible fallback states plus diagnostics for review/map sections to prevent silent regressions

### Out of Scope

- Real-time review synchronization — One-time/periodic manual updates acceptable, API integration preferred but not required if platform doesn't support it
- Interactive map widgets — Static visual map is sufficient for clarity and SEO
- Multi-page site expansion — Maintaining single-page architecture
- Blog or content marketing — Focus on core business site enhancements
- Progressive Web App features — Static site serves current needs
- User accounts or authentication — Public business site only
- Live chat or customer portal — Contact form is sufficient

## Context

**Existing Site:**
- Built with Hugo 0.135.0 static site generator
- Deployed to GitHub Pages via automated workflow
- Custom CSS matching original WordPress design
- Vanilla JavaScript for interactivity (carousel, mobile menu, form handling)
- Formspree handles contact form submissions
- Google Analytics 4 tracks visitor behavior

**Business Context:**
- Polos Electronics: Low voltage electrical contractor since 1979
- Headquarters: Battle Ground, WA (Clark County)
- Primary service area: Clark County and bordering counties
- Licensed coverage: Entire Washington state
- Key services: Electrical installations, repairs, low voltage work

**Technical Environment:**
- No backend server or database (static site architecture)
- Reviews currently stored in `data/reviews.json` (sample data)
- Service area data in `data/service-area.json` (partial)
- GitHub Actions workflow for automated review fetching exists but needs platform integration
- All styling in single `assets/css/custom.css` file (1,377 lines)

**Known Issues to Address:**
- Current reviews section has only placeholder sample data
- No aggregation from actual review platforms
- Missing comprehensive Schema.org structured data
- Service area not visually represented
- Local SEO signals incomplete

## Constraints

- **Platform**: Must use Hugo static site generator — site already built on Hugo, maintain consistency
- **Hosting**: Must deploy to GitHub Pages — existing deployment pipeline in place
- **Design**: Must maintain existing visual design system — client approved current look matching original WordPress site
- **Architecture**: Static site only, no backend server — GitHub Pages limitation and project design choice
- **Review Updates**: API integration preferred, manual updates acceptable — Some platforms may not provide suitable APIs
- **Build Time**: Must complete Hugo build under GitHub Actions 5-minute timeout — currently builds in ~2 seconds, room for growth
- **SEO Standards**: Must validate in Google's Rich Results Test — structured data must meet schema.org specifications

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-platform review aggregation over single source | Diverse review sources build more credibility than Google alone; customers use different platforms | — Pending |
| Static map image over interactive widget | SEO benefits from text content; static image loads faster and requires no API keys | — Pending |
| Prefer API integration with manual fallback | Automation reduces maintenance burden, but some platforms restrict API access | — Pending |
| Single-page architecture maintained | Current structure works well for local service business; no need for blog or multi-page complexity | — Pending |
| Enhanced Schema.org over basic markup | Rich results in search improve click-through; proper structured data signals trust to AI search engines | — Pending |

---
*Last updated: 2026-02-14 after starting milestone v1.1*
