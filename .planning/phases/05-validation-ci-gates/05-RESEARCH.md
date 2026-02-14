# Phase 5: Validation & CI Gates - Research

**Researched:** 2026-02-14
**Domain:** CI/CD validation, JSON contract checking, Hugo build hardening
**Confidence:** HIGH

## Summary

This phase adds validation gates to the existing GitHub Actions pipeline to catch broken data, missing assets, and build issues before deployment. The project already has a foundation: the CI workflow includes basic `jq` validation and post-build smoke checks. This research identifies how to harden these gates to meet the four VALD requirements.

The standard approach uses shell-native tools already present in the workflow: `jq` for JSON schema validation, `test -f` for asset existence checks, Hugo's `--panicOnWarning` flag for strict builds, and `grep` for smoke-testing built output. No additional dependencies or GitHub Actions marketplace actions are needed.

**Primary recommendation:** Enhance the existing CI pipeline inline rather than adding external validation frameworks. Keep it simple with bash, jq, and Hugo flags.

## Standard Stack

The established tools for this validation pattern:

### Core (Already in Pipeline)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| jq | 1.6+ (Ubuntu default) | JSON validation | Native in GitHub runners, -e flag for exit codes |
| bash | 5.x | Script orchestration | Universal, reliable, readable |
| Hugo | 0.135.0 | Static site build | --panicOnWarning for strict mode |
| grep | GNU grep | Content assertion | Fast, simple text matching |

### Supporting (No Installation Needed)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| test -f | File existence | Asset validation gates |
| test -s | Non-empty file | Verify build outputs aren't empty |
| wc -l | Count lines | Verify minimum content thresholds |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jq inline | JSON Schema action | More verbose errors but adds dependency |
| grep assertions | HTML validator action | Full validation but overkill for smoke tests |
| bash script | Node.js validator | Richer logic but unnecessary complexity |

**Installation:** None required. All tools present in `ubuntu-latest` runner.

## Architecture Patterns

### Recommended CI Pipeline Structure

```yaml
jobs:
  build:
    steps:
      # 1. Pre-build: Validate inputs
      - name: Validate data contracts
        run: |
          # reviews.json contract
          jq -e '...' data/reviews.json > /dev/null
          # service_area.json contract
          jq -e '...' data/service_area.json > /dev/null

      # 2. Pre-build: Validate assets exist
      - name: Validate required assets
        run: |
          test -f static/images/service-area-map.svg
          test -f static/images/service-area-map.png

      # 3. Build: Strict Hugo build
      - name: Build with Hugo
        run: hugo --gc --minify --panicOnWarning

      # 4. Post-build: Smoke test output
      - name: Smoke check homepage
        run: |
          test -f public/index.html
          grep -q "What Our Customers Say" public/index.html
          grep -q "service-area-map" public/index.html
```

### Pattern 1: Fail-Fast JSON Validation with jq -e

**What:** Use jq's exit-on-false flag to fail immediately on invalid contracts
**When to use:** Pre-build validation of data files
**Example:**
```bash
# Source: https://jqlang.org/manual/
# -e sets exit status 1 if output is false/null
jq -e '
  (.reviews | type == "array") and
  (.fallbackReviews | type == "array") and
  ((.reviews | length) + (.fallbackReviews | length) >= 9) and
  (.platforms | type == "object") and
  (.lastUpdated | type == "string") and
  (.staleAfterDays | type == "number") and
  (.freshnessLabel | type == "string")
' data/reviews.json > /dev/null
```

### Pattern 2: Strict Hugo Build

**What:** Use --panicOnWarning to halt build on any warning
**When to use:** CI builds where silent failures are unacceptable
**Example:**
```bash
# Source: https://gohugo.io/commands/hugo/
hugo \
  --gc \
  --minify \
  --panicOnWarning \
  --printPathWarnings
```

### Pattern 3: Smoke Test with grep -q

**What:** Silent grep that only sets exit code
**When to use:** Asserting expected content in built files
**Example:**
```bash
# -q: quiet mode (no output, just exit code)
# Must match at least once or fails
grep -q "What Our Customers Say" public/index.html
grep -q "Primary Service Areas" public/index.html
grep -q "service-area-map" public/index.html
```

