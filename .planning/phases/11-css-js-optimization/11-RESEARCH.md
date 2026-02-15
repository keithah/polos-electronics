# Phase 11: CSS/JS Optimization - Research

**Researched:** 2026-02-15
**Domain:** Critical CSS extraction, CSS deferral, render-blocking resource elimination
**Confidence:** HIGH

## Summary

This phase optimizes CSS and JavaScript delivery for the Polos Electronics Hugo site. The core strategy is to: (1) inline critical above-the-fold CSS directly in the HTML head, (2) defer non-critical CSS loading via the preload/swap technique, and (3) ensure no render-blocking JavaScript exists in the document head.

The current CSS file is ~22KB minified (29KB unminified). The critical CSS for header + hero + first-viewport should be extracted and inlined (~8-12KB target). The remaining CSS will be loaded asynchronously using the `rel="preload"` pattern with `onload` swap. Google Fonts already uses `display=swap` but can be further optimized with preconnect hints.

**Primary recommendation:** Split `custom.css` into critical (inline) and non-critical (deferred) portions using Hugo Pipes, with the preload/swap technique for async loading.

## Standard Stack

The established approach for this domain using Hugo's built-in capabilities:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Hugo Pipes | Built-in (v0.155+) | CSS processing, minification, fingerprinting | Native Hugo capability, no external dependencies |
| resources.Minify | Built-in | CSS/JS minification | Integrated with Hugo asset pipeline |
| resources.Fingerprint | Built-in | Cache busting with content hash | Ensures cache invalidation on changes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Critical (npm) | 6.x | Automated critical CSS extraction | Pre-build step if manual extraction is impractical |
| Penthouse (npm) | 2.x | Headless critical CSS generation | Alternative to Critical, uses Puppeteer |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual CSS split | Critical npm tool | Automation vs. build complexity; manual is simpler for single-page site |
| Preload/swap pattern | loadCSS library | Native browser support is sufficient; library adds unnecessary bytes |
| Google Fonts CDN | Self-hosted fonts | Self-hosting offers more control but requires font file management |

**Installation:**
```bash
# No npm packages required for Hugo-native approach
# Optional if using automated critical CSS extraction:
npm install --save-dev critical
```

## Architecture Patterns

### Recommended Project Structure
```
assets/
  css/
    critical.css       # Above-the-fold styles (inlined)
    deferred.css       # Below-the-fold styles (loaded async)
layouts/
  partials/
    head/
      critical-css.html   # Inline critical CSS partial
      deferred-css.html   # Preload/swap pattern partial
```

### Pattern 1: Inline Critical CSS via Hugo Pipes
**What:** Process critical CSS through Hugo Pipes and inline using `.Content | safeCSS`
**When to use:** Always - this is the primary pattern for critical CSS
**Example:**
```hugo
{{/* Source: Hugo Pipes documentation */}}
{{ $critical := resources.Get "css/critical.css" | resources.Minify }}
<style>{{ $critical.Content | safeCSS }}</style>
```

### Pattern 2: Deferred CSS with Preload/Swap
**What:** Load non-critical CSS asynchronously using `rel="preload"` with `onload` handler
**When to use:** For all below-the-fold CSS
**Example:**
```hugo
{{/* Source: web.dev/articles/defer-non-critical-css */}}
{{ $deferred := resources.Get "css/deferred.css" | resources.Minify | resources.Fingerprint "sha256" }}
<link rel="preload" href="{{ $deferred.RelPermalink }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{{ $deferred.RelPermalink }}"></noscript>
```

### Pattern 3: Optimized Google Fonts Loading
**What:** Preconnect to font origins and use display=swap
**When to use:** When using Google Fonts CDN
**Example:**
```html
{{/* Source: sia.codes/posts/making-google-fonts-faster/ */}}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&family=Josefin+Sans:wght@300;400;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&family=Josefin+Sans:wght@300;400;600;700&display=swap"></noscript>
```

### Pattern 4: Non-Blocking Inline JavaScript
**What:** Move all inline JavaScript to end of body, ensure external scripts use async/defer
**When to use:** Always - JavaScript in head blocks rendering
**Example:**
```html
{{/* External scripts already use async - verified in current template */}}
<script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>

{{/* Inline scripts at end of body - no changes needed */}}
<script>
  // All inline JS should remain at end of body (current position is correct)
</script>
```

