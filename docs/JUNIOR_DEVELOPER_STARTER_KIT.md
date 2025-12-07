# Junior Developer Starter Kit

## 🚀 Welcome!

This guide gets you up to speed adding templates **the right way** from day 1. You have **10 templates to start with** from Phase 10.1 (Years 6-7). These are the easiest ones - no custom helpers, just basic math.

**Time estimate**: 30-60 minutes total for all 10 templates
**Difficulty**: Easy ✅ (basic arithmetic only)

---

## 📍 Prerequisites

Before starting:
1. Clone the repo and install: `npm install`
2. Read: `DEVELOPER_ONBOARDING.md` (quick skim of sections 1 & 2)
3. Read: `TEMPLATE_ASSIGNMENT_TRACKER.md` (understand work division)
4. Read: This file completely

---

## 🎯 Your First 10 Templates

You're responsible for adding these **in order**:

### **Phase 10.1 - Year 6 (7 templates)**
1. Y6.S.STEM_AND_LEAF.T2 - Range with visualization
2. Y6.M.TIME.T2 - Time duration calculation
3. Y6.M.MEASUREMENT.T2 - Unit conversion
4. Y6.G.COMPOSITE_SHAPES.T2 - L-shape perimeter
5. Y6.G.VOLUME_PRISMS.T2 - Pool volume
6. Y6.S.PROBABILITY_REPLACEMENT.T2 - Probability
7. Y6.S.VENN_DIAGRAMS.T2 - Set operations

### **Phase 10.1 - Year 7 (3 templates)**
8. Y7.N.EXPONENTS_NEGATIVE.T2 - Fractions (no helper)
9. Y7.N.RATES.T2 - Rate division (with rounding)
10. Y7.N.RATES.T3 - Cost calculation

---

## 💡 Step-by-Step: How to Add Your First Template

### **Step 1: Understand the Skill**
Let's start with **Y6.S.STEM_AND_LEAF.T2** (Range calculation)

The **Range** = Largest value - Smallest value. Super simple.

### **Step 2: Write the JSON Template**

Copy this exactly into your local file `src/curriculumDataNew.json`:

```json
{
  "id": "Y6.S.STEM_AND_LEAF.T2",
  "stem": "Find the range of these values: {min}, {max}, {mid}",
  "params": {
    "min": ["int", 1, 10],
    "max": ["int", 20, 50],
    "mid": ["int", 11, 19]
  },
  "answer": "{max - min}",
  "difficulty": 3,
  "phase": 10.1
}
```

**Key points**:
- `"id"`: Unique identifier (MUST match skill name + .T2)
- `"stem"`: Question text with **placeholders in curly braces** `{param}`
- `"params"`: Random values. Types are `["int", min, max]`, `["decimal", min, max, decimals]`, `["choice", val1, val2]`
- `"answer"`: **USE CURLY BRACES** for expressions: `"{max - min}"` NOT `"max - min"`
- `"difficulty"`: 1-10 scale (3 = easy, 7 = medium, 10 = hard)
- `"phase"`: Use `10.1` for Phase 10.1 ⚠️ **NEVER use `10.10`** - that equals `10.1` in JavaScript!

### **Step 3: Test Locally**

```bash
# From project root, generate a sample
node scripts/sample_generate.mjs | Select-String "Y6.S.STEM_AND_LEAF.T2" -A 10
```

**Expected output** (something like):
```
{
  "stem": "Find the range of these values: 3, 45, 18",
  "answer": "42"
}
```

✅ **If you see this**: You're good! Commit and move to next template.

❌ **If you see an error**: Check the error message:
- `"stem": "Find the range..."` (no substitution) → Check `{param}` names match `params` object
- `"answer": "{max - min}"` (raw expression shown) → This means algebra detected, check if you have `=` sign or `x`/`y` variables

### **Step 4: Add to the Right Place in JSON**

Find the Year 6 section in `src/curriculumDataNew.json`:

```json
{
  "year": 6,
  "skills": [
    {
      "id": "Y6.S.STEM_AND_LEAF",
      "templates": [
        { "existing templates here..." },
        // 👇 ADD YOUR NEW TEMPLATE HERE
        {
          "id": "Y6.S.STEM_AND_LEAF.T2",
          "stem": "Find the range...",
          ...
        }
      ]
    }
  ]
}
```

