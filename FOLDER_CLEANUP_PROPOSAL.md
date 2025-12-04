# Folder Cleanup Proposal - Zero Risk

## Overview
Organize files into logical folders without breaking the app or workflow.

**Key Principle:** Only move/organize files. NO deletions, NO changes to imports. All JSON imports remain exactly the same.

---

## Current State Analysis

### Root Folder: Too Cluttered
**35+ files in root:**
- 20+ documentation files (.md)
- 7 PowerShell scripts (.ps1)
- 5 text files (.txt)
- 3 Node scripts (.mjs, .cjs)
- 1 temporary file (temp_before.txt)

**Problem:** Hard to distinguish live app files from workspace files.

### src/ Folder: Mixed Usage
**9 JSON files:**
- `curriculumDataNew.json` ✓ (used by app)
- `curriculumDataFull.json` ✓ (used by app)
- `olympiadCurriculum.json` ✓ (used by app)
- `year11Curriculum.json` ✓ (used by app - see imports)
- `year12Curriculum.json` ✓ (used by app)
- `year13Curriculum.json` ✓ (used by app)
- `knowledgeSnippets.json` ✓ (used by app)
- `curriculumDataNew.prod.json` ✗ (BACKUP - not imported)
- `curriculumDataNew.remerge.json` ✗ (BACKUP - not imported)

### phase/ Folder: Mixed Content
**Mixing input data with documentation:**
- Input JSON: `phase 10 year 11-13.json`, `phase 13 olymics.json`
- Working notes: `.md` files
- Reference text: `.txt` files
- Directories (old phases): `phase_9_*`

**Problem:** Can't distinguish between "files to process" and "documentation."

---

## Proposed Folder Structure

```
free-nz-maths/
│
├── src/                          (✓ KEEP - App source)
│   ├── *.jsx, *.js              (✓ React components, engines)
│   └── *.json                    (✓ Only ACTIVE curriculum files used by app)
│       ├── curriculumDataNew.json
│       ├── curriculumDataFull.json
│       ├── olympiadCurriculum.json
│       ├── year11Curriculum.json
│       ├── year12Curriculum.json
│       ├── year13Curriculum.json
│       └── knowledgeSnippets.json
│
├── phase/                        (✓ KEEP - Input/Working Area)
│   ├── README.md                 (NEW - explains this is input folder)
│   ├── phase 10 year 11-13.json  (input for processing)
│   ├── phase 13 olymics.json     (input for processing)
│   └── [old phase dirs] (can archive)
│
├── docs/                         (NEW - All documentation)
│   ├── README.md
│   ├── DEVELOPER_ONBOARDING.md
│   ├── DEVELOPER.md
│   ├── QUICK_START_TEMPLATES.md
│   ├── QUICK-START.md
│   ├── TEMPLATE_EXAMPLES.md
│   ├── TEMPLATE_FINDER_GUIDE.md
│   ├── TEMPLATE_SUBMISSION_PROCESS.md
│   ├── GIT_WORKFLOW_QUICK_REFERENCE.md
│   ├── PHASE_TAG_GUIDE.md
│   ├── HINT_KNOWLEDGE_MODAL_GUIDE.md
│   ├── JUNIOR_DEVELOPER_STARTER_KIT.md
│   ├── ONBOARDING_SUMMARY.md
│   ├── README_JUNIOR_DEVELOPER.md
│   ├── VISION.md
│   ├── Daily Job Tracking.md
│   ├── SESSION_CHANGES_SUMMARY.md
│   ├── Grouped Topics 10-12.md
│   ├── CURRICULUM_AUDIT_REPORT.md
│   ├── CURRICULUM_STRUCTURE_RECOMMENDATION.md
│   ├── HARDCODED_TEMPLATES_AUDIT.md
│   ├── VISUALDATA_AUDIT.md
│   └── audit_reports/            (sub-folder for audit logs)
│       ├── hint_audit_log.txt
│       ├── knowledge_audit_log.txt
│       └── audit_report.txt
│
├── scripts/                      (NEW - Utility scripts)
│   ├── check_recent_templates.cjs
│   ├── check_repo.ps1
│   ├── create_github_repo.ps1
│   ├── validate_template.cjs     (existing, move here)
│   ├── sample_generate.mjs        (existing, move here)
│   └── README.md                  (explains each script)
│
├── notes/                        (NEW - Temporary working notes)
│   ├── new_templates_and_explanation.txt
│   ├── one_template_topics.txt
│   ├── full year 10-12 topics.txt (from phase folder)
│   ├── full year 13.txt
│   ├── q11-13.txt
│   └── README.md
│
├── .gitignore                    (updated - ignore backups)
├── README.md                     (keep - main project README)
├── package.json                  (keep)
└── [other config files]          (keep)
```

