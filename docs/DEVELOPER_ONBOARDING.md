# Developer Onboarding – free-nz-maths

This guide provides a comprehensive overview of the codebase, workflows, and best practices for adding new content and features.

## 📁 Project Folder Structure

The project is organized into logical folders for easy navigation:

```
free-nz-maths/
├── src/                          ← App code (React, components, logic)
│   ├── *.jsx, *.js              (Components and utilities)
│   └── *.json                   (7 active curriculum files)
│
├── docs/                         ← All documentation
│   ├── DEVELOPER_ONBOARDING.md  (This file)
│   ├── *.md                     (20+ guides and references)
│   └── audit_reports/           (Audit logs and reports)
│
├── scripts/                      ← Utility scripts
│   ├── sample_generate.mjs      (Generate sample questions)
│   ├── validate_template.cjs    (Validate template syntax)
│   ├── check_recent_templates.cjs
│   ├── *.ps1 files              (PowerShell utilities)
│   └── README.md                (Scripts documentation)
│
├── notes/                        ← Working reference materials
│   ├── *.txt files              (Topic lists, curriculum references)
│   └── README.md                (Reference guide)
│
├── phase/                        ← Input data for processing
│   ├── phase 10 year 11-13.json (Template definitions)
│   ├── phase 13 olymics.json    (Olympiad templates)
│   └── README.md                (Input folder notes)
│
├── README.md                     ← Main project documentation
├── package.json                  ← Node dependencies
└── [other config files]          (vite.config.js, .gitignore, etc)
```

