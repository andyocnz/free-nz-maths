# Template Assignment Tracker

**Purpose**: Simple real-time tracking of WHO is adding WHAT templates to avoid duplicates and rework.

---

## 📋 Current Assignment

| Developer | Assignment | Progress | Status | Notes |
|-----------|-----------|----------|--------|-------|
| **Claude (AI)** | Complex templates + Helpers | 0/30 | 🟠 Ready | Year 11-13, randomized params, helper functions |
| **Junior Dev** | Simple templates (No helpers) | 0/142 | 🟠 Ready | Years 6-10 easy ones, basic params, NO custom helpers |

---

## 🎯 Work Division Strategy

### For JUNIOR DEVELOPER
**Focus**: Templates that DON'T need helper functions (easiest 60% of work)

**Criteria for "Junior-Friendly"**:
- ✅ Uses only basic arithmetic: `+`, `-`, `*`, `/`
- ✅ Uses only basic functions: `round()`, `sqrt()`, `Math.max()`, `Math.min()`
- ✅ Random params: `["int", min, max]` or `["choice", val1, val2]`
- ✅ No custom helpers: NO `simplify()`, `lcm()`, `prime_or_composite()`, etc.
- ✅ Static visualData or matching params
- ✅ No hardcoded templates (always has randomized params)

**Templates to assign**: ~142 out of 172

**Example good ones for junior**:
```json
{
  "id": "Y7.N.RATES.T3",
  "stem": "Petrol costs ${price} per litre. How much for a {volume}-litre tank?",
  "params": {
    "price": ["decimal", 1.8, 2.6, 2],
    "volume": ["int", 30, 70]
  },
  "answer": "{round(price * volume, 2)}"  // Just arithmetic!
}
```

### For CLAUDE (AI)
**Focus**: Complex templates that DO need helpers OR need careful planning

**Criteria**:
- ❌ Needs a helper function (`simplify()`, `lcm()`, `factor_quadratic()`, etc.)
- ❌ Complex randomization logic
- ❌ Tricky answer expressions
- ❌ Hardcoded templates that need fixing
- ❌ Advanced concepts (Year 13, Olympics)

**Templates to assign**: ~30 out of 172

**Example for Claude**:
```json
{
  "id": "Y8.N.NUMBER_THEORY.T2",
  "stem": "Find the least common multiple (LCM) of {a} and {b}.",
  "params": { "a": ["int", 12, 60], "b": ["int", 18, 80] },
  "answer": "lcm(a, b)"  // Needs helper function!
}
```

---

## 📊 Phase Breakdown

### Phase 10.1: 75 Templates (Add More)
| Category | Count | Assigned To | Status |
|----------|-------|------------|--------|
| Y6 (7 templates) | 7 | Junior | ⬜ Pending |
| Y7 (5 templates) | 5 | Junior | ⬜ Pending |
| Y8 (11 templates) | 8 Simple + 3 Complex | Junior (8) / Claude (3) | ⬜ Pending |
| Y9 (14 templates) | 10 Simple + 4 Complex | Junior (10) / Claude (4) | ⬜ Pending |
| Y10 (12 templates) | 6 Simple + 6 Complex | Junior (6) / Claude (6) | ⬜ Pending |
| Y11 (1 template) | 1 Complex | Claude | ⬜ Pending |
| Y12 (4 templates) | 4 Complex | Claude | ⬜ Pending |
| Y13 (19 templates) | 0 Simple + 19 Complex | Claude | ⬜ Pending |
| **TOTAL** | **75** | | |

### Phase 11: 73 Templates (Missing Topics)
| Category | Count | Assigned To | Status |
|----------|-------|------------|--------|
| Y10 Missing (~15) | 8 Simple + 7 Complex | Junior (8) / Claude (7) | ⬜ Pending |
| Y11 Missing (~25) | 10 Simple + 15 Complex | Junior (10) / Claude (15) | ⬜ Pending |
| Y12 Missing (~30) | 8 Simple + 22 Complex | Junior (8) / Claude (22) | ⬜ Pending |
| **TOTAL** | **73** | | |

