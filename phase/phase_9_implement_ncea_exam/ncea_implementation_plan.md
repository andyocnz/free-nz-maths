# Phase 9: NCEA Exam Implementation Plan

This document outlines the systematic, multi-phase plan for integrating NCEA past exam papers into the `free-nz-maths` application. This plan considers data structure, frontend components, and application logic, adhering to the project's existing conventions.

## Overall Goal

To provide a new section on the website where users can select an NCEA past paper and practice it in a structured format, enabling self-assessment against official exam questions.

## Phase 1: Data Structure & Content Preparation

This phase focuses on defining how NCEA exam data will be stored and converting existing sample exam papers into this format.

1.  **Create New Data File (`src/pastPapersData.js`):**
    *   **Purpose:** To store the structured NCEA exam data, keeping it separate from the main curriculum data.
    *   **Action:** Create an empty JavaScript file at `src/pastPapersData.js`. This file will eventually export an array of exam objects.

2.  **Define the Data Structure for an Exam Paper:**
    *   Each NCEA exam will be represented as an object. A new `pastPapersData.js` file will export an array of these objects.
    *   **Example Structure:**
        ```javascript
        const nceaExams = [
          {
            "id": "NCEA-L1-91027-2023",
            "year": 2023,
            "level": "NCEA Level 1",
            "standard": "91027",
            "title": "Apply algebraic methods in solving problems",
            "questions": [
              {
                "questionNumber": "1a",
                "partText": "Solve the equation: 4(2x - 3) + 5x = 27.",
                "answer": "x = 3",
                "marks": 2
              },
              // ... more questions
            ]
          },
          // ... other exam papers
        ];
        export default nceaExams;
        ```

3.  **Translate Existing Exam Content:**
    *   **Action:** Manually (or with a script) convert the content from `pastpapers/ncea_2014_level1_91027_full.json` and `pastpapers/ncea_2023_level1_91027_full.json` into the structure defined in `src/pastPapersData.js`.
    *   **Challenge:** This step requires mapping each exam question to a renderable format. For questions that don't fit existing curriculum templates, we will treat them as "static" questions with fixed text and answers.

## Phase 2: Frontend UI Scaffolding

This phase builds the necessary UI components.

1.  **Main Page Navigation (`src/App.jsx`):**
    *   **Action:** Add a new navigation link/button (e.g., "NCEA Past Papers") on the main application page to route to a new exam section.

2.  **Paper Selection Component (`src/PastPapersIndex.jsx`):**
    *   **Purpose:** To display a list of all available NCEA past papers.
    *   **Action:** Create `src/PastPapersIndex.jsx` to read from `src/pastPapersData.js` and render a clickable list of exams.

3.  **Exam Practice Component (`src/ExamPractice.jsx`):**
    *   **Purpose:** To display the practice session for a single NCEA exam.
    *   **Action:** Create `src/ExamPractice.jsx` which will load the selected exam data based on a route parameter (e.g., the exam ID).

## Phase 3: Core Logic and Question Rendering

This phase implements the mechanics of displaying the exam.

1.  **Question Rendering Loop (`src/ExamPractice.jsx`):**
    *   **Action:** Within `ExamPractice.jsx`, iterate through the `questions` array of the loaded exam.
    *   **Logic:** For each question, render its text, an input field for the user's answer, and any associated visuals. Since these are fixed questions from past papers, we won't use the dynamic `templateEngine.js` for generation, but will render them directly.

## Phase 4: Interactivity and Marking

This phase adds the interactive and feedback elements.

1.  **"Mark Exam" Functionality:**
    *   **Action:** Add a "Submit and Mark Exam" button. When clicked, it will collect all user answers.

2.  **Answer Evaluation:**
    *   **Action:** Create a new answer evaluation function tailored for this section.
    *   **Logic:** This function will compare the user's input against the stored answer. It will need to be robust enough to handle variations in algebraic answers (e.g., accepting `x=3` and `3` as equivalent).

3.  **Results Display (`src/ExamResults.jsx`):**
    *   **Action:** Create a new component `src/ExamResults.jsx` to display the user's score, show which questions were right or wrong, and provide the correct solutions.
