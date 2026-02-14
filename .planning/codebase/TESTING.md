# Testing Patterns

**Analysis Date:** 2026-02-13

## Test Framework

**Test Infrastructure:**
- **No test framework detected** - No Jest, Vitest, Mocha, or Jasmine configuration
- **No test files found** - Repository contains zero `.test.*` or `.spec.*` files
- **No CI test pipeline** - GitHub Actions workflows focus on Hugo build and review fetching only

**Current State:**
- Testing relies entirely on manual browser testing
- No automated test runner or test configuration files present
- No test dependencies in package.json (no package.json exists)

**Manual Testing Command (implied from CLAUDE.md):**
```bash
# Start development server
hugo server
```

## Test File Organization

**Location:**
- No test directory structure (tests/ folder does not exist)
- If tests were to be added, recommended pattern: co-located with source

**Naming Convention (recommended if adding tests):**
- Follow codebase pattern: `google-reviews.test.js` for `static/js/google-reviews.js`
- Test suites would logically group by component/feature

**Structure (hypothetical):**
```
static/js/
├── google-reviews.js
└── google-reviews.test.js       # If tests were added

layouts/
└── partials/                     # Could test template rendering
```

## Test Structure

This codebase has no test examples. However, the code is structured to be testable.

**GoogleReviews Class Design (testable aspects):**
- Constructor accepts configuration object (mockable)
- Methods are isolated with clear inputs/outputs
- Async operations present (fetchReviews uses fetch API)
- Dependency on external API (Google Places) and localStorage

**Would-be test structure:**
```javascript
describe('GoogleReviews', () => {
  describe('constructor', () => {
    test('should initialize with provided config', () => {
      // Constructor takes config object: apiKey, placeId, maxReviews
    });
  });

  describe('fetchReviews()', () => {
    test('should return cached reviews if available and valid', async () => {
      // Tests cache validation logic
      // Checks timestamp comparison: now - timestamp < this.cacheTime
    });

    test('should fetch from API if cache missing or expired', async () => {
      // Tests Google Places API fetch
      // Mocks fetch() response
      // Verifies CORS proxy usage
    });

    test('should handle fetch errors gracefully', async () => {
      // Tests error handling: returns null on failure
      // Logs to console.error()
    });
  });

  describe('getCache()', () => {
    test('should parse cached JSON from localStorage', () => {
      // Tests JSON parsing
      // Tests cache key lookup
    });

    test('should validate cache timestamp', () => {
      // Tests 24-hour expiration logic
      // Checks: now - timestamp < 24 * 60 * 60 * 1000
    });

    test('should return null on localStorage errors', () => {
      // Tests error handling with try-catch
    });
  });

  describe('renderReviews()', () => {
    test('should create review cards with proper HTML', () => {
      // DOM testing: creates elements with correct classes
      // Verifies review-card, review-stars, review-text, review-author
    });

    test('should handle empty reviews gracefully', () => {
      // Returns early without modifying DOM
    });
  });

  describe('renderStars()', () => {
    test('should render 5 stars for rating 5.0', () => {
      // Full stars logic: Math.floor(rating)
      // Half star logic: rating % 1 >= 0.5
      // Empty stars: 5 - Math.ceil(rating)
    });

    test('should handle decimal ratings', () => {
      // Tests half-star rendering (★½)
    });
  });

  describe('timeAgo()', () => {
    test('should format recent timestamps correctly', () => {
      // Tests time interval calculation
      // Tests singular/plural formatting
    });
  });
});
```

## Mocking

**Framework:** Not applicable (no testing framework)

**Testable Patterns in Existing Code:**
- **Global Config:** `window.GOOGLE_REVIEWS_CONFIG` - injectable via script
- **DOM selectors:** Container ID passed as parameter: `init('google-reviews-container')`
- **Fetch API:** Would need to mock `fetch()` globally
- **localStorage:** Would need to mock browser storage API
- **document.getElementById():** DOM targets by ID, mockable with jsdom

**What WOULD Need Mocking (if tests were written):**
- Google Places API responses
- localStorage API (getItem, setItem, removeItem)
- fetch() calls and responses
- document.createElement() and appendChild() for DOM assertions
- Math.random() for CAPTCHA generation

**What SHOULD NOT Mock:**
- Core algorithm logic (cache expiration, rating calculations)
- String formatting (timeAgo intervals, star rendering)
- DOM structure assertions (verify class names, element creation)

