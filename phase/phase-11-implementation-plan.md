# Phase 10: NCEA-Style Dynamic Template Implementation Plan

This document outlines the corrected and agreed-upon plan for creating **new, original, and dynamic question templates** that mimic the style and structure of the new NCEA Level 1 standards **91946** and **91947**.

The primary goal is to build a library of reusable, NCEA-style templates that can generate an infinite variety of practice questions, rather than transcribing static past papers.

---

### Phase 10.1: Analysis and Blueprint Definition

Before new templates are created, a thorough analysis of the NCEA materials is required to define a "blueprint" for each standard.

1.  **Analyze Exam Structure:**
    *   I will review the structured JSON data for the `91946` and `91947` standards.
    *   This analysis will identify the common question types, the combination of skills within a single question, typical mark allocations, and the overall structure of each exam.

2.  **Analyze Visual Requirements from Resource Booklets:**
    *   A critical step is to research the official **Resource Booklets** associated with these new standards.
    *   This research will identify the specific types of graphs, tables, and diagrams students are expected to interpret. This will inform the creation of new dynamic drawing functions for our `QuestionVisualizer.jsx` component.
    *   **Anticipated Visuals:** Comparative box plots, time-series graphs with trend lines, scatter plots, and potentially complex geometric diagrams.

---

### Phase 10.2: Proposed New Dynamic Templates

Based on the analysis, this is a list of proposed new, reusable templates to be built.

#### For Standard 91946 (Use algebraic methods to solve problems)

1.  **Template: Multi-step Perimeter/Area Word Problem**
    *   **Concept:** A classic NCEA question that involves setting up and solving a quadratic equation from a geometric context.
    *   **Example `stem`:** "A rectangular garden has a length that is 5 metres longer than its width, `x`. The total area of the garden is 84 m². Form a quadratic equation and solve it to find the dimensions of the garden."
    *   **Dynamic `params`:** The relationship between sides (`+5`) and the final area (`84`) will be randomized to create new problems.
    *   **`visualData`:** Could use the visualizer to draw a simple rectangle with labels `x` and `x+5`.

2.  **Template: Simultaneous Equations from Context**
    *   **Concept:** A word problem that requires the student to form two linear equations and solve them.
    *   **Example `stem`:** "At a cafe, 2 coffees and 1 muffin cost $14. 1 coffee and 3 muffins cost $17. Find the individual price of a coffee and a muffin."
    *   **Dynamic `params`:** The number of items and the total costs will be randomized to generate a solvable system.

#### For Standard 91947 (Demonstrate mathematical reasoning)

1.  **Template: Dynamic Box Plot Comparison**
    *   **Concept:** Ask students to compare two distributions shown as box plots, commenting on median, spread, and shape.
    *   **`visualData`:** `{ "type": "box_plot_comparison", "dataset1": {...}, "dataset2": {...} }`. This would require a new `drawBoxPlotComparison` function in `QuestionVisualizer.jsx`.
    *   **Example `stem`:** "The box plots show the daily sales for two different stores. Compare the sales distributions, making sure to comment on the median, interquartile range, and any skew."

2.  **Template: Time-Series Graph Interpretation**
    *   **Concept:** Ask students to identify trends and patterns in a time-series graph.
    *   **`visualData`:** `{ "type": "time_series_graph", "data": [...], "showTrend": true, "seasonality": "quarterly" }`. This would require a new `drawTimeSeries` function.
    *   **Example `stem`:** "The graph shows a company's quarterly profit from 2020 to 2025. Describe the long-term trend and any seasonal patterns you observe. Justify your answer with values from the graph."

3.  **Template: Scatter Plot Analysis**
    *   **Concept:** Ask students to interpret a scatter plot and its trend line.
    *   **`visualData`:** `{ "type": "scatter_plot", "data": [...], "correlation": "positive", "showTrendLine": true }`. The existing `drawScatterPlot` function may need to be enhanced.
    *   **Example `stem`:** "The scatter plot shows the relationship between hours spent studying and exam scores. Describe the relationship shown. Use the trend line to predict the score for a student who studies for 6 hours."

---

### Phase 10.3: Implementation Workflow

The implementation of each new template idea will follow these steps:

1.  **Create/Update Skill in `src/curriculumDataNew.json`:**
    *   A new skill will be created (e.g., "NCEA 91947 - Time Series Analysis").
    *   The new dynamic template will be added to this skill.

2.  **Extend `QuestionVisualizer.jsx` (If Needed):**
    *   For each new `visualData.type` (like `box_plot_comparison` or `time_series_graph`), a corresponding `draw...` function will be implemented inside `QuestionVisualizer.jsx`.

3.  **Extend `templateEngine.js` (If Needed):**
    *   For templates that require complex, randomized data sets (e.g., generating a noisy but correlated set of points for a scatter plot), new helper functions will be created in the template engine.

4.  **Test and Verify:**
    *   Each new template will be tested using `node scripts/sample_generate.mjs` to check the data generation.
    *   The template will be visually verified using `npm run dev` to ensure the canvas visuals are correct and the question renders as expected.

5.  **File Location for New Templates:**
    *   All new NCEA-style practice templates will be created in a new dedicated file: **`pastpapers/ncea_practice_templates.json`**. This keeps original work separate from the transcribed past papers.