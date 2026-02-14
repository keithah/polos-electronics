# Phase 2: Review Aggregation - Research

**Researched:** 2026-02-14
**Domain:** Multi-platform review aggregation, API integration, TOS compliance
**Confidence:** MEDIUM (APIs verified, scraping approaches vary by platform)

## Summary

This phase involves fetching and displaying customer reviews from four platforms: Google Business Profile, Yelp, HomeAdvisor, and Nextdoor. Each platform has different API availability, TOS requirements, and technical constraints.

Google Places API provides the most straightforward access but limits results to 5 reviews maximum. Yelp Fusion API returns only 3 review excerpts (160 characters each) and has strict display requirements including mandatory attribution badges. HomeAdvisor and Nextdoor lack public APIs, requiring either manual curation or third-party scraping services.

The existing GitHub Actions workflow fetches Google reviews daily. This needs modification for monthly frequency and extension to handle multiple platforms with normalized data structure. Yelp's 24-hour caching restriction conflicts with monthly updates, but storing business IDs indefinitely is permitted.

**Primary recommendation:** Use Google Places API for Google reviews (5 max), Yelp Fusion API for Yelp excerpts with strict TOS compliance, and manual curation for HomeAdvisor/Nextdoor reviews in `data/reviews.json`.

## Standard Stack

### Core (Already in Place)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| GitHub Actions | N/A | Automated review fetching | Already configured in repo |
| Hugo data files | N/A | Store reviews in `data/reviews.json` | Native Hugo pattern |
| curl + jq | Pre-installed on runners | API calls and JSON processing | Standard GitHub Actions tooling |

### APIs for Review Fetching
| API | Type | Reviews Available | Key Limitation |
|-----|------|-------------------|----------------|
| Google Places API | REST | Up to 5 "most relevant" | No pagination, no control over which reviews |
| Yelp Fusion API | REST | 3 excerpts (160 chars each) | Requires Enhanced/Premium plan; strict TOS |
| Google Business Profile API | REST (OAuth) | All reviews (paginated) | Requires owner verification + OAuth setup |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Google Places API | Google Business Profile API | Full review access but requires OAuth 2.0 and owner verification |
| Manual curation for HomeAdvisor | Third-party scraping APIs | Paid services (Datashake, Outscraper); TOS compliance risk |
| Yelp API | Yelp Review Badges widget | Free embedded widget but less control over styling |

## Architecture Patterns

### Recommended Data Structure

Per CONTEXT.md decision: flat array in `data/reviews.json` with platform field.

```json
{
  "reviews": [
    {
      "platform": "google",
      "author": "John Smith",
      "rating": 5,
      "text": "Full review text from Google...",
      "date": "2026-01-15",
      "relativeTime": "a month ago",
      "profilePhoto": "https://...",
      "profileUrl": "https://maps.google.com/..."
    },
    {
      "platform": "yelp",
      "author": "Jane Doe",
      "rating": 5,
      "text": "Review excerpt (160 chars max)...",
      "date": "2026-01-10",
      "profileUrl": "https://www.yelp.com/user_details?userid=...",
      "reviewUrl": "https://www.yelp.com/biz/polos-electronics-battle-ground"
    },
    {
      "platform": "homeadvisor",
      "author": "Bob Wilson",
      "rating": 5,
      "text": "Manually curated review text...",
      "date": "2025-12-01",
      "profileUrl": null,
      "reviewUrl": "https://www.homeadvisor.com/rated.PolosElectronicsInc.7529229.html"
    },
    {
      "platform": "nextdoor",
      "author": "Sarah L.",
      "rating": null,
      "text": "Recommendation text...",
      "date": "2025-11-15",
      "profileUrl": null,
      "reviewUrl": "https://nextdoor.com/page/polos-electronics-battle-ground-wa"
    }
  ],
  "platforms": {
    "google": {
      "businessName": "Polos Electronics",
      "profileUrl": "https://share.google/D3mexUt7VZzi7gvWZ",
      "overallRating": 4.8,
      "totalReviews": 45
    },
    "yelp": {
      "businessName": "Polos Electronics",
      "profileUrl": "https://www.yelp.com/biz/polos-electronics-battle-ground",
      "overallRating": 5.0,
      "totalReviews": 12
    },
    "homeadvisor": {
      "businessName": "Polos Electronics Inc.",
      "profileUrl": "https://www.homeadvisor.com/rated.PolosElectronicsInc.7529229.html"
    },
    "nextdoor": {
      "businessName": "Polos Electronics",
      "profileUrl": "https://nextdoor.com/page/polos-electronics-battle-ground-wa"
    }
  },
  "lastUpdated": "2026-02-14T00:00:00Z"
}
```

