# Developer Onboarding – free-nz-maths (Phase 7–12 overview)

This is a short working guide so a junior dev can pick up where the recent Phase 7–12 changes left off (curriculum extensions, NCEA trials, SEO, and group test mode).

## Quick setup (Windows PowerShell)
- Ensure Node.js (LTS) and npm are installed.
- From the project root (`c:\Users\Andy\free-nz-maths`):

```powershell
# install deps
npm install

# run dev server (Vite)
npm run dev
# if port 5173 is in use Vite will try another port (e.g., 5174)

# build for production
npm run build

# run local sample generator (prints sample question objects)
node .\scripts\sample_generate.mjs
```

Open the local dev URL shown by Vite (e.g. `http://localhost:5173/` or `http://localhost:5174/`) to view the app.

## Files you should know (most-relevant)
- `src/curriculumDataFull.json` – audited/base curriculum (do not modify directly when adding new Phase content).
- `src/curriculumDataNew.json` – Phase 7+ additions and editable new templates. New templates live here and are merged at runtime.
- `src/curriculumDataMerged.js` – runtime merging logic that appends `curriculumDataNew` into the base and marks appended templates with `isNew`.
- `src/templateEngine.js` – template parameter generation, answer expression evaluation, and `visualData` token substitution. Edit here when you need new param generators or answer normalization.
- `src/QuestionVisualizer.jsx` – HTML5 Canvas rendering routines for all visuals. Key functions:
  - `drawNet(ctx, data)` – draws nets. (Extended to support `shape_type`: `cube`, `rectangular_prism`, `triangular_prism`, `square_pyramid`, `tetrahedron`).
  - `drawParallelTransversal`, `drawHistogram`, etc. – other visuals.
- `src/HintModal.jsx` – hint modal component. Accepts `htmlContent` for rich (SVG/HTML) hints.
- `src/KnowledgeModal.jsx` – “Remind me the knowledge” modal that shows concept summaries from `src/knowledgeSnippets.json`. It is scrollable and sized larger than the hint modal.
- `src/App.jsx` – app logic (hint generation, wiring, question lifecycle), NCEA trial wiring, SEO titles/meta descriptions, and the IXL-alternative landing page.
- `scripts/sample_generate.mjs` – quick node script that uses the template engine to print sample questions (useful for automated checks without running the browser).

### NCEA past papers & trials (Phase 9)
- `pastpapers/ncea_legacy_papers_structured.json` – structured Level 1 **legacy** externals (91027, 91028, 91031 etc).
- `pastpapers/ncea_new_papers_structured.json` – structured Level 1 **revised** standards (e.g. 91946, 91947).
- `pastpapers/NewFrom2024.json` – source of the clean 2025 91947 structure; used to normalise the 91947 entry.
- `pastpapers/resources/**` – local exam/resource PDFs and diagrams (e.g. `pastpapers/resources/2025/91947/3a.webp`, `pastpapers/resources/91946-res-2025.pdf`).
- `src/nceaStructuredData.js` – normalises NCEA JSON into a flat question list and exposes `buildNceaTrialQuestionsForStandard(standardNumber)` used by the trial engine.
- `src/nceaResources.js` – resolves `local:pastpapers/resources/...` paths (both PDF and WEBP/PNG) to Vite URLs via `import.meta.glob`.
- `src/PastPapersIndex.jsx` – UI for the NCEA Trial Exams section (legacy vs revised tabs, standard/year selection, and hooks for starting trials).

To see the NCEA trial index locally, you can use `/?mode=ncea-index` or navigate via the "NCEA Trial Exams" block on the landing page. Trial questions are built from the structured JSON (fixed questions for now; randomisation is a future phase).

### Group Test Mode (Phase 12)
Phase 12 introduces deterministic group testing where teachers create tests with 7-digit codes and students get identical questions.

#### Key Files
- `src/groupTestEngine.js` – deterministic question generation using seeded RNG. Every student with the same code gets identical questions in identical order.
- `src/config.js` – Google Apps Script URLs for registry and scores storage.
- `src/googleApi.js` – API functions for interacting with Google Sheets backend.
- `phase/phase12 - group test.md` – full specification for group test mode.

#### Google Sheets Backend
Two sheets are required:
1. **GroupRegistry** (`REGISTRY_URL`) – stores test metadata (groupCode, teacherEmail, teacherPin, year, mode, totalQuestions)
2. **GroupScores** (`SCORES_URL`) – stores student results (groupCode, studentName, score, wrongQuestions, etc.)

Apps Script endpoints handle POST (submit data) and GET (retrieve data) operations.

#### How Group Tests Work
1. Teacher fills form at `/group-test-setup` → generates 7-digit code
2. Data POSTed to `REGISTRY_URL` with mode encoded as:
   - `"full"` – all topics for the year
   - `"focused:SKILL_ID"` – single topic only (e.g., `"focused:Y7.N.FRACTIONS_ADD"`)