### Phase 13: 24 Templates (Olympics)
| Category | Count | Assigned To | Status |
|----------|-------|------------|--------|
| All Competition | 24 | Claude | ⬜ Pending |

---

## ✅ How to Track Progress

### Method 1: Mark as You Go (SIMPLEST)
Just update this file in real-time:

```markdown
## PROGRESS LOG

### Phase 10.1 - Junior Developer
- [x] Y6.S.STEM_AND_LEAF.T2 - Range with visualization (2025-12-04)
- [x] Y6.M.TIME.T2 - Time duration calculation (2025-12-04)
- [ ] Y6.M.MEASUREMENT.T2 - Unit conversion
- [ ] Y6.G.COMPOSITE_SHAPES.T2 - L-shape perimeter
...

### Phase 10.1 - Claude
- [x] Y8.N.NUMBER_THEORY.T2 - LCM helper (2025-12-04)
- [ ] Y8.A.TWO_VARIABLE.T2 - Gradient simplification
...
```

### Method 2: Use Git Branches (PREVENTS CONFLICTS)
Each developer works on own branch:

```bash
# Junior creates and works on own branch
git checkout -b feature/junior-phase-10.1-part1

# Claude creates and works on own branch
git checkout -b feature/claude-phase-10.1-helpers

# When done, push and create PR for review
git push origin feature/junior-phase-10.1-part1
```

Then in PR title: **"Phase 10.1: Add 40 Junior-Friendly Templates (Y6-Y9 simple)"`**

---

## 🚀 Daily Standup Format (5 minutes)

**What to share daily**:

```
JUNIOR DEV:
- Yesterday: Added 5 Y6 templates (STEM_AND_LEAF, TIME, MEASUREMENT, etc.)
- Today: Will add 8 Y7 templates
- Blocker: None

CLAUDE:
- Yesterday: Created LCM helper + added Y8.N.NUMBER_THEORY.T2
- Today: Will fix 3 hardcoded Y10 templates + add 2 Y12 complex
- Blocker: Need to decide if Y13 templates should use custom helpers or ternary logic
```

---

## 📝 Simple Checklist Template

Copy this for your daily progress. Update the counts:

```
# Phase 10.1 Progress (75 total)

Junior Developer:
  Y6-Y9 Simple: [████░░░░░░] 42/45 (93%)
  Y10 Simple: [██░░░░░░░░] 5/6 (83%)
  Status: On track, 2 blockers waiting on helpers

Claude:
  Complex & Helpers: [██░░░░░░░░] 8/30 (27%)
  Y13 Olympics: [░░░░░░░░░░] 0/19 (0%)
  Status: Helpers created, starting complex templates tomorrow

Overall Phase 10.1: [████░░░░░░] 47/75 (62%)
```

---

## 🛡️ Anti-Duplicate System

### Rule 1: Assign Templates First
Before starting, mark template as "assigned to X"

### Rule 2: Use This Format When Starting
In the **curriculumDataNew.json**, add a comment:
```json
// ASSIGNED: Claude - Started 2025-12-04
// STATUS: In progress - Adding helper function
{
  "id": "Y8.N.NUMBER_THEORY.T2",
  ...
}
```

### Rule 3: Git Branches Keep Work Separate
- Junior works on: `feature/junior-phase-10.1-Y6-Y9`
- Claude works on: `feature/claude-phase-10.1-helpers`
- When merging, conflict = obvious who added what

### Rule 4: PR Review Before Merge
Only merge when reviewed - catches duplicates instantly

---

## 📱 Quick Status Emoji System

Use these in the assignment table:

| Emoji | Meaning |
|-------|---------|
| ⬜ | Not started |
| 🟡 | In progress (50%) |
| 🟢 | Completed |
| 🔴 | Blocked (waiting for helper) |
| ⭐ | Completed + tested |

---

## Example: First Day Assignment

### JUNIOR DEV - Start with these 10 (Easy wins)
```
Phase 10.1 - Y6 Templates (7):
□ Y6.S.STEM_AND_LEAF.T2 - Range (basic subtraction)
□ Y6.M.TIME.T2 - Duration (time math)
□ Y6.M.MEASUREMENT.T2 - Unit conversion (division)
□ Y6.G.COMPOSITE_SHAPES.T2 - L-shape perimeter (addition)
□ Y6.G.VOLUME_PRISMS.T2 - Pool volume (multiplication)
□ Y6.S.PROBABILITY_REPLACEMENT.T2 - Probability (basic formula)
□ Y6.S.VENN_DIAGRAMS.T2 - Set operations (subtraction)

