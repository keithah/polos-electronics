# Phase 1: Schema & Local SEO - Research

**Researched:** 2026-02-13
**Domain:** Schema.org structured data for LocalBusiness (ElectricalContractor subtype), Service schema, FAQPage markup
**Confidence:** HIGH

## Summary

This phase establishes schema.org structured data patterns for Polos Electronics, a low-voltage electrical contractor. The current site has basic LocalBusiness schema that needs upgrading to the more specific `Electrician` type (which inherits from HomeAndConstructionBusiness > LocalBusiness). Key additions include areaServed for the three-county service area, detailed Service schemas for each offering, and FAQPage markup for a new FAQ section.

The implementation approach should use Hugo's data-driven patterns: centralize business information (NAP) in a data file, create schema partials that reference this single source of truth, and use Hugo's `dict` and `jsonify` functions for clean JSON-LD generation.

**Primary recommendation:** Upgrade @type from "LocalBusiness" to "Electrician", add areaServed as AdministrativeArea array with Wikipedia sameAs links, create data-driven Service schema from services.json, and build FAQ section with FAQPage schema.

## Standard Stack

### Core Technologies

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Hugo | 0.131.0 | Static site generator | Already in use, excellent JSON-LD template support |
| Schema.org | Current | Structured data vocabulary | Google-recommended, industry standard |
| JSON-LD | - | Schema format | Google explicitly recommends JSON-LD over Microdata/RDFa |

### Schema Types Required

| Schema Type | Parent Type | Purpose | Required For |
|-------------|-------------|---------|--------------|
| Electrician | HomeAndConstructionBusiness > LocalBusiness | Primary business type | SCHM-01 |
| AdministrativeArea | Place | County-level service areas | SCHM-02 |
| Service | Intangible | Individual service offerings | SCHM-04 |
| FAQPage | WebPage | FAQ section markup | SCHM-05 |
| Question/Answer | - | FAQ items | SCHM-05 |

### Validation Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Google Rich Results Test | https://search.google.com/test/rich-results | Primary validation |
| Schema.org Validator | https://validator.schema.org | Comprehensive schema validation |
| Google Search Console | - | Post-deployment monitoring |

## Architecture Patterns

### Recommended Project Structure

```
/Users/keith/src/polos-electronics/
├── data/
│   ├── business.json          # NEW: Centralized NAP + business info
│   ├── services.json          # NEW: Service definitions with schema properties
│   ├── faq.json               # NEW: FAQ content for FAQPage schema
│   └── service-area.json      # EXISTS: Enhance with areaServed data
├── layouts/
│   ├── partials/
│   │   └── schema/
│   │       ├── local-business.html  # NEW: Electrician schema partial
│   │       ├── services.html        # NEW: Service schema array
│   │       └── faq.html             # NEW: FAQPage schema
│   └── index.html             # UPDATE: Include schema partials
└── hugo.toml                  # UPDATE: Remove hardcoded contact info
```

### Pattern 1: Data-Driven Schema Generation

**What:** Store all business data in JSON files under `/data/`, generate schema from these files using Hugo partials.

**When to use:** Always for LocalBusiness schema - ensures NAP consistency across site content, footer, and schema markup.

**Example business.json:**
```json
{
  "name": "Polos Electronics",
  "legalName": "Polos Electronics Inc.",
  "type": "Electrician",
  "description": "Locally owned and operated Low Voltage Electrical Contractor since 1979",
  "telephone": "(360) 687-3543",
  "email": "service@poloselectronics.com",
  "url": "https://poloselectronics.com",
  "address": {
    "streetAddress": "20810 NE 267th St",
    "addressLocality": "Battle Ground",
    "addressRegion": "WA",
    "postalCode": "98604",
    "addressCountry": "US"
  },
  "geo": {
    "latitude": 45.7844,
    "longitude": -122.5375
  },
  "foundingDate": "1979",
  "priceRange": "$$",
  "openingHours": {
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "16:00"
  },
  "areaServed": [
    {
      "name": "Clark County",
      "state": "Washington",
      "sameAs": "https://en.wikipedia.org/wiki/Clark_County,_Washington"
    },
    {
      "name": "Cowlitz County",
      "state": "Washington",
      "sameAs": "https://en.wikipedia.org/wiki/Cowlitz_County,_Washington"
    },
    {
      "name": "Skamania County",
      "state": "Washington",
      "sameAs": "https://en.wikipedia.org/wiki/Skamania_County,_Washington"
    }
  ],
  "sameAs": [
    "https://www.linkedin.com/company/polos-electronics/",
    "https://share.google/D3mexUt7VZzi7gvWZ",
    "https://www.yelp.com/biz/polos-electronics-battle-ground",
    "https://nextdoor.com/page/polos-electronics-battle-ground-wa",
    "https://www.homeadvisor.com/rated.PolosElectronicsInc.7529229.html"
  ]
}
```

