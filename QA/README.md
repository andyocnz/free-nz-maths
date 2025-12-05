# QA Question Template Generator

This folder contains Node.js scripts for generating question templates in JSON format for testing purposes. There are two main scripts:

1. **generateQuestionsNoVisuals.js** - Generate questions that do NOT require visual rendering
2. **generateQuestionsWithVisuals.js** - Generate questions that DO require visual rendering

## Quick Start

### Generate all questions without visuals
```bash
node generateQuestionsNoVisuals.js
```

### Generate all questions with visuals
```bash
node generateQuestionsWithVisuals.js
```

## Output

Both scripts generate JSON files in the `qa-output/` folder with the following structure:

```json
{
  "generatedAt": "2025-12-05T10:30:00.000Z",
  "totalQuestions": 42,
  "templatesUsed": 42,
  "questionsPerTemplate": 1,
  "filterApplied": {
    "year": null,
    "strand": null,
    "skillId": null
  },
  "questions": [
    {
      "topic": "Skill name",
      "templateId": "Y6.N.ADDITION.T1",
      "year": 6,
      "strand": "Number",
      "skillId": "Y6.N.ADDITION",
      "question": "What is 5 + 3?",
      "answer": "8",
      "formattedAnswer": "8",
      "params": {
        "a": 5,
        "b": 3
      }
    }
  ]
}
```

For visual questions, the output includes an additional `visual` field:

```json
{
  "topic": "Stem and Leaf",
  "templateId": "Y7.S.STEM_LEAF.T1",
  "year": 7,
  "strand": "Statistics & Probability",
  "skillId": "Y7.S.STEM_LEAF",
  "question": "Interpret the stem-and-leaf diagram below...",
  "answer": "8",
  "formattedAnswer": "8",
  "params": { ... },
  "visual": {
    "type": "stem_and_leaf",
    "stems": [6, 7, 8, 9],
    "leaves": {
      "6": [5, 8],
      "7": [2, 6, 9],
      "8": [0, 4, 4],
      "9": [1]
    },
    "key": "8 | 0 = 80"
  }
}
```

## No Visuals Script

### Usage

```bash
node generateQuestionsNoVisuals.js [options]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--year <number>` | Filter by year (6-13) | `--year 11` |
| `--strand <name>` | Filter by strand name | `--strand "Number"` |
| `--skill <skillId>` | Filter by skill ID | `--skill "Y11.A.QUADRATIC_EQS"` |
| `--output <path>` | Output file path | `--output custom/output.json` |
| `--count <number>` | Questions per template (default: 1) | `--count 5` |
| `--help` | Show help message | |

### Examples

```bash
# Generate all non-visual questions
node generateQuestionsNoVisuals.js

# Generate 5 questions per template for Year 11
node generateQuestionsNoVisuals.js --year 11 --count 5

# Generate questions for Number strand
node generateQuestionsNoVisuals.js --strand "Number"

# Generate for specific skill
node generateQuestionsNoVisuals.js --skill "Y11.A.QUADRATIC_EQS"

# Custom output location with 3 questions per template
node generateQuestionsNoVisuals.js --year 10 --count 3 --output results/y10-questions.json
```

## With Visuals Script

### Usage

```bash
node generateQuestionsWithVisuals.js [options]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--year <number>` | Filter by year (6-13) | `--year 11` |
| `--strand <name>` | Filter by strand name | `--strand "Geometry & Measurement"` |
| `--skill <skillId>` | Filter by skill ID | `--skill "Y7.S.STEM_LEAF"` |
| `--type <vizType>` | Filter by visualization type | `--type histogram` |
| `--output <path>` | Output file path | `--output custom/output.json` |
| `--count <number>` | Questions per template (default: 1) | `--count 3` |
| `--help` | Show help message | |

### Supported Visualization Types

- `stem_and_leaf` - Statistics data display
- `net` - 3D shape unfolding (cube, prism, pyramid)
- `histogram` - Frequency distribution
- `parallel_transversal` - Geometry angles
- `scatter_plot` - Correlation visualization
- `coordinate_grid` - Coordinate plane with points
- `box_plot` - Statistical distribution
- `car_on_road` - Distance/speed problems
- `circle_theorem_angle_center` - Circle theorems
- `graph_inequality` - Linear inequalities
- `graph_parabola` - Quadratic functions
- `matrix_2x2` - 2×2 matrices
- `rectangular_prism` - 3D box visualization
- `triangular_prism` - 3D prism visualization
- `venn_diagram_two` - Set theory
- `triangle` - Triangle with angles
- `circle` - Circle geometry

