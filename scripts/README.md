# Scripts Documentation

Helper scripts for development and template management.

## Template Validation

### `validate_template.cjs`
Validates template JSON before adding to curriculum files.

**Usage:**
```bash
# Validate template JSON string
node scripts/validate_template.cjs '{"id":"Y6.N.TEST.T1","stem":"Test","params":{},"answer":"42"}'

# Validate template from file
node scripts/validate_template.cjs templates/my_template.json
```

**What it checks:**
- ✅ Required fields (id, stem, params, answer)
- ✅ ID format (`Y{year}.{strand}.{TOPIC}.T{number}`)
- ✅ Missing `{}` around expressions with x/y
- ✅ Backticks or `${}` template literal syntax
- ✅ Variable prefixes in answers
- ✅ Missing rounding for divisions
- ✅ Parameter definitions match usage
- ✅ Parameter format validation
- ✅ Division by zero risks
- ✅ Function existence in mathHelpers.js
- ✅ Visual data validation

**Example output:**
```
🔍 Validating template...

Template ID: Y8.A.INEQUALITIES.T1

❌ ISSUES (must fix):
  ❌ Answer contains "x" or "y" but no {}. Wrap the expression: {your expression}

💡 SUGGESTIONS:
     Fix: Change "x + y" to "{x + y}"

❌ Template has issues. Fix them before adding to curriculum.
```

## Sample Generation

### `sample_generate.mjs`
Generates sample questions from templates without running the full app.

**Usage:**
```bash
# Generate all samples
node scripts/sample_generate.mjs

# Filter to specific skill
node scripts/sample_generate.mjs | Select-String "Y6.N.FRACTIONS"

# Count templates by year
node scripts/sample_generate.mjs | Select-String "Year" | Measure-Object -Line
```

**Output format:**
```
Year 6 - Y6.N.FRACTIONS_ADD.T1
Question: Calculate 3/4 + 2/5
Answer: 23/20
Visual: none
---
```

## Broken Answer Detection

### `find_broken_answers.cjs`
Scans all curriculum files for templates with answer expression issues.

**Usage:**
```bash
node scripts/find_broken_answers.cjs
```

**Finds:**
- Templates missing `{}` in answers
- Templates with backticks or dollar signs
- Displays file location and issue type

**Example output:**
```
================================================================================
BROKEN TEMPLATES - MISSING {} IN ANSWERS
================================================================================
Found 7 templates:

✗ Y7.N.DECIMALS.T3
  File: curriculumDataNew.json
  Skill: Decimals and decimal operations
  Answer: x + y

================================================================================
DISPLAY ISSUES - BACKTICKS OR DOLLAR SIGNS
================================================================================
Found 6 templates:

⚠ Y8.N.STANDARD_FORM_OPS.T1
  File: curriculumDataNew.json
  Answer: `${m1*m2} x 10^${e1+e2}`
```

## Topic Analysis

### `find_single_template_skills.js`
Identifies skills with only one template (need more variety).

**Usage:**
```bash
node scripts/find_single_template_skills.js
```

**Output:**
```
Skills with only 1 template:

Year 6:
- Y6.N.PLACE_VALUE: Place value
- Y6.G.ANGLES_SUPPLEMENTARY: Supplementary angles

Year 7:
- Y7.N.NEGATIVE_NUMBERS: Negative number operations
```

## Sitemap Generation

### `generate_sitemap.mjs`
Generates sitemap.xml for SEO.

**Usage:**
```bash
node scripts/generate_sitemap.mjs
```

Creates `sitemap.xml` in project root with:
- Homepage
- Topic pages (`/topics/<skillId>`)
- Special pages (`/ixl-alternative`)

## NCEA Resources

### `embed_91947_images.mjs`
Embeds images into NCEA 91947 structured JSON.

**Usage:**
```bash
node scripts/embed_91947_images.mjs
```

## Workflow Examples

### Adding a New Template
```bash
# 1. Write template (use TEMPLATE_EXAMPLES.md)
# 2. Validate it
node scripts/validate_template.cjs '{"id":"Y6.N.NEW.T1",...}'

# 3. Add to curriculumDataNew.json
# 4. Generate sample to test
node scripts/sample_generate.mjs | Select-String "Y6.N.NEW"

# 5. Run app
npm run dev
```

### Finding Templates to Improve
```bash
# Find skills needing more templates
node scripts/find_single_template_skills.js

# Find broken templates
node scripts/find_broken_answers.cjs

# Generate samples to review quality
node scripts/sample_generate.mjs | Select-String "Year 6"
```

### Before Committing
```bash
# Validate JSON syntax
Get-Content src/curriculumDataNew.json | ConvertFrom-Json | Out-Null

# Check for broken answers
node scripts/find_broken_answers.cjs

# Generate samples to spot-check
node scripts/sample_generate.mjs | Select-String "Y6"

# Run dev server and test manually
npm run dev
```

## Common Issues

### Validation Script Not Found
```bash
# Make sure you're in project root
cd c:\Users\Andy\free-nz-maths

# Check file exists
Test-Path scripts/validate_template.cjs
```

### JSON Parse Errors
If validation fails with "Invalid JSON":
- Check for trailing commas
- Ensure quotes are escaped: `"answer": "\"text\""`
- Use online JSON validator (jsonlint.com)

### Function Not Found Warnings
If validator warns about missing functions:
- Check function name spelling
- Verify it's exported in `src/mathHelpers.js`
- Add it if needed

## Tips

### Quick Template Testing
```bash
# Copy working template, modify, validate
$template = Get-Content templates/working.json
$template = $template -replace 'T1', 'T2'
$template | node scripts/validate_template.cjs
```

### Batch Validation
```powershell
# Validate all templates in a file
Get-Content templates/*.json | ForEach-Object {
  node scripts/validate_template.cjs $_
}
```

### Finding Template IDs
```bash
# List all template IDs for a year
node -e "const d=require('./src/curriculumDataNew.json'); const y6=d.years.find(y=>y.year===6); y6.skills.forEach(s=>s.templates.forEach(t=>console.log(t.id)))"
```