### Pattern 2: Hugo dict/jsonify for JSON-LD

**What:** Use Hugo's `dict` function to build schema objects, then `jsonify` and `safeJS` to output clean JSON-LD.

**When to use:** All schema generation to avoid HTML encoding issues.

**Example partial (layouts/partials/schema/local-business.html):**
```html
{{ $business := .Site.Data.business }}
{{ $schema := dict
  "@context" "https://schema.org"
  "@type" $business.type
  "@id" (printf "%s#organization" .Site.BaseURL)
  "name" $business.name
  "description" $business.description
  "url" $business.url
  "telephone" $business.telephone
  "email" $business.email
}}
<script type="application/ld+json">
{{ $schema | jsonify | safeJS }}
</script>
```

### Pattern 3: areaServed with AdministrativeArea

**What:** Specify service areas as AdministrativeArea objects with sameAs links to Wikipedia for disambiguation.

**When to use:** Service-area businesses serving specific geographic regions (counties, cities, states).

**Example:**
```json
"areaServed": [
  {
    "@type": "AdministrativeArea",
    "name": "Clark County, Washington",
    "sameAs": "https://en.wikipedia.org/wiki/Clark_County,_Washington"
  },
  {
    "@type": "AdministrativeArea",
    "name": "Cowlitz County, Washington",
    "sameAs": "https://en.wikipedia.org/wiki/Cowlitz_County,_Washington"
  },
  {
    "@type": "AdministrativeArea",
    "name": "Skamania County, Washington",
    "sameAs": "https://en.wikipedia.org/wiki/Skamania_County,_Washington"
  }
]
```

### Pattern 4: Service Schema with Provider Reference

**What:** Define each service as a Service type with provider linking back to the LocalBusiness @id.

**When to use:** When you have distinct services to mark up individually.

**Example services.json entry:**
```json
{
  "id": "starlink-installation",
  "name": "Starlink Installation",
  "description": "Professional Starlink satellite internet installation for residential and commercial properties in Southwest Washington.",
  "serviceType": "Installation",
  "category": "Internet & Networking"
}
```

**Generated schema:**
```json
{
  "@type": "Service",
  "@id": "https://poloselectronics.com#service-starlink-installation",
  "name": "Starlink Installation",
  "description": "Professional Starlink satellite internet installation...",
  "serviceType": "Installation",
  "provider": {
    "@id": "https://poloselectronics.com#organization"
  },
  "areaServed": [
    { "@id": "https://poloselectronics.com#area-clark-county" },
    { "@id": "https://poloselectronics.com#area-cowlitz-county" },
    { "@id": "https://poloselectronics.com#area-skamania-county" }
  ]
}
```

### Anti-Patterns to Avoid

- **Hardcoding NAP in multiple places:** NAP must come from single data source to ensure consistency
- **String interpolation for JSON-LD:** Use dict/jsonify instead to avoid encoding issues
- **Generic LocalBusiness type:** Use specific Electrician type for better search understanding
- **Text-only areaServed:** Use structured AdministrativeArea objects with sameAs links
- **Duplicate FAQ markup:** Only mark up FAQ content once on the site

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-LD generation | String templates | Hugo dict + jsonify | Proper escaping, cleaner code |
| Schema validation | Manual review | Google Rich Results Test | Authoritative, catches edge cases |
| NAP management | Scattered config values | Centralized data/business.json | Single source of truth |
| Date formatting | Custom formats | Hugo time.Format with ISO 8601 | Google-compliant timestamps |

**Key insight:** Schema.org structured data looks simple but has strict validation requirements. Google's tools are the definitive authority on what will work in search results.

## Common Pitfalls

### Pitfall 1: NAP Inconsistency

**What goes wrong:** Phone number format varies (360-687-3543 vs (360) 687-3543), address differs between schema and footer, business name has slight variations.

**Why it happens:** Data hardcoded in multiple places without centralization.

**How to avoid:** Create single data/business.json file, reference it everywhere (schema, footer, contact section, header).

**Warning signs:** Visual diff shows different phone formats in different sections.

### Pitfall 2: Using Deprecated/Wrong Schema Types

**What goes wrong:** Using ProfessionalService (deprecated), HomeAndConstructionBusiness (too generic), or LocalBusiness (lacks specificity).

**Why it happens:** Outdated documentation, not checking schema.org hierarchy.

