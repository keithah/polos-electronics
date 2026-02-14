# Architecture Research

**Domain:** Reliability hardening for a Hugo static site with build-time data ingestion
**Researched:** 2026-02-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DATA INGESTION LAYER                              │
├────────────────────────────────────────────────────────────────────────────┤
│ fetch-reviews.yml                                                         │
│  1) fetch -> 2) normalize -> 3) validate schema -> 4) write atomically   │
│                                │                                           │
│                                ▼                                           │
│                      data/reviews.json (canonical)                         │
│                      data/reviews.last-good.json (fallback)                │
└────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           BUILD VALIDATION LAYER                          │
├────────────────────────────────────────────────────────────────────────────┤
│ reliability.yml                                                           │
│  - JSON schema checks                                                     │
│  - asset existence checks (map image, platform logos)                     │
│  - Hugo strict build (panic on warnings)                                  │
│  - smoke assertions on generated /public/index.html                       │
└────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                             HUGO RENDER LAYER                             │
├────────────────────────────────────────────────────────────────────────────┤
│ layouts/index.html + reliability partials                                 │
│  - fail-closed for required structure                                     │
│  - fail-open for optional dynamic sections                                │
│  - deterministic asset URLs + fallback markup                             │
└────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOY + VISIBILITY                             │
├────────────────────────────────────────────────────────────────────────────┤
│ hugo.yml deploys only after reliability gate passes                       │
│ GitHub annotations + job summary expose root cause quickly                │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Existing: `fetch-reviews.yml` | Acquire external reviews and update `data/reviews.json` | Keep workflow, but add validation + atomic file swap |
| New: Review contract validator | Enforce required JSON shape before commit | `scripts/validate/reviews-schema.mjs` + JSON Schema |
| Existing: `layouts/index.html` | Render reviews/service area and map content | Move dynamic section logic into partials with explicit guards |
| New: Reliability partials | Centralize fallback rendering behavior | `layouts/partials/reliability/reviews.html`, `map.html` |
| Existing: `hugo.yml` | Build and deploy site | Add `needs: reliability` gate before deploy |
| New: `reliability.yml` CI workflow | Unified pre-deploy gate + visibility | Run schema checks, Hugo strict build, smoke checks, emit summary |

## Recommended Project Structure

```
.github/
├── workflows/
│   ├── fetch-reviews.yml              # Modified: validate + atomic write + summary
│   ├── reliability.yml                # New: required gate for render confidence
│   └── hugo.yml                       # Modified: deploy only after reliability gate
data/
├── reviews.json                       # Canonical dynamic input for templates
├── reviews.last-good.json             # New: fallback snapshot for ingestion failures
└── service_area.json                  # Existing static map/content source
layouts/
├── index.html                         # Modified: include reliability partials
└── partials/reliability/
    ├── reviews.html                   # New: guarded render + fallback states
    └── map.html                       # New: deterministic map asset resolution
scripts/
└── validate/
    ├── reviews-schema.mjs             # New: validate required keys/types
    ├── assets.mjs                     # New: assert required static assets exist
    └── smoke.mjs                      # New: assert built HTML contains target sections
```

### Structure Rationale

- Keep `data/` as single source of truth, but add `last-good` snapshot to preserve renderability when fetches fail.
- Isolate fallback behavior in dedicated partials so reliability logic is not spread across `layouts/index.html`.
- Put all gates in `scripts/validate/` so local and CI checks run identically.

## Architectural Patterns

### Pattern 1: Contract-First Build Inputs

**What:** Treat `data/reviews.json` and `data/service_area.json` as versioned contracts; reject invalid writes before they reach Hugo.
**When to use:** Any build-time data source that can change independently from template code.
**Trade-offs:** Strong reliability and easier debugging, with minor maintenance cost for schemas.

**Example:**
```bash
node scripts/validate/reviews-schema.mjs data/reviews.json
```

### Pattern 2: Dual-Path Rendering (Primary + Fallback)

**What:** Render from primary data when valid; otherwise render deterministic fallback (last-good data or static callout).
**When to use:** Non-critical dynamic sections like social proof and interactive map enhancements.
**Trade-offs:** Slightly more template branching, but avoids silent section disappearance.

**Example:**
```go-html-template
{{ $reviews := .Site.Data.reviews.reviews | default (slice) }}
{{ if gt (len $reviews) 0 }}
  {{ partial "reliability/reviews-cards" . }}
{{ else }}
  <p class="reviews-empty-state">Reviews are temporarily unavailable. Please use platform links below.</p>
{{ end }}
```

### Pattern 3: Fail-Closed CI, Fail-Open UX

**What:** CI blocks deploy on structural errors; UI still has bounded fallback when optional data is missing.
**When to use:** Static sites where broken deploys are worse than stale content.
**Trade-offs:** More up-front checks, but sharply reduced "feature vanished" incidents.

## Data Flow

### Reliability-Hardened Request Flow