## Fixtures and Factories

**Test Data (would be needed if tests added):**
```javascript
// Fixture: Mock Google Places API Response
const mockGooglePlacesResponse = {
  status: 'OK',
  result: {
    name: 'Polos Electronics',
    rating: 4.8,
    reviews: [
      {
        author_name: 'John Doe',
        rating: 5,
        text: 'Great service!',
        time: 1702000000
      },
      // ... more reviews
    ]
  }
};

// Fixture: Mock cached reviews from localStorage
const mockCachedData = {
  reviews: [
    {
      author_name: 'Jane Smith',
      rating: 5,
      text: 'Excellent electrical work',
      time: 1702000000,
      profile_photo: 'https://example.com/photo.jpg'
    }
  ],
  timestamp: Date.now()
};

// Factory: Create GoogleReviews instance with test config
function createGoogleReviewsInstance(overrides = {}) {
  const defaultConfig = {
    apiKey: 'test-api-key',
    placeId: 'ChIJoxxx...',
    maxReviews: 3
  };
  return new GoogleReviews({ ...defaultConfig, ...overrides });
}
```

**Location (would be):**
- `tests/fixtures/google-reviews-data.js` - Shared test data
- `tests/factories/google-reviews-factory.js` - Instance creation helpers

## Coverage

**Requirements:** None enforced

**Current State:**
- Zero test coverage (no tests written)
- Critical functions untested:
  - `GoogleReviews.fetchReviews()` - API integration
  - `GoogleReviews.getCache()` - Cache logic
  - `renderStars()` - Rating display
  - `timeAgo()` - Timestamp formatting
  - Carousel pagination logic (event handlers in HTML)
  - Form CAPTCHA generation
  - Mobile menu toggle

**Risk Areas Without Coverage:**
- Cache expiration edge cases
- API error handling fallbacks
- Fetch failures with CORS proxy
- localStorage quota exceeded scenarios
- Half-star rating display

## Test Types

**Unit Tests (would test):**
- `GoogleReviews` class methods in isolation
- `renderStars()` with various ratings (5, 4.5, 1, 0)
- `timeAgo()` with different timestamps
- Cache validation logic

**Integration Tests (would test):**
- Full `GoogleReviews.init()` flow: fetch → cache → render
- Contact form CAPTCHA generation → validation → submission
- Carousel initialization and pagination state
- Hugo template rendering with mock data (via Hugo test server)

**E2E Tests (not used):**
- No E2E framework detected (no Cypress, Playwright, Selenium)
- Manual browser testing documented in CLAUDE.md: "Chrome/Chromium, Firefox, Safari, Mobile browsers"

## Common Patterns

**Async Testing (would use):**
```javascript
// Example async test structure for GoogleReviews.fetchReviews()
test('should fetch and cache reviews', async () => {
  const reviews = new GoogleReviews(testConfig);

  // Mock fetch response
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockGooglePlacesResponse)
    })
  );

  const result = await reviews.fetchReviews();

  expect(result).toBeDefined();
  expect(result.length).toBeLessThanOrEqual(3);
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('https://maps.googleapis.com')
  );
});
```

**Error Testing (would use):**
```javascript
test('should return null when fetch fails', async () => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error('Network error'))
  );

  const reviews = new GoogleReviews(testConfig);
  const result = await reviews.fetchReviews();

  expect(result).toBeNull();
  expect(global.console.error).toHaveBeenCalledWith(
    'Error fetching Google reviews:',
    expect.any(Error)
  );
});
```

**DOM Testing (would use):**
```javascript
test('should render review cards with stars', () => {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  const reviews = new GoogleReviews(testConfig);
  reviews.renderReviews(mockReviews, 'test-container');

  const cards = document.querySelectorAll('.review-card');
  expect(cards.length).toBe(mockReviews.length);
  expect(cards[0].querySelector('.review-stars')).toBeTruthy();

  document.body.removeChild(container);
});
```

## Current Manual Testing Approach

**Browser Testing (documented in CLAUDE.md):**
- Tested on: Chrome/Chromium, Firefox, Safari, Mobile browsers
- Hugo server provides hot reload: `hugo server`
- Production build: `hugo --gc --minify`

**Testing Gaps:**
- No CAPTCHA verification testing documented
- No cache behavior verification in browser devtools described
- No API error scenario testing documented
- No performance/loading time testing

---

*Testing analysis: 2026-02-13*