**How to avoid:** Use `Electrician` type specifically. Schema hierarchy: Thing > Organization > LocalBusiness > HomeAndConstructionBusiness > Electrician.

**Warning signs:** Google Rich Results Test warnings about type specificity.

### Pitfall 3: FAQ Schema on Non-FAQ Content

**What goes wrong:** FAQPage schema added but content isn't actually FAQ format, or FAQs aren't visible on page.

**Why it happens:** Misunderstanding Google's guidelines requiring visible, FAQ-format content.

**How to avoid:** Create actual FAQ section with question/answer format, ensure visible on page, use expandable accordions if needed.

**Warning signs:** Rich Results Test shows "no eligible results" for FAQPage.

### Pitfall 4: Missing areaServed Disambiguation

**What goes wrong:** "Clark County" without state/sameAs could match any of 12 US counties named Clark.

**Why it happens:** Not including sameAs links to Wikipedia/Wikidata for disambiguation.

**How to avoid:** Always include state name and sameAs link to Wikipedia article for each county.

**Warning signs:** Schema validates but Google may not correctly associate service area.

### Pitfall 5: Services Not Linked to Provider

**What goes wrong:** Service schemas exist but aren't connected to the business schema.

**Why it happens:** Missing provider property or incorrect @id references.

**How to avoid:** Use @id references consistently (e.g., "https://poloselectronics.com#organization") and reference in Service provider property.

**Warning signs:** Services appear orphaned in schema graph visualization.

## Code Examples

### Complete Electrician Schema (layouts/partials/schema/local-business.html)

```html
{{- $b := .Site.Data.business -}}
{{- $baseURL := .Site.BaseURL -}}

{{- /* Build address object */ -}}
{{- $address := dict
  "@type" "PostalAddress"
  "streetAddress" $b.address.streetAddress
  "addressLocality" $b.address.addressLocality
  "addressRegion" $b.address.addressRegion
  "postalCode" $b.address.postalCode
  "addressCountry" $b.address.addressCountry
-}}

{{- /* Build geo object */ -}}
{{- $geo := dict
  "@type" "GeoCoordinates"
  "latitude" $b.geo.latitude
  "longitude" $b.geo.longitude
-}}

{{- /* Build opening hours */ -}}
{{- $hours := dict
  "@type" "OpeningHoursSpecification"
  "dayOfWeek" $b.openingHours.days
  "opens" $b.openingHours.opens
  "closes" $b.openingHours.closes
-}}

{{- /* Build areaServed array */ -}}
{{- $areas := slice -}}
{{- range $b.areaServed -}}
  {{- $area := dict
    "@type" "AdministrativeArea"
    "name" (printf "%s, %s" .name .state)
    "sameAs" .sameAs
  -}}
  {{- $areas = $areas | append $area -}}
{{- end -}}

{{- /* Build main schema */ -}}
{{- $schema := dict
  "@context" "https://schema.org"
  "@type" $b.type
  "@id" (printf "%s#organization" $baseURL)
  "name" $b.name
  "description" $b.description
  "url" $b.url
  "telephone" $b.telephone
  "email" $b.email
  "address" $address
  "geo" $geo
  "openingHoursSpecification" (slice $hours)
  "priceRange" $b.priceRange
  "foundingDate" $b.foundingDate
  "image" (printf "%simages/logo.png" $baseURL)
  "logo" (printf "%simages/logo.png" $baseURL)
  "areaServed" $areas
  "sameAs" $b.sameAs
-}}

<script type="application/ld+json">
{{- $schema | jsonify | safeJS -}}
</script>
```

### Service Schema Array (layouts/partials/schema/services.html)

```html
{{- $services := .Site.Data.services -}}
{{- $b := .Site.Data.business -}}
{{- $baseURL := .Site.BaseURL -}}

{{- $serviceSchemas := slice -}}
{{- range $services.services -}}
  {{- $service := dict
    "@context" "https://schema.org"
    "@type" "Service"
    "@id" (printf "%s#service-%s" $baseURL .id)
    "name" .name
    "description" .description
    "serviceType" .serviceType
    "provider" (dict "@id" (printf "%s#organization" $baseURL))
    "areaServed" (slice
      (dict "@id" (printf "%s#area-clark-county" $baseURL))
      (dict "@id" (printf "%s#area-cowlitz-county" $baseURL))
      (dict "@id" (printf "%s#area-skamania-county" $baseURL))
    )
  -}}
  {{- $serviceSchemas = $serviceSchemas | append $service -}}
{{- end -}}

{{- range $serviceSchemas -}}
<script type="application/ld+json">
{{- . | jsonify | safeJS -}}
</script>
{{- end -}}
```