```
[External APIs]
    ↓
[fetch-reviews.yml]
    ↓ validate schema
[candidate reviews artifact]
    ↓ pass
[atomic replace data/reviews.json] ----fail----> [keep data/reviews.last-good.json]
    ↓
[reliability.yml gate]
    ↓ (schema + asset + strict Hugo + smoke)
[hugo.yml deploy]
    ↓
[GitHub Pages]
```

### Key Data Flows

1. **Reviews pipeline:** API fetch -> normalize -> schema validate -> write canonical + refresh `last-good` -> Hugo render with guarded partial.
2. **Map pipeline:** `data/service_area.json` + required image assets -> asset validation -> Hugo partial resolves deterministic URL -> static image always renders.
3. **Visibility pipeline:** validators emit `::error`/`::warning` annotations and `GITHUB_STEP_SUMMARY` output for fast diagnosis.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k daily visits | Current static architecture is sufficient; prioritize CI guardrails over infra changes |
| 1k-100k daily visits | Keep same architecture; add more smoke checks and split validation jobs for faster feedback |
| 100k+ daily visits | No major runtime change needed; optimize asset sizes and CI throughput, not server topology |

### Scaling Priorities

1. **First bottleneck:** Data quality drift from upstream APIs; solve with schema versioning and strict validators.
2. **Second bottleneck:** Debug speed in CI; solve with explicit annotations and concise job summaries.

## Anti-Patterns

### Anti-Pattern 1: Directly Writing New API Data to `data/reviews.json`

**What people do:** Overwrite canonical data immediately after fetch.
**Why it's wrong:** A partial API failure can remove renderable content and ship empty sections.
**Do this instead:** Validate candidate payload first; write atomically only on pass, otherwise retain last-good snapshot.

### Anti-Pattern 2: Treating Missing Data as "No Problem"

**What people do:** Let templates quietly render nothing when keys are absent.
**Why it's wrong:** Production appears "successful" while sections disappear.
**Do this instead:** Use Hugo `errorf` for required contract keys and explicit fallback markup for optional content.

### Anti-Pattern 3: Deploying Without Post-Build Assertions

**What people do:** Assume `hugo --minify` success means sections rendered.
**Why it's wrong:** Build can succeed while key sections are missing due to conditionals.
**Do this instead:** Add smoke assertions on generated HTML for `#reviews` and `#service-area` presence.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Places API / Yelp API | Build-time ingestion in `fetch-reviews.yml` | Treat as unreliable upstream; guard with schema checks and fallback snapshot |
| GitHub Actions | Validation and deployment orchestration | Use `schedule`, `workflow_dispatch`, and required checks to enforce gate |
| GitHub Pages | Static artifact host | Deploy only from validated build output |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `fetch-reviews.yml` -> `data/reviews.json` | File contract (`JSON`) | New required checkpoint: schema + atomic swap |
| `data/*.json` -> `layouts/*` | Hugo `.Site.Data` access | Required keys fail build; optional keys use fallback UI |
| `layouts/index.html` -> `partials/reliability/*` | Partial includes | Consolidates fallback behavior into one boundary |
| `reliability.yml` -> `hugo.yml` | Workflow dependency (`needs`) | Prevents deploying a build that passed compile but failed render assertions |

## Suggested Build Order (Dependency-Respecting)

1. **Data contracts first**
   - Add schema validators for `reviews.json` and service-area required keys.
   - No template changes yet; this gives immediate signal quality.

2. **Fallback rendering partials**
   - Add `partials/reliability/reviews.html` and `map.html`.
   - Modify `layouts/index.html` to consume these partials.

3. **CI reliability gate**
   - Add `reliability.yml` with schema, asset, strict Hugo (`--panicOnWarning`), and smoke checks.
   - Publish errors via annotations and job summary.

4. **Deploy orchestration hardening**
   - Update `hugo.yml` to depend on reliability gate.
   - Keep deployment path unchanged otherwise.

5. **Ingestion resilience upgrade**
   - Update `fetch-reviews.yml` to use candidate file + atomic replace + `last-good` preservation.
   - Emit summary of counts and fallback usage.

## Sources

- Hugo data sources (`.Site.Data`, data merge behavior): https://gohugo.io/content-management/data-sources/ (HIGH)
- Hugo `errorf` (fail build from template): https://gohugo.io/functions/fmt/errorf/ (HIGH)
- Hugo `warnf` (warning emission from template): https://gohugo.io/functions/fmt/warnf/ (HIGH)
- Hugo `fileExists` for guard checks: https://gohugo.io/functions/os/fileexists/ (HIGH)
- Hugo `resources.Get` behavior (`nil` when missing): https://gohugo.io/functions/resources/get/ (HIGH)
- GitHub Actions workflow commands (`::error`, annotations, `GITHUB_STEP_SUMMARY`): https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands (HIGH)
- GitHub Actions triggers (`schedule`, `workflow_run`, etc.): https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows (HIGH)

---
*Architecture research for: Polos Electronics reliability hardening milestone (v1.1)*
*Researched: 2026-02-14*
