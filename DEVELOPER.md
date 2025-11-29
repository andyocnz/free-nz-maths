# Developer Documentation - Free NZ Maths

## Project Overview

Free NZ Maths is a React-based educational platform that generates mathematics questions aligned with the New Zealand Curriculum for Years 6-9. The platform features:

- Dynamic question generation using templates
- Visual representations (graphs, geometry, diagrams)
- Interactive curriculum map
- Practice tests and daily challenges
- PDF export functionality
- User progress tracking and leaderboards

**Live URL**: https://mathx.nz (deployed on Vercel)

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Custom CSS (no framework)
- **Math Rendering**: KaTeX
- **PDF Generation**: jsPDF + html2canvas
- **Build Tool**: Vite
- **Deployment**: Vercel

## Project Structure

```
free-nz-maths/
├── src/
│   ├── App.jsx                          # Main application component
│   ├── main.jsx                         # Entry point
│   ├── curriculumDataFull.json          # All curriculum skills & templates
│   │
│   ├── Core Engine
│   ├── templateEngine.js                # Question generation from templates
│   ├── testGenerator.js                 # Test creation & results calculation
│   ├── mathHelpers.js                   # Math utility functions
│   │
│   ├── Components
│   ├── CurriculumMap.jsx                # Interactive year/skill selector
│   ├── QuestionVisualizer.jsx           # Canvas-based question visuals
│   ├── TestResults.jsx                  # Test results display
│   ├── DailyChallenge.jsx               # Daily challenge feature
│   ├── Certificate.jsx                  # Printable certificates
│   ├── Leaderboard.jsx                  # User rankings
│   ├── LoginModal.jsx                   # User authentication
│   ├── LoginRecommendationModal.jsx     # Login prompt
│   ├── HintModal.jsx                    # Question hints
│   │
│   ├── Development
│   ├── DevVisualTest.jsx                # Visual testing component
│   ├── dev-entry.jsx                    # Dev mode entry point
│   │
│   └── Implementation Plans
│       ├── phase-7-implementation-workflow.txt    # Phase 7 workflow
│       └── phase-7-new-topics-implementation-plan.txt  # New topics code
│
├── dev-visual.html                      # Dev visual testing page
├── package.json
├── vite.config.js
└── vercel.json                          # Vercel deployment config
```

## Key Concepts

### 1. Curriculum Data Structure

The entire curriculum is defined in `src/curriculumDataFull.json`:

```json
{
  "years": [
    {
      "year": 6,
      "skills": [
        {
          "id": "Y6.N.FRACTIONS_ADD",
          "strand": "Number & Algebra",
          "name": "Adding fractions",
          "templates": [
            {
              "id": "Y6.N.FRACTIONS_ADD.T1",
              "stem": "Calculate {a}/{b} + {c}/{d}",
              "params": { "a": ["int", 1, 9], "b": ["int", 2, 10] },
              "answer": "simplify(a*d + c*b, b*d)",
              "difficulty": 4
            }
          ]
        }
      ]
    }
  ]
}
```

**Key fields:**
- `id`: Unique skill identifier (format: Y{year}.{strand}.{topic})
- `strand`: One of "Number & Algebra", "Geometry & Measurement", "Statistics & Probability"
- `templates`: Array of question templates for this skill
- `params`: Variable definitions for question generation
- `answer`: JavaScript expression evaluated to check correctness
- `visualData`: Optional visualization configuration

### 2. Template Engine

The template engine (`src/templateEngine.js`) handles:
- Parameter generation based on constraints
- Variable substitution in question stems
- Answer evaluation using JavaScript expressions
- Visual data preparation

**Parameter Types:**
- `["int", min, max]` - Random integer
- `["choice", val1, val2, ...]` - Random selection
- `["decimal", min, max, precision]` - Random decimal
- Dependent parameters (calculated from others)

### 3. Question Visualizer

The `QuestionVisualizer.jsx` component uses HTML5 Canvas to render:
- Geometric shapes (triangles, circles, angles, etc.)
- Graphs (coordinate grids, bar charts, pie charts)
- Statistical diagrams (stem-and-leaf, histograms, box plots, Venn diagrams)
- Specialized visuals (nets, fractions, etc.)

Each visual type is handled by a dedicated drawing function triggered by `visualData.type`.

### 4. Math Helpers

The `mathHelpers.js` file contains utility functions used in answer expressions:
- `simplify(numerator, denominator)` - Fraction simplification
- `gcd(a, b)` - Greatest common divisor
- `volume_*` and `surface_area_*` functions - Geometry calculations
- `geometric_sequence_nth_term(a, r, n)` - Sequence calculations

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd free-nz-maths

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Curriculum Topics

