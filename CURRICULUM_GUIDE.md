# 📚 Curriculum Guide – Where to Add Templates

**Quick reference for adding new question templates.** Check this first before opening any curriculum files!

---

## 🎯 Where to Add Templates by Year

| Year/Type | File Location | Size | What Contains |
|-----------|--------------|------|---------------|
| **Y6-Y9** | `src/curriculumDataNew.json` | ~1700 lines | Years 6, 7, 8, 9 combined |
| **Y10** | `src/curriculumDataNew_Y10.json` | ~1100 lines | Year 10 only |
| **Y11** | `src/curriculumDataNew_Y11.json` | ~1480 lines | Year 11 only |
| **Y12** | `src/curriculumDataNew_Y12.json` | ~1000 lines | Year 12 only |
| **Y13** | `src/curriculumDataNew_Y13.json` | ~750 lines | Year 13 only |
| **Olympiad** | `src/olympiadCurriculum.json` | ~850 lines | Elite challenge questions |

---

## 📝 How to Add a Template

### Step 1: Open the Right File
- **Adding Y10 template?** → Open `src/curriculumDataNew_Y10.json`
- **Adding Y6-9?** → Open `src/curriculumDataNew.json`
- etc.

### Step 2: Find the Skill
Search for the skill ID, e.g., `"id": "Y10.A.QUADRATIC_EQS"`

### Step 3: Add Your Template
Inside the skill's `"templates": [...]` array, add:

```json
{
  "id": "Y10.A.QUADRATIC_EQS.T2",
  "stem": "Solve {equation} = 0",
  "params": {
    "equation": ["choice", "x^2+3x+2", "x^2-5x+6"]
  },
  "answer": "factorized",
  "difficulty": 6,
  "phase": 10.17,
  "hint": "Try factoring first"
}
```

### Step 4: Test & Commit
```bash
npm run build    # Verify it compiles
git add .
git commit -m "feat: add quadratic equation template for Y10"
```

---

## 📁 Curriculum Files Architecture

```
src/
├── curriculumDataFull.json          Base curriculum (Years 6-13)
├── curriculumDataNew.json           ← NEW TEMPLATES for Y6-9
├── curriculumDataNew_Y10.json       ← NEW TEMPLATES for Y10
├── curriculumDataNew_Y11.json       ← NEW TEMPLATES for Y11
├── curriculumDataNew_Y12.json       ← NEW TEMPLATES for Y12
├── curriculumDataNew_Y13.json       ← NEW TEMPLATES for Y13
├── olympiadCurriculum.json          Olympiad elite challenges
├── knowledgeSnippets.json           Knowledge/explanation content
└── curriculumDataMerged.js          MERGES all above at runtime
```

**How it works:** At startup, `curriculumDataMerged.js` loads the base curriculum, then applies all "new" files on top to create the final merged curriculum.

---

## ✅ Template Requirements Checklist

Every template **must have**:

- ✓ **ID**: Unique, year-correct (e.g., `Y10.A.SKILL.T2`)
- ✓ **Stem**: Question text with `{placeholders}`
- ✓ **Params**: Values for each placeholder
- ✓ **Answer**: How to calculate the answer
- ✓ **Difficulty**: 1-10 scale
- ✓ **Phase**: When added (e.g., 10.17)

Optional:
- Hint text
- Visual instructions

---

## 🚫 Common Mistakes (Avoid These!)

| ❌ Wrong | ✅ Right |
|---------|---------|
| Add Y10 template to `curriculumDataNew_Y11.json` | Open `curriculumDataNew_Y10.json` |
| Use `Y11.A.SKILL` in a Y10 file | Use `Y10.A.SKILL` in Y10 file |
| Template ID: `Y10.A.SKILL.T1` (duplicate) | Template ID: `Y10.A.SKILL.T2` (next number) |
| Forget to increment difficulty | Set difficulty: 5 |
| Leave phase blank | Set phase: 10.17 or current version |

---

## 🔍 Skill ID Format

Template IDs follow this pattern:

```
Y10 . A . QUADRATIC_EQS . T1
│    │   │               │
│    │   │               └─ Template number (T1, T2, T3...)
│    │   └─────────────────── Skill name (UPPERCASE_WITH_UNDERSCORES)
│    └───────────────────────── Strand letter (A=Algebra, N=Number, etc)
└────────────────────────────── Year (Y6, Y7, Y10, Y11, Y12, Y13)
```

### Strand Letters
- **N** = Number & Algebra
- **A** = Algebra
- **G** = Geometry & Measurement
- **S** = Statistics & Probability
- **C** = Calculus (Y11+)
- **V** = Vectors (Y12+)

---

## 🏆 Olympiad Elite Challenges

For adding **Olympiad challenge questions**:
- File: `src/olympiadCurriculum.json`
- Format: Same as regular templates but use `year: "Olympiad"` instead of numeric year
- Difficulty: Typically 8-10 (harder than standard curriculum)
- Focus: Problem-solving, proofs, and advanced topics

Example Olympiad Template:
```json
{
  "id": "Y13.A.POLYNOMIAL_PROOF.T1",
  "stem": "Prove that {expression} is divisible by 3 for all positive integers n",
  "params": { ... },
  "answer": "proof_verification",
  "difficulty": 9,
  "year": "Olympiad",
  "phase": 10.17
}
```

---

## 🎓 Knowledge/Reference Content

If you're adding **explanations or key formulas** (not questions):
- File: `phase/knowledge add1.json`
- Format: Keyed by skill ID

Example:
```json
"Y10.A.QUADRATIC_EQS": {
  "title": "Solving Quadratic Equations",
  "summary": "Methods include factoring, completing the square, and the quadratic formula",
  "key_formulas": [
    "ax² + bx + c = 0",
    "x = (-b ± √(b²-4ac)) / 2a"
  ],
  "example": "Solve x² + 3x + 2 = 0 → (x+1)(x+2) = 0 → x = -1 or x = -2",
  "common_misconceptions": [
    "Forgetting both solutions when factoring"
  ]
}
```

---

## 🔧 Setup & Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate sample questions (test locally)
node scripts/sample_generate.mjs

# Build for production
npm run build

# Create git commit
git add src/curriculumDataNew*.json
git commit -m "feat: add [description] for [year]"
```

---

## 📞 Quick Help

**Question:** Where do I add Y12 templates?
**Answer:** `src/curriculumDataNew_Y12.json`

**Question:** File seems huge, am I in the right place?
**Answer:** Y10-13 files are ~750-1500 lines. If your file is huge, you might be in the base file by mistake.

**Question:** Can I edit multiple years in one go?
**Answer:** Yes! Open multiple files. Y10 and Y11 won't conflict since they're separate files.

**Question:** How do I know if my template is valid?
**Answer:** Run `npm run build`. If it compiles, you're good!

**Question:** How do I test a new template?
**Answer:** Run `node scripts/sample_generate.mjs` - it will generate questions with your new template.

---

## 📚 Full Documentation

For detailed information, see:
- **Full setup & features:** `docs/DEVELOPER_ONBOARDING.md`
- **Template syntax:** `docs/TEMPLATE_EXAMPLES.md`
- **Expression evaluator:** `docs/EXPRESSION_SYNTAX.md`
- **All documentation:** `docs/` folder

---

**Last Updated:** 2025-12-05
**Current Phase:** 10.17
**Status:** ✓ Y6-13 curriculum split and organized
