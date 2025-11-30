# Phase 8: Detailed Implementation Plan

This document provides a detailed, step-by-step workflow for implementing the new topics for Years 8, 9, and 10.

## General Implementation Workflow

The implementation of each new topic will follow this standard process, as derived from the `DEVELOPER_ONBOARDING.md` guide:

1.  **Add Skill & Template:** New skill and template definitions will be added to `src/curriculumDataNew.json`.
2.  **Extend Answer Engine (If Required):** If a template requires a new answer generation algorithm (e.g., solving a specific type of equation), a corresponding helper function will be added to `src/templateEngine.js`.
3.  **Extend Visualizer (If Required):** If a template requires a new visual, a new drawing function will be added to `src/QuestionVisualizer.jsx`.
4.  **Test & Verify:** The new template will be tested using both the command-line script (`scripts/sample_generate.mjs`) for data correctness and the dev server (`npm run dev`) for visual confirmation.

---

## Detailed Example: Implementing "Year 9 - Graphing Linear Inequalities"

This example demonstrates the end-to-end process for a single topic.

### Step 1: Add Skill and Template to `src/curriculumDataNew.json`

A new skill `Y9.A.GRAPH_INEQUALITIES` will be added to the Year 9 array in `src/curriculumDataNew.json`, along with its first template.

```json
{
  "id": "Y9.A.GRAPH_INEQUALITIES",
  "strand": "Number & Algebra",
  "name": "Graphing Linear Inequalities",
  "description": "Identify the correct graphical representation of a two-variable linear inequality.",
  "isNew": true,
  "templates": [
    {
      "id": "Y9.A.GRAPH_INEQUALITIES.T1",
      "stem": "Which graph represents the solution to the inequality `y < {m}x + {c}`?",
      "params": {
        "m": ["int", -3, 3, 1],
        "c": ["int", -5, 5]
      },
      "answer": "correct_graph_option()",
      "visualData": {
        "type": "graph_inequality",
        "m": "m",
        "c": "c",
        "inequality": "<"
      }
    }
  ]
}
```

### Step 2: Extend `templateEngine.js` (Answer Function)

The `answer` expression is `correct_graph_option()`. This assumes a multiple-choice scenario where several graphs are presented. While the core logic for this would be in the UI, we may need a placeholder or simple helper in `templateEngine.js`. For this example, let's assume no new function is needed in the engine, as the UI will handle showing 4 graphs and knowing which one is correct.

*(Note: If the answer required complex calculation, e.g., `solve_system_of_equations()`, we would add that function here.)*

### Step 3: Extend `QuestionVisualizer.jsx` (Visual Function)

The template requires a new visual of type `graph_inequality`. This necessitates the following changes to `src/QuestionVisualizer.jsx`:

1.  **Add a new case** to the `switch (visualData.type)` block:
    ```javascript
    case 'graph_inequality':
      drawGraphInequality(ctx, visualData);
      break;
    ```
2.  **Implement the new drawing function `drawGraphInequality`**:
    ```javascript
    function drawGraphInequality(ctx, data) {
      // 1. Get parameters from data object: m, c, inequality
      const { m, c, inequality } = data;

      // 2. Draw standard x and y axes.
      drawAxes(ctx);

      // 3. Calculate two points for the line y = mx + c.
      const x1 = -10, y1 = m * x1 + c;
      const x2 = 10, y2 = m * x2 + c;

      // 4. Draw the line. If inequality is '<' or '>', use a dashed line. Otherwise, use a solid line.
      drawLine(ctx, toCanvasX(x1), toCanvasY(y1), toCanvasX(x2), toCanvasY(y2), { dashed: inequality === '<' || inequality === '>' });

      // 5. Shade the correct region. For 'y < ...', shade below the line. For 'y > ...', shade above.
      shadeRegion(ctx, m, c, inequality);
    }
    ```
    *(Helper functions like `drawAxes`, `drawLine`, and `shadeRegion` would be created or reused within the file).*

### Step 4: Verification

1.  **CLI Test:** Run `node scripts/sample_generate.mjs --id=Y9.A.GRAPH_INEQUALITIES.T1` to confirm the `visualData` object is generated with correct `m` and `c` values.
2.  **Visual Test:** Run `npm run dev`, navigate to Year 9, and find the "Graphing Linear Inequalities" skill to ensure the canvas displays a correctly plotted and shaded inequality graph.

---

## High-Level Implementation Summary for All Topics

This table outlines the new functions and primary file modifications required for each new topic.

| Year | Topic                               | New `templateEngine.js` Functions   | New `QuestionVisualizer.jsx` Functions |
| :--- | :---------------------------------- | :------------------------------------ | :--------------------------------------- |
| 8    | Integer Word Problems               | (None)                                | (None)                                   |
| 8    | Advanced Exponents                  | (None - uses existing math ops)       | (None)                                   |
| 8    | Pythagorean Theorem                 | (None - uses `sqrt` and `round`)      | (None)                                   |
| 8    | Multi-step Inequalities             | (None)                                | (None)                                   |
| 9    | Systems of Linear Equations         | `solve_linear_system`                 | (None)                                   |
| 9    | Simplifying Radical Expressions      | `simplify_radical`                    | (None)                                   |
| 9    | Graphing Linear Inequalities        | (None)                                | `drawGraphInequality`                    |
| 9    | Midpoint Formula                    | (None - simple math)                  | (None)                                   |
| 9    | Composite 3D Solids                 | `volume_cone`, `volume_cylinder`      | (None)                                   |
| 10   | Quadratic Formula & Discriminant    | `solve_quadratic_formula`             | (None)                                   |
| 10   | Graphing Quadratics                 | (None)                                | `drawGraphParabola`                      |
| 10   | Sine & Cosine Rules                 | `cosine_rule_side`, `sine_rule_angle` | (None)                                   |
| 10   | Algebraic Fractions                 | (None)                                | (None)                                   |
| 10   | Circle Geometry Theorems            | (None)                                | `drawCircleTheoremAngleCenter`           |
| 10   | Conditional Probability             | (None - uses existing math ops)       | (None)                                   |
| 10   | Systems of Equations (Advanced)     | `solve_linear_parabola_system`        | (None)                                   |
| 10   | Trigonometry in 3D                  | (None - uses existing math ops)       | (None)                                   |
| 10   | Functions (Domain and Range)        | (None)                                | (None)                                   |
| 10   | Bivariate Statistics                | (None)                                | (None)                                   |
| 10   | Surface Area & Volume (Multi-step)  | (None - uses existing math ops)       | (None)                                   |
| 10   | Geometric Reasoning & Proofs        | (None)                                | (None)                                   |

All topics will require adding a new skill and templates to `src/curriculumDataNew.json`.