### Anti-Patterns to Avoid
- **Large inline CSS (>14KB compressed):** Delays HTML transmission; keep critical CSS under 14KB
- **CSS @import in stylesheets:** Creates additional blocking requests; use HTML link tags instead
- **Sync loading of non-critical CSS:** Blocks first paint unnecessarily
- **Font preload without display=swap:** Can cause invisible text (FOIT)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Critical CSS extraction | Manual copy-paste guessing | Structured analysis of above-fold elements | Missing styles causes visible unstyled flash |
| CSS async loading | Custom JavaScript loaders | Preload/swap pattern with noscript fallback | Browser-native, works without JS |
| Cache busting | Query string parameters | Hugo `resources.Fingerprint` | Content-based hashing is more reliable |
| Font loading optimization | Custom font-loading JavaScript | `font-display: swap` + preconnect | Browser handles fallback rendering |

**Key insight:** The preload/swap pattern is now well-supported (all modern browsers) and doesn't require JavaScript libraries. Hugo's built-in asset pipeline handles minification and fingerprinting without external tools.

## Common Pitfalls

### Pitfall 1: Critical CSS Too Large
**What goes wrong:** Inlining >14KB of CSS delays HTML document transmission
**Why it happens:** Including too many selectors or entire component styles
**How to avoid:** Include ONLY styles needed for first viewport: reset, header, hero, buttons, layout primitives
**Warning signs:** HTML document >50KB, slow Time to First Byte

### Pitfall 2: Layout Shift from Font Swap
**What goes wrong:** Text reflows when web fonts load, causing CLS
**Why it happens:** Fallback font metrics don't match web font metrics
**How to avoid:**
- Use system font stack with similar metrics as fallback
- Apply `size-adjust` and `ascent-override` CSS properties (advanced)
- Accept brief FOUT over FOIT for hero/header text
**Warning signs:** Text visibly jumps/reflows in hero section on load

### Pitfall 3: Missing Noscript Fallback
**What goes wrong:** Users with JavaScript disabled see no styles
**Why it happens:** Preload/swap relies on `onload` handler
**How to avoid:** Always include `<noscript><link rel="stylesheet" ...></noscript>` fallback
**Warning signs:** Page renders unstyled in no-JS environment

### Pitfall 4: Fingerprint Breaking Cache
**What goes wrong:** CSS URL changes on every build even without content changes
**Why it happens:** Using timestamp-based versioning or inconsistent build process
**How to avoid:** Use content-based hashing via `resources.Fingerprint "sha256"`
**Warning signs:** Cache miss on every page load despite unchanged CSS

### Pitfall 5: Inline Scripts Blocking Render
**What goes wrong:** Inline `<script>` tags in head delay first paint
**Why it happens:** Browser must parse and execute JS before continuing HTML
**How to avoid:** Move all inline scripts to end of body; use async for external scripts
**Warning signs:** Long "Parse HTML" in DevTools timeline, high Time to First Paint

## Code Examples

Verified patterns from official sources:

### Hugo Critical CSS Inlining
```hugo
{{/* layouts/partials/head/critical-css.html */}}
{{/* Source: gohugo.io/hugo-pipes/introduction/ */}}
{{ $critical := resources.Get "css/critical.css" }}
{{ if hugo.IsProduction }}
  {{ $critical = $critical | resources.Minify }}
{{ end }}
<style>{{ $critical.Content | safeCSS }}</style>
```

### Hugo Deferred CSS with Fingerprinting
```hugo
{{/* layouts/partials/head/deferred-css.html */}}
{{/* Source: gohugo.io/hugo-pipes/fingerprint/ */}}
{{ $deferred := resources.Get "css/deferred.css" | resources.Minify | resources.Fingerprint "sha256" }}
<link rel="preload"
      href="{{ $deferred.RelPermalink }}"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
      integrity="{{ $deferred.Data.Integrity }}"
      crossorigin="anonymous">
<noscript>
  <link rel="stylesheet"
        href="{{ $deferred.RelPermalink }}"
        integrity="{{ $deferred.Data.Integrity }}"
        crossorigin="anonymous">
</noscript>
```

### Optimized Google Fonts (Current Site Fonts)
```html
{{/* Source: web.dev/articles/defer-non-critical-css */}}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload"
      href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&family=Josefin+Sans:wght@300;400;600;700&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&family=Josefin+Sans:wght@300;400;600;700&display=swap">
</noscript>
```