3. Students visit `/?group=7482915` → app fetches registry entry → generates deterministic test
4. `groupTestEngine.js` uses the group code as seed → all students get same questions
5. On submit, results POSTed to `SCORES_URL`
6. Teacher views results at `/results?group=7482915&pin=1234`

#### Focused Mode (Phase 12 Feature)
Teachers can select a single topic instead of testing all topics:
- UI: Mode dropdown with "Full assessment" or "Focused on one topic"
- When "Focused" is selected, a searchable dropdown appears with all skills for that year
- Skills grouped by strand and sorted alphabetically
- Mode stored as `focused:SKILL_ID` in the existing `mode` column (no new sheet columns)
- `groupTestEngine.js` filters to only the selected skill when generating questions

#### Answer Hiding (Phase 12 Feature)
To prevent answer sharing between students:
- **Students** see "Wrong ❌" without the answer shown
- **Teachers** add `&dev=true` to URL to see answers for debugging
- Regular (non-group) tests always show answers
- Implementation: checks `isGroupMode && !isDevMode` before displaying answers

#### Testing Group Mode Locally
```powershell
# Create a test at:
http://localhost:5173/

# Navigate to "Group Test Setup" and create a code
# Then open student link:
http://localhost:5173/?group=1234567

# View results (teacher):
http://localhost:5173/results?group=1234567&pin=1234

# Debug mode (see answers):
http://localhost:5173/?group=1234567&dev=true
```

### SEO & site structure (Phase 9.1)
- `src/App.jsx` (top-level `useEffect`) – sets `document.title` and the main `<meta name="description">` dynamically based on current mode, selected skill, and active NCEA paper.
- `src/App.jsx` – also handles a dedicated `/ixl-alternative` virtual page (“A Free Alternative to IXL for NZ Maths Practice”) with comparison table and copy.
- `scripts/generate_sitemap.mjs` – Node script that merges `curriculumDataFull.json` + `curriculumDataNew.json` and generates `sitemap.xml` (root) with routes like `/`, `/ixl-alternative`, `/topics/<skillId>`.

When adjusting SEO behaviour, keep changes minimal and avoid breaking the SPA routing – we still rely on client-side navigation for most paths.

## How to add new question templates (high level)
1. Add template JSON to `src/curriculumDataNew.json` under the appropriate `year` and `skill` group. Example template structure:
```json
{
  "id": "Y6.G.NETS.T8",
  "stem": "Which 3D solid is formed from the net shown?",
  "params": {},
  "answer": "'MyShapeName'",
  "difficulty": 3,
  "visualData": { "type": "net", "shape_type": "tetrahedron" }
}
```
2. Pick `visualData.type` to match a renderer in `QuestionVisualizer.jsx` (e.g. `net`, `histogram`, `parallel_transversal`).
3. If the template needs parameters, add a `params` object using the same param types as existing templates (e.g., `["int", min, max]`, `["choice", ...]`).
4. Keep the `answer` expression as a JavaScript-style expression string. The template engine evaluates it.

Note: New templates in `curriculumDataNew.json` are merged and marked `isNew` at runtime – don't edit `curriculumDataMerged.js` unless you need to change merging behaviour.

## How to extend visuals
- Open `src/QuestionVisualizer.jsx` and find the `switch` on `visualData.type`. Add a case that calls a new `drawXxx` function.
- Implement the `drawXxx(ctx, data)` function. Keep drawings simple and avoid revealing answers in the visual. Use `data` fields rather than hard-coded numbers.
- For nets: edit `drawNet` and add support for new `shape_type` variants. Keep the function robust to missing fields.
- After modifying visuals, run the dev server and view affected questions in-browser, or run `node .\scripts\sample_generate.mjs` to see the `visualData` printed and ensure the correct `shape_type` is used.

## How hints & knowledge reminders work
- The app uses `HintModal.jsx` for per-question hints. Hints may be provided as plain text or as `htmlContent` containing inline SVG/HTML.
- “Remind me the knowledge” uses `KnowledgeModal.jsx` + `knowledgeSnippets.json` to show a short, scrollable concept recap with formulas and examples for the current skill.
- Both modals are opened from `App.jsx` – search for `hintModal` and `knowledgeModal` usage to see where content is constructed.

## Testing & verification
- Use `node .\scripts\sample_generate.mjs` to generate and inspect sample questions quickly. The script prints `visualData` objects – this is useful to confirm template IDs, params, and `visualData.type`/`shape_type` values.
- To verify visuals in-context: run `npm run dev`, open the site, navigate to Practice/Test pages and trigger the skill/topic that contains your templates.
- NCEA trials: use `/?mode=ncea-index`, choose a standard (e.g. 91947), and step through the trial to confirm diagrams/resources are wired correctly.

