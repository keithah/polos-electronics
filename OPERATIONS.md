# Operations Runbook

Quick reference for operators managing the Polos Electronics static site.

## Quick Reference

| Task | Command |
|------|---------|
| Trigger review refresh | `gh workflow run fetch-reviews.yml` |
| Check workflow status | `gh run list --workflow=fetch-reviews.yml --limit 5` |
| Verify reviews on site | `curl -s https://poloselectronics.com \| grep -q "What Our Customers Say" && echo "OK"` |
| Verify map on site | `curl -s https://poloselectronics.com \| grep -q "service-area-map" && echo "OK"` |

## Manual Review Refresh

### Via GitHub CLI (preferred)

```bash
gh workflow run fetch-reviews.yml
```

Check status:
```bash
gh run list --workflow=fetch-reviews.yml --limit 3
```

### Via GitHub UI

1. Go to **Actions** tab in the repository
2. Click **Fetch Reviews** in the left sidebar
3. Click **Run workflow** button (top right)
4. Select `main` branch, click **Run workflow**

**Expected outcome:** New commit with updated `data/reviews.json` (if reviews changed).

## Health Verification

Run these commands to verify site health:

```bash
# Check reviews section present
curl -s https://poloselectronics.com | grep -q "What Our Customers Say" && echo "Reviews section: OK" || echo "Reviews section: MISSING"

# Check review cards rendered (look for review author attribution)
curl -s https://poloselectronics.com | grep -q "review-card" && echo "Review cards: OK" || echo "Review cards: CHECK MANUALLY"

# Check service area map present
curl -s https://poloselectronics.com | grep -q "service-area-map" && echo "Service map: OK" || echo "Service map: MISSING"

# Check GitHub Actions status
gh run list --workflow=hugo.yml --limit 3
```

## Fallback Behavior

The site has automatic fallback protection for reviews:

- **When it triggers:** If the live `reviews` array in `data/reviews.json` is empty
- **What happens:** The site displays `fallbackReviews` instead (3+ curated reviews)
- **Operator action needed:** None - fallback is automatic
- **CI validation:** Both `reviews` and `fallbackReviews` arrays must exist (validated in `hugo.yml`)

This means users always see reviews, even if API fetch fails.

## Understanding CI Failures

When a workflow fails:

1. Go to **Actions** tab
2. Click the failed run
3. Expand the failed step to see error logs

**Validation step names describe the check:**
- `Validate reliability inputs` - checks `data/reviews.json` and `data/service_area.json` structure
- `Validate required assets` - checks map images exist
- `Smoke check homepage output` - checks reviews/map render in final HTML

See `.github/workflows/hugo.yml` for exact validation logic.

---

*Last updated: 2026-02-14*
