# Hardcoded Templates Audit

**Total Found:** 17 templates with `"params": {}`
**Location:** All in `src/curriculumDataNew.json` (base curriculum has 0)

## Category 1: ACCEPTABLE (Visual/Diagram-based)
These rely on interpreting a static visualData diagram - student must analyze the visual:

### Stem-and-Leaf Plots (5 templates) ✅
- `Y6.S.STEM_AND_LEAF.T3` - Find smallest value from plot
- `Y6.S.STEM_AND_LEAF.T4` - Find largest value from plot
- `Y6.S.STEM_AND_LEAF.T5` - Find range from plot
- `Y6.S.STEM_AND_LEAF.T6` - Count total values from plot
- `Y6.S.STEM_AND_LEAF.T7` - Find median from plot
**Status:** OK - all have `visualData` showing static stem-and-leaf diagram

### Nets (7 templates) ✅
- `Y6.G.NETS.T1` - Identify cube from net
- `Y6.G.NETS.T2` - Identify rectangular prism from net
- `Y6.G.NETS.T3` - Identify triangular prism from net
- `Y6.G.NETS.T4` - Identify square pyramid from net
- `Y6.G.NETS.T5` - Identify tetrahedron from net
- `Y6.G.NETS.T6` - Identify cylinder from net
- `Y6.G.NETS.T7` - Identify cone from net
**Status:** OK - all have `visualData` showing static net diagram

### Scatter Plots (1 template) ✅
- `Y8.S.SCATTER_PLOTS.T1` - Identify correlation from scatter plot
**Status:** OK - has `visualData` showing static scatter plot

**Total Acceptable:** 13 templates

---

## Category 2: NOT ACCEPTABLE (Pure Calculation - No Visual)
These should be randomized:

### Rotational Symmetry (1 template) ❌
- `Y6.G.ROTATIONAL_SYMMETRY.T1` - "What is the order of rotational symmetry of a square?" = 4
**Issue:** Pure knowledge/calculation, no visualData, always same question
**Fix:** Already has T2 with randomized shape parameter - DELETE T1 or add visualData

### Probability (1 template) ❌
- `Y7.S.COMPOUND_PROBABILITY.T3` - "Two fair dice are rolled. What is the probability that both show an even number?" = 1/4
**Issue:** Pure calculation, no parameters
**Fix:** Add parameters for different probability scenarios OR make it use visualData

### Inequalities (1 template) ❌
- `Y9.A.EQUATIONS_INEQUALITIES.T2` - "Solve the inequality: −2x + 7 ≥ 15." = x ≤ −4
**Issue:** Pure algebra, no parameters, students will memorize answer
**Fix:** Add parameters: `{a}x + {b} ≥ {c}`

### Polynomial Division (1 template) ❌
- `Y9.A.POLYNOMIAL_OPS.T2` - "Divide 3x³ + 6x² − 9x by 3x." = x² + 2x − 3
**Issue:** Pure algebra, no parameters, students will memorize answer
**Fix:** Add parameters: `{a}x³ + {b}x² − {c}x by {a}x`

**Total NOT Acceptable:** 4 templates

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Visual/Diagram-based (OK) | 13 | ✅ Keep as-is |
| Pure Calculation (NOT OK) | 4 | ❌ Must fix |
| **TOTAL** | **17** | **4 need fixing** |

---

## Action Plan

1. **Fix 4 non-visual hardcoded templates** by adding randomization
2. **Update DEVELOPER_ONBOARDING.md** with strict rule:
   - ❌ NEVER use `"params": {}` for pure calculation questions
   - ✅ ONLY use `"params": {}` for visual interpretation questions with `visualData`
3. **Add validation** to prevent future hardcoded calculation questions

---

## Developer Rule (to add to docs)

### 🚫 NEVER Hardcode Calculation Questions

**Rule:** Templates with `"params": {}` are ONLY allowed if they have `visualData` and require visual interpretation.

```json
// ❌ NEVER - Pure calculation with no params
{
  "stem": "Solve 2x + 5 = 15",
  "params": {},
  "answer": "5"  // Students will memorize this!
}

// ✅ CORRECT - Randomized calculation
{
  "stem": "Solve {a}x + {b} = {c}",
  "params": {
    "a": ["int", 1, 5],
    "b": ["int", 1, 10],
    "c": ["int", 10, 30]
  },
  "answer": "(c - b) / a"
}

// ✅ ALSO OK - Visual interpretation (no calc)
{
  "stem": "What is the smallest value in the stem-and-leaf plot?",
  "params": {},
  "answer": "22",
  "visualData": { "type": "stem_and_leaf", ... }  // Has visual!
}
```

**Why?** Students will memorize hardcoded answers instead of learning the concept.