### Hugo Template Pattern for Mixed Reviews

```html
{{ range .Site.Data.reviews.reviews }}
  {{ if ge .rating 4 }}
  <div class="review-card" data-platform="{{ .platform }}">
    <div class="review-header">
      <img src="{{ .profilePhoto | default "/images/default-avatar.png" }}"
           alt="{{ .author }}" class="review-avatar">
      <div class="review-meta">
        <p class="review-author">{{ .author }}</p>
        <p class="review-time">{{ .relativeTime | default .date }}</p>
      </div>
      <img src="/images/platforms/{{ .platform }}-logo.svg"
           alt="{{ .platform }}" class="platform-badge">
    </div>
    <div class="review-stars">{{ partial "stars" .rating }}</div>
    <div class="review-text">
      <p class="review-excerpt">{{ .text | truncate 200 }}</p>
      {{ if gt (len .text) 200 }}
      <button class="read-more-btn" aria-expanded="false">Read more</button>
      <p class="review-full" hidden>{{ .text }}</p>
      {{ end }}
    </div>
    <a href="{{ .reviewUrl }}" target="_blank" rel="noopener"
       class="review-source-link">View on {{ .platform | title }}</a>
  </div>
  {{ end }}
{{ end }}
```

### GitHub Actions Workflow Pattern (Monthly)

```yaml
name: Fetch Reviews
on:
  schedule:
    - cron: '0 0 1 * *'  # First day of each month at midnight UTC
  workflow_dispatch:

jobs:
  fetch-reviews:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Fetch Google Reviews
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          GOOGLE_PLACE_ID: ${{ secrets.GOOGLE_PLACE_ID }}
        run: |
          # Fetch and filter 4-5 star reviews only
          curl -s "https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${GOOGLE_API_KEY}" \
            | jq '[.result.reviews[]? | select(.rating >= 4) | {
                platform: "google",
                author: .author_name,
                rating: .rating,
                text: .text,
                relativeTime: .relative_time_description,
                profilePhoto: .profile_photo_url
              }]' > /tmp/google-reviews.json

      - name: Merge reviews into data/reviews.json
        run: |
          # Merge with existing manual reviews (homeadvisor, nextdoor)
          # Implementation: read existing, filter out google, add new google
          jq -s '.[0] + .[1]' ...
```

### Anti-Patterns to Avoid

- **Caching Yelp data beyond 24 hours**: Violates TOS. Store business IDs only, fetch fresh on each build.
- **Blending Yelp ratings with other platforms**: Yelp TOS prohibits aggregating ratings from multiple sources. Display Yelp content standalone.
- **Scraping without TOS review**: Each platform has different scraping policies. Verify before implementing.
- **Storing full Yelp reviews**: API only returns 160-char excerpts; don't imply you have full text.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Platform logo badges | Custom images | Official brand assets | Yelp requires specific badges; Google has brand guidelines |
| Star rating display | Custom star logic | Unicode stars or SVG sprites | Consistent rendering, accessibility |
| Review text truncation | Manual substring | Hugo `truncate` function | Handles word boundaries, ellipsis |
| JSON merging in shell | Complex bash scripts | jq slurp and merge | jq is pre-installed, handles edge cases |
| OAuth token management | Manual token handling | GitHub Actions secrets | Secure, automatic rotation |

**Key insight:** Review platform APIs have strict TOS requirements. Using official tools (badges, widgets) ensures compliance and reduces legal risk.

## Common Pitfalls

### Pitfall 1: Yelp TOS Non-Compliance
**What goes wrong:** Displaying Yelp content without proper attribution, caching beyond 24 hours, or blending with other platforms' ratings.
**Why it happens:** Yelp's requirements are stricter than other platforms; developers assume all review APIs work the same.
**How to avoid:**
- Always display "Find us on Yelp" badge or logo
- Link star ratings to Yelp business page
- Never combine Yelp rating with aggregate scores
- Re-fetch on each build (monthly is acceptable for display, but content should be treated as ephemeral)
**Warning signs:** Missing Yelp logo, aggregated "overall rating" from multiple sources.

