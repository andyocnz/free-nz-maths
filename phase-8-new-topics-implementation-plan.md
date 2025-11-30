# Phase 8: New Topics Implementation Plan

This document outlines the new topics to be added for Years 8, 9, and 10, based on a curriculum gap analysis against the IXL NZ Maths curriculum.

## Year 8 New Topics

- [ ] **Integer Word Problems:** Create templates focusing on the multiplication and division of integers within practical scenarios.
  ```json
  {
    "id": "Y8.N.INTEGERS.T4",
    "stem": "A submarine descends {a} metres every minute for {b} minutes. What is its change in elevation?",
    "params": { "a": ["int", 5, 50], "b": ["int", 2, 10] },
    "answer": "-(a * b)"
  }
  ```
- [ ] **Advanced Exponents:** Develop templates for fractional and negative exponents and their associated rules, building on concepts from Year 7.
  ```json
  {
    "id": "Y8.N.EXPONENTS_ROOTS.T2",
    "stem": "Evaluate ({a}/{b})^-2.",
    "params": { "a": ["int", 1, 5], "b": ["int", 2, 6] },
    "answer": "(b*b) / (a*a)"
  }
  ```
- [ ] **Pythagorean Theorem:** Add an introductory topic on the Pythagorean theorem, including finding the hypotenuse and missing legs in right-angled triangles.
  ```json
  {
    "id": "Y8.G.PYTHAGORAS.T1",
    "stem": "A right-angled triangle has two shorter sides of length {a} cm and {b} cm. What is the length of the hypotenuse, rounded to one decimal place?",
    "params": { "a": ["int", 3, 20], "b": ["int", 3, 20] },
    "answer": "round(sqrt(a*a + b*b), 1)"
  }
  ```
- [ ] **Multi-step Inequalities:** Create templates for solving and graphing simple one- and two-step inequalities.
  ```json
  {
    "id": "Y8.A.INEQUALITIES.T1",
    "stem": "Solve for x: {a}x + {b} > {c}",
    "params": { "a": ["int", 2, 5], "b": ["int", 1, 10], "c": ["int", 11, 40] },
    "answer": "`x > ${(c-b)/a}`"
  }
  ```

## Year 9 New Topics

- [ ] **Systems of Linear Equations:** Implement templates for solving systems of two linear equations using substitution and/or elimination methods.
  ```json
  {
    "id": "Y9.A.SYSTEMS_LINEAR.T1",
    "stem": "Solve the following system of equations for x and y: `y = {m}x + {c}` and `y = {m2}x + {c2}`.",
    "params": { "m": ["int", -5, 5, 1], "c": ["int", -10, 10], "m2": ["int", -5, 5, 1], "c2": ["int", -10, 10] },
    "answer": "solve_linear_system(m, c, m2, c2)"
  }
  ```
- [ ] **Simplifying Radical Expressions:** Add templates focused on simplifying square roots (e.g., converting √50 to 5√2).
  ```json
  {
    "id": "Y9.N.RADICALS.T1",
    "stem": "Simplify the following radical expression: √{n}",
    "params": { "n": ["int", 12, 150] },
    "answer": "simplify_radical(n)"
  }
  ```
- [ ] **Graphing Linear Inequalities:** Develop a visual template to graph the solution sets of linear inequalities on a coordinate plane.
  ```json
  {
    "id": "Y9.A.GRAPH_INEQUALITIES.T1",
    "stem": "Which graph represents the solution to the inequality `y < {m}x + {c}`?",
    "params": { "m": ["int", -3, 3, 1], "c": ["int", -5, 5] },
    "answer": "correct_graph_option()",
    "visualData": {
      "type": "graph_inequality",
      "m": "m",
      "c": "c",
      "inequality": "<"
    }
  }
  ```
- [ ] **Midpoint Formula:** Create templates for finding the midpoint of a line segment given two endpoints.
  ```json
  {
    "id": "Y9.G.MIDPOINT.T1",
    "stem": "Find the midpoint of the line segment with endpoints ({x1}, {y1}) and ({x2}, {y2}).",
    "params": { "x1": ["int", -10, 10], "y1": ["int", -10, 10], "x2": ["int", -10, 10], "y2": ["int", -10, 10] },
    "answer": "`(${(x1+x2)/2}, ${(y1+y2)/2})`"
  }
  ```
- [ ] **Composite 3D Solids:** Add templates for calculating the surface area and volume of combined 3D shapes (e.g., a cone joined to a cylinder).
  ```json
  {
    "id": "Y9.G.COMPOSITE_SOLIDS.T1",
    "stem": "A solid is formed by placing a cone with radius {r} cm and height {h_cone} cm on top of a cylinder with the same radius and height {h_cyl} cm. What is the total volume of the solid? Use π ≈ 3.14.",
    "params": { "r": ["int", 3, 10], "h_cone": ["int", 4, 12], "h_cyl": ["int", 5, 15] },
    "answer": "round(volume_cone(r, h_cone) + volume_cylinder(r, h_cyl), 2)"
  }
  ```

## Year 10 New Topics

### New Concepts for Year 10
- [ ] **Quadratic Formula & Discriminant:** Solving quadratic equations that cannot be factored.
  ```json
  {
    "id": "Y10.A.QUADRATIC_FORMULA.T1",
    "stem": "Use the quadratic formula to solve {a}x² + {b}x + {c} = 0. Give your answers to two decimal places.",
    "params": { "a": ["int", 2, 5], "b": ["int", -10, 10], "c": ["int", -10, 5] },
    "answer": "solve_quadratic_formula(a, b, c)"
  }
  ```
