# Phase 3: Service Area Mapping - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual map and text-based representation of service coverage areas. Visitors instantly understand whether Polos Electronics serves their location. Map is static image (not interactive widget). Includes Schema.org areaServed markup integration with existing LocalBusiness schema.

</domain>

<decisions>
## Implementation Decisions

### Map Visual Design
- Simple flat illustration style — clean vector look with solid fills
- Full Washington state outline visible with muted fill (shows statewide license context)
- Clark County highlighted in primary red (#fe3a46)
- Bordering counties (Cowlitz, Skamania) in lighter tint of red
- Battle Ground marked with pin/marker icon (cleaner than star)

### Text Listing Structure
- Organized by priority tier: Primary → Also Serving → Licensed Statewide
- Comprehensive city list for maximum local SEO value
- Clark County includes all incorporated cities PLUS unincorporated areas (Brush Prairie, Hockinson, etc.)
- "Licensed to serve all of Washington State" — brief one-line statement for statewide coverage

### Service Area Emphasis
- Strong primary emphasis on Clark County — headline-level treatment
- Welcoming local message: "Proudly serving Clark County since 1979" or similar
- Distinct "Also Serving" subheading section for Cowlitz and Skamania counties
- Out-of-area CTA: "Not in our primary area? Call us — we may still be able to help"

### Page Placement & Layout
- Section placement: After Services, before Contact (natural flow)
- Layout: Text with inline map embedded within content area
- Background: Match existing site alternating pattern
- Section heading: "Our Coverage Area"
- Add "Service Areas" or similar item to top navigation menu

### Claude's Discretion
- Exact map dimensions and aspect ratio
- Pin icon design details
- City/community list formatting (columns, bullets, etc.)
- Mobile responsive behavior for map sizing
- Exact copy for local welcoming message

</decisions>

<specifics>
## Specific Ideas

- Visual hierarchy should make Clark County unmistakably primary — "We're YOUR local electrician" feel
- Comprehensive city list prioritizes SEO discoverability for hyperlocal searches
- Map should feel modern and clean to match site design system
- Existing data/service-area.json can be expanded for comprehensive city data

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-service-area-mapping*
*Context gathered: 2026-02-14*