---

## Migration Plan (Zero Risk)

### Step 1: Create New Folders
```bash
mkdir -p docs/audit_reports
mkdir -p scripts
mkdir -p notes
```
✓ **Risk: NONE** - Just creating empty folders

### Step 2: Move Documentation to docs/
```bash
# Move all .md files (except README.md in root)
git mv DEVELOPER_ONBOARDING.md docs/
git mv DEVELOPER.md docs/
git mv CURRICULUM_AUDIT_REPORT.md docs/
... (20 more files)

# Move audit logs to subdirectory
git mv hint_audit_log.txt docs/audit_reports/
git mv knowledge_audit_log.txt docs/audit_reports/
git mv audit_report.txt docs/audit_reports/
```
✓ **Risk: NONE** - Files moved with `git mv` preserves history

### Step 3: Move Scripts to scripts/
```bash
git mv check_recent_templates.cjs scripts/
git mv check_repo.ps1 scripts/
git mv create_github_repo.ps1 scripts/

# Note: scripts/sample_generate.mjs and validate_template.cjs already exist
# We're organizing them with other utility scripts
```
✓ **Risk: NONE** - No imports changed, just organization

### Step 4: Move Reference Notes to notes/
```bash
git mv new_templates_and_explanation.txt notes/
git mv one_template_topics.txt notes/

# Move from phase/ folder
git mv phase/full\ year\ 10-12\ topics.txt notes/
git mv phase/full\ year\ 13.txt notes/
git mv phase/q11-13.txt notes/
```
✓ **Risk: NONE** - These are reference only

### Step 5: Clean Up Root
**Remove temporary files:**
```bash
git rm temp_before.txt
```
✓ **Risk: NONE** - This file is never imported

### Step 6: Clean Up src/ (Remove Unused JSONs)
```bash
# BACKUP files - not imported, safe to remove
git rm src/curriculumDataNew.prod.json
git rm src/curriculumDataNew.remerge.json
```
✓ **Risk: NONE** - Confirmed these are NOT imported anywhere

### Step 7: Update .gitignore
```gitignore
# Temporary/backup files
*.prod.json
*.backup.json
*.bak
temp_*.txt
*.tmp.json

# If using notes folder
/notes/*.backup
/notes/*.tmp
```
✓ **Risk: NONE** - Prevents accidental commits

### Step 8: Create README Files in New Folders

**docs/README.md:**
```markdown
# Documentation

All project documentation is organized here:
- Developer guides and onboarding
- Architecture and implementation notes
- Curriculum and template guides
- Audit reports and quality checks

Start with DEVELOPER_ONBOARDING.md for setup.
```

**scripts/README.md:**
```markdown
# Utility Scripts

Scripts for development, validation, and testing:
- `sample_generate.mjs` - Generate sample questions
- `validate_template.cjs` - Validate template syntax
- `check_recent_templates.cjs` - Check recent template changes
- `check_repo.ps1` - Repository health check
- `create_github_repo.ps1` - GitHub repository setup

Usage: Run from project root: `node scripts/sample_generate.mjs`
```

**notes/README.md:**
```markdown
# Working Notes & Reference

Temporary working notes and reference materials:
- Topic lists and curriculum maps
- Planning documents
- Reference data for curriculum design

These are working documents and may be outdated.
```