### **Step 5: Commit & Create PR**

```bash
# Create a feature branch
git checkout -b feature/junior-phase-10.1-Y6-easy

# Add and commit
git add src/curriculumDataNew.json
git commit -m "Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2 (range calculation)"

# Push to GitHub
git push origin feature/junior-phase-10.1-Y6-easy
```

Then create a **Pull Request** on GitHub.

---

## 📋 All 10 Starter Templates (Ready to Copy-Paste)

### **✅ 1. Y6.S.STEM_AND_LEAF.T2**
**Concept**: Find the range (max - min)
```json
{
  "id": "Y6.S.STEM_AND_LEAF.T2",
  "stem": "Find the range of these values: {min}, {max}, {mid}",
  "params": {
    "min": ["int", 1, 10],
    "max": ["int", 20, 50],
    "mid": ["int", 11, 19]
  },
  "answer": "{max - min}",
  "difficulty": 3,
  "phase": 10.1
}
```

### **✅ 2. Y6.M.TIME.T2**
**Concept**: Calculate time duration
```json
{
  "id": "Y6.M.TIME.T2",
  "stem": "A lesson starts at {start_hour}:{start_min} and ends at {end_hour}:{end_min}. How many minutes long is the lesson?",
  "params": {
    "start_hour": ["int", 8, 11],
    "start_min": ["choice", 0, 15, 30, 45],
    "end_hour": ["int", 12, 14],
    "end_min": ["choice", 0, 15, 30, 45]
  },
  "answer": "{(end_hour - start_hour) * 60 + (end_min - start_min)}",
  "difficulty": 4,
  "phase": 10.1
}
```

### **✅ 3. Y6.M.MEASUREMENT.T2**
**Concept**: Unit conversion (meters to centimeters)
```json
{
  "id": "Y6.M.MEASUREMENT.T2",
  "stem": "Convert {metres} metres to centimetres.",
  "params": {
    "metres": ["decimal", 1.5, 8.5, 1]
  },
  "answer": "{metres * 100}",
  "difficulty": 2,
  "phase": 10.1
}
```

### **✅ 4. Y6.G.COMPOSITE_SHAPES.T2**
**Concept**: L-shape perimeter (add all sides)
```json
{
  "id": "Y6.G.COMPOSITE_SHAPES.T2",
  "stem": "An L-shaped garden has sides: {a}m, {b}m, {c}m, {d}m, {e}m, {f}m. Find the perimeter.",
  "params": {
    "a": ["int", 5, 15],
    "b": ["int", 3, 8],
    "c": ["int", 4, 12],
    "d": ["int", 2, 7],
    "e": ["int", 3, 10],
    "f": ["int", 2, 6]
  },
  "answer": "{a + b + c + d + e + f}",
  "difficulty": 3,
  "phase": 10.1
}
```

### **✅ 5. Y6.G.VOLUME_PRISMS.T2**
**Concept**: Volume of rectangular prism (length × width × height)
```json
{
  "id": "Y6.G.VOLUME_PRISMS.T2",
  "stem": "A swimming pool is {length}m long, {width}m wide, and {depth}m deep. What is its volume in cubic metres?",
  "params": {
    "length": ["int", 20, 50],
    "width": ["int", 10, 25],
    "depth": ["int", 2, 5]
  },
  "answer": "{length * width * depth}",
  "difficulty": 3,
  "phase": 10.1
}
```

### **✅ 6. Y6.S.PROBABILITY_REPLACEMENT.T2**
**Concept**: Probability with replacement (event happens twice independently)
```json
{
  "id": "Y6.S.PROBABILITY_REPLACEMENT.T2",
  "stem": "A bag contains {total} balls: {red} red and {blue} blue. You draw a ball, replace it, then draw again. What is the probability of drawing a red ball both times? Give your answer as a fraction in simplest form.",
  "params": {
    "total": ["int", 6, 10],
    "red": ["int", 1, 4],
    "blue": ["int", 1, 4]
  },
  "answer": "'{red}/{total} × {red}/{total} = {red * red}/{total * total}'",
  "difficulty": 5,
  "phase": 10.1
}
```

