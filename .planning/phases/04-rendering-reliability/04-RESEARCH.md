# Phase 4: Rendering Reliability - Research

**Researched:** 2026-02-14
**Domain:** Hugo deterministic rendering, fallback UX patterns, stale-data signaling
**Confidence:** HIGH

## Summary

Phase 4 should make the homepage deterministic: Reviews and Service Area must always render, regardless of ingestion emptiness, stale timestamps, or primary map-image failure. Current templates already render section containers, but review cards can collapse to an empty-state paragraph and map rendering depends on a single image URL. We need explicit fallback data, predictable section-level view models, and graceful map fallback behavior that preserves continuity.

The strongest approach is to keep all reliability logic server-rendered in Hugo templates/partials and keep browser JavaScript limited to image-failure presentation toggles. This keeps behavior identical across local and production builds and avoids client-only divergence.

**Primary recommendation:** Introduce a reliability-oriented reviews view model (live + fallback + freshness metadata), add deterministic rendering partials for reviews and service-area map context, and style metadata as low-emphasis status text rather than alarm copy.

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Hugo templates + partials | 0.135.0 | Deterministic server-side section rendering | Already the project runtime; avoids JS drift |
| Hugo data files (`data/*.json`) | N/A | Fallback content + freshness fields | Native, auditable source of truth |
| Existing custom CSS + minimal JS | N/A | Seamless fallback presentation | Keeps established visual system |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `time.AsTime` / `time.Now` | Freshness computation in template | Stale indicator for reviews |
| `<img onerror>` failover | Primary map asset fallback behavior | Runtime image load failure |
| Hugo `default`, `with`, `len` | Fail-open section rendering | Avoiding conditional disappearance |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|-----------|-----------|----------|
| Template freshness calc | Precomputed stale flag in CI | Faster render but introduces pipeline coupling early |
| Inline map fallback HTML | Build-time generated fallback image variants | Better fidelity, more complexity for this phase |
| Section-level deterministic partials | Keep logic inline in `index.html` | Faster initially, harder to audit and test later |

## Architecture Patterns

### Pattern 1: Reviews Reliability View Model

**What:** Build a single template variable that always resolves to displayable review cards.
**When to use:** Live review array may be empty, stale, or malformed.
**Shape recommendation:**

```json
{
  "reviews": [],
  "fallbackReviews": [
    {
      "platform": "google",
      "author": "Customer",
      "rating": 5,
      "text": "...",
      "date": "2025-12-01"
    }
  ],
  "lastUpdated": "2026-02-14T00:00:00Z",
  "staleAfterDays": 45
}
```

Render order:
1. Use `reviews` when non-empty.
2. Else use `fallbackReviews`.
3. Always keep attribution badges/source links.

### Pattern 2: Low-Emphasis Freshness Metadata

**What:** Show "Updated <date>" and optional "Refresh in progress" style stale hint.
**When to use:** Requirement REND-03.

Implementation guidance:
- Always show updated timestamp if parseable.
- Show stale label only when age > `staleAfterDays`.
- Keep tone neutral and evergreen (no outage language).

### Pattern 3: Service-Area Map Fallback Chain

**What:** Keep service-area list and context visible first, then map media panel with image fallback.
**When to use:** Missing/invalid primary map asset.

Recommended chain:
1. Primary map image URL (`map.url`).
2. Secondary fallback URL (`map.fallbackUrl`) if provided.
3. In-panel textual map context block if both fail.

## Pitfalls to Avoid

1. **Section disappearance via `if` wrappers**
   - Keep section shells always rendered; only branch inside content blocks.
2. **Replacing real fallback reviews with generic placeholder copy**
   - Phase context requires last-known authentic review content.
3. **Harsh warning language for stale data**
   - Keep trust-preserving, low-emphasis messaging.
4. **Map-only service-area communication**
   - Service-area list must carry context even when image fails.
5. **Template-only assumptions about optional fields**
   - Use `default`/`with` guards for platform metadata and timestamps.

## Implementation Notes for This Repo

- `layouts/index.html` currently has review-card rendering and a reviews empty-state paragraph; phase 4 should replace the empty-state branch with deterministic card fallback behavior.
- `layouts/index.html` currently renders service-area list and single map image; phase 4 should add fallback map context handling while preserving current section ordering intent (list context first).
- `data/reviews.json` currently has empty `reviews` and `lastUpdated`; it should gain explicit fallback review objects and stale policy metadata.
- `data/service_area.json` should gain fallback map metadata fields consumed by template logic.

## Sources

### Primary (HIGH confidence)
- Hugo data sources and templating functions: https://gohugo.io/content-management/data-sources/
- Hugo time functions: https://gohugo.io/functions/time/
- Project-local files: `layouts/index.html`, `data/reviews.json`, `data/service_area.json`, `assets/css/custom.css`

### Secondary (MEDIUM confidence)
- Existing internal pitfalls and roadmap notes in `.planning/research/SUMMARY.md` and `.planning/research/PITFALLS.md`

## Metadata

**Research date:** 2026-02-14
**Valid until:** 2026-03-14

---

## Recommendations for Claude's Discretion Areas

### Fallback review count
- Show 3 fallback review cards to preserve section density without visual overload.

### Freshness label placement
- Place under "What Our Customers Say" heading as muted metadata, before carousel.

### Fallback state visuals
- Keep same card/map containers in all states; only swap content internals to avoid layout jumps.
