# Domain Pitfalls: SEO Polish (robots.txt, Canonical URLs, WebP Images)

**Domain:** Hugo static site SEO enhancements
**Researched:** 2026-02-14 (Updated with additional 2026 sources)
**Confidence:** HIGH (verified via Hugo official docs, GitHub issues, community forums, and recent 2026 sources)

---

## Critical Pitfalls

Mistakes that cause SEO damage, broken builds, or require significant rework.

---

### Pitfall 1: robots.txt Template vs Static File Conflict

**Affects:** robots.txt

**What goes wrong:** Site has both `static/robots.txt` AND `enableRobotsTXT = true` in config, causing unpredictable behavior where one overwrites the other or both exist in different environments depending on build order.

**Why it happens:** Hugo documentation shows two methods but doesn't strongly warn against using both. Developers add static/robots.txt first, then later enable template generation without removing the static file, or vice versa.

**Consequences:**
- Different robots.txt content between local dev and production
- Static file may be overwritten during build process
- Template-based robots.txt ignored if static file takes precedence
- Search engines receive inconsistent crawl directives
- CI/CD pipeline may fail to detect the conflict
- Appears unpredictable: sometimes template wins, sometimes static file wins

**Warning signs:**
- `ls static/robots.txt` exists AND `grep enableRobotsTXT hugo.toml` shows true
- Different robots.txt in dev vs production HTML
- Robots.txt changes don't take effect after rebuild
- Build generates robots.txt in unexpected location

**Prevention:**
1. **Choose ONE approach before implementation:**
   - **Option A (Template - Recommended for maintainability):** Set `enableRobotsTXT = true`, create `layouts/robots.txt`, NEVER add `static/robots.txt`
   - **Option B (Static - Simpler for basic needs):** Set `enableRobotsTXT = false`, place file in `static/robots.txt`, no template
2. Add CI check to fail if both exist: `test ! -f static/robots.txt || grep -q "enableRobotsTXT.*false" hugo.toml`
3. Document chosen approach in README/OPERATIONS.md
4. After deployment, verify: `curl https://poloselectronics.com/robots.txt` matches expected content

**Detection:**
- Run `hugo --gc --minify && find public -name "robots.txt"` and verify only one exists at `public/robots.txt`
- Check `hugo.toml` for `enableRobotsTXT` setting
- Search codebase: `find . -name "robots.txt"` (should find only one source)

**Current project state:** No robots.txt exists yet - implement template approach (Option A) to avoid this pitfall.