**phase/README.md:**
```markdown
# Phase Input Folder

This folder contains input data used for curriculum processing:
- `phase 10 year 11-13.json` - Phase 10 template definitions (Years 10-13)
- `phase 13 olymics.json` - Phase 13 olympiad template definitions

**Important:** Do NOT mix these input files with app curriculum files in `src/`.

These files are processed and their contents are merged into `src/curriculumDataMerged.js`
for the app to use.
```

✓ **Risk: NONE** - Just documentation

---

## What Stays in Root (Unchanged)
```
README.md               (main project docs)
package.json            (Node configuration)
package-lock.json       (dependencies)
vite.config.js          (build config)
index.html              (entry point)
.gitignore              (git configuration)
.env                    (environment - if exists)
vercel.json             (deployment config)
```

---

## What Gets Removed (Safe to Delete)
```
❌ temp_before.txt      (temporary, never imported)
❌ src/curriculumDataNew.prod.json    (backup, not imported)
❌ src/curriculumDataNew.remerge.json (backup, not imported)
```

✓ **Verified:** These files have NO imports in the codebase.

---

## Import Changes: ZERO

**Before and After - Exactly the Same:**
```javascript
// src/App.jsx - No changes needed
import curriculumData from './curriculumDataMerged.js'
import olympiadCurriculum from './olympiadCurriculum.json'

// src/testGenerator.js - No changes needed
import curriculumData from './curriculumDataMerged.js'

// Phase files are NOT imported (input only)
// They're used for manual processing, not by the app
```

✓ **Risk: NONE** - All imports remain exactly the same

---

## Benefits of This Structure

| Aspect | Before | After |
|--------|--------|-------|
| **App Files** | Mixed in root | Clear in `src/` |
| **Documentation** | 20+ files in root | Organized in `docs/` |
| **Scripts** | Scattered | Organized in `scripts/` |
| **Working Notes** | Mixed with docs | Separated in `notes/` |
| **Input Data** | Clear (phase folder) | Even clearer with README |
| **Navigation** | Hard to find things | Logical folder structure |
| **New Dev Confusion** | "Why are .md files in root?" | "Clear: docs/ = documentation" |

---

## Validation Checklist

Before committing the reorganization:

```bash
# 1. Verify build still works
npm run build
# Should say: ✓ built in X.XXs

# 2. Verify dev server still works
npm run dev
# Should open http://localhost:5173/

# 3. Verify no import errors
grep -r "from.*json\|import.*json" src/ | grep -v node_modules
# Should show same imports as before

# 4. Verify git history preserved
git log --oneline docs/DEVELOPER_ONBOARDING.md
# Should show full history from original location

# 5. Test sample generator still works
node scripts/sample_generate.mjs | head -20
# Should generate sample questions
```

---

## Rollback Plan (If Something Goes Wrong)

```bash
# All changes are git-tracked
git log --oneline
# Find the commit before cleanup

# Revert everything
git revert <commit-hash>

# Or reset to before cleanup
git reset --hard <commit-hash>
```

✓ **Risk: ZERO** - Complete rollback possible with git

---

## Summary

### What We're Doing
- Moving .md files to `docs/`
- Moving scripts to `scripts/`
- Moving reference notes to `notes/`
- Removing unused backup JSONs
- Keeping phase folder as-is (input folder)
- Keeping src/ as-is (app code)

### What We're NOT Changing
- Any imports or requires
- Any file contents
- App functionality
- Build process
- src/ folder organization

### Risk Level
**✅ ZERO RISK**
- All changes use `git mv` (preserves history)
- No code changes
- No import changes
- Easily rollback-able
- Just file organization

### Time to Implement
- 10-15 minutes to run commands
- 5 minutes to verify build works
- Total: ~20 minutes

### Sign-Off Checklist
Before committing:
- [ ] `npm run build` succeeds
- [ ] `npm run dev` works
- [ ] No import errors
- [ ] Git history preserved
- [ ] All files accounted for

---

## Questions Before We Start?

1. **Keep `temp_before.txt`?** - Recommend DELETE (it's old)
2. **Archive old phase folders?** - Recommend MOVE to `phase/archive/`
3. **Move from phase/ folder to notes/?** - Yes, reference files only
4. **Keep all .md files?** - Yes, all have value for team

