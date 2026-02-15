# Phase 6: Operations & Recovery - Research

**Researched:** 2026-02-14
**Domain:** Operations documentation, recovery procedures, static site reliability
**Confidence:** HIGH

## Summary

This phase is primarily a documentation exercise. The technical infrastructure for operational reliability already exists:

1. **Fallback data (OPER-01):** Phase 4.1 implemented conditional fallback logic in `layouts/index.html` that automatically switches to `fallbackReviews` when the live `reviews` array is empty. No additional work needed.

2. **CI diagnostics (OPER-03):** Phase 5 implemented descriptive error messages in all validation gates (`hugo.yml` lines 39-96). The smoke checks clearly identify missing reviews/map content. No additional work needed.

3. **Recovery documentation (OPER-02):** This is the only deliverable. The phase needs a simple runbook documenting how to manually trigger the review refresh workflow and verify site health.

**Primary recommendation:** Add a concise OPERATIONS.md file to the repository root documenting the manual recovery workflow and health verification steps. Keep it practical, not exhaustive.

## Standard Stack

No new libraries or tools needed. This phase uses existing infrastructure:

### Core (Already Implemented)
| Component | Location | Purpose |
|-----------|----------|---------|
| Fallback reviews | `data/reviews.json` + `layouts/index.html` | Automatic graceful degradation |
| Review fetch workflow | `.github/workflows/fetch-reviews.yml` | Monthly refresh + manual trigger |
| CI validation | `.github/workflows/hugo.yml` | Data contract + smoke tests |
| Descriptive errors | CI workflow steps | Failure diagnosis |

### Documentation (To Be Created)
| Document | Location | Purpose |
|----------|----------|---------|
| OPERATIONS.md | Repository root | Recovery procedures |

## Architecture Patterns

### Recommended Documentation Structure

```
/
├── OPERATIONS.md           # New: Recovery runbook
├── README.md               # Existing: Development guide
├── .github/workflows/
│   ├── hugo.yml            # CI with diagnostics
│   └── fetch-reviews.yml   # Review refresh (manual trigger)
└── data/
    └── reviews.json        # Contains fallbackReviews
```

### Pattern 1: Concise Runbook Format

**What:** Single-page operations document with clear sections
**When to use:** Simple systems with rare recovery scenarios
**Format:**
```markdown
# Operations Guide

## Quick Reference
- [table of common tasks with one-liner commands]

## Manual Recovery
### Scenario: Reviews Missing/Stale
[numbered steps with exact commands/clicks]

## Health Verification
[how to confirm site is healthy]

## Escalation
[when/how to escalate beyond documented procedures]
```

### Pattern 2: GitHub Actions Manual Trigger

**What:** `workflow_dispatch` enables manual runs from GitHub UI or CLI
**Already implemented in:** `.github/workflows/fetch-reviews.yml`
**Example usage:**
```bash
# Via GitHub CLI (must have gh installed and authenticated)
gh workflow run fetch-reviews.yml

# Via GitHub UI
# Actions > Fetch Reviews > Run workflow
```

### Anti-Patterns to Avoid
- **Over-documentation:** This is a static site with one main recovery scenario. Don't write an enterprise SRE playbook.
- **Automation for rare events:** Manual steps are appropriate for monthly/quarterly recovery scenarios.
- **Duplicating CI error messages:** CI already has descriptive errors. Don't repeat them in docs.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Review refresh | Custom script | Existing `fetch-reviews.yml` workflow | Already handles API calls, scraping, deduplication, commit |
| Site health check | Custom monitoring | GitHub Actions workflow status + live site smoke | Built-in to GH, free |
| Fallback data | Manual intervention | Existing conditional logic in template | Automatic, zero-touch |

**Key insight:** The existing workflows already do the hard work. Documentation just needs to explain how to trigger them manually.

## Common Pitfalls

### Pitfall 1: Documenting Implementation Details That Change

**What goes wrong:** Documentation includes specific line numbers, commit hashes, or implementation details
**Why it happens:** Desire to be "complete"
**How to avoid:** Document behaviors and commands, not internals
**Warning signs:** Doc needs updating every time code changes

### Pitfall 2: Creating a Separate Monitoring System

**What goes wrong:** Building custom health checks when GitHub provides them
**Why it happens:** Enterprise habits applied to simple site
**How to avoid:** Use GitHub Actions run history as monitoring
**Warning signs:** Maintaining two systems for the same purpose

### Pitfall 3: Over-Automating Recovery

**What goes wrong:** Complex automation for scenarios that happen rarely
**Why it happens:** "Automate everything" mentality
**How to avoid:** Manual is fine for monthly/quarterly events
**Warning signs:** More time maintaining automation than doing manual recovery

### Pitfall 4: Forgetting the Happy Path

**What goes wrong:** Only documenting failure recovery, not normal operation
**Why it happens:** Focus on problems
**How to avoid:** Include "everything is working" verification steps
**Warning signs:** Operators don't know what "healthy" looks like

