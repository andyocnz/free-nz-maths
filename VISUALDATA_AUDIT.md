# Visual Data Audit Report

**Date**: 2025-12-03
**Purpose**: Ensure all templates with `visualData` have matching visualizations

## Summary

**Total templates with visualData**: ~36 instances across 3 curriculum files

## Audit Results

### ✅ CORRECT Templates (Dynamic visualData)
These templates use **parameter references** in visualData, so the visualization updates with each question:

**Histograms** (Y6.S.HISTOGRAMS.T1-T5)
```json
"params": { "v1": ["int", 2, 8], "v2": ["int", 2, 10], ... },
"visualData": { "values": ["v1", "v2", "v3", "v4"] }  ✅ References params!
```

**Coordinate Grids** (Y8.G.TRANSFORMATIONS_COORDINATE, Y12.G.VECTOR_OPS, Y13.A.COMPLEX_NUMBERS)
```json
"params": { "x": ["int", 1, 10], "y": ["int", 1, 10] },
"visualData": { "points": [["x","y"]] }  ✅ References params!
```

**Matrices** (Y12.A.MATRIX_OPS)
```json
"params": { "a": ["int", 1, 5], "b": ["int", 1, 5], ... },
"visualData": { "matrix1": [["a","b"],["c","d"]] }  ✅ References params!
```

**Volume Prisms** (Y6.G.VOLUME_PRISMS)
```json
"params": { "a": ["int", 10, 100], "h": ["int", 5, 20] },
"visualData": { "baseArea": "a", "height": "h" }  ✅ References params!
```

### ✅ ACCEPTABLE (Static visualData for visual interpretation)
These have `"params": {}` with static visualData - acceptable because the question IS about interpreting the visual:

**Stem-and-Leaf Plots** (Y6.S.STEM_AND_LEAF.T3-T7)
```json
"params": {},
"visualData": { "stems": [2, 3, 4, 5], "leaves": {...} }  ✅ Static visual, no params
```

**Nets** (Y6.G.NETS.T1-T7)
```json
"params": {},
"visualData": { "shape_type": "cube" }  ✅ Static visual, no params
```

### ⚠️ FIXED ISSUE (Y8.S.SCATTER_PLOTS - Phase 10.12)
**Problem**: Had randomized scenarios but ONE static upward-trending visualization
**Solution**: Split into TWO templates:
- T1: Positive correlations with upward trend visualization
- T2: Negative correlations with downward trend visualization

---

## Critical Rules for Developers

### Rule 1: visualData Must Match Question Parameters

```json
// ❌ WRONG - Mismatch between params and visualData
{
  "stem": "What correlation does {scenario} show?",
  "params": {
    "scenario": ["choice",
      ["hours studied vs scores (increases)", "Positive"],
      ["TV hours vs scores (decreases)", "Negative"]  // Different correlations!
    ]
  },
  "visualData": {
    "type": "scatter_plot",
    "points": [[1,40],[2,50],[3,60]]  // Always upward! WRONG!
  }
}
```

```json
// ✅ CORRECT Option 1 - Reference params in visualData
{
  "stem": "Reflect point ({x},{y}) across y-axis",
  "params": { "x": ["int", 1, 10], "y": ["int", 1, 10] },
  "visualData": {
    "type": "coordinate_grid",
    "points": [["x","y"]]  // References param names as strings!
  }
}
```

```json
// ✅ CORRECT Option 2 - Split into separate templates
{
  "id": "SCATTER.T1",  // Positive only
  "params": {
    "scenario": ["choice", ["hours studied", "Positive"], ...]
  },
  "visualData": { "points": [[1,40],[2,50],[3,60]] }  // Upward
},
{
  "id": "SCATTER.T2",  // Negative only
  "params": {
    "scenario": ["choice", ["TV hours", "Negative"], ...]
  },
  "visualData": { "points": [[1,60],[2,50],[3,40]] }  // Downward
}
```

```json
// ✅ CORRECT Option 3 - Static visual for interpretation
{
  "stem": "What is the smallest value in this stem-and-leaf plot?",
  "params": {},  // No params = OK!
  "answer": "22",
  "visualData": { "stems": [2,3,4], "leaves": {...} }
}
```

### Rule 2: Three Types of visualData Usage

| Type | Params | visualData | Example |
|------|--------|------------|---------|
| **Dynamic** | Randomized | References params | Histograms, coordinate grids |
| **Split Templates** | Randomized (grouped) | Static per template | Scatter plots (T1=positive, T2=negative) |
| **Static Interpretation** | Empty `{}` | Static | Nets, stem-and-leaf interpretation |

### Rule 3: How to Reference Params in visualData

```json
// String references (quoted)
"visualData": {
  "points": [["x", "y"]],           // Will use param values
  "matrix1": [["a","b"],["c","d"]], // Array of strings
  "values": ["v1", "v2", "v3"],     // List of param names
  "baseArea": "a",                   // Single param
  "height": "h"
}
```

---

## Testing Checklist

When adding a template with visualData:

- [ ] Does the template have randomized params?
- [ ] If YES: Does the visualData reference param names OR is it split by type?
- [ ] If visualData is static: Are params empty `{}`?
- [ ] Test multiple times - does the visual match the question every time?
- [ ] For choice params: Do all choices match the same visual OR split into separate templates?

---

## Files Audited

1. ✅ `src/curriculumDataNew.json` (Years 6-10)
2. ✅ `src/year12Curriculum.json`
3. ✅ `src/year13Curriculum.json`

**Status**: All templates with visualData have been audited and are correct except scatter plots (fixed in phase 10.12).