### Examples

```bash
# Generate all visual questions
node generateQuestionsWithVisuals.js

# Generate 3 questions per template for Year 11
node generateQuestionsWithVisuals.js --year 11 --count 3

# Generate only histogram visualizations
node generateQuestionsWithVisuals.js --type histogram

# Generate for Geometry strand with 2 questions each
node generateQuestionsWithVisuals.js --strand "Geometry & Measurement" --count 2

# Generate stem-and-leaf plots for Year 7
node generateQuestionsWithVisuals.js --year 7 --type stem_and_leaf --count 4
```

## Helper Module (qaHelpers.js)

The `qaHelpers.js` module provides utility functions used by both scripts:

### Key Functions

- **`loadCurriculumData(filePath)`** - Load curriculum JSON data
- **`getAllTemplates(curriculumData, includeVisuals)`** - Extract all templates
- **`generateParams(paramsSpec)`** - Generate random parameter values
- **`renderTemplateString(str, params)`** - Substitute parameters into template strings
- **`formatQuestion(templateData, params, visualData)`** - Format question object
- **`saveQuestionsToFile(questions, outputPath)`** - Save to JSON file
- **`getTemplatesByYear(templates, year)`** - Filter templates by year
- **`getTemplatesByStrand(templates, strand)`** - Filter templates by strand
- **`getTemplatesBySkill(templates, skillId)`** - Filter templates by skill

### Supported Parameter Types

Templates can define parameters with the following types:

1. **Integer**: `["int", min, max]`
   - Generates random integers
   - Example: `["int", 2, 12]`

2. **Decimal**: `["decimal", min, max, places]`
   - Generates random decimals to specified places
   - Example: `["decimal", 0, 10, 2]`

3. **Choice**: `["choice", option1, option2, ...]`
   - Selects random option
   - Example: `["choice", "red", "blue", "green"]`

## Testing Workflow

### 1. Generate test data
```bash
# Generate both visual and non-visual questions
node generateQuestionsNoVisuals.js --output test-data/no-visuals.json
node generateQuestionsWithVisuals.js --output test-data/with-visuals.json
```

### 2. Run tests with the generated data
Use the JSON files in your test suite to validate:
- Question generation logic
- Parameter substitution
- Answer evaluation
- Visual data processing

### 3. Filter by specific criteria
```bash
# Test Year 11 Algebra templates
node generateQuestionsNoVisuals.js --year 11 --strand "Algebra" --count 10

# Test all geometry visualization types
node generateQuestionsWithVisuals.js --strand "Geometry & Measurement" --count 5
```

## Output Files

Generated files are saved to `qa-output/` by default:

- `qa-output/questions-no-visuals.json` - Questions without visual data
- `qa-output/questions-with-visuals.json` - Questions with visual data

To specify custom output locations, use the `--output` option:

```bash
node generateQuestionsNoVisuals.js --output my-tests/math-questions.json
```

## JSON Schema

### Question Object

Each question in the output has this structure:

```typescript
{
  topic: string;                    // Skill name (e.g., "Quadratic Equations")
  templateId: string;               // Template ID (e.g., "Y11.A.QUADRATIC_EQS.T2")
  year: number;                     // Year level (6-13)
  strand: string;                   // Subject strand (Number, Algebra, Geometry, Statistics)
  skillId: string;                  // Skill identifier (e.g., "Y11.A.QUADRATIC_EQS")
  question: string;                 // Generated question text
  answer: string;                   // Answer value/expression
  formattedAnswer: string;          // Formatted answer for display
  params: object;                   // Generated parameter values
  visual?: object;                  // Visual data (optional, for visual questions)
}
```

### Visual Data Object

```typescript
{
  type: string;                     // Visualization type
  [key: string]: any;              // Type-specific visualization properties
}
```

## Troubleshooting

### No templates found
- Check that `src/curriculumDataNew.json` exists
- Verify the file path in the script
- Check filter criteria match actual data

### Invalid parameter generation
- Verify template param specifications
- Check that min/max values are valid
- Ensure choice options are properly formatted

### Output file not created
- Check that `qa-output/` folder exists or is creatable
- Verify write permissions in the directory
- Use `--output` to specify alternative location

## Notes

- Each template generates random parameters, so questions will vary between runs
- Visual data includes parameter references that are substituted during generation
- The scripts process the complete curriculum data for comprehensive coverage
- For large datasets, generating multiple questions per template may take longer