### Pitfall 2: Google Places API 5-Review Limit
**What goes wrong:** Expecting to get all reviews from Google Places API.
**Why it happens:** Google Places API returns maximum 5 "most relevant" reviews with no pagination.
**How to avoid:**
- Accept the 5-review limit for Places API
- OR upgrade to Google Business Profile API (requires OAuth, owner verification)
- Filter to 4-5 star reviews as CONTEXT.md specifies
**Warning signs:** Code trying to paginate Places API reviews, missing reviews that exist on Google.

### Pitfall 3: Nextdoor Authentication Requirements
**What goes wrong:** Attempting to scrape Nextdoor without authentication.
**Why it happens:** Nextdoor requires login to view business information; scrapers fail silently.
**How to avoid:**
- Use manual curation for Nextdoor reviews
- Don't invest in scraping automation for Nextdoor
**Warning signs:** Empty Nextdoor review arrays, authentication errors in logs.

### Pitfall 4: Reviews Without Star Ratings
**What goes wrong:** Template breaks when rendering reviews without numeric ratings (Nextdoor uses recommendations, not stars).
**Why it happens:** Assuming all platforms use 1-5 star ratings.
**How to avoid:**
- Check for null/missing rating in templates
- Use "Recommended" badge instead of stars for Nextdoor
- Handle in CSS: `.review-card[data-platform="nextdoor"] .review-stars { display: none; }`
**Warning signs:** NaN or undefined in star rating display.

### Pitfall 5: Broken Profile Photos
**What goes wrong:** Reviewer profile photos return 403 or show broken images.
**Why it happens:** Google profile photo URLs can expire; Yelp URLs require proper referrer.
**How to avoid:**
- Provide fallback default avatar
- Use CSS object-fit for graceful degradation
- Consider not relying on profile photos (privacy concerns)
**Warning signs:** Console 403 errors, broken image icons.

## Code Examples

### Google Places API Fetch with jq (Verified)
```bash
# Source: Existing fetch-reviews.yml + Google Places API docs
curl -s "https://maps.googleapis.com/maps/api/place/details/json?\
place_id=${GOOGLE_PLACE_ID}&\
fields=name,rating,reviews,user_ratings_total&\
key=${GOOGLE_API_KEY}" | jq '.result | {
  name: .name,
  rating: .rating,
  total_ratings: .user_ratings_total,
  reviews: [.reviews[]? | select(.rating >= 4) | {
    platform: "google",
    author: .author_name,
    rating: .rating,
    text: .text,
    relativeTime: .relative_time_description,
    profilePhoto: .profile_photo_url
  }]
}'
```

### Yelp Business Reviews API Call
```bash
# Source: Yelp Fusion API docs
# Note: Returns up to 3 review excerpts (~160 chars each)
# Requires Enhanced or Premium plan
curl -s -H "Authorization: Bearer ${YELP_API_KEY}" \
  "https://api.yelp.com/v3/businesses/polos-electronics-battle-ground/reviews" \
  | jq '.reviews | map({
    platform: "yelp",
    author: .user.name,
    rating: .rating,
    text: .text,
    date: .time_created,
    profileUrl: .user.profile_url,
    reviewUrl: .url
  })'
```

### Hugo Template: Read More Toggle (JavaScript)
```javascript
// Expand/collapse review text
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.review-card');
    const excerpt = card.querySelector('.review-excerpt');
    const full = card.querySelector('.review-full');
    const expanded = this.getAttribute('aria-expanded') === 'true';

    excerpt.hidden = !expanded;
    full.hidden = expanded;
    this.textContent = expanded ? 'Read more' : 'Show less';
    this.setAttribute('aria-expanded', !expanded);
  });
});
```