**Current Status**: The project is in **Phase 7** - expanding curriculum coverage for Years 6-9.

Follow the workflow documented in `src/phase-7-implementation-workflow.txt`:

#### Step 1: Backup Files
Before making changes, create backups:
```bash
cp src/mathHelpers.js src/mathHelpers.js.bak
cp src/QuestionVisualizer.jsx src/QuestionVisualizer.jsx.bak
cp src/curriculumDataFull.json src/curriculumDataFull.json.bak
```

#### Step 2: Add Helper Functions
1. Open `src/phase-7-new-topics-implementation-plan.txt`
2. Copy functions from PART 1
3. Paste at the end of `src/mathHelpers.js`
4. Verify exports are correct

#### Step 3: Add Visualizations
1. Copy case statements from PART 2, Step 2.1
2. Add to the `switch(visualData.type)` block in `QuestionVisualizer.jsx`
3. Copy drawing functions from PART 2, Step 2.2
4. Paste at the end of `QuestionVisualizer.jsx`

#### Step 4: Update Curriculum Data
1. For each year (6, 7, 8, 9), copy the JSON from PART 3
2. In `curriculumDataFull.json`, find the year's `skills` array
3. Add comma after the last skill object
4. Paste new skills (remove outer `[` and `]`)
5. **CRITICAL**: Validate JSON syntax - one error breaks the entire app

#### Step 5: Test Implementation
```bash
npm run dev
```

Test checklist:
- [ ] No startup errors in terminal
- [ ] No console errors in browser
- [ ] Navigate to Year 6 curriculum map
- [ ] Test a new skill (e.g., "Stem-and-leaf plots")
- [ ] Verify question loads correctly
- [ ] Verify visualization appears
- [ ] Test answer checking
- [ ] Spot-check Year 7, 8, 9 new skills

### Validating JSON

**IMPORTANT**: `curriculumDataFull.json` must be valid JSON or the app won't load.

```bash
# PowerShell: Check JSON is valid
Get-Content src/curriculumDataFull.json | ConvertFrom-Json | Out-Null

# Node.js: Validate and count lines
node -e "console.log(JSON.parse(require('fs').readFileSync('src/curriculumDataFull.json')).years.length)"
```

Common JSON errors:
- Missing/extra commas in arrays
- Trailing commas before closing `]` or `}`
- Unescaped quotes in strings
- Missing closing brackets

## Testing

### Manual Testing
1. **Question Generation**: Click through skills in curriculum map
2. **Answer Checking**: Test correct/incorrect answers
3. **Visuals**: Verify all visualization types render
4. **PDF Export**: Test certificate and test results export
5. **Responsive Design**: Test on mobile/tablet viewports

### Visual Testing (Dev Mode)
Use `dev-visual.html` for isolated visual testing:
1. Open in browser
2. Test specific visualization components
3. Useful for debugging canvas rendering issues

### Browser Console
Check for:
- React warnings
- Math evaluation errors
- Missing template parameters
- Visualization rendering errors

## Deployment

### Vercel Deployment
The project auto-deploys to Vercel on push to main branch.

**Manual deployment:**
```bash
# Build locally first
npm run build

# Deploy using Vercel CLI (if installed)
vercel --prod
```

### Deployment Checklist
- [ ] All tests passing locally
- [ ] No console errors
- [ ] JSON is valid
- [ ] New skills tested in production build
- [ ] PDF export works
- [ ] Mobile responsive

## Common Tasks

### Adding a Single New Skill

1. Open `src/curriculumDataFull.json`
2. Find the appropriate year and strand
3. Add a new skill object:
```json
{
  "id": "Y7.N.MY_SKILL",
  "strand": "Number & Algebra",
  "name": "My new skill",
  "templates": [
    {
      "id": "Y7.N.MY_SKILL.T1",
      "stem": "Question text with {variable}",
      "params": { "variable": ["int", 1, 10] },
      "answer": "variable * 2",
      "difficulty": 5
    }
  ]
}
```
4. Validate JSON
5. Test in browser

### Adding a New Math Helper Function

1. Open `src/mathHelpers.js`
2. Add function at the end:
```javascript
export function myNewHelper(param1, param2) {
  // calculation
  return result;
}
```
3. Use in template answers: `"answer": "myNewHelper(a, b)"`

### Adding a New Visualization Type

1. Add case to switch in `QuestionVisualizer.jsx`:
```javascript
case 'my_visual':
  drawMyVisual(ctx, visualData);
  break;
```