**Key Points:**
- **src/** contains the live app code - this is what runs
- **docs/** is all documentation for developers
- **scripts/** has utility scripts for development tasks
- **notes/** contains working reference materials
- **phase/** contains input data used for processing (not live app data)

## Table of Contents

1.  [**Quick Start & Setup**](#1-quick-start--setup)
    *   [Initial Project Setup](#11-initial-project-setup-windows-powershell)
    *   [5-Minute Workflow: Adding a New Template](#12-5-minute-workflow-adding-a-new-template)
2.  [**Core Workflows**](#2-core-workflows)
    *   [Adding New Question Templates (Detailed)](#21-adding-new-question-templates-detailed)
    *   [Extending Visuals](#22-extending-visuals)
    *   [Testing and Verification](#23-testing-and-verification)
3.  [**System Deep Dives**](#3-system-deep-dives)
    *   [The Template & Answer Engine](#31-the-template--answer-engine)
    *   [NCEA Implementation](#32-ncea-implementation)
    *   [Group Test Mode](#33-group-test-mode)
    *   [Olympiad Curriculum](#34-olympiad-curriculum)
    *   [Math Symbol Normalization](#35-math-symbol-normalization)
4.  [**Project Reference**](#4-project-reference)
    *   [Project File Overview](#41-project-file-overview)
    *   [Commit & PR Guidelines](#42-commit--pr-guidelines)
    *   [Common Issues & Gotchas](#43-common-issues--gotchas)

---

## 1. Quick Start & Setup

### 1.1. Initial Project Setup (Windows PowerShell)
- Ensure Node.js (LTS) and npm are installed.
- From the project root (`c:\Users\Andy\free-nz-maths`):

```powershell
# install deps
npm install

# run dev server (Vite)
npm run dev
# if port 5173 is in use Vite will try another port (e.g., 5174)

# build for production
npm run build

# run local sample generator (prints sample question objects)
node .\scripts\sample_generate.mjs
```

Open the local dev URL shown by Vite (e.g. `http://localhost:5173/`) to view the app.

### 1.2. 5-Minute Workflow: Adding a New Template
**Want to add templates quickly and correctly?** Follow this streamlined workflow:

#### Step 1: Create Your Template JSON
Use examples from `TEMPLATE_EXAMPLES.md` or start with this basic structure:
```json
{
  "id": "Y6.N.MY_SKILL.T1",
  "stem": "Question text with {param}",
  "params": { "param": ["int", 1, 10] },
  "answer": "param * 2",
  "difficulty": 5
}
```

#### Step 2: Validate It
```bash
# Catches 90% of issues before you add it!
node scripts/validate_template.cjs '{"id":"Y6.N.MY_SKILL.T1",...}'
```

#### Step 3: Add to `src/curriculumDataNew.json`
1.  Find the right skill and add your template to its `templates` array.
2.  **IMPORTANT - Phase Numbering:** Use the same phase number (e.g., `"phase": 10.6`) for all templates added in the same batch. After 10.9, use `10.11`, `10.12` to avoid JavaScript decimal issues.

#### Step 4: Test It
```bash
# Generate a sample to check the output
node scripts/sample_generate.mjs | Select-String "Y6.N.MY_SKILL"
# Or run the dev server to test in the UI
npm run dev
```

#### Multiple-Choice Templates
Some skills (like polynomial expansion/simplification) use button-style choices instead of free-form text. To set one up:
- Compute any helper params (e.g., `correctExpr`) in the `params` block and keep `answer` pointed at the canonical expression.
- Add a `choices` array. Each entry can be a param name (e.g., `"correctExpr"`) or a string containing `{...}` expressions (e.g., `"{formatQuadraticExpression(aSum, bSum, cSum)}"`). The engine evaluates every entry, clones the values, and shuffles them automatically.
- No extra UI wiring is needed—the practice view shows a “Choose one:” prompt above the options.

See `Y11.A.POLYNOMIALS.T1`/`T3` in `src/curriculumDataNew.json` for reference.

---

## 2. Core Workflows

### 2.1. Adding New Question Templates (Detailed)

#### Template Structure
```json
{
  "id": "Y6.G.NETS.T8",
  "stem": "Which 3D solid is formed from the net shown?",
  "params": {},
  "answer": "'MyShapeName'",
  "difficulty": 3,
  "visualData": { "type": "net", "shape_type": "tetrahedron" }
}
```

#### Parameter Types
- `["int", min, max]` - Random integer.
- `["decimal", min, max, decimals]` - Random decimal.
- `["choice", val1, val2, ...]` - Random selection from a list.

#### Key Rules for Writing Templates
1.  **Use `{}` for expressions with x/y**: `"answer": "{x + y}"` not `"answer": "x + y"`.
2.  **No backticks**: Use `"x={a}"` not ``'`x=${a}`'``.
3.  **No variable prefixes**: Use `"{2*a}x + {b}"` not `"f'(x) = {2*a}x + {b}"`. The system adds prefixes automatically.
4.  **Round divisions**: Use `"round(a/b, 2)"` to avoid long decimals.
5.  **Protect division by zero**: If a parameter `x` is used in a denominator, ensure its range does not include 0 (e.g., `["int", 1, 10]`).
6.  **Static Answers**: If a template has no `params`, the `answer` string must NOT have extra quotes. E.g., `"answer": "x ≤ −4"`, not `"answer": "'x ≤ −4'"`.
7.  **No Hardcoded Calculations**: Templates with empty `params` are only allowed if they include `visualData` for interpretation. A question like `"stem": "Solve 2x + 5 = 15"` with an answer of `"5"` is not allowed as students will memorize it. It MUST be parameterized.

### 2.2. Extending Visuals
- Open `src/QuestionVisualizer.jsx` and find the `switch` statement on `visualData.type`.
- Add a `case` for your new visual type that calls a new drawing function (e.g., `drawMyNewVisual(ctx, data)`).
- Implement your `drawMyNewVisual(ctx, data)` function.
- **IMPORTANT**: If the visual depends on randomized parameters, reference them as strings in the `visualData` object (e.g., `"values": ["v1","v2"]`) so the template engine can substitute the values. If the visual changes fundamentally based on a parameter, create separate templates for each case.

### 2.3. Testing and Verification
- **Quick Check:** Use `node .\scripts\sample_generate.mjs` to generate and inspect sample question objects. This is great for quickly checking parameters and answers without a browser.
- **Visual Check:** Run `npm run dev`, navigate to the relevant skill, and generate several questions to ensure the visuals render correctly and match the question text.
- **NCEA Trials:** Use the `/?mode=ncea-index` query parameter to access the NCEA section and test that trial papers and their resources load correctly.

---

## 3. System Deep Dives

### 3.1. The Template & Answer Engine
This section documents critical knowledge about how `src/templateEngine.js` evaluates answer expressions.

#### How Answer Evaluation Works
The engine uses two paths:
1.  **Pure Expression Path**: For numeric/probability expressions. It creates and evaluates a JavaScript function from the `answer` string.
2.  **Display Template Path**: For answers containing `{placeholders}` or algebraic syntax (like an `=` sign or `x`/`y` variables). This path performs string substitution.

**Detection Logic**: `const looksAlgebraic = /(?<![=!<>])=(?!=)/.test(rawAnswer) || /x/.test(rawAnswer) || /y/.test(rawAnswer)`
This regex is specifically designed to detect assignment operators (`=`), not comparison operators (`==`, `!=`, etc.).

#### Answer Expression Best Practices
- **DO** use simple arithmetic (`a+b`), ternary operators (`a > b ? 1 : 0`), and function calls from `mathHelpers` (`simplify(a,b)`).
- **DON'T** use object literals (`{...}`) as they confuse the parser. Use a ternary chain instead.
- **DON'T** use assignment operators (`x = a + b`). The answer expression should only return a value.

#### Case Study: Histogram Answer Fix
- **Original Problem**: `"answer": "({\"130-140\": v1, ...})[targetBinLabel]"
- **Why it Failed**: The `{}` triggered the display path, showing the raw expression as the answer.
- **The Fix**: `"answer": "(targetBinLabel === '130-140' ? v1 : ...)"`. This uses a ternary chain, which is evaluated as a pure expression.

### 3.2. NCEA Implementation
- **Data Files**: `pastpapers/ncea_legacy_papers_structured.json` and `pastpapers/ncea_new_papers_structured.json` contain the structured exam data.
- **Resource Loading**: `src/nceaResources.js` resolves `local:pastpapers/resources/...` paths to Vite URLs using `import.meta.glob`.
- **Logic**: `src/nceaStructuredData.js` normalizes the JSON data into a flat question list for trials.
- **UI**: `src/PastPapersIndex.jsx` renders the NCEA Trial Exams section.

### 3.3. Group Test Mode
- **Engine**: `src/groupTestEngine.js` uses a seeded RNG based on a 7-digit group code to ensure all students get identical questions.
- **Backend**: `src/googleApi.js` and `src/config.js` handle communication with Google Apps Script endpoints for storing test registry data and scores.
- **Workflow**: A teacher creates a test (full or focused on one topic), gets a code, and students use that code to take the deterministic test. Results are posted to a Google Sheet for the teacher to view.
- **Features**: Includes "Focused Mode" (testing a single skill) and "Answer Hiding" (students only see "Wrong ❌" without the correct answer).

### 3.4. Olympiad Curriculum
The application now supports an elite "Olympiad Challenge" mode with advanced mathematics problems:

#### File Structure
- **Data File**: `src/olympiadCurriculum.json` contains 28 olympiad skills across 6 strands:
  - Number Theory
  - Algebra
  - Geometry
  - Combinatorics
  - Probability
  - Competition Mathematics

#### How It Works
- **Multiple Curriculum Support**: The app uses three curriculum files:
  - `curriculumDataMerged.js` - Regular curriculum (Years 6-13)
  - `olympiadCurriculum.json` - Elite olympiad skills
  - `curriculumDataFull.json` - Legacy/backup data
- **Mode Switching**: Users select "Olympiad" from the landing page menu to enter olympiad mode (`isOlympiadMode` state).
- **Practice & Test**: In olympiad mode, users can practice individual skills or take a full 20-question Olympiad Challenge test.

#### Key Implementation Details
1. **Test Generator**: `src/testGenerator.js` accepts an optional `activeCurriculum` parameter. When olympiad mode is active, the olympiad curriculum is passed for question generation.
2. **Curriculum Map Sidebar**: `src/CurriculumMap.jsx` also accepts `activeCurriculum` parameter to display the correct strands and skills.
3. **Year Parameter**: Olympiad questions use `year: "Olympiad"` instead of numeric years. This ensures the sidebar correctly identifies olympiad mode.
4. **Question Generation**: `generateQuestionForSkill()` in `templateEngine.js` extracts the year value from the curriculum structure, so it naturally returns "Olympiad" for olympiad questions.

#### For New Developers
- If adding olympiad skills, follow the same template structure as regular skills but add them to `src/olympiadCurriculum.json`.
- All question validation and generation works automatically—no special handling needed beyond curriculum selection.

### 3.5. Math Symbol Normalization
The application automatically fixes corrupted mathematical symbols that may appear in questions and answers due to encoding issues (mojibake):

#### What Gets Fixed
- Corrupted fractions: `┬▓` → `²`, `┬│` → `³` (squared, cubed)
- Corrupted operators: `├ù` → `×` (multiplication), `┬╖` → `·` (dot product)
- Corrupted symbols: `╧Ç` → `π` (pi), `╬╕` → `θ` (theta), `┬░` → `°` (degree)
- And 30+ more mojibake patterns

#### Implementation
- **MATH_REPLACEMENTS Array**: Defined in `src/App.jsx` (lines 190-225). Add new patterns here when discovered.
- **normalizeMathDisplay() Function**: Applies all replacements to a given string. Called on:
  - Question text when rendering
  - Answer display (in practice feedback)
  - Test results
  - Dev mode answer reveal

#### Usage in Templates
- Use `*` for multiplication in template answers (not `×`). The frontend displays it correctly using normalization.
- When templates contain `×`, it gets converted to `*` during preprocessing (search for places using × in curriculum files).

#### Adding New Symbol Patterns
If you discover a corrupted symbol:
1. Note the mojibake characters (e.g., `┬▓`)
2. Identify what symbol it should be (e.g., `²`)
3. Add an entry to `MATH_REPLACEMENTS`: `['┬▓', '²']`
4. Test by generating questions and checking if the symbol displays correctly

---

## 4. Project Reference

### 4.1. Project File Overview

#### Core Curriculum & Generation
- `src/curriculumDataNew.json`: Primary curriculum for Years 6-13 question templates.
- `src/olympiadCurriculum.json`: Elite olympiad skills (28 skills across 6 strands).
- `src/curriculumDataMerged.js`: Merged/compiled curriculum used in production.
- `src/curriculumDataFull.json`: Legacy/backup curriculum data.

#### Question Generation & Processing
- `src/templateEngine.js`: The core engine for generating questions and evaluating answers. Key exports:
  - `generateQuestionForSkill(curriculum, skillId)` - Generates a single question
  - `getSkillsForYear(curriculum, year)` - Gets all skills for a year
  - `getStrandsForYear(curriculum, year)` - Gets all strands for a year
- `src/testGenerator.js`: Generates full test/practice question sets. Key exports:
  - `generateTest(year, totalQuestions, options, activeCurriculum)` - Generates test questions

#### UI & Display
- `src/App.jsx`: Main application component with:
  - `isOlympiadMode` state for switching between regular and olympiad curricula
  - `MATH_REPLACEMENTS` array for symbol normalization (lines 190-225)
  - `normalizeMathDisplay()` function for fixing corrupted symbols
  - `CurriculumMap` integration with active curriculum support
- `src/CurriculumMap.jsx`: Sidebar curriculum map showing strands and skills. Now accepts:
  - `activeCurriculum` prop for olympiad mode display
- `src/QuestionVisualizer.jsx`: HTML5 Canvas rendering for visuals.

#### Utilities & Scripts
- `scripts/sample_generate.mjs`: Utility script for quickly generating sample questions.
- `scripts/validate_template.cjs`: Validator to check template syntax before submission.

### 4.2. Commit & PR Guidelines
- Keep changes focused: one concept per Pull Request.
- Run `npm run build` or at least `node .\scripts\sample_generate.mjs` to catch errors before submitting.
- Reference template IDs, NCEA standards, or file names in the PR description so reviewers know what to check.

### 4.3. Common Issues & Gotchas
- **Phase Numbering**: JavaScript treats `10.10` as `10.1`. After phase 10.9, use `10.11`, `10.12`, etc.
- **`visualData` Mismatches**: Ensure that visuals correctly reference randomized parameters or are split into separate templates for different scenarios.
- **Answer Expression Errors**:
    - "Wrong ❌ Answer: (expression...)" -> Caused by `{}` in the answer. Use a ternary chain instead.
    - Answer shows "0" -> Caused by an exception during evaluation. Check the browser console.
- **Last Question Not Counted**: This was a state update timing issue, fixed in `finishTest()` in `App.jsx` by checking the answer synchronously before finishing.
- **Grade Not Displaying**: This was fixed by ensuring `gradeFromPercentage()` is called for all test modes, not just group mode.
- **Dev Mode**: Use `?dev=true` to see answers in group tests and access other debugging features.
- **Olympiad Navigation Issues**:
    - **Left sidebar not showing topics in olympiad mode**: Ensure `CurriculumMap` receives the `activeCurriculum` prop (line 4585 in App.jsx).
    - **Olympiad test not generating questions**: Verify that `generateTest()` receives the olympiad curriculum and that the year parameter is 'Olympiad'.
    - **Year detection fails in sidebar**: Check that question objects have `year: "Olympiad"` set (automatically done by `generateQuestionForSkill()`).
- **Corrupted Math Symbols**:
    - **Symbols show as mojibake** (e.g., `┬▓` instead of `²`): Add the pattern to `MATH_REPLACEMENTS` in `App.jsx`.
    - **Symbol normalization not applied**: Ensure `normalizeMathDisplay()` is called on all displayed text (question text, answers, feedback).
- **Parameter Validation Errors**:
    - **Vertical line in coordinate geometry**: Use `validateParams` constraint (e.g., `"validateParams": "x1 !== x2"`) to prevent invalid parameters and auto-regenerate if needed. See `templateEngine.js:592-606`.
