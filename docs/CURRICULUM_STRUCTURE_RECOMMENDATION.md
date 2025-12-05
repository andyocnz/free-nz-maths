# Curriculum Structure Recommendation: Split Multi-Year JSON Files

## Executive Summary
**Recommendation: YES, split the multi-year JSON files into separate year-specific files.** This addresses year-mixing errors, reduces merge conflicts, and improves developer experience significantly.

---

## Current Problem

### File Structure
- **`phase/phase 10 year 11-13.json`** (2189 lines):
  - Year 10: 4 skills, ~8 templates
  - Year 11: 9 skills, ~17 templates
  - Year 12: 8 skills, ~19 templates
  - Year 13: 7 skills, ~17 templates
  - **Total: 28 skills, ~61 templates in ONE file**

- **Issue**: When developers add templates for one year, they can accidentally:
  1. Place templates in the wrong year object
  2. Use wrong year prefix in template IDs (e.g., `Y11.X.SKILL` under Year 10)
  3. Set wrong `"year"` field in template metadata
  4. Create merge conflicts affecting all years simultaneously

---

## Recommended Solution: Year-Specific Files

### File Structure After Split

```
phase/
├── phase_10_year_10.json      (4 skills, ~8 templates)
├── phase_10_year_11.json      (9 skills, ~17 templates)
├── phase_10_year_12.json      (8 skills, ~19 templates)
├── phase_10_year_13.json      (7 skills, ~17 templates)
└── README.md                   (explains the structure)
```

### Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **File Size** | 2189 lines (hard to review) | ~550 lines each (easy to review) |
| **Merge Conflicts** | All years affected together | Only that year affected |
| **Developer Error Risk** | HIGH - easy to put Y10 template in Y13 section | LOW - file name is year |
| **Git History Clarity** | Changes to any year touch one huge file | Each year has clean, focused history |
| **Adding Templates** | Search through entire file | Know exactly which file to edit |
| **Code Review** | Harder to spot cross-year errors | Impossible to mix years accidentally |
| **Testing** | Need to validate all 4 years together | Test year independently |

### Developer Workflow Improvement

**Before (Error-Prone):**
```
1. Developer opens "phase 10 year 11-13.json" (2189 lines)
2. Looks for "Year 11" section (hard to find visually)
3. Adds template for Y11 skill
4. ❌ Accidentally places it under Y10 section
5. Commit goes through, breaks Y10 tests
```

**After (Clear & Safe):**
```
1. Developer opens "phase_10_year_11.json"
2. File is focused - only ~550 lines
3. Adds template - can't get wrong year
4. ✓ File name ensures correctness
5. Clean, isolated commit
```

---

## Implementation Plan

### Phase 1: Create New Structure (No Data Loss)
```bash
# Split phase 10 year 11-13.json into 4 files
node scripts/split_curriculum_by_year.mjs

# Result:
# - phase_10_year_10.json
# - phase_10_year_11.json
# - phase_10_year_12.json
# - phase_10_year_13.json
```

### Phase 2: Update Import System
Update `src/curriculumDataMerged.js` or loader to merge files at runtime:
```javascript
// Before
const data = require('./phase_10_year_11_13.json')

// After
const data = {
  years: [
    ...require('../phase/phase_10_year_10.json').years,
    ...require('../phase/phase_10_year_11.json').years,
    ...require('../phase/phase_10_year_12.json').years,
    ...require('../phase/phase_10_year_13.json').years
  ]
}
```

### Phase 3: Update Developer Guide
- Update `DEVELOPER_ONBOARDING.md` with new file locations
- Add quick reference: "Adding Y10 templates? Edit `phase/phase_10_year_10.json`"

### Phase 4: Migrate Existing Workflow
- Update Daily Job Tracking to reference specific year files
- Update any scripts that read these files

---

## Additional Structural Improvements (Optional)

### Idea 1: Consistent Naming Convention
```
phase/
├── phase_10/
│   ├── year_10.json
│   ├── year_11.json
│   ├── year_12.json
│   └── year_13.json
├── phase_13/  (if/when separate)
│   ├── year_11.json (olympiad overlap)
│   └── year_12.json
└── README.md
```

