# Template Submission Process - For Junior Developer

## ✅ Safe Review Workflow (NEW PROCESS)

To prevent issues like the phase 14 incident, use this process:

### Step 1: Create a Separate Submission File
Instead of directly editing `src/curriculumDataNew.json`, create a **separate review file** first:

**File naming**: `junior-templates-to-review-YYYYMMDD.json`

Example: `junior-templates-to-review-20251204.json`

### Step 2: Add Your Templates to the Review File

Format your submission as a simple JSON array of NEW templates:

```json
{
  "submittedDate": "2025-12-04",
  "submittedBy": "JuniorDeveloper",
  "totalCount": 3,
  "templates": [
    {
      "skillId": "Y6.S.PROBABILITY",
      "skillName": "Probability",
      "templateId": "Y6.S.PROBABILITY.T10",
      "stem": "A bag contains {r} red balls and {b} blue balls. What is the probability of picking a red ball?",
      "params": {
        "r": ["int", 2, 8],
        "b": ["int", 2, 8]
      },
      "answer": "r / (r + b)",
      "difficulty": 3,
      "phase": 10.1,
      "notes": "No hardcoded values, uses randomized parameters"
    },
    {
      "skillId": "Y7.N.EXPONENTS",
      "skillName": "Exponents",
      "templateId": "Y7.N.EXPONENTS.T15",
      "stem": "Simplify: {base}^{exp1} × {base}^{exp2}",
      "params": {
        "base": ["int", 2, 10],
        "exp1": ["int", 1, 4],
        "exp2": ["int", 1, 4]
      },
      "answer": "{base}^({exp1} + {exp2})",
      "difficulty": 2,
      "phase": 10.1,
      "notes": "Simple exponent law application"
    },
    {
      "skillId": "Y8.A.EQUATIONS",
      "skillName": "Equations",
      "templateId": "Y8.A.EQUATIONS.T12",
      "stem": "Solve: {a}x + {b} = {c}",
      "params": {
        "a": ["int", 2, 10],
        "b": ["int", 1, 20],
        "c": ["int", 21, 50]
      },
      "answer": "({c} - {b}) / {a}",
      "difficulty": 3,
      "phase": 10.1,
      "notes": "Linear equation with one variable"
    }
  ]
}
```

### Step 3: Push to a Feature Branch

```bash
# Create a feature branch for your submission
git checkout -b feature/junior-templates-review-20251204

# Add the review file
git add junior-templates-to-review-20251204.json

# Commit with descriptive message
git commit -m "Submit 3 templates for review: Y6.S.PROBABILITY.T10, Y7.N.EXPONENTS.T15, Y8.A.EQUATIONS.T12"

# Push to remote
git push -u origin feature/junior-templates-review-20251204
```

### Step 4: Notify Andy for Review

Send a message with:
- Number of templates submitted
- Template IDs
- Link to the review file on GitHub
- Any special notes about the templates

Example: "Submitted 3 templates in PR feature/junior-templates-review-20251204. All use randomized parameters, no hardcoding. All tagged with phase 10.1."

### Step 5: Andy Reviews & Merges

Andy will:
1. ✅ Check all templates have proper phase tags
2. ✅ Verify no hardcoded values
3. ✅ Test that parameters are valid
4. ✅ Either approve or request changes
5. ✅ Manually insert into `src/curriculumDataNew.json`
6. ✅ Commit to main branch

---

## 🚨 Review Checklist - What Andy Will Check

Before your templates are merged, they will be verified against:

- [ ] **Phase tag exists**: Every template has `"phase"` field
- [ ] **Phase is valid**: Phase is 10.1, 10.6, 10.7, 10.8, 10.9, 10.11, or 10.12
- [ ] **Phase is numeric**: `"phase": 10.1` NOT `"phase": "10.1"`
- [ ] **No hardcoded answers**: Uses parameter placeholders like `{a}`, `{b}`
- [ ] **Parameters are valid**: Each param uses `["int", ...]`, `["decimal", ...]`, or `["choice", ...]` format
- [ ] **Answer formula is correct**: Math is correct for the randomization
- [ ] **Difficulty is set**: 1-5 scale
- [ ] **No visualData issues**: If using visualData, it must match parameter names
- [ ] **Stem is clear**: Question makes sense with the parameters

---

## ⚠️ Why This Process Matters

**Previous Issue**: Phase 14 templates were added but didn't appear on frontend because:
- Phase format was wrong (`14` instead of `10.1`)
- No one caught it before they were committed
- Had to restore entire file from GitHub

**New Process Prevents**:
- Invalid phase tags
- Hardcoded values slipping through
- Parameter format errors
- Frontend visibility issues

---

## 📝 Submission Template (Copy & Use)

Save this as a template for each submission:

```json
{
  "submittedDate": "YYYY-MM-DD",
  "submittedBy": "JuniorDeveloper",
  "totalCount": 0,
  "templates": [
    {
      "skillId": "",
      "skillName": "",
      "templateId": "",
      "stem": "",
      "params": {},
      "answer": "",
      "difficulty": 0,
      "phase": 10.1,
      "notes": ""
    }
  ]
}
```

---

## ✅ Benefits of This Workflow

1. **Safety**: Templates reviewed before going into main file
2. **Traceability**: Clear record of what was submitted when
3. **Learning**: Andy can give feedback on template quality
4. **Prevention**: Catches issues like phase 14 before they cause problems
5. **Accountability**: Both developers track submissions & approvals

---

**Questions?** Ask Andy before submitting!