**Sources:**
- [Hugo robots.txt template documentation](https://gohugo.io/templates/robots/)
- [SOLVED Unable to set robots.txt content - HUGO discourse](https://discourse.gohugo.io/t/solved-unable-to-set-robots-txt-content/2795)
- [Description of robots.txt override - GitHub Issue #8293](https://github.com/gohugoio/hugo/issues/8293)

---

### Pitfall 2: Using .RelPermalink for Canonical URLs (Missing Domain)

**Affects:** Canonical URLs

**What goes wrong:** Developer implements canonical tag as `<link rel="canonical" href="{{ .RelPermalink }}">` which generates relative URLs without the domain (e.g., `/` instead of `https://poloselectronics.com/`).

**Why it happens:** `.RelPermalink` and `.Permalink` look similar, and relative URLs work for most internal links. Developers don't realize canonical URLs MUST be absolute per SEO best practices and Google requirements.

**Consequences:**
- Google Search Console errors: "Missing Domain" or "Invalid canonical URL"
- Canonical tag fails its primary purpose (preventing duplicate content across domains)
- If content is syndicated or mirrored, canonical won't point to authoritative source
- SEO penalty: Search engines may not honor the canonical directive
- Query parameters (?utm_source=facebook) create duplicate URLs without proper canonical handling

**Warning signs:**
- View page source: canonical href starts with `/` not `https://`
- Google Search Console > Settings shows canonical errors
- SEO audit tools flag "relative canonical URL"

**Prevention:**
1. **ALWAYS use `.Permalink` (absolute) for canonical tags:** `<link rel="canonical" href="{{ .Permalink }}">`
2. Never use `.RelPermalink` for canonical tags
3. Add validation in CI: `grep -r "rel=\"canonical\"" layouts/ && ! grep -r "rel=\"canonical\".*RelPermalink" layouts/` (should pass)
4. Test output: `grep "rel=\"canonical\"" public/index.html` should show full `https://poloselectronics.com` URL

**Detection:**
- View page source in browser, check canonical href value
- Run: `grep "rel=\"canonical\"" public/index.html` and verify starts with `https://poloselectronics.com`
- Google Search Console > Settings > Crawl Stats shows canonical errors

**Current project state:** Line 17 of `layouts/index.html` correctly uses `.Permalink` - pitfall already avoided. Maintain this pattern.

**Sources:**
- [Permalink vs RelPermalink - HUGO discourse](https://discourse.gohugo.io/t/permalink-vs-relpermalink/41638)
- [Define Canonical URL in a Hugo Theme - Qameta](https://qameta.com/posts/define-canonical-url-in-a-hugo-theme/)
- [SEO for Hugo websites: All you need to know - Moonbooth](https://moonbooth.com/hugo/seo/)

---

### Pitfall 3: baseURL Mismatch with Custom Domain

**Affects:** Canonical URLs, Open Graph, Sitemap

**What goes wrong:** `hugo.toml` has `baseURL = 'https://keithah.github.io/polos-electronics/'` (GitHub Pages path) but site uses custom domain `https://poloselectronics.com`, causing all absolute URLs (canonical, OG tags, sitemap) to point to wrong domain.

**Why it happens:** Developer sets baseURL during initial GitHub Pages deployment before custom domain configuration. After adding CNAME and custom domain, they forget to update baseURL. Or they use dynamic baseURL from GitHub Actions that includes repository name.

**Consequences:**
- Canonical URLs point to github.io instead of custom domain
- Sitemap.xml lists wrong domain URLs
- Open Graph URLs incorrect (breaks social sharing previews)
- Google indexes wrong domain, splits SEO authority between domains
- Links in RSS feeds point to github.io
- Schema.org structured data contains wrong URLs

**Warning signs:**
- `grep baseURL hugo.toml` shows github.io URL but CNAME file shows custom domain
- Canonical tag in HTML shows github.io URL when accessing via custom domain
- Sitemap XML contains mixed domains
- Google Search Console shows both domains indexed

**Prevention:**
1. Set baseURL to custom domain: `baseURL = 'https://poloselectronics.com'` (NO trailing slash for root domain)
2. **DO NOT use dynamic baseURL from GitHub Actions** (`${{ steps.pages.outputs.base_url }}`) if using custom domain
3. Verify CNAME file in static/ contains only domain: `poloselectronics.com`
4. After baseURL change, rebuild and check all absolute URLs
5. Submit correct sitemap to Google Search Console
6. Test: `grep -r "github.io" public/` should return no results after build

**Detection:**
- Check `hugo.toml`: `grep baseURL hugo.toml`
- Check built canonical: `grep "rel=\"canonical\"" public/index.html`
- Check sitemap: `grep "<loc>" public/sitemap.xml`
- View page source, verify canonical/OG URLs use custom domain only

**Current project state:** `hugo.toml` line 1 correctly shows `baseURL = 'https://poloselectronics.com'` - pitfall already avoided.

**Sources:**
- [Deploying to GitHub, then Custom Domain; what baseurl? - HUGO discourse](https://discourse.gohugo.io/t/deploying-to-github-then-custom-domain-what-baseurl/9638)
- [Problem with baseURL with Github Action - HUGO discourse](https://discourse.gohugo.io/t/problem-with-baseurl-with-github-action/56404)
- [Hugo Base URL with Cloudflare Pages](https://blog.nathanv.me/posts/cloudflare-pages-hugo-baseurl/)

---

### Pitfall 4: Sitemap and robots.txt Disallow Mismatch

**Affects:** robots.txt

**What goes wrong:** robots.txt blocks paths (e.g., `Disallow: /tags/`, `Disallow: /categories/`) but sitemap.xml still includes those URLs, causing Google Search Console errors: "Submitted URL blocked by robots.txt."

**Why it happens:** Developer adds disallow rules to robots.txt but doesn't customize the sitemap template to exclude those same paths. Hugo's default sitemap includes all pages.

**Consequences:**
- Google Search Console reports errors for every blocked URL in sitemap
- Wastes crawl budget on blocked pages
- Appears unprofessional in GSC reporting
- Search engines ignore sitemap entries (defeats sitemap purpose)
- May signal poor technical SEO to search engines

**Warning signs:**
- Google Search Console > Sitemaps shows "Blocked by robots.txt" errors
- robots.txt contains Disallow rules for paths that appear in sitemap.xml
- SEO audit tools flag the inconsistency

**Prevention:**
1. **Rule:** Any path in robots.txt Disallow MUST be excluded from sitemap
2. **For this single-page site:** This is NOT a concern - no taxonomy pages to block
3. For multi-page sites:
   - If blocking taxonomies in robots.txt: `Disallow: /tags/` → Must also customize sitemap template
   - Better: Use Hugo's `disableKinds = ["taxonomy", "term"]` to prevent generation entirely
4. After robots.txt changes, verify alignment: Compare `grep "Disallow:" public/robots.txt` vs `grep "<loc>" public/sitemap.xml`

**Detection:**
- Compare robots.txt and sitemap.xml after build
- Google Search Console > Sitemaps shows "Blocked by robots.txt" errors
- Test before deploying: Extract blocked paths from robots.txt and verify not in sitemap

**Current project state:** Single-page site with `disableKinds = ["taxonomy", "term"]` in hugo.toml (line 6) - robots.txt can be simple with no Disallow rules needed.

**Sources:**
- [Hugo Robots and Sitemaps - Tangent Technologies](https://tangenttechnologies.ca/blog/hugo-robots-and-sitemaps/)
- [Custom Robots.txt and sitemap.xml Templates - HUGO discourse](https://discourse.gohugo.io/t/custom-robots-txt-and-sitemap-xml-templates/11869)
- [Robots.txt should link to sitemap by default - GitHub Issue #4678](https://github.com/gohugoio/hugo/issues/4678)

---

### Pitfall 5: WebP Color Profile Corruption (sRGB Images)

**Affects:** WebP Images

**What goes wrong:** Hugo processes sRGB WebP source images and outputs WebP files without embedded color profile, causing images to appear faded/washed out in browsers. Colors look desaturated, grays appear shifted toward brown/green, whites look yellowish.

**Why it happens:** Hugo uses different libraries for WebP vs other formats. When reading WebP for resizing/processing, it strips the color profile but doesn't re-embed sRGB on output. This is a known Hugo bug affecting WebP-to-WebP conversions.

**Consequences:**
- Images look correct in design tools but faded on website
- Color inconsistency across different image formats
- Unprofessional appearance damages brand perception
- Team photos look washed out or "off"
- Brand colors (like red #fe3a46) appear incorrect
- User trust issues (looks like low-quality site)
- Difficult to debug (images "work" but look wrong)

**Warning signs:**
- Side-by-side comparison shows processed WebP looks desaturated vs original
- Images appear unnaturally pale or washed out only on website, not in editor
- Grays appear shifted, whites look slightly yellow
- Source images are `.webp` in `static/images/` directory
- Color profile check shows missing profile: `identify -verbose public/images/hero-image.webp | grep -i profile`

**Prevention:**
1. **DO NOT use WebP as source format** - Use JPEG/PNG originals, convert to WebP in Hugo
2. If must use WebP sources, convert to JPEG first: `for f in *.webp; do convert "$f" "${f%.webp}.jpg"; done`
3. Test color accuracy: View processed images in Chrome, Firefox, Safari
4. Use Hugo v0.155.1+ which includes WebP color profile fixes (check: `hugo version`)
5. Always keep JPEG/PNG masters, generate WebP at build time only
6. Set explicit imaging configuration in hugo.toml (may help with color accuracy)

**Detection:**
- Visual inspection: Compare source image to built output in browser
- Check for color profile: `identify -verbose public/images/hero-image.webp | grep -i profile`
- If missing or shows "none", color corruption likely

**Current project state:** All images currently JPEG/PNG in `static/images/` - maintain this as source format, convert to WebP as output only.

**Sources:**
- [Dealing with color profiles for hugo and the web - fplanque.com](https://www.fplanque.com/tech/web-dev/hugo-web-color-profiles-and-webp-issues/)
- [Hugo v0.155.1 released - WebP fixes](https://discourse.gohugo.io/t/hugo-v0-155-1-released/56645)
- [Conversion to WebP - HUGO discourse](https://discourse.gohugo.io/t/conversion-to-webp/50347)
- [Colour issue when image processing applied to webp](https://discourse.gohugo.io/t/colour-issue-when-image-processing-applied-to-webp/39521)

---

### Pitfall 6: Images in `/static/` Cannot Be Processed for WebP

**Affects:** WebP Images

**What goes wrong:** Developer places images in `/static/images/` (as this project currently does) and tries to use Hugo's image processing to convert them to WebP. Hugo silently ignores the images or throws errors because `resources.Get` only works with the `/assets/` folder.

**Why it happens:** Hugo has two distinct asset pipelines:
- `/static/` - Files copied verbatim to output (no processing)
- `/assets/` - Files available for Hugo Pipes processing (resize, convert, fingerprint)

Many developers assume all images can be processed regardless of location.

**Consequences:**
- WebP conversion simply doesn't work
- `resources.Get` returns `nil`, causing template errors
- Build may fail with cryptic "resource not found" errors
- Time wasted debugging template issues that are actually file location issues
- Or worse: Build succeeds silently but no WebP files generated

**Warning signs:**
- `resources.Get` returns `nil`
- WebP images not appearing in `/public/` output
- Template errors mentioning "nil pointer" when accessing image properties
- Build logs: "error calling Resize: resource not found"

**Prevention:**
1. **Move images from `/static/images/` to `/assets/images/` before implementing WebP**
2. Update all templates to use `resources.Get` instead of `relURL` for images needing processing
3. Keep `/static/images/` only for images that should NOT be processed (if any)
4. Test locally with `hugo server` after migration, verify `resources.Get` returns non-nil
5. Document in README: "Source images for processing: `/assets/images/`"

**Detection:**
- Check directory structure: `ls assets/images/` vs `ls static/images/`
- Try accessing image: `{{ resources.Get "images/test.jpg" }}` - if nil, wrong location
- Build errors mentioning "resources" or "Resize"

**Current project state:** All images are in `/static/images/` - **migration to `/assets/images/` required** for WebP processing. This is a significant refactor requiring template updates.

**Sources:**
- [Hugo discourse: Difference between asset and static folder](https://discourse.gohugo.io/t/difference-between-asset-and-static-folder/41203)
- [Hugo discourse: Are assets and static folders interchangeable?](https://discourse.gohugo.io/t/are-assets-and-static-folders-interchangeable/36778)
- [Hugo Image Processing documentation](https://gohugo.io/content-management/image-processing/)
- [Perfect Image Processing with Hugo - Ryan Bagley](https://rb.ax/blog/perfect-image-processing-with-hugo/)

---

## Moderate Pitfalls

Mistakes that cause quality issues or technical debt.

---

### Pitfall 7: Hugo Extended Not Installed (WebP Processing Fails)

**Affects:** WebP Images

**What goes wrong:** WebP conversion works locally (developer has Hugo Extended) but fails in CI/CD because the GitHub Actions workflow installs standard Hugo instead of Hugo Extended.

**Why it happens:** Hugo has two editions:
- Standard Hugo: No image processing beyond basic resize
- Hugo Extended: Full image processing including WebP/AVIF conversion, Sass/SCSS

**Consequences:**
- Build fails with errors about unsupported image operations
- Or worse: Build succeeds but WebP images are not generated (silent failure)
- Site deploys without optimized images
- Different behavior local vs CI

**Warning signs:**
- Local `hugo version` shows `+extended` but CI build doesn't
- Build logs mention "unsupported image format" or WebP errors
- Images in production are still JPEG/PNG despite WebP template code
- CI build succeeds but no .webp files in artifact

**Prevention:**
1. Install Hugo Extended locally: `brew install hugo` (Homebrew now defaults to extended)
2. Verify: `hugo version` should show "extended"
3. In CI (GitHub Actions), use extended version in workflow
4. Add build validation step to check output contains .webp files
5. Pin Hugo version in CI to match local development version

**Detection:**
- Run: `hugo version` and check for "extended" in output
- Try converting test image locally
- Check CI logs for Hugo version output
- Verify .webp files exist in built `public/` directory

**Current project state:** The workflow at `.github/workflows/hugo.yml` correctly uses `hugo_extended_${HUGO_VERSION}` - this pitfall is already avoided.

**Sources:**
- [Building a Hugo Theme from Scratch: Best Practices 2026](https://dasroot.net/posts/2026/01/building-hugo-theme-best-practices-2026/)
- [Hugo Extended Version Upgrade Guide](https://www.bongotwisty.blog/hugo_version_upgrade_guide/)
- [peaceiris/actions-hugo GitHub Action](https://github.com/peaceiris/actions-hugo)

---

### Pitfall 8: WebP Build Time Explosion

**Affects:** WebP Images

**What goes wrong:** Converting many images to WebP during every Hugo build increases build time from seconds to minutes, potentially exceeding GitHub Actions timeout (default 2 minutes for Hugo sites, max 10 minutes for Pages).

**Why it happens:** Hugo processes images on every build when using `resources.Get` with image processing. No caching between builds in CI environment by default. Large source images compound the problem.

**Consequences:**
- Slow local development (site rebuild takes minutes)
- CI/CD pipeline timeouts and failures
- Developer productivity loss
- Increased GitHub Actions minutes usage
- May require paid GitHub Actions plan
- Frustration during iterative development

**Warning signs:**
- Build takes >30 seconds for single-page site
- CI logs show most time spent in Hugo build step
- Local `hugo server` slow to start
- GitHub Actions timeout errors
- Build time increases dramatically after adding WebP

**Prevention:**
1. **Enable resource caching** - Hugo caches processed images in `resources/_gen/` (local) and file cache (CI)
2. In GitHub Actions, cache resources directory:
```yaml
- uses: actions/cache@v3
  with:
    path: resources
    key: ${{ runner.os }}-hugo-resources-${{ hashFiles('assets/**') }}
    restore-keys: |
      ${{ runner.os }}-hugo-resources-
```
3. Optimize source images BEFORE conversion (resize to max needed dimensions, e.g., 2000px wide max)
4. Use `quality` parameter judiciously: `{{ $img.Resize "800x webp q85" }}`
5. Consider processing images locally, commit WebP files to repo (avoids build-time processing but less flexible)
6. Monitor build times: Add timing output to CI logs

**Detection:**
- Time local builds: `time hugo --gc --minify`
- Check CI logs for step durations
- Compare build time before/after WebP implementation
- GitHub Actions workflow run time in Actions tab

**Current project state:** Site has 11 images in `static/images/` - moderate count, but caching still recommended.

**Sources:**
- [Build timeout Jpeg vs Webp processing - HUGO discourse](https://discourse.gohugo.io/t/build-timeout-jpeg-vs-webp-processing/32821)
- [Hugo Performance Optimization: Achieving Sub-Second Load Times](https://dasroot.net/posts/2026/01/hugo-performance-optimization-sub-second-load-times/)
- [How to Optimize Hugo Build Time for Large Websites? - HUGO discourse](https://discourse.gohugo.io/t/how-to-optimize-hugo-build-time-for-large-websites/54633/2)

---

### Pitfall 9: WebP Without JPEG Fallback Breaks Older Browsers/Email

**Affects:** WebP Images

**What goes wrong:** Developer converts all images to WebP-only, breaking display for:
- Internet Explorer (still used in some corporate environments)
- Older iOS Safari versions (<14)
- Email clients that don't support WebP
- Social media preview crawlers that may not support WebP

**Why it happens:** WebP has 97%+ browser support in 2026, leading developers to skip fallbacks. But the remaining 3% includes important edge cases.

**Consequences:**
- Broken images for some users (2-4% of visitors)
- OG/Twitter preview images may not display in some contexts
- Email signature images fail in Outlook and other clients
- Screen readers may not announce images properly
- User frustration and site abandonment

**Warning signs:**
- User reports of missing images from specific browsers/devices
- Social media previews show broken image icons
- Email clients show placeholder images
- Network tab in old browser shows only .webp requests (no fallback)

**Prevention:**
1. **Always use HTML `<picture>` element** with WebP source and JPEG/PNG fallback
2. Keep OG image (`og:image`) as JPEG, not WebP
3. Test social media previews after deployment (Facebook, Twitter, LinkedIn)
4. For single-page sites, progressive enhancement pattern:

```html
<picture>
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Description" loading="lazy">
</picture>
```

5. Use Hugo render hook at `layouts/_default/_markup/render-image.html` to automate
6. Generate both WebP and original format in image processing pipeline
7. Test in BrowserStack or similar for legacy browser compatibility

**Detection:**
- View page source: Should see both `<source type="image/webp">` and `<img src=".jpg">`
- Test in Safari 13, Edge 18, iOS 13
- Check network tab: Both .webp and .jpg files should be available
- Social media debuggers (Facebook Sharing Debugger, Twitter Card Validator)

**Current project state:** OG image is `hero-image.jpg` (line 25 in index.html) - **keep this as JPEG** even after adding WebP.

**Sources:**
- [Hugo WebP Images with Fallback - Will Nye](https://www.williamnye.co.uk/hugo-webp-images-with-fallback/)
- [Fallback for browsers that don't support webp - HUGO discourse](https://discourse.gohugo.io/t/fallback-for-browsers-that-dont-support-webp/37661)
- [WebP and AVIF images on a Hugo website - Pawel Grzybek](https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/)
- [Is there a need to offer JPG fallback? - HUGO discourse](https://discourse.gohugo.io/t/is-there-a-need-to-offer-jpg-fallback-for-images/56114)

---

### Pitfall 10: Forgetting Sitemap URL in robots.txt

**Affects:** robots.txt

**What goes wrong:** Custom robots.txt template doesn't include `Sitemap:` directive pointing to sitemap.xml, so search engines may not discover the sitemap automatically.

**Why it happens:** Developer creates custom robots.txt focused on Disallow rules, forgets that sitemap URL should be declared in robots.txt per standard practice.

**Consequences:**
- Search engines may not auto-discover sitemap
- Must manually submit sitemap in Google Search Console (extra step)
- Other search engines (Bing, DuckDuckGo, etc.) may never find sitemap
- Reduced crawl efficiency
- Not a critical SEO issue but poor practice

**Warning signs:**
- robots.txt doesn't contain "Sitemap:" line
- Google Search Console doesn't show sitemap auto-discovered from robots.txt
- Bing Webmaster Tools requires manual sitemap submission

**Prevention:**
1. Include in robots.txt template:
```
User-agent: *
Allow: /

Sitemap: {{ .Site.BaseURL }}/sitemap.xml
```
2. Note: Hugo's default robots.txt template includes sitemap link (as of recent versions)
3. If using custom template, always add sitemap URL
4. Use fully-qualified sitemap URL with baseURL, not relative path
5. Verify after deployment: `curl https://poloselectronics.com/robots.txt | grep Sitemap`

**Detection:**
- View robots.txt in browser: `https://poloselectronics.com/robots.txt`
- Should contain: `Sitemap: https://poloselectronics.com/sitemap.xml`
- Check Google Search Console > Sitemaps for auto-discovery indicator

**Current project state:** No robots.txt exists yet - when implementing template, include sitemap directive.

**Sources:**
- [Robots.txt should link to sitemap by default - GitHub Issue #4678](https://github.com/gohugoio/hugo/issues/4678)
- [ii.com: Hugo and sitemap.txt (& a bit about robots.txt)](https://www.ii.com/hugo-sitemapdottxt/)
- [Hugo robots.txt template documentation](https://gohugo.io/templates/robots/)

---

### Pitfall 11: Default Image Quality (75) Produces Visible Artifacts

**Affects:** WebP Images

**What goes wrong:** WebP images look noticeably worse than original JPEGs because Hugo's default quality setting (75) is too aggressive for photos with fine detail.

**Why it happens:** Hugo defaults to `quality: 75` for lossy compression. This is acceptable for many uses but can produce visible artifacts on:
- Team photos with faces
- Hero images with gradients
- Images with text overlays
- Brand-critical imagery

**Consequences:**
- Professional photos look unprofessional
- Brand perception suffers
- Compression artifacts visible around edges and gradients
- Text in images becomes fuzzy
- May need to regenerate all images after discovering issue

**Warning signs:**
- Side-by-side comparison shows WebP is noticeably worse than JPEG
- Compression artifacts visible around edges and gradients
- Text in images becomes fuzzy
- Team member faces look "blocky"

**Prevention:**
1. Configure `imaging.quality: 85` or higher in `hugo.toml`
2. For critical images (hero, team photos), consider `quality: 90`
3. Test image quality on actual content before deploying
4. Use `resampleFilter: Lanczos` for better resize quality

**Recommended hugo.toml addition:**
```toml
[imaging]
  quality = 85
  resampleFilter = "Lanczos"
  hint = "photo"
```

**Detection:**
- Visual inspection: Compare WebP output to JPEG original
- Look for blocking, banding in gradients
- Test on team photos (faces are sensitive to quality loss)

**Current project state:** No `[imaging]` config in hugo.toml - add with quality: 85 when implementing WebP.

**Sources:**
- [Hugo: Configure imaging](https://gohugo.io/configuration/imaging/)
- [Hugo: Image processing](https://gohugo.io/content-management/image-processing/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

---

### Pitfall 12: robots.txt Formatting Errors Cause Silent Failures

**Affects:** robots.txt

**What goes wrong:** Missing newline after `User-agent: *` or other formatting issues cause robots to ignore subsequent directives entirely.

**Why it happens:** robots.txt is parsed line-by-line with strict formatting requirements. Unlike HTML, crawlers don't "fix" malformed files - they just ignore malformed directives.

**Consequences:**
- Disallow rules silently ignored
- Site crawled in ways you didn't intend
- No error messages - just wrong behavior
- Difficult to debug (file looks correct in editor)

**Warning signs:**
- Google Search Console's robots.txt tester shows different parsing than expected
- Pages being indexed that should be blocked (or vice versa)
- Directives on same line: `User-agent: *Allow: /`

**Prevention:**
1. Use Hugo's template approach (`enableRobotsTXT = true`) for automatic formatting
2. Or use static file with careful formatting:
   - Each directive on its own line
   - Blank line between rule groups
   - No trailing spaces or tabs
   - Unix line endings (LF not CRLF)
3. Always validate with Google Search Console's robots.txt tester after deployment
4. Include fully-qualified sitemap URL
5. Test raw output: `curl https://poloselectronics.com/robots.txt | cat -A` to see hidden characters

**Correct format example:**
```
User-agent: *
Allow: /

Sitemap: https://poloselectronics.com/sitemap.xml
```

**Detection:**
- View raw robots.txt: `curl https://poloselectronics.com/robots.txt`
- Check for missing newlines between directives
- Test in Google Search Console > robots.txt Tester
- Verify file has proper line endings: `cat -A public/robots.txt`

**Sources:**
- [Hugo: robots.txt template](https://gohugo.io/templates/robots/)
- [Google: How Google interprets robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Robots.txt, the essential information - Hugo Scott](https://hugoscott.com/en/faq/robots-txt-the-essential-information/)

---

### Pitfall 13: enableRobotsTXT Ignored After Hugo Upgrade

**Affects:** robots.txt

**What goes wrong:** After upgrading Hugo (especially 0.122 -> 0.123), robots.txt stops being generated even though `enableRobotsTXT = true` is set.

**Why it happens:** Hugo version upgrades occasionally change behavior. Some users reported robots.txt disappearing after version upgrades with no changelog mention (GitHub Issue #12071).

**Consequences:**
- Site deployed without robots.txt
- No immediate SEO harm, but missing sitemap reference
- May confuse aggressive crawlers

**Warning signs:**
- robots.txt 404s after Hugo upgrade
- No robots.txt in `/public/` after build
- Build succeeds but file missing

**Prevention:**
1. After any Hugo upgrade, verify robots.txt exists in `/public/`
2. Add build validation step in CI: `test -f public/robots.txt || exit 1`
3. Consider using static file approach for more predictable behavior
4. Pin Hugo version in CI and local development (use `asdf` or similar)
5. Test locally after upgrades before deploying

**Detection:**
- Check after build: `ls public/robots.txt`
- Test deployed site: `curl -I https://poloselectronics.com/robots.txt` (should be 200, not 404)

**Current project state:** Using Hugo 0.135.0 (relatively recent) - if upgrading, verify robots.txt generation afterward.

**Sources:**
- [GitHub issue: robots.txt disappeared after upgrade to 0.123.0](https://github.com/gohugoio/hugo/issues/12071)

---

### Pitfall 14: Canonical URL Contains Fragment (Invalid for SEO)

**Affects:** Canonical URLs

**What goes wrong:** On a single-page site with anchor navigation (#about, #services, etc.), developers might try to set different canonical URLs for each "section" using fragments. Google ignores URL fragments in canonical tags.

**Why it happens:** Developers think each anchor section should have its own canonical URL to be treated as separate content. This misunderstands how canonicals work.

**Consequences:**
- Google ignores the fragment entirely
- All sections point to the same canonical (the base URL)
- No SEO harm, but wasted effort if trying to differentiate sections
- Misconception about how single-page SEO works

**Warning signs:**
- Attempting to use `.Permalink` with fragments appended
- Expecting Google to index #sections separately
- Canonical tags with #anchors in source code

**Prevention:**
1. Accept that single-page sites have one canonical URL: the base URL
2. Current implementation is correct: `<link rel="canonical" href="{{ .Permalink }}">` outputs `https://poloselectronics.com/`
3. If you need sections indexed separately, they must be separate pages (not anchors)
4. Don't append fragments to canonical URLs
5. Use structured data to indicate different sections (like FAQ schema)

**Detection:**
- Check canonical tag in HTML source for fragments
- Verify understanding: single-page = one canonical

**Current project state:** The existing canonical tag (line 17) correctly uses `.Permalink` without fragments - no changes needed.

**Sources:**
- [Google: How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Moonbooth: SEO for Hugo websites](https://moonbooth.com/hugo/seo/)

---

### Pitfall 15: Metadata Lost During Image Transformation

**Affects:** WebP Images

**What goes wrong:** EXIF data, copyright information, GPS, and other metadata stripped during Hugo's image processing.

**Why it happens:** Hugo explicitly does not preserve metadata during transformation - this is documented behavior but often overlooked.

**Consequences:**
- Copyright/attribution metadata lost
- GPS data stripped (sometimes desirable for privacy)
- Creation dates lost
- EXIF orientation data lost (images may appear rotated incorrectly)

**Warning signs:**
- Image metadata tools show no EXIF data on processed images
- Original image has metadata, processed version doesn't

**Prevention:**
1. Document that processed images lose metadata (expected behavior)
2. If metadata is critical, store separately or use unprocessed images
3. For copyright, add visible watermarks or separate attribution
4. Pre-rotate images before processing (don't rely on EXIF orientation)
5. Consider privacy benefit: GPS stripped automatically

**Detection:**
- Check metadata: `exiftool public/images/hero.webp` vs `exiftool assets/images/hero.jpg`
- Processed images will show minimal metadata

**Current project state:** Not a critical concern for business website; metadata loss acceptable.

**Sources:**
- [Hugo: Image processing - Metadata](https://gohugo.io/content-management/image-processing/)

---

### Pitfall 16: Overly Restrictive robots.txt for Single-Page Site

**Affects:** robots.txt

**What goes wrong:** Developer copies multi-page site robots.txt that blocks `/tags/`, `/categories/`, `/admin/` but single-page site has none of these paths, resulting in unnecessary complexity.

**Why it happens:** Copying templates from other Hugo sites without understanding what's being blocked. Single-page sites have simpler needs.

**Consequences:**
- Confusing robots.txt maintenance
- No functional impact (paths don't exist anyway)
- Makes site appear more complex than it is
- Future confusion when debugging SEO issues

**Warning signs:**
- Multiple Disallow rules on site with only index.html
- Blocking paths that don't exist: `ls public/tags/` returns "not found"

**Prevention:**
1. For single-page sites, minimal robots.txt is sufficient:
```
User-agent: *
Allow: /

Sitemap: https://poloselectronics.com/sitemap.xml
```
2. Only add Disallow rules for actual paths that exist and should be blocked
3. Don't block paths that don't exist in your site
4. Keep it simple

**Detection:**
- Review robots.txt Disallow rules
- Check if blocked paths actually exist: `ls public/` for each blocked path
- Verify sitemap doesn't contain those paths

**Current project state:** Single-page site with `disableKinds = ["taxonomy", "term"]` - no Disallow rules needed in robots.txt.

**Sources:**
- [Hugo Robots and Sitemaps - Tangent Technologies](https://tangenttechnologies.ca/blog/hugo-robots-and-sitemaps/)

---

## Phase-Specific Warnings

For a milestone adding robots.txt, canonical URLs, and WebP images to existing single-page Hugo site on GitHub Pages:

| Feature | Primary Pitfall | Secondary Concern | Mitigation |
|---------|----------------|-------------------|------------|
| **robots.txt** | Template vs static file conflict (Critical #1) | Sitemap misalignment (Critical #4) | Choose template approach; verify no static file; keep simple for single-page |
| **Canonical URLs** | Already implemented correctly | baseURL verification (Critical #3) | Verify hugo.toml baseURL matches custom domain (already correct) |
| **WebP Images** | Images in wrong folder (Critical #6) | Color profile corruption (Critical #5) | Move from `/static/` to `/assets/`; use JPEG/PNG sources only |
| **WebP Images** | Build time explosion (Moderate #8) | Missing fallback (Moderate #9) | Enable resource caching; implement `<picture>` element |

---

## Implementation Order to Avoid Pitfalls

Recommended order based on risk and dependencies:

### 1. Canonical URLs (LOWEST RISK - Already Implemented)
- **Verify** existing implementation at line 17: `<link rel="canonical" href="{{ .Permalink }}">`
- **Verify** baseURL in hugo.toml matches custom domain: `https://poloselectronics.com` (already correct)
- **Test** after deployment: View source, check canonical URL
- **No changes needed** - pitfall already avoided

### 2. robots.txt (MEDIUM RISK - Configuration Conflicts Possible)
- **Choose** template approach (recommended): Set `enableRobotsTXT = true` in hugo.toml
- **Create** `layouts/robots.txt` with minimal content:
```
User-agent: *
Allow: /

Sitemap: {{ .Site.BaseURL }}/sitemap.xml
```
- **Verify** no `static/robots.txt` exists
- **Test** with `hugo --gc --minify` locally, verify `public/robots.txt` generated
- **Deploy** and test with Google Search Console robots.txt Tester
- **Add** CI validation: `test -f public/robots.txt || exit 1`

### 3. WebP Images (HIGHEST RISK - Complex Implementation)
- **Step 1: Verify Hugo Extended** locally and in CI (already using extended)
- **Step 2: Add imaging config** to hugo.toml:
```toml
[imaging]
  quality = 85
  resampleFilter = "Lanczos"
  hint = "photo"
```
- **Step 3: Move images** from `static/images/` to `assets/images/`
  - This affects 11 images
  - Major refactor of templates required
- **Step 4: Update templates** to use `resources.Get` instead of `relURL`
- **Step 5: Implement render hook** at `layouts/_default/_markup/render-image.html` with `<picture>` element for fallback
- **Step 6: Keep OG image** as JPEG (line 25): Don't convert to WebP
- **Step 7: Add resource caching** to GitHub Actions workflow
- **Step 8: Test color accuracy** on team photos across browsers
- **Step 9: Add build validation** for .webp files in output
- **Step 10: Monitor build time** impact

---

## Pre-Implementation Checklist

Before implementing SEO polish features:

### robots.txt
- [ ] Decide: template (`enableRobotsTXT = true`) or static file? **Recommendation: template**
- [ ] Draft minimal rules (no Disallow needed for single-page site)
- [ ] Include sitemap URL in template
- [ ] Verify no `static/robots.txt` exists
- [ ] Plan post-deployment validation with Google Search Console robots.txt Tester
- [ ] Add CI validation step

### Canonical URLs
- [ ] Verify current implementation uses `.Permalink` (not `.RelPermalink`) - **Already correct**
- [ ] Verify baseURL in hugo.toml matches custom domain - **Already correct**
- [ ] Confirm no fragments needed (single-page site = one canonical) - **Correct approach**
- [ ] No changes needed - already avoiding pitfalls

### WebP Images
- [ ] Verify Hugo Extended installed locally: `hugo version | grep extended`
- [ ] Verify CI uses Hugo Extended - **Already correct in workflow**
- [ ] **CRITICAL:** Plan migration from `/static/images/` to `/assets/images/` (11 images)
- [ ] **CRITICAL:** Plan template refactor for all image references
- [ ] Add `[imaging]` config with quality: 85 and resampleFilter: Lanczos
- [ ] Design `<picture>` element pattern with JPEG fallbacks
- [ ] Keep OG image (`og:image`) as JPEG (not WebP)
- [ ] Plan resource caching in GitHub Actions
- [ ] Prepare color accuracy testing procedure
- [ ] Add build validation for .webp files in output
- [ ] Plan build time monitoring

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| robots.txt pitfalls | HIGH | Official Hugo docs + GitHub Issue #8293 confirms static/template conflict; Hugo discourse threads document formatting issues |
| Canonical URL pitfalls | HIGH | Discourse threads + official docs clearly document .Permalink vs .RelPermalink; baseURL issues confirmed in multiple 2026 sources |
| WebP color pitfalls | HIGH | Specific GitHub issue (v0.155.1 release notes) + detailed blog post with workaround from fplanque.com; confirmed bug |
| WebP build time | HIGH | Discourse threads + 2026 performance articles provide benchmarks; Hugo official docs confirm caching approach |
| Browser fallback | HIGH | 2026 browser support data + multiple implementation guides; well-established practice |
| Single-page site specifics | HIGH | Project context (existing site) + Hugo single-page patterns are standard |
| Image location requirements | HIGH | Hugo official docs clearly state assets/ vs static/ distinction; confirmed in multiple discourse threads |

---

## Sources Summary

### Official Hugo Documentation (Highest Authority)
- [Hugo: robots.txt template](https://gohugo.io/templates/robots/)
- [Hugo: Image processing](https://gohugo.io/content-management/image-processing/)
- [Hugo: Configure imaging](https://gohugo.io/configuration/imaging/)
- [Hugo: URL management](https://gohugo.io/content-management/urls/)

### GitHub Issues & Releases (Version-Specific)
- [Description of robots.txt override - Issue #8293](https://github.com/gohugoio/hugo/issues/8293)
- [Robots.txt should link to sitemap by default - Issue #4678](https://github.com/gohugoio/hugo/issues/4678)
- [robots.txt disappeared after upgrade to 0.123.0 - Issue #12071](https://github.com/gohugoio/hugo/issues/12071)
- [Hugo v0.155.1 released - WebP fixes](https://discourse.gohugo.io/t/hugo-v0-155-1-released/56645)

### Hugo Discourse (High-Quality Community, Verified)
- [SOLVED Unable to set robots.txt content](https://discourse.gohugo.io/t/solved-unable-to-set-robots-txt-content/2795)
- [Permalink vs RelPermalink](https://discourse.gohugo.io/t/permalink-vs-relpermalink/41638)
- [Deploying to GitHub, then Custom Domain; what baseurl?](https://discourse.gohugo.io/t/deploying-to-github-then-custom-domain-what-baseurl/9638)
- [Problem with baseURL with Github Action](https://discourse.gohugo.io/t/problem-with-baseurl-with-github-action/56404)
- [Conversion to WebP](https://discourse.gohugo.io/t/conversion-to-webp/50347)
- [Build timeout Jpeg vs Webp processing](https://discourse.gohugo.io/t/build-timeout-jpeg-vs-webp-processing/32821)
- [Fallback for browsers that don't support webp](https://discourse.gohugo.io/t/fallback-for-browsers-that-dont-support-webp/37661)
- [Custom Robots.txt and sitemap.xml Templates](https://discourse.gohugo.io/t/custom-robots-txt-and-sitemap-xml-templates/11869)
- [How to Optimize Hugo Build Time for Large Websites?](https://discourse.gohugo.io/t/how-to-optimize-hugo-build-time-for-large-websites/54633/2)
- [Difference between asset and static folder](https://discourse.gohugo.io/t/difference-between-asset-and-static-folder/41203)
- [Are assets and static folders interchangeable?](https://discourse.gohugo.io/t/are-assets-and-static-folders-interchangeable/36778)
- [Colour issue when image processing applied to webp](https://discourse.gohugo.io/t/colour-issue-when-image-processing-applied-to-webp/39521)

### Technical Articles & Guides (2026, Verified)
- [Building a Hugo Theme from Scratch: Best Practices 2026](https://dasroot.net/posts/2026/01/building-hugo-theme-best-practices-2026/)
- [Hugo Performance Optimization: Achieving Sub-Second Load Times 2026](https://dasroot.net/posts/2026/01/hugo-performance-optimization-sub-second-load-times/)
- [2026 Hugo SEO benchmark data - SALT.agency](https://salt.agency/blog/hugo-seo-benchmark-data/)
- [Dealing with color profiles for hugo and the web - fplanque.com](https://www.fplanque.com/tech/web-dev/hugo-web-color-profiles-and-webp-issues/)
- [Hugo WebP Images with Fallback - Will Nye](https://www.williamnye.co.uk/hugo-webp-images-with-fallback/)
- [WebP and AVIF images on a Hugo website - Pawel Grzybek](https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/)
- [SEO for Hugo websites: All you need to know - Moonbooth](https://moonbooth.com/hugo/seo/)
- [Define Canonical URL in a Hugo Theme - Qameta](https://qameta.com/posts/define-canonical-url-in-a-hugo-theme/)
- [Add a Canonical URL tag to your Hugo site - Tech Titbits](https://techtitbits.com/posts/hugo-canonical-url/)
- [Hugo Robots and Sitemaps - Tangent Technologies](https://tangenttechnologies.ca/blog/hugo-robots-and-sitemaps/)
- [Perfect Image Processing with Hugo - Ryan Bagley](https://rb.ax/blog/perfect-image-processing-with-hugo/)
- [Hugo Base URL with Cloudflare Pages](https://blog.nathanv.me/posts/cloudflare-pages-hugo-baseurl/)

### Google Official Documentation
- [Google: How Google interprets robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Google: How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### SEO Industry Sources
- [KeyCDN: How to Fix Sitemap Contains URLs Blocked by robots.txt](https://www.keycdn.com/support/sitemap-contains-urls-which-are-blocked-by-robots-txt)

---

**Research Methodology:**
- WebSearch queries included "2026" for currency
- Cross-verified findings between official docs, GitHub issues, and discourse threads
- Prioritized pitfalls with multiple independent source confirmations
- Flagged version-specific issues (Hugo v0.155.1 WebP fixes, v0.123 robots.txt regression)
- Analyzed current project state to identify already-avoided pitfalls
- Noted project-specific advantages (single-page = simpler than multi-page pitfalls)
- Verified official Hugo documentation for authoritative guidance

**Last Updated:** 2026-02-14