### FAQPage Schema (layouts/partials/schema/faq.html)

```html
{{- $faq := .Site.Data.faq -}}
{{- $baseURL := .Site.BaseURL -}}

{{- $questions := slice -}}
{{- range $faq.questions -}}
  {{- $q := dict
    "@type" "Question"
    "name" .question
    "acceptedAnswer" (dict
      "@type" "Answer"
      "text" .answer
    )
  -}}
  {{- $questions = $questions | append $q -}}
{{- end -}}

{{- $schema := dict
  "@context" "https://schema.org"
  "@type" "FAQPage"
  "@id" (printf "%s#faq" $baseURL)
  "mainEntity" $questions
-}}

<script type="application/ld+json">
{{- $schema | jsonify | safeJS -}}
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LocalBusiness generic | Use specific subtypes (Electrician) | Google guidance 2024+ | Better search understanding, may affect rankings |
| Text areaServed | AdministrativeArea with sameAs | Schema.org best practice | Disambiguation for Knowledge Graph |
| ProfessionalService | Service type | Deprecated 2023 | Must use Service instead |
| Microdata/RDFa | JSON-LD | Google preference | Easier implementation, cleaner separation |
| Manual validation | Rich Results Test | Ongoing | Only validation that matters for Google |

**Deprecated/outdated:**
- ProfessionalService: Deprecated, use Service instead
- Relying solely on schema.org validator: Must also pass Google Rich Results Test
- String-based JSON-LD in Hugo: Use dict/jsonify pattern

## FAQ Content Recommendations

Based on research into low-voltage electrical contractor FAQs, recommend 6-8 questions covering:

1. **Service scope:** "What low voltage services does Polos Electronics provide?"
2. **Service area:** "What areas does Polos Electronics serve?"
3. **Licensing:** "Is Polos Electronics licensed and insured?"
4. **Estimates:** "How do I get a free estimate?"
5. **Starlink-specific:** "Can you install Starlink satellite internet?"
6. **Security systems:** "Do you install residential security systems?"
7. **Commercial vs residential:** "Do you serve both residential and commercial customers?"

Keep answers between 40-60 words for optimal AI extraction, per 2026 guidance.

## Open Questions

1. **Google Business Profile NAP alignment**
   - What we know: NAP must match exactly across website and GBP
   - What's unclear: Current GBP listing details not reviewed
   - Recommendation: Include NAP audit task to verify GBP matches new schema

2. **Service pricing in schema**
   - What we know: offers/priceRange can be added to Service schema
   - What's unclear: Whether to include pricing (may vary by project)
   - Recommendation: Omit specific pricing, use priceRange "$$" on main business only

3. **Review aggregation schema for Phase 2**
   - What we know: AggregateRating can be added to LocalBusiness
   - What's unclear: How to handle multi-platform review aggregation
   - Recommendation: Defer to Phase 2 (review aggregation) as designed

## Sources

### Primary (HIGH confidence)

- [Google Search Central - LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) - Required/recommended properties, JSON-LD format
- [Google Search Central - FAQPage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage) - FAQPage requirements, content guidelines
- [Schema.org - Electrician Type](https://schema.org/Electrician) - Type hierarchy (HomeAndConstructionBusiness > Electrician)
- [Schema.org - areaServed Property](https://schema.org/areaServed) - Property definition and accepted types
- [Schema.org - AdministrativeArea](https://schema.org/AdministrativeArea) - County/state representation
- [Hugo JSON-LD Implementation Guide](https://dpb587.me/entries/add-schema-org-json-ld-to-hugo-templates-20251024) - dict/jsonify pattern

### Secondary (MEDIUM confidence)

- [Schema App - Service Schema Guide](https://www.schemaapp.com/schema-markup/services-schema-markup-schema-org-services/) - Service markup best practices
- [Schema App - LocalBusiness Guide](https://www.schemaapp.com/schema-markup/how-to-do-schema-markup-for-local-business/) - Implementation patterns
- [Local Business Schema 2026 Guide](https://zumeirah.com/local-business-schema-markup-2026-ultimate-guide/) - Current year practices
- [Schema Markup 2026](https://almcorp.com/blog/schema-markup-detailed-guide-2026-serp-visibility/) - SERP visibility guidance

### Tertiary (LOW confidence)

- General web search results for FAQ content examples - Used for FAQ recommendations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on schema.org official documentation and Google guidance
- Architecture: HIGH - Hugo patterns verified from multiple technical sources
- Pitfalls: HIGH - Based on Google guidelines and industry best practices
- FAQ content: MEDIUM - Based on general industry patterns, not site-specific research

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (schema.org evolves slowly, 30-day validity appropriate)
