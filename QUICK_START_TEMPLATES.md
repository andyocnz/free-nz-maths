# Quick Start: Adding Templates in 5 Minutes

This guide gets you from idea to working template fast.

## TL;DR Workflow

```bash
# 1. Copy an example, modify it
# 2. Validate
npm run validate '{"id":"Y6.N.TEST.T1",...}'

# 3. Add to curriculumDataNew.json
# 4. Test
npm run dev
```

## Step-by-Step Example

### Example: Adding a Simple Addition Question

**1. Write the template:**
```json
{
  "id": "Y6.N.ADDITION.T5",
  "stem": "Calculate: {a} + {b}",
  "params": {
    "a": ["int", 10, 100],
    "b": ["int", 10, 100]
  },
  "answer": "a + b",
  "difficulty": 2
}
```

**2. Validate it:**
```bash
npm run validate '{"id":"Y6.N.ADDITION.T5","stem":"Calculate: {a} + {b}","params":{"a":["int",10,100],"b":["int",10,100]},"answer":"a + b","difficulty":2}'
```

Output:
```
✅ Template is valid!
   No issues found. Ready to add to curriculum.
```

**3. Add to file:**
- Open `src/curriculumDataNew.json`
- Find Year 6 → Y6.N.ADDITION skill
- Add comma after last template
- Paste your template

**4. Test it:**
```bash
npm run dev
# Navigate to Year 6 → Addition in the UI
```

---

## Common Template Types

### Type 1: Simple Math (No x/y variables)
```json
{
  "id": "Y7.N.MULTIPLY.T1",
  "stem": "Calculate {a} × {b}",
  "params": {
    "a": ["int", 2, 12],
    "b": ["int", 2, 12]
  },
  "answer": "a * b",
  "difficulty": 3
}
```
✅ **No {} needed** - no x or y in answer

### Type 2: Algebra (Has x/y)
```json
{
  "id": "Y8.A.LINEAR.T1",
  "stem": "Solve for y: y = {m}x + {c} when x = {x}",
  "params": {
    "m": ["int", 2, 5],
    "c": ["int", -10, 10],
    "x": ["int", 1, 10]
  },
  "answer": "{m * x + c}",
  "difficulty": 6
}
```
⚠️ **Needs {}** - has x in answer

### Type 3: With Function
```json
{
  "id": "Y6.N.FRACTIONS.T3",
  "stem": "Simplify {num}/{den}",
  "params": {
    "num": ["int", 2, 20],
    "den": ["int", 2, 20]
  },
  "answer": "simplify(num, den)",
  "difficulty": 4
}
```
✅ **No {} needed** - function call, no x/y

### Type 4: Conditional Answer
```json
{
  "id": "Y6.S.HISTOGRAM.T1",
  "stem": "How many in the {bin} bin?",
  "params": {
    "v1": ["int", 5, 15],
    "v2": ["int", 5, 15],
    "bin": ["choice", "10-20", "20-30"]
  },
  "answer": "(bin === '10-20' ? v1 : v2)",
  "difficulty": 3
}
```
✅ **No {} needed** - ternary, no x/y

### Type 5: With Rounding
```json
{
  "id": "Y9.A.INEQUALITIES.T1",
  "stem": "Solve: {a}x + {b} > {c}",
  "params": {
    "a": ["int", 2, 5],
    "b": ["int", 1, 10],
    "c": ["int", 11, 40]
  },
  "answer": "{'x > ' + round((c - b) / a, 2)}",
  "difficulty": 7
}
```
⚠️ **Needs {}** - has x, plus rounding for clean display

---

## Quick Validation Checklist

Before adding your template:

- [ ] ID format: `Y{year}.{strand}.{TOPIC}.T{number}`
- [ ] All `{params}` in stem are in params object
- [ ] Answer has `{}` if it contains x or y
- [ ] No backticks (`` ` ``) in answer
- [ ] Division uses `round(expression, 2)`
- [ ] Parameter ranges don't include 0 if answer divides by them
- [ ] Difficulty is 1-10
- [ ] Run validator: `npm run validate '...'`

---

## Fast Copy-Paste Templates

### Basic arithmetic:
```json
{"id":"Y6.N.SKILL.T1","stem":"Calculate: {a} + {b}","params":{"a":["int",1,100],"b":["int",1,100]},"answer":"a + b","difficulty":3}
```

### With x/y (algebra):
```json
{"id":"Y7.A.SKILL.T1","stem":"Evaluate {m}x when x = {x}","params":{"m":["int",2,10],"x":["int",1,10]},"answer":"{m * x}","difficulty":5}
```

### With choice:
```json
{"id":"Y8.S.SKILL.T1","stem":"What is {choice}?","params":{"v1":["int",5,15],"v2":["int",5,15],"choice":["choice","A","B"]},"answer":"(choice === 'A' ? v1 : v2)","difficulty":4}
```

---

## Troubleshooting

### ❌ Error: "Answer shows x + y as raw text"
**Fix:** Add `{}` around answer: `"{x + y}"`

### ❌ Error: "Invalid JSON"
**Fix:** Check for:
- Missing comma before your template
- Trailing comma after last template
- Unescaped quotes in strings

### ❌ Error: "Function not found"
**Fix:** Either:
- Add function to `src/mathHelpers.js`
- Or use different function

### ❌ Error: "Division by zero"
**Fix:** Either:
- Exclude 0 from range: `["int", 1, 10]` not `["int", 0, 10]`
- Or add conditional: `"{x === 0 ? 'undefined' : 10/x}"`

---

## NPM Scripts Reference

```bash
npm run validate '<json>'    # Validate a template
npm run check-broken          # Find broken templates in files
npm run samples               # Generate sample questions
npm run find-singles          # Find skills with only 1 template
npm run dev                   # Start dev server
```

---

## Full Documentation

- **Examples & Patterns:** `TEMPLATE_EXAMPLES.md`
- **Developer Guide:** `DEVELOPER_ONBOARDING.md`
- **Scripts Help:** `scripts/README.md`

---

## Need Help?

1. Check `TEMPLATE_EXAMPLES.md` for more patterns
2. Look at existing templates in `src/curriculumDataNew.json`
3. Run validator to catch issues early
4. Test in browser before committing

**Remember:** Validator catches 90% of issues! Always run it first.
