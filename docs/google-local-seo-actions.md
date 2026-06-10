# Google Local SEO Actions

Use this checklist for the items that must be completed inside Google products after the site changes are deployed.

## Google Business Profile

Profile URL: https://business.google.com/

Use only business details that are true for Polos Electronics. Google's business profile guidelines say the profile should represent the business as it is consistently known in the real world, keep the address or service area accurate, and use the fewest categories needed to describe the core business.

1. Confirm the core NAP details match the website exactly:
   - Business name: Polos Electronics
   - Phone: (360) 687-3543
   - Website: use the tagged GBP website URL below
   - Address: 20810 NE 267th St, Battle Ground, WA 98604
   - Hours: Monday-Friday 9:00 AM-4:00 PM, Saturday-Sunday closed

2. Set the website link to:

   ```text
   https://poloselectronics.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=website
   ```

3. Set service areas to match the website:
   - Clark County, Washington
   - Cowlitz County, Washington
   - Lewis County, Washington
   - Skamania County, Washington

4. Review categories in Google's Business Profile category picker. Pick the smallest accurate set. Do not add categories for services Polos does not actually perform.
   - Start with the exact available category that best matches the core business. The website currently describes Polos as a low voltage electrical contractor.
   - Evaluate secondary categories only if Google's category picker offers an exact match for real services Polos performs, such as security systems, low voltage, telecommunications, networking, or audio/video installation.

5. Add services that match the live service pages:
   - Low voltage contractor
   - Security camera installation
   - Starlink installation
   - Network cabling
   - Access control systems
   - Home theater installation

6. Add photos that prove the entity and work:
   - Logo
   - Exterior or business/location photo if appropriate
   - Team photos
   - Real job photos for cameras, cabling, access control, AV, Starlink, and networking
   - Avoid stock photos

7. Add a short business description based on the site:

   ```text
   Polos Electronics is a locally owned low voltage electrical contractor in Battle Ground, Washington, serving Southwest Washington since 1979. Services include security camera installation, Starlink installation, network cabling, access control, home theater, whole house audio, and wiring cleanup for residential and commercial projects.
   ```

8. Add posts periodically for real work or announcements. Use tagged URLs:

   ```text
   https://poloselectronics.com/services/security-camera-installation-battle-ground-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=post_security_cameras
   https://poloselectronics.com/services/starlink-installation-vancouver-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=post_starlink
   https://poloselectronics.com/services/network-cabling-vancouver-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=post_network_cabling
   https://poloselectronics.com/services/access-control-systems-clark-county-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=post_access_control
   https://poloselectronics.com/services/home-theater-installation-vancouver-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=post_home_theater
   ```

9. Ask happy customers for reviews after completed jobs. Do not offer incentives. Reply to reviews with specific, factual, professional responses.

## Google Search Console

Property URL: https://search.google.com/search-console/

1. Add a Domain property for `poloselectronics.com` if it does not already exist. Domain properties require DNS verification.

2. If DNS verification is not available, add a URL-prefix property for:

   ```text
   https://poloselectronics.com/
   ```

3. If using the HTML meta tag method, paste the token value into `google_site_verification` in `hugo.toml`. Use only the token content value, not the whole meta tag.

4. Submit the sitemap:

   ```text
   https://poloselectronics.com/sitemap.xml
   ```

5. Use URL Inspection after deploy for:
   - `https://poloselectronics.com/`
   - `https://poloselectronics.com/services/`
   - Each service page under `/services/`

6. In URL Inspection, use "Test live URL" first. If the live test is indexable, request indexing for the updated pages. Google notes that requesting the same URL repeatedly does not make crawling faster.

7. Weekly checks:
   - Pages: make sure important URLs are indexed
   - Sitemaps: make sure the sitemap was read successfully
   - Performance: review queries, pages, countries, devices
   - Experience/Core Web Vitals: watch for mobile performance problems
   - Enhancements/structured data: check LocalBusiness, FAQ, and other detected schema

## GA4 And UTM Tracking

The website already has GA4 configured in `hugo.toml`. The site also sends these click events when GA4 is loaded:

- `click_to_call`
- `click_to_email`
- `click_google_business_profile`
- `click_review_profile`
- `click_service_page`

In GA4, mark the lead events as key events/conversions:

- `click_to_call`
- `click_to_email`

Use lowercase UTM values consistently. Do not add UTM parameters to internal links on the website. Use them only on links from Google Business Profile, social posts, citations, email signatures, QR codes, and other off-site placements.

Recommended naming pattern:

```text
utm_source=google
utm_medium=organic
utm_campaign=gbp
utm_content=website
```

Other examples:

```text
https://poloselectronics.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=website
https://poloselectronics.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=appointment#contact
https://poloselectronics.com/services/starlink-installation-vancouver-wa/?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=service_starlink
```

Google's Campaign URL Builder can be used to generate and validate campaign URLs: https://ga-dev-tools.google/campaign-url-builder/

## References

- Google Business Profile guidelines: https://support.google.com/business/answer/3038177
- Google Search Console URL Inspection: https://support.google.com/webmasters/answer/9012289
- Google sitemap submission guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Analytics URL builder guidance: https://support.google.com/analytics/answer/10917952
- Google's generative AI search guidance: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
