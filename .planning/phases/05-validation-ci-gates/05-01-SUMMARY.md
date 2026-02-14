---
type: summary
phase: 05-validation-ci-gates
plan: 01
subsystem: ci-pipeline
tags: [validation, github-actions, jq, data-contracts]
completed: 2026-02-14
duration: 1 min
requires: [04.1-01]
provides: [pre-build-validation-gates]
affects: [06-operations-recovery]
tech-stack:
  patterns: [fail-fast-validation, data-contract-enforcement]
key-files:
  modified:
    - .github/workflows/hugo.yml
decisions: []
metrics:
  tasks: 2/2
  commits: 2
---

# Phase 05 Plan 01: Pre-build Validation Gates Summary

**One-liner:** CI pipeline now validates data contracts (staleAfterDays, freshnessLabel, tiers count) and asset existence (SVG/PNG map) before Hugo build starts.

## What Was Done

### Task 1: Enhance data contract validation
- Added `staleAfterDays` type check (must be number) for reviews.json
- Added `freshnessLabel` type check (must be string) for reviews.json
- Added `tiers | length >= 1` check for service_area.json
- Added descriptive error messages for all validation failures
- **Commit:** `89c5642`

### Task 2: Add asset existence validation
- Added new "Validate required assets" step immediately after data validation
- Checks for `static/images/service-area-map.svg` existence
- Checks for `static/images/service-area-map.png` fallback existence
- Clear error messages when assets missing
- **Commit:** `8aa4dd7`

## Technical Notes

### Validation Flow
The CI pipeline now has this pre-build validation sequence:
1. **Data contract validation** - reviews.json and service_area.json field checks
2. **Asset existence validation** - SVG map and PNG fallback existence
3. **Hugo build** - only runs if all validations pass
4. **Smoke check** - post-build output verification

### Error Message Pattern
All validations use consistent error message pattern:
```bash
jq -e '...' file.json > /dev/null || { echo "ERROR: description"; exit 1; }
test -f path || { echo "ERROR: description"; exit 1; }
```

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Verification

| Criteria | Status |
|----------|--------|
| reviews.json jq validation includes staleAfterDays (number) check | PASS |
| reviews.json jq validation includes freshnessLabel (string) check | PASS |
| service_area.json jq validation includes tiers length >= 1 check | PASS |
| New "Validate required assets" step checks for service-area-map.svg | PASS |
| New "Validate required assets" step checks for service-area-map.png | PASS |
| All validation steps have descriptive error messages | PASS |

## Requirements Traceability

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| VALD-01: Validate reviews.json contract | COMPLETE | staleAfterDays, freshnessLabel type checks |
| VALD-02: Validate service_area.json contract | COMPLETE | tiers length >= 1 check |
| VALD-03: Validate required assets | COMPLETE | SVG and PNG existence checks |

## Files Modified

| File | Changes |
|------|---------|
| `.github/workflows/hugo.yml` | Added data contract validations and asset existence step |

## Next Phase Readiness

- All validation gates in place
- CI will fail fast on broken data contracts
- CI will fail fast on missing assets
- Ready for Phase 06: Operations & Recovery
