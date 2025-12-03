# Phase Tag Guide - For Junior Developer

## ❌ The Problem We Just Fixed

Your templates weren't showing up in the frontend phase filter because you didn't add **individual phase tags** to each template.

---

## ✅ The Solution

**Every template MUST have a `"phase"` field** at the individual template level (not just the skill level).

---

## 📋 Template Structure (Correct Format)

```json
{
  "id": "Y6.S.STEM_AND_LEAF",
  "strand": "Statistics & Probability",
  "name": "Stem and leaf plots",
  "description": "Interpret stem and leaf plots",
  "phase": 10.1,          // ← SKILL level (optional, used as fallback)

  "templates": [
    {
      "id": "Y6.S.STEM_AND_LEAF.T1",
      "stem": "...",
      "params": { ... },
      "answer": "...",
      "difficulty": 3,
      "phase": 10.1         // ← TEMPLATE level (REQUIRED!)
    },
    {
      "id": "Y6.S.STEM_AND_LEAF.T2",
      "stem": "...",
      "params": { ... },
      "answer": "...",
      "difficulty": 4,
      "phase": 10.1         // ← MUST BE HERE TOO!
    }
  ]
}
```

---

## 🎯 Phase Numbers to Use

Use these phase numbers for templates you're adding:

| Phase | Period | Status | Use For |
|-------|--------|--------|---------|
| **10.1** | Latest batch | Active | Junior-friendly simple templates |
| **10.6** | Recent | Active | Geometry & measurement basics |
| **10.7** | Recent | Active | Multi-step problems |
| **10.8** | Recent | Active | Data & statistics |
| **10.9** | Recent | Active | Time & conversions |
| **10.12** | Recent | Active | Complex/fixed templates |

---

## 🚨 Red Flags (Don't Do These!)

### ❌ WRONG: Missing individual phase tag
```json
{
  "id": "Y6.S.STEM_AND_LEAF.T1",
  "stem": "What is the range?",
  "params": { ... },
  "answer": "...",
  "difficulty": 3
  // ❌ NO "phase" HERE - template won't show in filter!
}
```

### ❌ WRONG: Using string instead of number
```json
{
  "phase": "10.1"  // ❌ String! Should be numeric
}
```

### ❌ WRONG: Using problematic decimal
```json
{
  "phase": 10.10   // ❌ This equals 10.1 in JavaScript!
}
```

### ✅ RIGHT: Numeric phase
```json
{
  "phase": 10.1    // ✅ Correct!
}
```

---

## 📝 Checklist Before Submitting

- [ ] Every template has `"phase": <number>`?
- [ ] Phase is a NUMBER, not a string?
- [ ] Phase is one of: 10.1, 10.6, 10.7, 10.8, 10.9, 10.12?
- [ ] Phase comes after `"difficulty"`?
- [ ] No problematic decimals like 10.10 or 10.11?

---

## 🧪 How to Test Before Committing

Run this to check for missing phases:

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/curriculumDataNew.json'));
let missing = 0;
data.years.forEach(y => y.skills.forEach(s =>
  s.templates.forEach(t => !t.phase && missing++)
));
console.log('Templates without phase: ' + missing);
"
```

If result is `0`, you're good! ✅

---

## 📌 Summary

**Rule**: Every template MUST have `"phase": <number>` at the individual template level.

**Result**: Your templates will show up in the frontend phase filter!

**Questions?** Ask Andy before committing!
