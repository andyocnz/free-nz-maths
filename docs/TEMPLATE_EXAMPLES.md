# Template Examples & Patterns

Quick reference for creating correct question templates. Use these patterns as starting points.

## Basic Templates

### Simple Arithmetic
```json
{
  "id": "Y6.N.ADDITION.T1",
  "stem": "Calculate: {a} + {b}",
  "params": {
    "a": ["int", 10, 100],
    "b": ["int", 10, 100]
  },
  "answer": "a + b",
  "difficulty": 2
}
```

### With x or y Variables
**❌ WRONG:**
```json
"answer": "x + y"  // Missing {} - won't evaluate!
```

**✅ CORRECT:**
```json
{
  "id": "Y7.A.EXPRESSIONS.T1",
  "stem": "Evaluate 2x + 3y when x = {x} and y = {y}",
  "params": {
    "x": ["int", -10, 10],
    "y": ["int", -10, 10]
  },
  "answer": "{2 * x + 3 * y}",
  "difficulty": 5
}
```

### With Rounding
```json
{
  "id": "Y8.A.INEQUALITIES.T1",
  "stem": "Solve for x: {a}x + {b} > {c}",
  "params": {
    "a": ["int", 2, 5],
    "b": ["int", 1, 10],
    "c": ["int", 11, 40]
  },
  "answer": "{'x > ' + round((c - b) / a, 2)}",
  "difficulty": 7
}
```

## Function Calls

### Using Math Helpers
```json
{
  "id": "Y6.N.FRACTIONS.T1",
  "stem": "Simplify: {a}/{b}",
  "params": {
    "a": ["int", 2, 20],
    "b": ["int", 2, 20]
  },
  "answer": "simplify(a, b)",
  "difficulty": 4
}
```

### Geometry Calculations
```json
{
  "id": "Y8.G.VOLUME.T1",
  "stem": "Find volume of rectangular prism: length={l}cm, width={w}cm, height={h}cm",
  "params": {
    "l": ["int", 2, 10],
    "w": ["int", 2, 10],
    "h": ["int", 2, 10]
  },
  "answer": "volume_rectangular_prism(l, w, h)",
  "difficulty": 6
}
```

## Conditional Logic

### Choice Parameter
```json
{
  "id": "Y6.S.HISTOGRAM.T1",
  "stem": "How many students are in the {bin} cm bin?",
  "params": {
    "v1": ["int", 2, 8],
    "v2": ["int", 2, 10],
    "v3": ["int", 2, 12],
    "v4": ["int", 1, 6],
    "bin": ["choice", "130-140", "140-150", "150-160", "160-170"]
  },
  "answer": "(bin === '130-140' ? v1 : bin === '140-150' ? v2 : bin === '150-160' ? v3 : v4)",
  "visualData": {
    "type": "histogram",
    "bins": ["130-140", "140-150", "150-160", "160-170"],
    "values": ["v1", "v2", "v3", "v4"]
  }
}
```

### Division by Zero Protection
```json
{
  "id": "Y11.G.COORDINATE_GEOMETRY.T1",
  "stem": "Find the gradient of the line through ({x1},{y1}) and ({x2},{y2})",
  "params": {
    "x1": ["int", -10, 10],
    "y1": ["int", -10, 10],
    "x2": ["int", -10, 10],
    "y2": ["int", -10, 10]
  },
  "answer": "{x1 === x2 ? 'undefined (vertical line)' : (y2-y1)/(x2-x1)}",
  "difficulty": 6
}
```

## String Formatting

### Simple Format Strings
```json
{
  "id": "Y9.A.QUADRATICS.T1",
  "stem": "Expand (x + {a})(x + {b})",
  "params": {
    "a": ["int", -8, 8],
    "b": ["int", -8, 8]
  },
  "answer": "x² + {a+b}x + {a*b}",
  "difficulty": 7
}
```