## Common tasks you may need to do
- Add synonyms for answers (e.g., accept both `Cuboid` and `Rectangular prism`): update `src/templateEngine.js` answer normalization or add multiple acceptable answer strings in the template (or extend the UI comparison to accept case-insensitive variations).
- Add new param generators (e.g., generate an array of points): extend `templateEngine.js` helpers and param types parsing.
- Improve artwork for a visual: update drawing code in `src/QuestionVisualizer.jsx` and watch for canvas scaling differences across sizes.
- Extend NCEA coverage: update `pastpapers/*.json`, re-run any helper scripts (e.g. `scripts/embed_91947_images.mjs`), and ensure new standards are surfaced in `PastPapersIndex.jsx` and `nceaStructuredData.js`.

## Commit / PR guidance
- Keep changes focused: one concept per PR (e.g., “Add triangular prism nets” vs “Refactor visualizer”).
- Run `npm run build` or at least `node .\scripts\sample_generate.mjs` before opening a PR to catch syntax/runtime issues.
- Reference template IDs, NCEA standards, and pages changed in the PR description so reviewers know where to look (e.g. “updates 91947 Q2(b) diagram wiring”).

## Notes / Gotchas
- The template engine performs string substitution for `visualData` fields. If you put parameter names as strings in `visualData` (e.g., `"values": ["v1","v2"]`) the engine will replace those with actual numbers when generating a question.
- Canvas coordinates assume 400×300 by default. If adding a large/complex visual, use `visualData.canvasWidth` / `canvasHeight` to request a different canvas size.
- Hints and knowledge content may use `dangerouslySetInnerHTML` to render inline SVG/HTML – review security/escaping if you accept external content.
- NCEA resource paths must start with `local:pastpapers/resources/...` so `nceaResources.js` can resolve them correctly via `import.meta.glob`.
- Group test registry lookups must always send both `groupCode` and the sanitized teacher PIN to the Google Apps Script endpoints (`getRegistry`, `fetchGroupScores`). The `/sample/index.html` and `/sample/registry-dump.html` tools already do this – mirror that behaviour in `src/App.jsx` or the backend replies with "Incorrect teacher PIN or group code." even for valid pairs.

## Common Issues & Fixes (Phase 12)

### Answer Expression Issues
**Problem**: Template answer shows raw expression instead of evaluated result (e.g., `"Wrong ❌ Answer: (targetBinLabel === '130-140' ? v1 : ...)"`).

**Root Cause**: The template engine has logic to detect "algebraic" answers (line 707 in `templateEngine.js`) and skip evaluation. The regex `/=/` was matching comparison operators.

**Fix**: Avoid JavaScript object literal syntax `{...}` in answer expressions as curly braces confuse the parser. Use ternary chains instead:
```javascript
// ❌ DON'T use object literals
"answer": "({\"key1\": v1, \"key2\": v2})[param]"

// ✅ DO use ternary chains
"answer": "(param === 'key1' ? v1 : param === 'key2' ? v2 : v3)"
```

The regex was updated to `/(?<![=!<>])=(?!=)/` to allow comparison operators while detecting assignment.

### Last Question Not Counted
**Problem**: When clicking "Finish Test" on the last question with an answer typed in, the answer is skipped and counted as wrong.

**Root Cause**: React state updates are asynchronous. Calling `checkAnswer()` then immediately reading `history` state gave stale data.

**Fix**: The `finishTest()` function now manually checks the answer inline and passes the updated history directly to `finishTestInternal(updatedHistory)` (lines 1296-1350 in `App.jsx`), avoiding async state timing issues.

### Grade Not Displaying
**Problem**: Test results show percentage (e.g., 80%) but no letter grade (should be A-).

**Root Cause**: The grade was only calculated for group mode tests (line 1324). Regular tests didn't have grade assignment.

**Fix**: Added a safeguard (lines 1327-1330) that ensures `gradeFromPercentage()` is called for all test types:
```javascript
if (!normalizedResults.grade) {
  normalizedResults.grade = gradeFromPercentage(normalizedResults.percentageScore)
}
```

### Total Questions Input Not Working
**Problem**: Cannot type in the "Total questions" field in group setup form.

**Root Cause**: Missing `sanitizeDigits` function that was being called but not defined.

**Fix**: Added the function (line 289 in `App.jsx`):
```javascript
const sanitizeDigits = (value, maxLength) => String(value || '').replace(/\D/g, '').slice(0, maxLength)
```

### Dev Mode for Debugging
Use `?dev=true` or `&dev=true` in the URL to:
- See answers in group tests (students normally see "Wrong ❌" only)
- Access additional debugging features
- Test teacher-only functionality

Example: `http://localhost:5173/?group=1234567&dev=true`

---
Saved as `DEVELOPER_ONBOARDING.md` in the project root.