### Anti-Patterns to Avoid
- **Over-engineering validation:** Don't add JSON Schema libraries for simple contracts
- **Ignoring exit codes:** Always use `set -e` or explicit exit code handling
- **Testing implementation not behavior:** Check for user-visible content, not template internals
- **Missing fallback validation:** Both primary AND fallback data must be validated

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON structure validation | Custom parser | jq with -e flag | Proven, handles edge cases, clear exit codes |
| Build warning detection | Log parsing | Hugo --panicOnWarning | Built-in, officially supported |
| File existence | Complex checks | test -f / test -s | POSIX standard, zero deps |
| Text presence | Regex engine | grep -q | Fast, simple, universal |

**Key insight:** The GitHub Actions runner already has everything needed. Adding external actions increases maintenance burden without benefit for this simple site.

## Common Pitfalls

### Pitfall 1: Silent jq Success on Null

**What goes wrong:** jq returns 0 even when expression evaluates to null
**Why it happens:** By default, jq only fails on parse errors
**How to avoid:** Always use `-e` flag for validation
**Warning signs:** Tests pass but data is actually missing

```bash
# BAD: Returns 0 even if field missing
jq '.missingField' data.json

# GOOD: Returns 1 if result is null/false
jq -e '.missingField' data.json
```

### Pitfall 2: grep Without -q Pollutes Output

**What goes wrong:** Matched lines printed to stdout, cluttering CI logs
**Why it happens:** grep's default behavior is to print matches
**How to avoid:** Use `-q` for assertion-only checks
**Warning signs:** Long CI logs with duplicated content

```bash
# BAD: Prints every matching line
grep "What Our Customers Say" public/index.html

# GOOD: Silent, only sets exit code
grep -q "What Our Customers Say" public/index.html
```

### Pitfall 3: Missing Asset Check Before Build

**What goes wrong:** Hugo build succeeds but references missing images
**Why it happens:** Hugo doesn't validate external assets by default
**How to avoid:** Add explicit asset existence gate before build
**Warning signs:** Deployed site shows broken images

### Pitfall 4: Hardcoded Magic Numbers

**What goes wrong:** Validation threshold doesn't match data contract
**Why it happens:** Review count validated against arbitrary number
**How to avoid:** Validate structure, not exact counts (unless minimum required)
**Warning signs:** Valid data fails validation or invalid data passes

### Pitfall 5: Only Checking index.html Exists

**What goes wrong:** Empty or truncated file passes validation
**Why it happens:** `test -f` only checks existence, not content
**How to avoid:** Combine existence check with content assertions
**Warning signs:** Deployed homepage is blank

## Code Examples

Verified patterns for this project:

### Reviews Data Contract Validation
```bash
# Validates all required fields for VALD-01
jq -e '
  # Required arrays
  (.reviews | type == "array") and
  (.fallbackReviews | type == "array") and

  # Minimum review count (live + fallback)
  ((.reviews | length) + (.fallbackReviews | length) >= 9) and

  # Required objects
  (.platforms | type == "object") and

  # Required metadata fields (REND-03 support)
  (.lastUpdated | type == "string") and
  (.staleAfterDays | type == "number") and
  (.freshnessLabel | type == "string")
' data/reviews.json > /dev/null
```

### Service Area Contract Validation
```bash
# Validates all required fields for VALD-02
jq -e '
  # Required tiers array
  (.tiers | type == "array") and
  (.tiers | length >= 1) and

  # Map configuration
  (.map | type == "object") and
  (.map.url | type == "string") and
  (.map.fallbackUrl | type == "string") and
  (.map.fallbackContext | type == "string")
' data/service_area.json > /dev/null
```

### Asset Existence Validation
```bash
# Validates required map assets for VALD-02
test -f static/images/service-area-map.svg || \
  { echo "ERROR: Missing service-area-map.svg"; exit 1; }
test -f static/images/service-area-map.png || \
  { echo "ERROR: Missing service-area-map.png (fallback)"; exit 1; }
```

### Strict Hugo Build
```bash
# VALD-03: Fail on warnings
hugo \
  --gc \
  --minify \
  --panicOnWarning
```