**Benefit**: Scales better if you have multiple phases with same structure.

### Idea 2: Validation at Commit Time
Add pre-commit hook to validate:
- All template IDs start with correct year prefix
- All templates in Y11 file actually have `"year": 11` in metadata
- No duplicate skill/template IDs across files

### Idea 3: Template Audit Script
```bash
node scripts/audit_curriculum.mjs
# Output:
# ✓ phase_10_year_10.json - valid
# ✓ phase_10_year_11.json - valid
# ✗ phase_10_year_12.json - ERROR: Y11.X.SKILL found in Y12 file!
```

---

## Risk Assessment

### ✅ Low Risk
- Data is not lost, just reorganized
- Can revert by re-merging if needed
- No changes to question generation logic
- Import/merge happens at runtime

### ⚠️ Medium Risk
- Need to update curriculum loader code
- Require one-time migration of scripts
- Developer guide updates needed

### ✅ Mitigation
- Create migration script to validate output
- Test that generated questions are identical before/after split
- Keep old file in git history for reference

---

## Comparison: Split vs. Keep Combined

### Keep Combined File (`phase_10_year_11_13.json`)
```
✓ Simple import (one file)
✓ Single merge commit
✗ 2189 lines hard to review
✗ Easy to mix years
✗ All years blocked on one merge
✗ Harder to track who edited which year
```

### Split into 4 Files
```
✓ 550 lines each, easy to review
✓ Impossible to mix years
✓ Parallel work on different years
✓ Clear file ownership
✓ Better git history
✓ Easier to find what you need
✗ Need merge/load logic
✗ Slightly more build complexity
```

**Verdict: Benefits FAR outweigh the minor complexity cost.**

---

## Example: How the Fix Prevents Errors

### Scenario: Adding Y10 Surds Template

**Old Way (Risky):**
```json
// developer opens "phase_10_year_11_13.json" at 2189 lines
// searches for "Y10.N.SURDS"
// finds it at line 142
// adds template...
// OH NO - actually added it to Y11.A.QUADRATIC_EQS at line 500 by mistake
```

**New Way (Safe):**
```json
// developer opens "phase_10_year_10.json" (~200 lines)
// file is ONLY year 10 content
// adds template to Y10.N.SURDS_SIMPLIFY
// cannot possibly put it in wrong year
// ✓ Safe, clear, easy to review
```

---

## Recommendation Summary

### **Final Recommendation: SPLIT**

**Reason:**
1. **Developer Error Prevention** - File name enforces year correctness
2. **Better Git Experience** - Clean, focused commits per year
3. **Easier Collaboration** - Multiple devs can work on different years without conflicts
4. **Improved Maintainability** - Smaller files are easier to understand and review
5. **Scalability** - If you add more phases, structure is consistent

### **Timeline**
- **Phase 1 (Urgent):** Write split script + migrate
- **Phase 2 (Quick):** Update imports and docs
- **Phase 3 (Follow-up):** Add validation/audit scripts

### **Cost**
- Time to implement: ~2-3 hours
- Risk level: Low (data is not lost)
- Payoff: Prevents future mistakes, improves team velocity

---

## Migration Script (Coming Soon)

```bash
# To be created: scripts/split_curriculum_by_year.mjs
# This will:
# 1. Read phase/phase_10_year_11_13.json
# 2. Split by year into 4 separate files
# 3. Validate each file is valid JSON
# 4. Create backup of original
# 5. Update loader code automatically
# 6. Run tests to ensure no change to question generation
```

---

## Questions & Answers

**Q: Will this affect how questions are generated?**
A: No. We'll merge the files at runtime so the app sees the same data structure.

**Q: What if a skill spans multiple years?**
A: Keep it in the year where it first appears, with a comment referencing the other year versions.

**Q: How do we handle overlapping Olympic/Standard templates?**
A: They're already separate files (`src/olympiadCurriculum.json` vs main curriculum), so no conflict.

**Q: Can we do this incrementally?**
A: Yes - start with phase_10_year_10.json, test, then split the others. No need to do all at once.