Phase 10.1 - Y7 Templates (5):
□ Y7.N.EXPONENTS_NEGATIVE.T2 - Fractions (no helper)
□ Y7.N.RATES.T2 - Rate division (with rounding)
□ Y7.N.RATES.T3 - Cost calculation (decimal × int)
```

### CLAUDE - Start with these 5 (Need helpers)
```
Phase 10.1 - Helpers & Complex:
□ Create lcm() helper function
□ Create simplify() helper function
□ Y8.N.NUMBER_THEORY.T2 - LCM calculation
□ Y8.A.TWO_VARIABLE.T2 - Gradient simplification
□ Fix Y9.A.SEQUENCES.T2 - Hardcoded to randomized
```

---

## 🎓 For Junior Developer: How to Know if Your Template is Right

**Before submitting, check**:

1. ✅ **No custom helpers used**
   ```javascript
   // ❌ WRONG for junior
   "answer": "simplify(a, b)"  // Custom helper

   // ✅ RIGHT for junior
   "answer": "round(a / b, 2)"  // Built-in only
   ```

2. ✅ **Randomized params** (never hardcoded)
   ```javascript
   // ❌ WRONG
   "params": {}
   "answer": "5"

   // ✅ RIGHT
   "params": { "a": ["int", 1, 10] }
   "answer": "a * 2"
   ```

3. ✅ **Rounding on division**
   ```javascript
   // ❌ WRONG
   "answer": "a / b"

   // ✅ RIGHT
   "answer": "round(a / b, 2)"
   ```

4. ✅ **No hardcoded answers with quotes**
   ```javascript
   // ❌ WRONG
   "answer": "'x ≤ 4'"

   // ✅ RIGHT (if any params)
   "answer": "'{x} ≤ {limit}'"
   ```

5. ✅ **Tested** - Run locally
   ```bash
   npm run dev  # See if it works
   node scripts/sample_generate.mjs | grep "Y6.S.STEM_AND_LEAF.T2"  # Check output
   ```

---

## 🚨 Red Flags (Stop and Ask Claude)

If you encounter:
- ❌ Need to write a helper function → Ask Claude
- ❌ Complex randomization logic → Ask Claude
- ❌ Template needs specific educational tweaks → Ask Claude
- ❌ Unsure about answer formula → Ask Claude

**Don't guess!** Better to ask than submit wrong template.

---

## Git Workflow (Recommended)

```bash
# Junior creates his branch
git checkout -b feature/junior-phase-10.1-easy

# Make changes, commit frequently
git add src/curriculumDataNew.json
git commit -m "Phase 10.1: Add Y6 simple templates (7 templates)"

# Push when ready for review
git push origin feature/junior-phase-10.1-easy

# Claude reviews and merges after checking for:
# - No duplicate IDs
# - All params are randomized
# - No hardcoded calculations
# - All tested
```

---

## Summary Table

| Aspect | Solution | Who Tracks |
|--------|----------|-----------|
| **What to do** | See assignment table above | Both use same table |
| **Progress tracking** | Update checkbox in this file OR git commits | Both update together |
| **Prevent duplicates** | Assign before starting + use git branches | Use branch names |
| **Daily sync** | 5-min standup, share blockers | Both |
| **Quality check** | Simple checklist (rounding, params, helpers) | Junior reviews own, Claude reviews PRs |

---

## 🎯 Goal: Zero Rework

**By following this**:
1. ✅ No duplicate work (assigned before starting)
2. ✅ No missed templates (tracking in one place)
3. ✅ No merge conflicts (separate branches)
4. ✅ No surprises (daily standup)
5. ✅ No bad submissions (simple checklist)

**Estimated speed boost**: 2-3x faster than one person alone.