### Homepage Smoke Check
```bash
# VALD-04: Assert critical sections present
test -f public/index.html || { echo "ERROR: index.html not built"; exit 1; }

# Reviews section present
grep -q "What Our Customers Say" public/index.html || \
  { echo "ERROR: Reviews section missing from homepage"; exit 1; }

# Service area section present
grep -q "Primary Service Areas" public/index.html || \
  { echo "ERROR: Service area section missing from homepage"; exit 1; }

# Map element present
grep -q "service-area-map" public/index.html || \
  { echo "ERROR: Service area map missing from homepage"; exit 1; }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No pre-build validation | jq contract checks | Added in current workflow | Catches bad data before build |
| Hugo warnings ignored | --panicOnWarning | Hugo 0.55+ (2019) | Treats warnings as errors |
| Manual output inspection | grep smoke tests | CI best practice | Automated regression detection |

**Currently in project workflow:**
The existing `hugo.yml` already has:
- Basic jq validation (can be enhanced)
- Post-build smoke checks (can be enhanced)
- Missing: --panicOnWarning flag
- Missing: Asset existence checks

## Existing CI Analysis

### Current Validation Step (lines 39-54 of hugo.yml)
```yaml
- name: Validate reliability inputs
  run: |
    jq -e '
      (.reviews | type == "array") and
      (.fallbackReviews | type == "array") and
      ((.reviews | length) + (.fallbackReviews | length) >= 9) and
      (.platforms | type == "object") and
      (.lastUpdated | type == "string")
    ' data/reviews.json > /dev/null

    jq -e '
      (.tiers | type == "array") and
      (.map.url | type == "string") and
      (.map.fallbackUrl | type == "string") and
      (.map.fallbackContext | type == "string")
    ' data/service_area.json > /dev/null
```

**Gap:** Missing checks for `staleAfterDays` and `freshnessLabel` fields added in Phase 4.

### Current Smoke Check (lines 63-68 of hugo.yml)
```yaml
- name: Smoke check homepage output
  run: |
    test -f public/index.html
    grep -q "What Our Customers Say" public/index.html
    grep -q "Primary Service Areas" public/index.html
    grep -q "service-area-map" public/index.html
```

**Gap:** No asset validation step before build.

### Current Hugo Build (lines 55-62 of hugo.yml)
```yaml
- name: Build with Hugo
  env:
    HUGO_ENVIRONMENT: production
    HUGO_ENV: production
  run: |
    hugo \
      --gc \
      --minify
```

**Gap:** Missing `--panicOnWarning` flag for VALD-03.

## Open Questions

Things that couldn't be fully resolved:

1. **Warning suppression for known issues**
   - What we know: Hugo may warn about legitimate things (unused variables, deprecated features)
   - What's unclear: Are there current warnings that would break build with --panicOnWarning?
   - Recommendation: Run `hugo --panicOnWarning` locally first to identify any warnings to fix

2. **Review count threshold**
   - What we know: Currently validates >= 9 total reviews
   - What's unclear: Is this the right threshold for the business?
   - Recommendation: Keep existing threshold, document as business rule

## Sources

### Primary (HIGH confidence)
- [Hugo commands documentation](https://gohugo.io/commands/hugo/) - --panicOnWarning, --printPathWarnings flags
- [jq 1.8 Manual](https://jqlang.org/manual/) - -e flag behavior, type checking, has()

### Secondary (MEDIUM confidence)
- [Hugo strict mode discussion](https://discourse.gohugo.io/t/static-analysis-for-hugo-sites-with-strict-mode-build-time-safety-against-unintentional-errors/56197) - Community patterns
- [jq validation in bash](https://pavolkutaj.medium.com/how-to-check-the-validity-of-json-with-jq-in-bash-scripts-21523418f67d) - Exit code patterns

### Existing Implementation (HIGH confidence)
- `.github/workflows/hugo.yml` - Current CI configuration (reviewed directly)
- `data/reviews.json` - Current review data contract (reviewed directly)
- `data/service_area.json` - Current service area contract (reviewed directly)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - tools already in use, well documented
- Architecture: HIGH - patterns already partially implemented in CI
- Pitfalls: HIGH - based on direct code review and jq documentation
- Gaps: HIGH - identified by diff against existing workflow

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (tools stable, no expected changes)

## Requirements Mapping

| Requirement | Validation Approach | Confidence |
|-------------|---------------------|------------|
| VALD-01 | Enhanced jq contract for reviews.json (add staleAfterDays, freshnessLabel) | HIGH |
| VALD-02 | jq contract + asset existence checks (service-area-map.svg/png) | HIGH |
| VALD-03 | Hugo --panicOnWarning flag | HIGH |
| VALD-04 | Existing smoke checks already satisfy (reviews + map presence) | HIGH |
