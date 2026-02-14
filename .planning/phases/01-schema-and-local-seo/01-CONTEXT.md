# Phase 1: Schema & Local SEO - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish correct schema markup patterns and NAP (Name/Address/Phone) consistency across the Hugo site before adding review content. Search engines must understand Polos Electronics as a verified local electrical contractor with defined service areas (Clark, Cowlitz, and Skamania counties).

This is foundational work - schema must validate before deploying review aggregation in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User delegated all implementation decisions for this technical infrastructure phase. The researcher and planner have full discretion on:

- **Schema placement & generation** - Whether to hardcode schema in templates vs use data-driven approach from JSON/YAML files, single partial vs distributed, template organization
- **NAP management** - How to centralize Name/Address/Phone data to ensure consistency across site content, schema markup, and footer
- **Service schema detail** - Level of detail for each electrical service's Service schema (beyond basic name/description - consider price ranges, service areas, hours, etc.)
- **FAQ content & organization** - Which frequently asked questions to include, whether to organize by service type or keep unified, total number of FAQs
- **areaServed structure** - How to represent the three-county service area in schema (simple text list vs structured Place objects)
- **Validation approach** - Testing strategy using Google Rich Results Test and other schema validators

</decisions>

<specifics>
## Specific Ideas

No specific requirements - open to standard schema.org best practices for local contractors.

**Hard requirements from roadmap:**
- LocalBusiness schema with ElectricalContractor subtype
- areaServed property listing Clark, Cowlitz, and Skamania counties
- NAP matching exactly across website, schema, and external listings
- Service schema for each electrical service listed on site
- FAQPage schema markup for FAQ section
- Must validate in Google Rich Results Test

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 01-schema-and-local-seo*
*Context gathered: 2026-02-13*
