# Phase 4: Rendering Reliability - Context

**Gathered:** 2026-02-14
**Status:** Planned

<domain>
## Phase Boundary

Ensure homepage visitors always see both Reviews and Service Area credibility sections, even when live review ingestion or primary map assets are degraded, with rendering behavior that does not disappear or collapse these sections.

</domain>

<decisions>
## Implementation Decisions

### Reviews fallback content
- If live ingestion is empty, show last-known real reviews (not generic placeholder copy).
- Keep per-review source attribution visible at all times.
- Use non-alarmist, evergreen presentation style for fallback reviews.
- Reliability intent is to make reviews actually render consistently; avoid states where section appears broken or missing.

### Map failure fallback
- If primary map asset fails, show the Service Area list first.
- Fallback location context should include the full service-area list on homepage.
- Do not display an outage/unavailable message; present fallback content seamlessly.
- Show both call and contact-form CTAs with fallback service-area context.

### Claude's Discretion
- Number of fallback review items shown before any secondary action.
- Exact placement/wording of required review freshness metadata so it remains low-emphasis and non-disruptive.
- Visual layout details for fallback states, as long as sections remain reliably visible.

</decisions>

<specifics>
## Specific Ideas

- "Reviews are evergreen" tone preference: avoid warning-heavy language.
- "Fix them so they actually work" priority: reliability over decorative handling.
- For map degradation, user preference is seamless continuity rather than explicit outage callout.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 04-rendering-reliability*
*Context gathered: 2026-02-14*