### Coordinate Formatting
```json
{
  "id": "Y11.G.TRANSFORMATIONS.T1",
  "stem": "Reflect point ({x},{y}) across y-axis",
  "params": {
    "x": ["int", 1, 10],
    "y": ["int", 1, 10]
  },
  "answer": "({-x}, {y})",
  "difficulty": 6
}
```

## Visual Data

### With Histogram
```json
{
  "visualData": {
    "type": "histogram",
    "bins": ["130-140", "140-150", "150-160", "160-170"],
    "values": ["v1", "v2", "v3", "v4"]
  }
}
```

### With Graph
```json
{
  "visualData": {
    "type": "graph_parabola",
    "a": "a",
    "b": "b",
    "c": "c",
    "width": 400,
    "height": 300
  }
}
```

### With Net
```json
{
  "visualData": {
    "type": "net",
    "shape_type": "cube"
  }
}
```

## Common Mistakes & Fixes

### ❌ Mistake 1: Missing {} for x/y
```json
// WRONG
"answer": "m * x + c"

// RIGHT
"answer": "{m * x + c}"
```

### ❌ Mistake 2: Using Backticks
```json
// WRONG
"answer": "`x² + ${a}x + ${b}`"

// RIGHT
"answer": "x² + {a}x + {b}"
```

### ❌ Mistake 3: Variable Prefix in Answer
```json
// WRONG (students must type "f'(x) = 6x + 5")
"answer": "f'(x) = {2*a}x + {b}"

// RIGHT (students type "6x + 5")
"answer": "{2*a}x + {b}"
```

### ❌ Mistake 4: Object Literals
```json
// WRONG
"answer": "({\"key1\": v1, \"key2\": v2})[param]"

// RIGHT
"answer": "(param === 'key1' ? v1 : param === 'key2' ? v2 : v3)"
```

### ❌ Mistake 5: No Rounding for Division
```json
// WRONG (shows 6.666666666666667)
"answer": "{'x > ' + ((c - b) / a)}"

// RIGHT (shows 6.67)
"answer": "{'x > ' + round((c - b) / a, 2)}"
```

### ❌ Mistake 6: Division by Zero
```json
// WRONG (can produce Infinity)
"params": { "x": ["int", -5, 5] }  // includes 0!
"answer": "10 / x"

// RIGHT (avoids 0)
"params": { "x": ["int", 1, 10] }  // or use conditional
"answer": "{x === 0 ? 'undefined' : 10 / x}"
```

## Parameter Types Reference

### Integer
```json
"param": ["int", min, max]
// Example: ["int", 1, 100] generates integers from 1 to 100
```

### Decimal
```json
"param": ["decimal", min, max, decimals]
// Example: ["decimal", 0, 10, 2] generates 0.00 to 10.00
```

### Choice
```json
"param": ["choice", option1, option2, option3, ...]
// Example: ["choice", "red", "blue", "green"]
```

## Testing Your Template

### Quick Validation
```bash
# Validate a template
node scripts/validate_template.cjs '{"id":"Y6.N.TEST.T1","stem":"Test","params":{},"answer":"42"}'

# Or validate from file
node scripts/validate_template.cjs templates/my_template.json
```

### Generate Sample Question
```powershell
# Add template to curriculumDataNew.json, then:
node scripts/sample_generate.mjs | Select-String "Y6.N.TEST"
```

## Template Checklist

Before adding a template, verify:

- [ ] `id` follows format: `Y{year}.{strand}.{TOPIC}.T{number}`
- [ ] `stem` has all parameters in `{param}` format
- [ ] All `{param}` in stem are defined in `params`
- [ ] `answer` uses `{}` if it contains `x`, `y`, or `=`
- [ ] No backticks or `${}` syntax
- [ ] No variable prefixes like `"v = "` unless students must type them
- [ ] Division operations use `round(, 2)` or protect against division by zero
- [ ] Functions called in answer exist in `mathHelpers.js`
- [ ] Difficulty is 1-10
- [ ] If using visualData, type is implemented in `QuestionVisualizer.jsx`
- [ ] Tested with validator: `node scripts/validate_template.cjs`
