# Quick Start Guide - Free NZ Maths

## For New Developers

### First Time Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Navigate to http://localhost:5173 (or the port shown in terminal)
```

That's it! The app should now be running.

## Common Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally

# Validation
node -e "JSON.parse(require('fs').readFileSync('src/curriculumDataFull.json'))"  # Validate curriculum JSON
```

## Most Common Tasks

### 1. Test a Specific Skill

1. Run `npm run dev`
2. Click on a year (e.g., Year 7)
3. Click on a skill (e.g., "Fractions - Addition")
4. Answer the question to test functionality

### 2. Add a New Question Template

Edit `src/curriculumDataFull.json`:

```json
{
  "id": "Y7.N.EXISTING_SKILL",
  "name": "Existing Skill",
  "templates": [
    // ... existing templates ...
    {
      "id": "Y7.N.EXISTING_SKILL.T99",
      "stem": "What is {a} + {b}?",
      "params": {
        "a": ["int", 1, 10],
        "b": ["int", 1, 10]
      },
      "answer": "a + b",
      "difficulty": 3
    }
  ]
}
```

**Remember**: Add comma before your new template!

### 3. Check for Errors

**Browser Console** (F12):
- Look for red error messages
- Check for "Cannot find" or "undefined" errors

**Common Issues**:
- "Unexpected token" → JSON syntax error (missing comma, extra comma)
- "Cannot read property" → Missing parameter or helper function
- Question doesn't appear → Check browser console

### 4. Implement Phase 7 Topics

**IMPORTANT**: Phase 7 code is ready but NOT integrated yet.

Run through the complete workflow:

```bash
# 1. Create backups
cp src/mathHelpers.js src/mathHelpers.js.bak
cp src/QuestionVisualizer.jsx src/QuestionVisualizer.jsx.bak
cp src/curriculumDataFull.json src/curriculumDataFull.json.bak

# 2. Follow steps in src/phase-7-implementation-workflow.txt

# 3. Validate JSON after each change
node -e "JSON.parse(require('fs').readFileSync('src/curriculumDataFull.json'))"

# 4. Test each change incrementally
npm run dev
```

**Pro tip**: Do one year at a time, test, then move to next year.

## Understanding the Codebase (30 seconds)

```
src/
├── curriculumDataFull.json     ← All questions (YOU'LL EDIT THIS MOST)
├── templateEngine.js           ← Generates questions from templates
├── mathHelpers.js              ← Math functions used in answers
├── QuestionVisualizer.jsx      ← Draws diagrams/graphs
├── App.jsx                     ← Main app
└── CurriculumMap.jsx           ← Year/skill selector
```

**Most edited files**:
1. `curriculumDataFull.json` (90% of changes)
2. `mathHelpers.js` (5% - new math functions)
3. `QuestionVisualizer.jsx` (5% - new visuals)

## Parameter Types Cheat Sheet

```javascript
// Random integer between min and max (inclusive)
"a": ["int", 1, 10]           // a = 1,2,3,...,10

// Random choice from list
"op": ["choice", "+", "-", "×", "÷"]

// Random decimal
"x": ["decimal", 0, 1, 2]     // x = 0.00 to 1.00 (2 decimal places)

// Calculated from other params
"sum": "a + b"                // sum = whatever a + b equals
```

## Answer Expression Cheat Sheet

```javascript
// Simple calculation
"answer": "a + b"

// Using math helpers
"answer": "simplify(a, b)"              // Returns fraction as "numerator/denominator"
"answer": "round(Math.PI * r * r, 2)"   // Round to 2 decimal places

// String answer
"answer": "'Positive'"                  // Literal string (note the quotes!)

// Template literal (for formatted output)
"answer": "`(${x},${y})`"              // Returns "(3,4)"

// Conditional
"answer": "a > b ? 'Greater' : 'Less'"
```

## Difficulty Levels

- **1-2**: Primary (Years 1-3)
- **3-4**: Intermediate (Years 4-6)
- **5-7**: Middle Secondary (Years 7-8)
- **8-10**: Upper Secondary (Years 9-10)

## Visual Types Already Available

```javascript
// In template, add:
"visualData": {
  "type": "triangle",
  "a": 3, "b": 4, "c": 5,
  "angleA": 90
}
```

**Available types**:
- `triangle`, `right_triangle`, `angle`, `bar_chart`, `pie_chart`
- `coordinate_grid`, `line_graph`, `number_line`, `fraction_bars`
- `stem_and_leaf`, `histogram`, `venn_diagram_two`, `box_plot` (Phase 7)

See `QuestionVisualizer.jsx` switch statement for full list.

## Git Workflow

```bash
# Before making changes
git status                    # Check current state
git add .                     # Stage changes
git commit -m "Description"   # Commit with message
git push                      # Push to remote (auto-deploys to Vercel)
```

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Questions Not Appearing
1. Check browser console (F12)
2. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('src/curriculumDataFull.json'))"`
3. Check skill ID matches exactly
4. Ensure skill has at least one template

### Visuals Not Showing
1. Check `visualData.type` is valid
2. Check corresponding drawing function exists in `QuestionVisualizer.jsx`
3. Look for canvas errors in console

### Answers Not Checking Correctly
1. Verify parameter names in answer match params
2. Test expression in browser console
3. Check if helper function is exported from `mathHelpers.js`
4. For string answers, ensure proper quotes: `"answer": "'string'"`

## Where to Get Help

1. **Full documentation**: Read `DEVELOPER.md`
2. **Implementation workflow**: Read `src/phase-7-implementation-workflow.txt`
3. **Browser console**: Press F12, check Console tab
4. **React DevTools**: Install browser extension
5. **Example skills**: Look at existing skills in `curriculumDataFull.json`

## Testing Checklist

Before committing changes:

- [ ] App starts without errors (`npm run dev`)
- [ ] No console errors in browser
- [ ] JSON is valid
- [ ] New questions load correctly
- [ ] Answer checking works (test correct AND incorrect answers)
- [ ] Visuals render (if applicable)
- [ ] No regressions (old skills still work)

## Pro Tips

1. **Test incrementally**: Don't add 50 skills at once - add 1, test, then add more
2. **Use existing skills as templates**: Copy similar skill and modify
3. **Validate JSON frequently**: Run validation after every few edits
4. **Check console early**: If something seems wrong, check console immediately
5. **Backup before Phase 7**: The phase-7 files tell you to backup - DO IT!

---

**Next Steps**:
- Read `DEVELOPER.md` for complete documentation
- Try adding a simple template to an existing skill
- Test Phase 7 implementation on a development branch first
