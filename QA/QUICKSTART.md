# QA Scripts - Quick Start Guide

## Setup

No installation needed! The scripts use Node.js (v14+) and work with your existing project.

## Running the Scripts

### Generate questions WITHOUT visuals
```bash
cd C:\Users\Andy\free-nz-maths
node QA/generateQuestionsNoVisuals.js
```

### Generate questions WITH visuals
```bash
cd C:\Users\Andy\free-nz-maths
node QA/generateQuestionsWithVisuals.js
```

## Common Commands

### Generate multiple questions per template
```bash
node QA/generateQuestionsNoVisuals.js --count 5
node QA/generateQuestionsWithVisuals.js --count 3
```

### Filter by year
```bash
node QA/generateQuestionsNoVisuals.js --year 11 --count 2
node QA/generateQuestionsWithVisuals.js --year 10
```

### Filter by strand
```bash
node QA/generateQuestionsNoVisuals.js --strand "Algebra"
node QA/generateQuestionsWithVisuals.js --strand "Geometry & Measurement"
```

### Filter by visualization type
```bash
node QA/generateQuestionsWithVisuals.js --type histogram
node QA/generateQuestionsWithVisuals.js --type net
```

### Custom output location
```bash
node QA/generateQuestionsNoVisuals.js --output test-data/my-questions.json
```

## Output Files

Generated files are saved to `qa-output/` folder:
- `qa-output/questions-no-visuals.json` - Questions without visuals (238 generated)
- `qa-output/questions-with-visuals.json` - Questions with visuals (37 generated)

Each file contains:
- **generatedAt**: ISO timestamp
- **totalQuestions**: Total number of questions generated
- **templatesUsed**: Number of unique templates used
- **questionsPerTemplate**: How many questions were generated per template
- **filterApplied**: Which filters were applied
- **questions**: Array of question objects

## Question Structure

Each question has:
- `topic` - Skill name
- `templateId` - Unique template ID
- `year` - Year level (6-13)
- `strand` - Subject area (Number, Algebra, Geometry, Statistics)
- `skillId` - Skill identifier
- `question` - Generated question text
- `answer` - Answer value
- `formattedAnswer` - Answer formatted for display
- `params` - Random parameters used (only for visual questions)
- `visual` - Visual data spec (only for visual questions)

## Testing Tips

1. **Generate a small sample first**
   ```bash
   node QA/generateQuestionsNoVisuals.js --year 6 --count 1
   ```

2. **Test specific strands**
   ```bash
   node QA/generateQuestionsWithVisuals.js --strand "Statistics & Probability"
   ```

3. **Generate multiple for batch testing**
   ```bash
   node QA/generateQuestionsNoVisuals.js --count 10 --output test-data/batch.json
   ```

4. **Check specific visualization types**
   ```bash
   node QA/generateQuestionsWithVisuals.js --type stem_and_leaf --count 5
   ```

## File Structure

```
QA/
├── qaHelpers.js                      # Shared utility functions
├── generateQuestionsNoVisuals.js     # Script for non-visual questions
├── generateQuestionsWithVisuals.js   # Script for visual questions
├── README.md                         # Full documentation
└── QUICKSTART.md                     # This file

qa-output/
├── questions-no-visuals.json         # Generated test data
└── questions-with-visuals.json       # Generated test data with visuals
```

## Get Help

```bash
node QA/generateQuestionsNoVisuals.js --help
node QA/generateQuestionsWithVisuals.js --help
```

## Example Test Data

### Non-visual question
```json
{
  "topic": "Rotational symmetry",
  "templateId": "Y6.G.ROTATIONAL_SYMMETRY.T1",
  "year": 6,
  "strand": "Geometry & Measurement",
  "skillId": "Y6.G.ROTATIONAL_SYMMETRY",
  "question": "What is the order of rotational symmetry of a regular 10-sided polygon?",
  "answer": "sides",
  "formattedAnswer": "sides",
  "params": {
    "sides": 10
  }
}
```

### Visual question (stem-and-leaf)
```json
{
  "topic": "Stem-and-leaf plots",
  "templateId": "Y6.S.STEM_AND_LEAF.T1",
  "year": 6,
  "strand": "Statistics & Probability",
  "skillId": "Y6.S.STEM_AND_LEAF",
  "question": "The stem-and-leaf plot shows test scores. How many students scored in the 80s?",
  "answer": "3",
  "formattedAnswer": "3",
  "params": {
    "targetStem": 8
  },
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