⚠️ **NOTE**: This uses `'...'` for a statement answer. That's OK here because it's showing the working, not a calculation.

### **✅ 7. Y6.S.VENN_DIAGRAMS.T2**
**Concept**: Set operations (both - either)
```json
{
  "id": "Y6.S.VENN_DIAGRAMS.T2",
  "stem": "In a Venn diagram: Set A has {total_a} elements, Set B has {total_b} elements, and {both} elements are in both sets. How many elements are in A but not B?",
  "params": {
    "total_a": ["int", 5, 15],
    "total_b": ["int", 5, 15],
    "both": ["int", 1, 5]
  },
  "answer": "{total_a - both}",
  "difficulty": 4,
  "phase": 10.1
}
```

### **✅ 8. Y7.N.EXPONENTS_NEGATIVE.T2**
**Concept**: Negative exponents as fractions
```json
{
  "id": "Y7.N.EXPONENTS_NEGATIVE.T2",
  "stem": "Simplify {base}^{neg_exp} (write as a fraction)",
  "params": {
    "base": ["int", 2, 5],
    "neg_exp": ["int", -3, -1]
  },
  "answer": "'1/{base}^{Math.abs(neg_exp)}'",
  "difficulty": 5,
  "phase": 10.1
}
```

⚠️ **NOTE**: Using `Math.abs()` to make the exponent positive in the display.

### **✅ 9. Y7.N.RATES.T2**
**Concept**: Unit rate (division with rounding) - IMPORTANT: Shows rounding!
```json
{
  "id": "Y7.N.RATES.T2",
  "stem": "If {cost} dollars buys {quantity} items, what is the cost per item? Round to 2 decimal places.",
  "params": {
    "cost": ["decimal", 5, 25, 1],
    "quantity": ["int", 3, 8]
  },
  "answer": "{round(cost / quantity, 2)}",
  "difficulty": 4,
  "phase": 10.1
}
```

🔴 **KEY LEARNING**: Notice `round(cost / quantity, 2)` - we MUST round division results! This fixes the long decimal problem.

### **✅ 10. Y7.N.RATES.T3**
**Concept**: Cost calculation (multiply with rounding)
```json
{
  "id": "Y7.N.RATES.T3",
  "stem": "Petrol costs ${price} per litre. How much does a {volume}-litre tank cost? Round to 2 decimal places.",
  "params": {
    "price": ["decimal", 1.8, 2.6, 2],
    "volume": ["int", 30, 70]
  },
  "answer": "{round(price * volume, 2)}",
  "difficulty": 3,
  "phase": 10.1
}
```

---

## 🚨 Common Mistakes to Avoid

We've learned these lessons the hard way. **Don't repeat them!**

### ❌ MISTAKE 1: Missing Curly Braces in Answers
```javascript
// WRONG - This shows the raw expression as the answer!
"answer": "max - min"

// ✅ RIGHT - Curly braces tell the system to evaluate it
"answer": "{max - min}"
```

### ❌ MISTAKE 2: Decimal Phase Numbers
```javascript
// WRONG - JavaScript treats 10.10 as 10.1
"phase": "10.10_fix"

// ✅ RIGHT - Use 10.11, 10.12, etc. after 10.9
"phase": 10.12
```

### ❌ MISTAKE 3: Division Without Rounding
```javascript
// WRONG - Shows long decimals like 0.666666666
"answer": "{a / b}"

// ✅ RIGHT - Always round division
"answer": "{round(a / b, 2)}"
```

### ❌ MISTAKE 4: Extra Quotes on Static Answers
```javascript
// WRONG - Literal quotes appear in the answer!
"params": {},
"answer": "'x ≤ 4'"

// ✅ RIGHT - No extra quotes
"params": {},
"answer": "x ≤ 4"
```

### ❌ MISTAKE 5: Hardcoded Calculations
```javascript
// WRONG - Students memorize the answer, no randomization
"params": {},
"answer": "42"

// ✅ RIGHT - Always randomize
"params": { "a": ["int", 1, 10], "b": ["int", 1, 10] },
"answer": "{a * b}"
```

---

