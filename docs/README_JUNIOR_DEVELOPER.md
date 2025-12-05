# Junior Developer Guide – START HERE

Welcome! This is your complete onboarding guide. **Read these documents in order** to understand everything you need to add templates.

---

## 📖 Reading Order

### **Day 1: Understanding the Big Picture (30 mins)**

1. **Read**: This file (you're reading it now! ✅)
2. **Read**: [`TEMPLATE_ASSIGNMENT_TRACKER.md`](TEMPLATE_ASSIGNMENT_TRACKER.md)
   - Understand work division: what's your job, what's Claude's job
   - See which 142 templates are assigned to you
   - Learn the tracking system

3. **Read**: [`JUNIOR_DEVELOPER_STARTER_KIT.md`](JUNIOR_DEVELOPER_STARTER_KIT.md)
   - See examples of the first 10 templates you'll add
   - Understand the template JSON structure
   - Learn the checklist to validate templates
   - Common mistakes to avoid

### **Day 1: Setting Up Git (15 mins)**

4. **Read**: [`GIT_WORKFLOW_QUICK_REFERENCE.md`](GIT_WORKFLOW_QUICK_REFERENCE.md)
   - Learn the daily git workflow (copy-paste commands)
   - Understand branch naming
   - See what NOT to do

### **Day 2+: Reference Materials (As Needed)**

5. **Reference**: [`DEVELOPER_ONBOARDING.md`](DEVELOPER_ONBOARDING.md)
   - Deep dives on template structure
   - How the answer engine works
   - Troubleshooting section
   - When to ask for help

6. **Reference**: [`VISUALDATA_AUDIT.md`](VISUALDATA_AUDIT.md)
   - For templates that need visuals (you probably won't need this for first 10)
   - Rules for matching visuals to parameters

7. **Reference**: [`HINT_KNOWLEDGE_MODAL_GUIDE.md`](HINT_KNOWLEDGE_MODAL_GUIDE.md)
   - If you need to update hints or knowledge content
   - Unlikely needed for your first batch

---

## 🎯 Your Job (142 Templates)

**You add templates that**:
- ✅ Use only basic arithmetic: `+`, `-`, `*`, `/`
- ✅ Use only basic functions: `round()`, `sqrt()`, `Math.max()`, `Math.min()`
- ✅ Have randomized params: `["int", min, max]` or `["choice", val1, val2]`
- ✅ **NO custom helpers** like `simplify()`, `lcm()`, `prime_or_composite()`
- ✅ No hardcoded calculations
- ✅ Static visualizations OR matching parameter references

**Examples of YOUR templates**:
```json
{
  "id": "Y6.M.TIME.T2",
  "stem": "A lesson starts at {start_hour}:{start_min} and ends at {end_hour}:{end_min}. How many minutes long?",
  "params": { "start_hour": ["int", 8, 11], ... },
  "answer": "{(end_hour - start_hour) * 60 + (end_min - start_min)}"
}
```

---

## 🚀 What Claude Handles (30 Templates)

Claude adds templates that need:
- ❌ Custom helper functions (`lcm()`, `simplify()`, `factor_quadratic()`)
- ❌ Complex randomization logic
- ❌ All Year 13 (Olympics) templates
- ❌ Fixing hardcoded templates

**You don't need to worry about these!** Just focus on your 142.

---

## 📊 Your Assignment (by Phase)

### **Phase 10.1: 45 Simple Templates**
- Year 6: 7 templates
- Year 7: 5 templates (+ 3 more = 8)
- Year 8: 8 simple templates (Claude handles 3 complex)
- Year 9: 10 simple templates (Claude handles 4 complex)
- Year 10: 6 simple templates (Claude handles 6 complex)

**Start with**: The first 10 in [`JUNIOR_DEVELOPER_STARTER_KIT.md`](JUNIOR_DEVELOPER_STARTER_KIT.md)

### **Phase 11: 55 Simple Templates**
- More Year 10-12 topics (8 Y10 + 10 Y11 + 8 Y12)

### **Timeline**: No rush – just work at a steady pace. Target: 5-10 per day.

---

## ✅ Day 1 Checklist

- [ ] Read this file completely
- [ ] Read TEMPLATE_ASSIGNMENT_TRACKER.md
- [ ] Read JUNIOR_DEVELOPER_STARTER_KIT.md
- [ ] Read GIT_WORKFLOW_QUICK_REFERENCE.md
- [ ] Understand: Your job is 142 simple templates, Claude's job is 30 complex
- [ ] Understand: You'll use git branches to track work
- [ ] Set up your git branch: `git checkout -b feature/junior-phase-10.1-Y6-easy`
- [ ] Create first template (Y6.S.STEM_AND_LEAF.T2) and test it
- [ ] Commit and push: `git push origin feature/junior-phase-10.1-Y6-easy`

---

## 🎓 Key Concepts

### **Template = Question**
Each template generates many random questions. Example:

```json
{
  "id": "Y6.S.STEM_AND_LEAF.T2",  // Unique ID
  "stem": "Find the range: {min}, {max}, {mid}",  // Question text with placeholders
  "params": {  // Random values
    "min": ["int", 1, 10],   // Random 1-10
    "max": ["int", 20, 50],  // Random 20-50
    "mid": ["int", 11, 19]   // Random 11-19
  },
  "answer": "{max - min}",  // Formula to evaluate
  "difficulty": 3,  // 1-10 scale
  "phase": 10.1  // Phase number (NOT "10.10"!)
}
```

### **Every Time a Student Takes This Template**
- System generates random `min`, `max`, `mid` values
- Shows: "Find the range: 5, 42, 16"
- Calculates answer: 42 - 5 = 37
- Student types answer, gets marked correct/incorrect

---

## 🚨 Red Flags (When to Ask Claude)

**If your template has any of these, ask Claude first!**

- 🚩 Needs a helper function (`lcm()`, `simplify()`, etc.)
- 🚩 Complex "if-then" logic in the answer
- 🚩 Hardcoded values (no params)
- 🚩 Visualization that changes based on parameters
- 🚩 Educational concept you're unsure about
- 🚩 Something looks weird or broken after testing

**Better to ask early than submit wrong templates!**

---

## 📋 Daily Workflow

### **Each Day:**

1. **Pick a template** from your assignment
2. **Write the JSON** (copy template structure from STARTER_KIT.md)
3. **Test it**: `node scripts/sample_generate.mjs | Select-String "Y6.S.STEM_AND_LEAF"`
4. **Verify**: Output looks good (numbers, not expressions)
5. **Commit**: `git commit -m "Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2"`
6. **Push**: `git push origin feature/junior-phase-10.1-Y6-easy`
7. **Update tracking**: Mark template as done in TEMPLATE_ASSIGNMENT_TRACKER.md

### **When You Finish 5 Templates:**
- Create a Pull Request on GitHub
- Title: `Phase 10.1: Add 5 Year 6 templates`
- Claude will review and merge

---

## 💬 How to Communicate

### **Daily Standup (5 minutes)**
Share with Claude:
- ✅ What you completed yesterday
- 🎯 What you're doing today
- 🚩 Any blockers

Example:
```
Yesterday: Added 5 Y6 templates (STEM_AND_LEAF.T2, TIME.T2, MEASUREMENT.T2, COMPOSITE_SHAPES.T2, VOLUME_PRISMS.T2)
Today: Will add Y6.G.VOLUME_PRISMS.T2 and Y6.S.PROBABILITY.T2
Blockers: None
```

### **Getting Help**
- ❓ Questions about templates? → Ask Claude
- 🐛 Test fails? → Ask Claude
- 🚨 Red flag from checklist? → Ask Claude
- ✅ Looks good to you? → Just commit and push

---

## 🧪 Testing Checklist

Before committing each template:

```powershell
# Test the template
node scripts/sample_generate.mjs | Select-String "Y6.S.STEM_AND_LEAF.T2" -A 10

# Expected output:
# {
#   "stem": "Find the range: 5, 42, 16",
#   "answer": "37"
# }

# ✅ If it looks good: Commit!
# ❌ If it shows error or expression: Check DEVELOPER_ONBOARDING.md section 4.3
```

---

## 🔗 Quick Links

| Need | Go To |
|------|-------|
| **First 10 templates** | [`JUNIOR_DEVELOPER_STARTER_KIT.md`](JUNIOR_DEVELOPER_STARTER_KIT.md) |
| **Daily git commands** | [`GIT_WORKFLOW_QUICK_REFERENCE.md`](GIT_WORKFLOW_QUICK_REFERENCE.md) |
| **Work division & tracking** | [`TEMPLATE_ASSIGNMENT_TRACKER.md`](TEMPLATE_ASSIGNMENT_TRACKER.md) |
| **Template rules & troubleshooting** | [`DEVELOPER_ONBOARDING.md`](DEVELOPER_ONBOARDING.md) |
| **Visualization rules** | [`VISUALDATA_AUDIT.md`](VISUALDATA_AUDIT.md) |
| **Progress tracking** | [`Daily Job Tracking.md`](Daily Job Tracking.md) |

---

## 📞 Questions?

**General question about templates?**
→ Check [`JUNIOR_DEVELOPER_STARTER_KIT.md`](JUNIOR_DEVELOPER_STARTER_KIT.md) first

**Stuck on git?**
→ Check [`GIT_WORKFLOW_QUICK_REFERENCE.md`](GIT_WORKFLOW_QUICK_REFERENCE.md)

**Error message in test?**
→ Check [`DEVELOPER_ONBOARDING.md`](DEVELOPER_ONBOARDING.md) section 4.3

**Anything else?**
→ Ask Claude! Don't guess.

---

## 🚀 Ready to Go?

1. ✅ Did you read all 4 main documents? (This file, ASSIGNMENT_TRACKER, STARTER_KIT, GIT_QUICK_REFERENCE)
2. ✅ Do you understand your 142 templates are simple (no helpers)?
3. ✅ Do you have 10 examples ready from STARTER_KIT?
4. ✅ Did you create your feature branch?
5. ✅ Ready to add your first template?

**Yes? Let's go! Start with Y6.S.STEM_AND_LEAF.T2 from JUNIOR_DEVELOPER_STARTER_KIT.md**

---

**Good luck! 🎉 You've got this! Remember: ask Claude if anything is unclear.**

---

*Last updated: 2025-12-04*
*For changes or questions about this guide, let Claude know!*
