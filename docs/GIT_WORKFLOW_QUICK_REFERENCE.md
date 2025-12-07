# Git Workflow Quick Reference

**TL;DR**: Copy-paste these commands in order. No thinking required.

---

## 🎯 Your Daily Workflow

### **First Time Setup (Once)**

```powershell
# Make sure you're in the right directory
cd C:\Users\Andy\free-nz-maths

# Create your feature branch (do this ONCE at the start)
git checkout -b feature/junior-phase-10.1-Y6-easy

# Verify you're on the right branch
git status
# Should show: "On branch feature/junior-phase-10.1-Y6-easy"
```

---

### **After Adding Each Template (Repeat)**

#### **Step 1: Check What Changed**
```powershell
# See modified files
git status

# Should show:
# M  src/curriculumDataNew.json
```

#### **Step 2: Add Your Changes**
```powershell
# Add the modified file
git add src/curriculumDataNew.json

# Verify it's staged
git status
# Should show green: "Changes to be committed"
```

#### **Step 3: Commit with a Clear Message**
```powershell
# Commit (change the description to match your template)
git commit -m "Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2 (range calculation)"

# Verify the commit
git log --oneline -1
```

#### **Step 4: Push to GitHub (After 3-5 Templates)**
```powershell
# Push your changes to GitHub
git push origin feature/junior-phase-10.1-Y6-easy

# Expected output:
# remote: Create a pull request for 'feature/junior-phase-10.1-Y6-easy'
```

---

## 📋 Branch Naming Convention

**Your branch should be**:
```
feature/junior-phase-10.1-Y6-easy
```

**NOT**:
- `feature/junior-phase-10.1-Y6-Y7` (save for next batch)
- `master` (never work directly on master!)
- `phase-10.1-fix` (too generic)

---

## ❌ What NOT to Do

### ❌ Don't Work on `master` Branch
```powershell
# WRONG - Never do this!
git checkout master
# (make changes)
git add .
git commit -m "added stuff"

# RIGHT - Always create a feature branch
git checkout -b feature/junior-phase-10.1-Y6-easy
# (make changes)
```

### ❌ Don't Force Push
```powershell
# WRONG - Never do this!
git push origin feature/junior-phase-10.1-Y6-easy --force

# RIGHT - Just push normally
git push origin feature/junior-phase-10.1-Y6-easy
```

### ❌ Don't Forget to Push
```powershell
# WRONG - Commit but never push
git commit -m "Added template"
# (never run git push)

# RIGHT - Commit AND push
git commit -m "Added template"
git push origin feature/junior-phase-10.1-Y6-easy
```

---

## 🔍 Common Questions

### **Q: How do I check what branch I'm on?**
```powershell
git status
# Shows: "On branch feature/junior-phase-10.1-Y6-easy"
```

### **Q: How do I see my commits?**
```powershell
git log --oneline -10
# Shows last 10 commits with short IDs and messages
```

### **Q: I made a mistake in the last commit message. How do I fix it?**
```powershell
# Only if NOT pushed yet:
git commit --amend -m "New correct message"

# If already pushed, ask Claude for help
```

### **Q: How do I see the diff of what I changed?**
```powershell
# Before staging:
git diff src/curriculumDataNew.json

# After staging:
git diff --cached src/curriculumDataNew.json

# View full diff:
git diff HEAD
```

### **Q: I accidentally changed a file I shouldn't have. How do I undo it?**
```powershell
# Undo ALL changes to one file (not committed)
git checkout src/curriculumDataNew.json

# If already committed, ask Claude for help
```

### **Q: How do I check if my push succeeded?**
```powershell
# After pushing
git log --oneline -1
# If it shows your commit, it's pushed

# Or check GitHub directly - your branch should appear there
```

---

## 📊 Commit Message Format

**Good commit messages**:
- `Phase 10.1: Add Y6.S.STEM_AND_LEAF.T2 (range calculation)`
- `Phase 10.1: Add Y7.N.RATES.T2 and T3 (rate calculations)`
- `Phase 10.1: Add 3 Year 6 geometry templates`

**Bad commit messages**:
- `fixed stuff`
- `update`
- `added`

**Why?** So when we review the history, we know exactly what was added!

---

## 🚀 Multi-Template Batch Workflow

If you're adding **multiple templates at once** (recommended):

```powershell
# 1. Add all templates to src/curriculumDataNew.json
#    (don't commit yet, just edit the file)

# 2. Test them all:
node scripts/sample_generate.mjs | Select-String "Y6.S" -A 3
# Should see all your Y6 templates with good output

# 3. THEN commit as one batch:
git add src/curriculumDataNew.json
git commit -m "Phase 10.1: Add 5 Year 6 templates (STEM_AND_LEAF.T2, TIME.T2, MEASUREMENT.T2, COMPOSITE_SHAPES.T2, VOLUME_PRISMS.T2)"

# 4. Push:
git push origin feature/junior-phase-10.1-Y6-easy
```

This is **faster than committing one-by-one** and keeps your history clean.

---

## ✅ Verification Checklist

After each session:

- [ ] `git status` shows no uncommitted changes
- [ ] `git log --oneline -5` shows your recent commits
- [ ] `git push origin feature/junior-phase-10.1-Y6-easy` succeeds (no errors)
- [ ] GitHub shows your branch with all commits
- [ ] TEMPLATE_ASSIGNMENT_TRACKER.md is updated with checkmarks

---

## 🆘 If Something Goes Wrong

**Stuck or confused?**

1. **Run `git status`** - It always tells you what to do
2. **Ask Claude** - Don't guess, don't force push
3. **Never use `--force`** - It can break things

Safe commands to use anytime:
- `git status` ✅
- `git log --oneline` ✅
- `git diff` ✅
- `git branch` ✅

Commands to avoid without asking:
- `git reset` ❌
- `git revert` ❌
- `git push --force` ❌
- `git merge` ❌

---

## 📍 Reference

For more details, see: **DEVELOPER_ONBOARDING.md** Section 4.2

---

**That's it! Just follow the workflow above and you'll be fine.** 🚀