## ✅ Your Daily Checklist

Before submitting **each template**, check:

- [ ] **Template ID**: Matches the pattern `YX.CATEGORY.SKILL.TX` (e.g., `Y6.S.STEM_AND_LEAF.T2`)
- [ ] **Stem**: Has `{param}` placeholders for each randomized parameter
- [ ] **Params**:
  - [ ] Every param in stem is defined in `params` object
  - [ ] Every param in `answer` is defined in `params` object
  - [ ] No param is left with empty/undefined range
  - [ ] Uses correct format: `["int", min, max]` or `["decimal", min, max, decimals]` or `["choice", val1, val2, ...]`
- [ ] **Answer**:
  - [ ] Uses curly braces: `"{expression}"` not `"expression"`
  - [ ] Includes `round(..., 2)` if division is used
  - [ ] NO extra quotes on static answers (unless showing working like `'1/{n}'`)
- [ ] **Difficulty**: 1-10 scale, reasonable for the year level
- [ ] **Phase**: `10.1` (numeric, no "fix" or "test" suffix)
- [ ] **Tested**: Ran `node scripts/sample_generate.mjs` and saw realistic output
- [ ] **Committed**: Created a feature branch, committed with clear message, pushed to GitHub

---

## 🧪 Quick Test Workflow

For each template, run this:

```bash
# 1. Generate a sample (replace T2 with correct number)
node scripts/sample_generate.mjs | Select-String "Y6.S.STEM_AND_LEAF.T2" -A 10

# 2. Check output looks good:
#    - stem: Shows numbers not "{param}"
#    - answer: Shows a number not an expression
#    - No errors in console

# 3. If good, commit:
git add src/curriculumDataNew.json
git commit -m "Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2 (range)"
git push origin feature/junior-phase-10.1-Y6-easy
```

If there's an error, check the error message against the common mistakes above.

---

## 🎓 When to Ask Claude

**DON'T hesitate to ask!** These are red flags:

- ❓ "I need a helper function like `simplify()` or `lcm()`" → **Ask Claude**
- ❓ "The answer depends on the parameter value in a complex way" → **Ask Claude**
- ❓ "I'm not sure what this skill is supposed to teach" → **Ask Claude**
- ❓ "I've tried 3 times and it still shows an error" → **Ask Claude**
- ❓ "Should I use visualization for this?" → **Ask Claude**

**DO ask early.** Better to clarify than submit wrong templates and redo work.

---

## 📊 Progress Tracking

As you complete each template:

1. **Update the checkbox** in TEMPLATE_ASSIGNMENT_TRACKER.md:
   ```markdown
   - [x] Y6.S.STEM_AND_LEAF.T2 (2025-12-04)
   - [ ] Y6.M.TIME.T2
   ```

2. **Commit with clear message**:
   ```bash
   git commit -m "Phase 10.1: Add Y6.M.TIME.T2 (time duration)"
   ```

3. **Push & Create PR** when you finish 3-5 templates:
   ```bash
   git push origin feature/junior-phase-10.1-Y6-easy
   # Then go to GitHub and create Pull Request
   ```

---

## 🚀 Ready to Start?

1. ✅ Read this entire file
2. ✅ Create a feature branch: `git checkout -b feature/junior-phase-10.1-Y6-easy`
3. ✅ Copy template #1 (Y6.S.STEM_AND_LEAF.T2) into `src/curriculumDataNew.json`
4. ✅ Test it: `node scripts/sample_generate.mjs | Select-String "Y6.S.STEM_AND_LEAF.T2"`
5. ✅ Commit: `git commit -m "Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2 (range)"`
6. ✅ Continue with template #2

**Questions? Ask Claude!**

---

## 📝 Reference Links

- **Work Division**: See TEMPLATE_ASSIGNMENT_TRACKER.md
- **Template Rules**: See DEVELOPER_ONBOARDING.md sections 2.1 & 2.3
- **Visual Data**: See VISUALDATA_AUDIT.md (not needed for these 10)
- **Common Issues**: See DEVELOPER_ONBOARDING.md section 4.3
- **Example Templates**: See TEMPLATE_EXAMPLES.md

---

**Happy templating! 🎉 You've got this!**