2. Add drawing function at end of file:
```javascript
function drawMyVisual(ctx, data) {
  const { param1, param2 } = data;
  // Canvas drawing code
  ctx.fillRect(x, y, width, height);
  // ...
}
```

3. Use in template:
```json
"visualData": {
  "type": "my_visual",
  "param1": 10,
  "param2": 20
}
```

### Debugging Answer Checking

If answers aren't being marked correctly:

1. Check browser console for evaluation errors
2. Verify variable names in `answer` match `params`
3. Test expression in browser console:
```javascript
// Example with params a=5, b=10
const a = 5, b = 10;
eval("a + b"); // Should return 15
```
4. Check for missing helper functions
5. Verify answer type (string vs number)

### Finding Skill IDs

```bash
# PowerShell: List all skill IDs for a year
(Get-Content src/curriculumDataFull.json | ConvertFrom-Json).years |
  Where-Object { $_.year -eq 7 } |
  Select-Object -ExpandProperty skills |
  Select-Object -ExpandProperty id
```

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Prefer `const` over `let`
- Use template literals for string interpolation
- Keep components focused (single responsibility)
- Extract complex logic to utility functions

### Naming Conventions
- **Files**: PascalCase for components (`MyComponent.jsx`), camelCase for utilities (`myHelper.js`)
- **Skill IDs**: `Y{year}.{strand}.{TOPIC_NAME}` (e.g., `Y7.N.FRACTIONS_ADD`)
- **Template IDs**: `{skillId}.T{number}` (e.g., `Y7.N.FRACTIONS_ADD.T1`)
- **Functions**: camelCase (`generateQuestion`)
- **Constants**: UPPER_SNAKE_CASE

### Comments
- Add comments for complex math calculations
- Document non-obvious parameter constraints
- Explain visualization coordinate systems

## Known Issues & Limitations

### Current Limitations
1. **No backend**: All data is client-side (localStorage)
2. **No user sync**: Progress doesn't sync across devices unless logged in
3. **Static curriculum**: Requires rebuild to update questions
4. **Limited validation**: Answer checking is case-sensitive for text answers

### Phase 7 Status
- Implementation plan ready in `src/phase-7-new-topics-implementation-plan.txt`
- New topics include:
  - **Year 6**: Supplementary angles, rotational symmetry, stem-and-leaf plots, histograms, nets, Venn diagrams
  - **Year 7**: Rational number operations, negative/fractional exponents, circles, rates, compound probability
  - **Year 8**: Multi-step equations, transversals, coordinate transformations, surface area, scatter plots
  - **Year 9**: Inequalities, nonlinear functions, polynomials, counting principle, cones/spheres, box plots, geometric sequences

**Status**: Code is ready but NOT YET INTEGRATED into the main files.

## Getting Help

### Understanding Code Flow
1. User selects skill in `CurriculumMap.jsx`
2. `templateEngine.js` generates question from skill's templates
3. `QuestionVisualizer.jsx` renders visual if `visualData` exists
4. User submits answer
5. `templateEngine.js` evaluates answer expression
6. Feedback shown, stats updated

### Debugging Resources
- React DevTools browser extension
- Browser console for template evaluation errors
- `console.log()` in helper functions
- Test individual visuals in `dev-visual.html`

### File Modification Priority
**High Impact** (modify carefully):
- `curriculumDataFull.json` - Invalid JSON breaks everything
- `templateEngine.js` - Core question generation

**Medium Impact**:
- `QuestionVisualizer.jsx` - Affects visual questions
- `mathHelpers.js` - Affects answer checking
- `testGenerator.js` - Affects test creation

**Low Impact**:
- UI components (`LoginModal.jsx`, `Leaderboard.jsx`, etc.)
- Styling files

## Future Improvements

### Potential Enhancements
- Backend integration (Firebase, Supabase)
- Teacher dashboard for class management
- Question difficulty adaptation (adaptive testing)
- More visual types (3D shapes, interactive diagrams)
- Multi-language support
- Offline PWA support
- Question hints/worked solutions
- Video tutorials integration

### Technical Debt
- Refactor large components (App.jsx, QuestionVisualizer.jsx)
- Add TypeScript for type safety
- Implement automated testing (Jest, React Testing Library)
- Optimize curriculum data loading
- Add error boundaries for graceful failures

## Contact & Contribution

For questions or contributions, ensure you:
1. Follow the coding style
2. Test changes thoroughly
3. Validate JSON before committing
4. Update this documentation if adding new features

---

**Last Updated**: Phase 7 preparation (2025)
**Maintainer**: Andy
**License**: See LICENSE file
