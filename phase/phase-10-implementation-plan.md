# Implementation Plan: New Question Templates for Years 10-13

This document outlines the implementation plan for adding new question templates for Years 10-13, as well as some additional templates for other year levels. The goal is to expand the curriculum coverage of the application with a focus on more advanced mathematical concepts.

## 1. Analysis of New Templates

The new templates introduce a range of advanced topics, primarily for Years 10, 11, 12, and 13. Key areas include:

-   **Algebra:** Quadratic equations, simultaneous equations, polynomial operations, matrix operations, complex numbers, partial fractions.
-   **Calculus:** Differentiation (including product, quotient, and chain rules), integration (definite and indefinite), and applications of calculus.
-   **Geometry & Trigonometry:** Advanced trigonometric identities and equations, vector operations (2D and 3D), coordinate geometry of conic sections, and circle theorems.
-   **Statistics & Probability:** Descriptive statistics, probability distributions (Binomial, Normal), and statistical inference (confidence intervals, hypothesis testing).

### New Functionality Required

Implementing these templates requires two main categories of new functionality:

1.  **Complex Answer Calculation:** Many templates have `answer` fields that are not simple expressions. These require new functions to perform calculations such as solving quadratic equations, factoring, matrix operations, statistical analysis, and solving systems of equations.
2.  **New Question Visualizers:** A few templates specify new `visualData.type` values, which require corresponding rendering functions to be added to the `QuestionVisualizer.jsx` component. The new visual types are:
    *   `stem_and_leaf`
    *   `scatter_plot`
    *   `circle_theorem_same_segment`
    *   `circle_diameter_angle`

## 2. File-by-File Implementation Details

The following files will need to be modified to implement the new templates.

### `src/curriculumDataNew.json`

-   **Change:** All new topic and template definitions from `phase/phase 10 year 11-13.json` and `phase/phase 10.1 add more templates` will be added to this file. This follows the process outlined in the developer onboarding guide for adding new content.
-   **Risk:** **Low**. This is a data-only change. Care must be taken to ensure the JSON structure is valid.

### `src/mathHelpers.js` (or a new file for mathematical logic)

-   **Change:** This file should be the central location for the new mathematical functions required to calculate the answers for the new templates. The `templateEngine.js` will call these functions. This keeps the core template engine clean and separates mathematical logic.
-   **Risk:** **High**. The logic in this file is critical for the correctness of a large number of questions. Each function must be robust, handle edge cases, and be thoroughly tested to prevent unrealistic or incorrect questions.

-   **Required Functions:**
    -   `solveQuadratic(a, b, c)`: Solves a quadratic equation. Must handle cases with two, one, or no real roots. Should be able to return integer or decimal solutions.
    -   `getDiscriminantNature(a, b, c)`: Calculates the discriminant and returns a string describing the nature of the roots (e.g., "two real rational roots", "one real root", "two complex conjugate roots").
    -   `solveLinearSystem(a, b, c, d, e, f)`: Solves a 2x2 system of linear equations. Must handle cases with one, none, or infinite solutions.
    -   `calculateMedian(numbers)`: Calculates the median of an array of numbers.
    -   `matrixMultiply(A, B)`: Multiplies two 2x2 matrices.
    -   `matrixInverse(A)`: Calculates the inverse of a 2x2 matrix. Must handle singular matrices (determinant is zero).
    -   `matrixDeterminant(A)`: Calculates the determinant of a 2x2 matrix.
    -   `solveComplexSquareRoot(a, b)`: Finds the square roots of a complex number `a + bi`.
    -   `lcm(a, b)`: Calculates the least common multiple.
    -   `prime_or_composite(n)`: Determines if a number is prime, composite, or neither.
    -   `to_scientific(n)`: Converts a number to scientific notation.
    -   `simplify_algebraic_fraction(a,b,c,d)`: Simplifies algebraic fractions.
    -   `cosine_rule_angle(a,b,c)`: Calculates an angle using the cosine rule.
    -   `factor_quadratic_integer(a,b,c)`: Factors a quadratic equation with integer roots.
    -   `standard_form(...)`: Converts a number to standard form.
    -   `time_difference_minutes(...)`: Calculates difference in time.
    -   Statistical functions: `normalcdf`, `invNorm`, `binomialPmf`, `t_statistic`.

### `src/templateEngine.js`

-   **Change:** The template engine needs to be updated to recognize and call the new functions in `mathHelpers.js`. The answer evaluation logic will need to be extended to parse and execute these function calls.
-   **Risk:** **High**. Changes to this core file can affect all existing and new questions. All changes must be backward compatible. The focus should be on making the engine aware of the new helper functions.

### `src/QuestionVisualizer.jsx`

-   **Change:** Add new `case` statements to the `switch` block for the new `visualData.type` values and implement the corresponding `draw...` functions.
-   **Risk:** **Medium**. Changes can be isolated to the new functions, minimizing the risk of affecting existing visuals.

-   **Required `draw` Functions:**
    -   `drawStemAndLeaf(ctx, data)`: Renders a stem-and-leaf plot based on the `stems` and `leaves` data.
    -   `drawScatterPlot(ctx, data)`: Renders a scatter plot. The `trend` property should influence the general distribution of points.
    -   `drawCircleTheoremSameSegment(ctx, data)`: Draws a circle with a chord and two angles in the same segment, illustrating the theorem.
    -   `drawCircleDiameterAngle(ctx, data)`: Draws a circle with a diameter and a triangle inscribed such that one side is the diameter, illustrating the angle in a semicircle theorem.

## 3. Summary Table

| File                          | Summary of Changes                                                                                             | Risk Level |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| `src/curriculumDataNew.json`  | Add new templates and topic definitions for years 6-13.                                                        | **Low**    |
| `src/mathHelpers.js`          | Create and implement new mathematical functions for complex calculations (quadratics, matrices, stats, etc.).      | **High**   |
| `src/templateEngine.js`       | Extend the engine to call and process results from the new functions in `mathHelpers.js`.                        | **High**   |
| `src/QuestionVisualizer.jsx`  | Add new `case` statements and `draw...` functions for `stem_and_leaf`, `scatter_plot`, and circle theorem visuals. | **Medium** |

This plan provides a structured approach to implementing the new question templates. The highest risk lies in the mathematical logic and its integration into the template engine, which should be the focus of careful implementation and thorough testing.