## Code Examples

### Existing Fallback Logic (No Changes Needed)
```hugo
{{/* layouts/index.html lines 350-358 */}}
{{ if gt (len ($reviewsData.reviews | default slice)) 0 }}
    {{ range $reviewsData.reviews }}
        {{ $displayReviews = $displayReviews | append . }}
    {{ end }}
{{ else }}
    {{ range $reviewsData.fallbackReviews }}
        {{ $displayReviews = $displayReviews | append . }}
    {{ end }}
{{ end }}
```

### Existing CI Diagnostics (No Changes Needed)
```yaml
# .github/workflows/hugo.yml lines 42-48
jq -e '...' data/reviews.json > /dev/null || {
  echo "ERROR: reviews.json missing required fields...";
  exit 1;
}
```

### Manual Workflow Trigger (Via GitHub CLI)
```bash
# Trigger the review fetch workflow
gh workflow run fetch-reviews.yml

# Check workflow status
gh run list --workflow=fetch-reviews.yml --limit 5
```

### Manual Workflow Trigger (Via GitHub UI)
1. Navigate to repository Actions tab
2. Select "Fetch Reviews" workflow
3. Click "Run workflow" button
4. Select branch (main)
5. Click "Run workflow"

### Health Verification Commands
```bash
# Check live site reviews section
curl -s https://poloselectronics.com | grep -q "What Our Customers Say" && echo "OK: Reviews section present"

# Check for review cards (at least one)
curl -s https://poloselectronics.com | grep -q "review-card" && echo "OK: Review cards rendered"

# Check service area map
curl -s https://poloselectronics.com | grep -q "service-area-map" && echo "OK: Map present"
```

## Documentation Location Recommendation

Based on project structure and simplicity requirements:

| Option | Location | Pros | Cons |
|--------|----------|------|------|
| **Recommended** | `OPERATIONS.md` (root) | Visible, standard location, GitHub renders it | Another root file |
| Alternative | `docs/OPERATIONS.md` | Keeps root clean | Another directory to maintain |
| Alternative | Append to `README.md` | Single file | README already long, mixes concerns |
| Alternative | GitHub Wiki | Separate from code | Disconnected from repo, easy to forget |

**Recommendation:** `OPERATIONS.md` in repository root. It's the standard pattern for operational documentation, visible in the repository, and doesn't require maintaining a docs directory.

## Documentation Content Recommendation

The OPERATIONS.md should include:

1. **Quick Reference Table** - One-liner commands for common tasks
2. **Manual Review Refresh** - Step-by-step for triggering fetch-reviews.yml
3. **Health Verification** - How to confirm site is healthy
4. **Understanding Failures** - What CI errors mean (reference, not duplication)
5. **Fallback Behavior** - Explaining the automatic fallback mechanism

**Estimated length:** 60-80 lines of markdown. Concise, scannable, actionable.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Runbook wiki pages | README/OPERATIONS.md in repo | Version controlled, reviewed |
| Separate monitoring | GitHub Actions status | Simpler, no extra tools |
| Scheduled scraping only | workflow_dispatch for manual | Operator control |

## Open Questions

None. The phase scope is well-defined by CONTEXT.md decisions.

## Sources

### Primary (HIGH confidence)
- `.github/workflows/hugo.yml` - Current CI configuration (reviewed directly)
- `.github/workflows/fetch-reviews.yml` - Review fetch workflow (reviewed directly)
- `data/reviews.json` - Fallback data structure (reviewed directly)
- `layouts/index.html` - Conditional fallback logic (reviewed directly)

### Secondary (MEDIUM confidence)
- [Scribe Runbook Guide](https://scribe.com/library/runbooks) - Best practices for runbook structure
- [AWS Well-Architected - Runbook](https://wa.aws.amazon.com/wellarchitected/2020-07-02T19-33-23/wat.concept.runbook.en.html) - Operations documentation principles

### Tertiary (LOW confidence)
- N/A - No unverified claims in this research

## Metadata

**Confidence breakdown:**
- Existing infrastructure: HIGH - directly verified in codebase
- Documentation patterns: HIGH - industry standard, simple to apply
- Recommendations: HIGH - based on CONTEXT.md user decisions

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (documentation patterns stable)

## Requirements Mapping

| Requirement | Status | Notes |
|-------------|--------|-------|
| OPER-01 | SATISFIED | Phase 4.1's fallbackReviews + conditional logic |
| OPER-02 | **DELIVERABLE** | Create OPERATIONS.md with recovery procedures |
| OPER-03 | SATISFIED | Phase 5's CI smoke checks with descriptive errors |

## Deliverables Summary

This phase has a single deliverable:

1. **OPERATIONS.md** - Recovery runbook at repository root
   - Manual review refresh procedure
   - Health verification steps
   - Fallback behavior explanation
   - Quick reference table

No code changes required. No new workflows. No additional automation.