### Platform Badge Styling (CSS)
```css
/* Platform badge on each review card */
.platform-badge {
  width: 24px;
  height: 24px;
  object-fit: contain;
  margin-left: auto;
}

/* Yelp-specific: TOS requires logo to link to yelp.com or business page */
.review-card[data-platform="yelp"] .platform-badge {
  cursor: pointer;
}

/* Nextdoor: No star ratings, show "Recommended" */
.review-card[data-platform="nextdoor"] .review-stars {
  display: none;
}

.review-card[data-platform="nextdoor"]::after {
  content: "Recommended";
  color: #00b246;
  font-weight: 600;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Embed third-party widgets | Fetch via API, render natively | 2020+ | Better performance, styling control |
| Daily review fetching | Monthly fetching (per CONTEXT.md) | N/A | Reduced API costs, acceptable freshness |
| Aggregate ratings across platforms | Display each platform separately | Yelp TOS update | Must show Yelp standalone |
| Self-hosted review schema | No rich results for LocalBusiness reviews | Google 2019 | Self-serving reviews don't get stars in SERP |

**Deprecated/outdated:**
- **Yelp v2 API**: Deprecated, use Fusion API (v3)
- **Google My Business API v3**: Superseded by v4, use v4 endpoints
- **LocalBusiness aggregateRating for SERP stars**: Google stopped showing self-serving review stars in 2019

## Open Questions

1. **Yelp API Plan Access**
   - What we know: Yelp Fusion API reviews endpoint requires Enhanced or Premium plan
   - What's unclear: Does the business already have API access? What plan?
   - Recommendation: Check Yelp developer dashboard; if no access, consider Yelp Review Badges widget as fallback

2. **Google Business Profile API vs Places API**
   - What we know: Places API = 5 reviews max; GBP API = all reviews but requires OAuth
   - What's unclear: Is OAuth setup acceptable complexity for this phase?
   - Recommendation: Start with Places API (already working); document GBP API as future enhancement

3. **HomeAdvisor/Nextdoor Review Freshness**
   - What we know: No APIs available; manual curation required
   - What's unclear: How to maintain freshness of manually curated reviews?
   - Recommendation: Add `lastVerified` field to manual reviews; document review curation process

4. **Yelp 24-Hour Cache Limit vs Monthly Updates**
   - What we know: Yelp TOS says cache content max 24 hours
   - What's unclear: Is displaying month-old Yelp data a TOS violation?
   - Recommendation: Treat Yelp reviews as "ephemeral display" - re-fetch on each Hugo build in CI, not just monthly workflow

## Sources

### Primary (HIGH confidence)
- [Google Places API Place Details](https://developers.google.com/maps/documentation/places/web-service/overview) - Reviews field, 5-review limitation
- [Google Business Profile API Review Data](https://developers.google.com/my-business/content/review-data) - OAuth endpoints, pagination
- [Yelp Brand Center](https://www.yelp.com/brand) - Logo usage, attribution requirements
- [Yelp Fusion API Business Reviews](https://docs.developer.yelp.com/reference/v3_business_reviews) - 3 excerpts, 160 chars

### Secondary (MEDIUM confidence)
- [Yelp Display Requirements](https://terms.yelp.com/developers/display_requirements/) - TOS compliance (WebSearch, redirect blocked WebFetch)
- [Yelp API Terms of Use](https://terms.yelp.com/developers/api_terms/) - 24-hour cache limit
- [Playwright + GitHub Actions scheduling](https://www.marcveens.nl/posts/scheduled-web-scraping-made-easy-using-playwright-with-github-actions) - Workflow patterns

### Tertiary (LOW confidence - WebSearch only)
- HomeAdvisor scraping approaches - Multiple third-party services mentioned but no official API
- Nextdoor scraping approaches - Requires authentication; manual curation recommended
- Web scraping legal considerations - General guidance, varies by jurisdiction

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - APIs documented, existing workflow in place
- Architecture: HIGH - Hugo data patterns well-established, JSON structure verified
- Yelp TOS: MEDIUM - Official docs blocked by 403, relied on WebSearch summaries
- Scraping approaches: LOW - No official docs for HomeAdvisor/Nextdoor APIs

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - APIs stable, TOS may change)

---

## Recommendations for Claude's Discretion Areas

Per CONTEXT.md, the following are Claude's discretion:

### Visual Format Choice
**Recommendation:** Use card-based layout matching existing review section. Cards provide:
- Clear visual separation between reviews
- Space for platform badge in header
- Consistent with site's `.review-card` CSS already in place

### Review Text Truncation
**Recommendation:** First 150-200 characters (approximately 2-3 sentences). Use Hugo `truncate` function with word boundary respect. Add "Read more" button that expands to full text in-place (no modal/overlay).

### Review Sorting
**Recommendation:** Sort by date (newest first) within mixed stream. Rationale:
- Shows freshness to visitors
- Avoids bias toward any single platform
- Alternative: rotate platforms (Google, Yelp, HomeAdvisor, repeat) for visual variety

### Error Handling for API Failures
**Recommendation:**
- Log error to GitHub Actions output
- Continue with existing cached `data/reviews.json` (don't overwrite with empty)
- Add `fetchStatus` field to track last successful fetch per platform
- Site builds successfully even with stale data

### Reviews Without Star Ratings (Nextdoor)
**Recommendation:** Display "Recommended" badge in green (#00b246, Nextdoor brand color) instead of stars. Template should check `{{ if .rating }}` before rendering stars.
