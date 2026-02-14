# Coding Conventions

**Analysis Date:** 2026-02-13

## Naming Patterns

**Files:**
- HTML templates: lowercase with hyphens (e.g., `index.html`)
- CSS files: lowercase with hyphens (e.g., `custom.css`)
- JavaScript files: lowercase with hyphens (e.g., `google-reviews.js`)
- Markdown files: descriptive names with uppercase for docs (e.g., `CLAUDE.md`, `README.md`)
- JSON data files: lowercase with hyphens (e.g., `service-area.json`, `reviews.json`)

**Functions (JavaScript):**
- camelCase for function names: `generateCaptcha()`, `updateCarousel()`, `nextPage()`
- Class names: PascalCase: `GoogleReviews`
- Private/internal methods follow same camelCase pattern
- Descriptive names indicating action/purpose

**Variables:**
- camelCase consistently used: `currentPage`, `cardsPerPage`, `totalPages`, `dotsContainer`
- Prefix 'is' or 'has' for boolean variables: implied but not strictly used (e.g., checking `currentPage === 0`)
- Constants: camelCase with uppercase context (e.g., `this.cacheTime`, `this.cacheKey`)

**CSS Classes:**
- kebab-case (hyphenated) throughout: `.reviews-carousel`, `.carousel-btn`, `.review-card`, `.site-header`, `.section-title`
- BEM-style modifiers: `.carousel-btn.prev`, `.dot.active`, `.nav-toggle.active`
- Semantic naming reflecting purpose: `.hero-section`, `.contact-form-container`, `.mobile-menu`
- No underscores in class names

**Hugo/Template Variables:**
- dotted notation for site parameters: `.Site.Params.phone`, `.Site.Data.reviews`
- camelCase for data fields: `.Site.Params.description`, `.Site.Params.email`

## Code Style

**Formatting:**
- No automated formatter detected (no .prettierrc, eslintrc files)
- 2-space indentation used consistently in HTML, CSS, and JavaScript
- Consistent spacing around operators and after commas
- Semicolons used in JavaScript (not consistently in all cases)

**CSS:**
- Properties alphabetically organized within rule blocks in some sections
- Comments precede related CSS rules
- Color values as hex codes (e.g., `#5a9fd4`, `#fe3a46`, `#ffffff`)
- Measurements in `px` and `rem` units
- Responsive breakpoints documented with media queries

**JavaScript (in HTML):**
- Inline `<script>` tags in HTML template
- Event listeners attached via `addEventListener()` rather than inline handlers
- Vanilla JavaScript (no framework dependencies)
- Comments describe functionality rather than obvious code

**Linting:**
- No linting configuration detected
- No format enforcement in place
- Code review relies on manual inspection

## Import Organization

**Not applicable** - No module system used. This is a static Hugo site with no JavaScript imports/exports.

**Load Order (HTML):**
1. Meta tags (charset, viewport, SEO)
2. Favicon links
3. CSS (compiled assets via Hugo)
4. Google Fonts preconnect
5. Schema.org structured data (ld+json)
6. Google Analytics script
7. Body content
8. Inline scripts at end (smooth scrolling, form handling, carousel)

**Hugo Template Functions:**
- `resources.Get` for asset loading: `{{ $style := resources.Get "css/custom.css" | resources.Minify }}`
- URL generation with `| relURL` and `| absURL` filters
- Conditional rendering with `{{ if }}` blocks
- Range iteration for dynamic data: `{{ range .Site.Data.reviews.reviews }}`

## Error Handling

**JavaScript:**
- Try-catch blocks in `GoogleReviews` class: `try { } catch (error) { console.error(...) }`
- Graceful degradation: When reviews fetch fails, fallback to manual static reviews shown
- Form validation: CAPTCHA check with user alert: `if (userAnswer != correctAnswer) { alert(...) }`
- Silent error logging: Errors logged to console without interrupting user flow
- Null/undefined checks before DOM operations: `if (container) { }` before manipulating elements

**HTTP Requests:**
- Fetch API with `response.ok` check: `if (!response.ok) { throw new Error(...) }`
- CORS handling: Uses proxy service (cors-anywhere.herokuapp.com) to bypass browser CORS restrictions

**Form Processing:**
- Client-side validation before submission
- Hidden fields for Formspree integration: `_subject`, `_next`
- Submit button disabled during submission to prevent double-submit

## Logging

**Framework:** Browser console API (no logging framework)

**Patterns:**
- `console.log()` for informational messages: "Using cached reviews", "No reviews to display"
- `console.error()` for error conditions: "Error fetching Google reviews:", "Error reading cache:"
- Informational messages when features are unavailable: "Reviews container not found"
- No error tracking service integrated (no Sentry, LogRocket, etc.)
- Production console logs remain (not removed in minified build)

## Comments

**When to Comment:**
- Explain non-obvious algorithm logic (e.g., cache expiration timing)
- Document API endpoints and third-party services used
- Mark browser compatibility notes (e.g., CORS workaround)
- Section markers for major functionality blocks

**Examples:**
```javascript
// Check cache first
// Note: Direct CORS requests to Google Places API won't work from browser
// Using a proxy approach
// Cache expired
// Generate new CAPTCHA
// Form will submit normally to Formspree
```

**JSDoc/TSDoc:**
- Used minimally but present: `/** * Google Places API Reviews Integration * ... */`
- Block comments precede class definitions and major functions
- Parameter/return documentation absent (vanilla JS, not TypeScript)

## Function Design

**Size:**
- Functions typically 10-40 lines (small-to-medium)
- Largest function: `updateCarousel()` at ~25 lines (carousel pagination logic)
- Most event handlers: 5-15 lines

**Parameters:**
- Limited parameters (1-3 per function)
- Object properties used for configuration: `GoogleReviews` constructor accepts `config` object with `apiKey`, `placeId`, `maxReviews`
- No destructuring used

**Return Values:**
- Explicit returns with meaningful values
- Null/false returned on error conditions
- Promise returns from async functions: `async fetchReviews()` returns reviews array or null
- Functions modifying DOM state often return undefined (side effects)

**Scope:**
- Single responsibility: `generateCaptcha()` only creates CAPTCHA, `updateCarousel()` only updates display
- Closures used for pagination state: `currentPage`, `totalPages`, `cards` variables in carousel function scope

## Module Design

**Exports:**
- No ES6 module system used
- Class instantiation happens in HTML: `const reviewsWidget = new GoogleReviews(window.GOOGLE_REVIEWS_CONFIG)`
- Global namespace pollution minimized by scoping to page initialization

**Instance Variables (OOP):**
- GoogleReviews class maintains state: `this.apiKey`, `this.placeId`, `this.maxReviews`, `this.cacheKey`, `this.cacheTime`
- Methods operate on instance state

**Barrel Files:**
- Not applicable (no module system)

---

*Convention analysis: 2026-02-13*