- [ ] **Graphing Quadratics:** Analyzing and graphing parabolas (vertex, axis of symmetry, intercepts).
  ```json
  {
    "id": "Y10.A.GRAPH_QUADRATIC.T1",
    "stem": "What are the coordinates of the vertex of the parabola y = x² + {b}x + {c}?",
    "params": { "b": ["int", -10, 10, 2], "c": ["int", -10, 10] },
    "answer": "`(${-b/2}, ${(-b/2)**2 + b*(-b/2) + c})`",
    "visualData": { "type": "graph_parabola", "a": 1, "b": "b", "c": "c" }
  }
  ```
- [ ] **Sine & Cosine Rules:** Solving problems with non-right-angled triangles.
  ```json
  {
    "id": "Y10.G.TRIG_RULES.T1",
    "stem": "In a triangle, side a = {a}, side b = {b}, and the angle between them is C = {C}°. Find the length of side c using the Cosine Rule.",
    "params": { "a": ["int", 5, 20], "b": ["int", 5, 20], "C": ["int", 20, 160] },
    "answer": "round(cosine_rule_side(a, b, C), 1)"
  }
  ```
- [ ] **Algebraic Fractions:** Operations (add, subtract, multiply, divide) on rational expressions.
  ```json
  {
    "id": "Y10.A.ALGEBRAIC_FRACTIONS.T1",
    "stem": "Simplify the expression: (x² - {a*a}) / (x - {a})",
    "params": { "a": ["int", 1, 10, 1] },
    "answer": "`x + ${a}`"
  }
  ```
- [ ] **Circle Geometry Theorems:** Applying formal theorems for angles, chords, and tangents.
  ```json
  {
    "id": "Y10.G.CIRCLE_THEOREMS.T1",
    "stem": "An angle at the circumference subtended by an arc is {a}°. What is the angle at the centre subtended by the same arc?",
    "params": { "a": ["int", 20, 80] },
    "answer": "2 * a",
     "visualData": { "type": "circle_theorem_angle_center", "angle": "a" }
  }
  ```
- [ ] **Conditional Probability & Tree Diagrams:** More advanced probability concepts.
  ```json
  {
    "id": "Y10.S.PROB_ADVANCED.T1",
    "stem": "A bag contains {r} red and {b} blue marbles. Two marbles are drawn without replacement. What is the probability that both are red?",
    "params": { "r": ["int", 3, 10], "b": ["int", 3, 10] },
    "answer": "simplify(r*(r-1), (r+b)*(r+b-1))"
  }
  ```

### Advanced Topics for Year 10
- [ ] **Systems of Equations (Advanced):** Solving systems that include non-linear equations.
  ```json
  {
    "id": "Y10.A.SYSTEMS_ADVANCED.T1",
    "stem": "Find the positive x-coordinate of the intersection points of the line `y = {c}` and the parabola `y = x² - {a}`.",
    "params": { "a": ["int", 1, 10], "c": ["int", 11, 30] },
    "answer": "sqrt(c + a)"
  }
  ```
- [ ] **Trigonometry in 3D:** Applying trigonometry to 3D shapes.
  ```json
  {
    "id": "Y10.G.TRIG_3D.T1",
    "stem": "A rectangular prism has length {l}, width {w}, and height {h}. Find the angle the space diagonal makes with the base, in degrees.",
    "params": { "l": ["int", 5, 15], "w": ["int", 5, 15], "h": ["int", 5, 15] },
    "answer": "round(atan(h / sqrt(l*l + w*w)) * (180/Math.PI), 1)"
  }
  ```
- [ ] **Functions (Domain and Range):** A deeper dive into function notation.
  ```json
  {
    "id": "Y10.A.FUNCTIONS_ADVANCED.T1",
    "stem": "What is the domain of the function f(x) = sqrt(x - {a})?",
    "params": { "a": ["int", 0, 20] },
    "answer": "`x ≥ ${a}`"
  }
  ```
- [ ] **Bivariate Statistics:** Analyzing scatter plots and lines of best fit.
  ```json
  {
    "id": "Y10.S.BIVARIATE.T1",
    "stem": "A line of best fit for a scatter plot is y = {m}x + {c}. Predict the value of y when x = {x_val}.",
    "params": { "m": ["decimal", 0.5, 5, 1], "c": ["decimal", 0, 20, 1], "x_val": ["int", 5, 25] },
    "answer": "m * x_val + c"
  }
  ```
- [ ] **Surface Area & Volume (Multi-step):** Problems requiring preliminary calculations.
  ```json
  {
    "id": "Y10.G.SA_VOLUME_ADVANCED.T1",
    "stem": "A cone has a slant height of {s} cm and a radius of {r} cm. What is its volume? Use π ≈ 3.14.",
    "params": { "s": ["int", 10, 25], "r": ["int", 3, 9] },
    "answer": "round(volume_cone(r, sqrt(s*s - r*r)), 2)"
  }
  ```
- [ ] **Geometric Reasoning & Proofs:** More formal geometric proofs and multi-step angle problems.
  ```json
  {
    "id": "Y10.G.GEOMETRIC_REASONING.T1",
    "stem": "In a cyclic quadrilateral, one angle is {a}°. What is the measure of the opposite angle?",
    "params": { "a": ["int", 60, 120] },
    "answer": "180 - a"
  }
  ```