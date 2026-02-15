# Phase 7: Interactive Service Map - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Embed an interactive service-area map on the homepage using an iframe, while keeping the existing static SVG/image map as a reliability fallback. This phase improves exploration/clarity but must not reduce reliability of the Service Area section.

</domain>

<decisions>
## Implementation Decisions

### Embed approach
- Use an embedded iframe (not the paid Google Maps JavaScript API).
- Embed source is Google My Maps (public map) so we can show multiple city markers and a service-area overlay.
- Keep the existing static map (SVG/image) as fallback; the Service Area section must always render.

### Fallback behavior
- Primary display preference: interactive embed when available.
- If the iframe is blocked/unavailable (network, CSP, third-party blocked), fall back automatically to the static SVG/image map.
- Provide a clear "Open in Google Maps" link as an escape hatch.

### Content expectations (map)
- My Maps should include key city markers (as discussed previously): Vancouver, Battle Ground, Kelso, Olympia, Seattle, Bellingham, Yakima, Spokane, Walla Walla, Kennewick.
- Battle Ground is visually emphasized as the home base (marker style handled in My Maps).

### Claude's Discretion
- Exact iframe sizing/aspect ratio, lazy-loading, and placeholder styling.
- Where to store the embed URL in site config/data (as long as it is editable and validated in CI).
- Exact copy for the "Open in Google Maps" link label and placement.

</decisions>

<specifics>
## Specific Ideas

- Interactive map should feel like an enhancement; it must not replace reliability fallback.
- Use My Maps because it supports multiple pins and overlays without requiring paid JS API implementation.

</specifics>

<deferred>
## Deferred Ideas

- Full custom overlay rendering, geofencing, or address lookup inside the site (would require additional APIs/logic) - future phase.

</deferred>

---

*Phase: 07-interactive-service-map*
*Context gathered: 2026-02-14*