### Critical CSS Scope (What to Include)
```css
/* critical.css - Target ~8-12KB minified */
/* Source: CONTEXT.md decisions */

/* 1. CSS Reset (essential) */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* 2. Base typography + layout primitives */
html { scroll-behavior: smooth; }
body { font-family: 'Roboto Condensed', -apple-system, ...; line-height: 1.6; ... }

/* 3. Fixed header/navigation */
.site-header { position: fixed; top: 0; ... }
.header-top { ... }
.navbar { ... }
.nav-container { ... }
.nav-logo .logo { ... }
.nav-menu { ... }
.nav-phone { ... }
.phone-cta { ... }

/* 4. Hero section */
.site-main { margin-top: 140px; }  /* Header offset */
.hero-section { ... }
.hero-container { ... }
.hero-content { ... }
.hero-title { ... }
.hero-text { ... }
.hero-buttons { ... }
.hero-image { ... }

/* 5. Button styles (used in hero) */
.btn { ... }
.btn-primary { ... }
.btn-secondary { ... }

/* 6. Contact button (header) */
.contact-btn { ... }

/* 7. Mobile-specific critical styles */
@media (max-width: 768px) {
  .header-top { display: none; }
  .site-main { margin-top: 70px; }
  .nav-toggle { display: block; }
  /* ... minimal mobile overrides for header/hero */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| loadCSS library | Native preload/swap | ~2020 | No library needed, browser-native support |
| rel="preload" polyfill | Native browser support | ~2021 | All modern browsers support preload |
| Critical CSS via Grunt/Gulp | Hugo Pipes native | Hugo 0.43+ | No external build tools needed |
| Font loader JS | font-display: swap | ~2019 | Declarative, no JS required |

**Deprecated/outdated:**
- **loadCSS library:** Browser support for preload/swap is now universal in modern browsers
- **rel="subresource":** Replaced by rel="preload" which has broader support
- **JavaScript-based font loading:** `font-display` CSS property is simpler and more reliable

## Open Questions

Things that couldn't be fully resolved:

1. **Exact critical CSS cutoff size**
   - What we know: Target <14KB compressed for TCP initial window
   - What's unclear: Actual compressed size of header+hero CSS won't be known until extraction
   - Recommendation: Extract conservatively, verify with DevTools, iterate if needed

2. **Font-swap layout shift tolerance**
   - What we know: User accepts "close enough" fallback, no jarring reflow
   - What's unclear: Exact system font metrics match for Roboto Condensed / Josefin Sans
   - Recommendation: Test with throttled connection, verify no visible jump in hero text

3. **Google Analytics script optimization**
   - What we know: Currently uses `async` attribute which is correct
   - What's unclear: Whether gtag inline script affects first paint
   - Recommendation: Current placement is acceptable; inline gtag is minimal

## Sources

### Primary (HIGH confidence)
- Hugo Pipes Documentation (gohugo.io/hugo-pipes/) - CSS processing, fingerprinting, minification
- Hugo resources.Fingerprint (gohugo.io/functions/resources/fingerprint/) - Hash algorithms, SRI
- web.dev/articles/defer-non-critical-css - Preload/swap pattern, noscript fallback
- web.dev/articles/extract-critical-css - Critical CSS extraction best practices

### Secondary (MEDIUM confidence)
- [Inline Critical CSS With Hugo Pipes](https://www.rockyourcode.com/inline-critical-css-with-hugo-pipes/) - Hugo-specific implementation
- [Making Google Fonts Faster](https://sia.codes/posts/making-google-fonts-faster/) - Font optimization techniques
- [Critical npm package](https://github.com/addyosmani/critical) - Automated critical CSS extraction

### Tertiary (LOW confidence)
- WebSearch results on font-display and CLS - general guidance, verify with testing
- Critical CSS size budget (14KB) - widely cited but actual impact varies by connection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Hugo Pipes is well-documented and current site already uses it
- Architecture: HIGH - Preload/swap pattern is standardized and widely verified
- Pitfalls: MEDIUM - Some pitfalls are based on general web performance knowledge

**Research date:** 2026-02-15
**Valid until:** 2026-04-15 (60 days - this is stable technology)
