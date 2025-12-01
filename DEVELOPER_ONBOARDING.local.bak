# Developer Onboarding — free-nz-maths (Phase‑7 additions)

This is a short working guide so a junior dev can pick up where recent Phase‑7 changes left off.

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
- `src/curriculumDataFull.json` — audited/base curriculum (do not modify directly when adding new Phase content).
- `src/curriculumDataNew.json` — Phase‑7 additions and editable new templates. New templates live here and are merged at runtime.
- `src/curriculumDataMerged.js` — runtime merging logic that appends `curriculumDataNew` into the base and marks appended templates with `isNew`.
- `src/templateEngine.js` — template parameter generation, answer expression evaluation, and visualData token substitution. Edit here when you need new param generators or answer normalization.
- `src/QuestionVisualizer.jsx` — HTML5 Canvas rendering routines for all visuals. Key functions:
  - `drawNet(ctx, data)` — draws nets. (Recently extended to support `shape_type`: `cube`, `rectangular_prism`, `triangular_prism`, `square_pyramid`, `tetrahedron`).
  - `drawParallelTransversal`, `drawHistogram`, etc. — other visuals.
- `src/HintModal.jsx` — hint modal component. Accepts `htmlContent` for rich (SVG/HTML) hints.
- `src/App.jsx` — app logic (hint generation, wiring, question lifecycle). Where hints get injected and modal opened.
- `scripts/sample_generate.mjs` — quick node script that uses the template engine to print sample questions (useful for automated checks without running the browser).

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

Note: New templates in `curriculumDataNew.json` are merged and marked `isNew` at runtime — don't edit `curriculumDataMerged.js` unless you need to change merging behaviour.

## How to extend visuals
- Open `src/QuestionVisualizer.jsx` and find the `switch` on `visualData.type`. Add a case that calls a new `drawXxx` function.
- Implement the `drawXxx(ctx, data)` function. Keep drawings simple and avoid revealing answers in the visual. Use `data` fields rather than hard-coded numbers.
- For nets: edit `drawNet` and add support for new `shape_type` variants. Keep the function robust to missing fields.
- After modifying visuals, run the dev server and view affected questions in-browser, or run `node .\scripts\sample_generate.mjs` to see the `visualData` printed and ensure the correct `shape_type` is used.

## How hints work
- The app uses `HintModal.jsx`. Hints may be provided as plain text or as `htmlContent` containing inline SVG/HTML to present an image-like hint.
- Hints are set in `src/App.jsx` where questions are displayed. Search for `hintModal` usage to see how hint content is constructed for specific skills (e.g. transversals).

## Testing & verification
- Use `node .\scripts\sample_generate.mjs` to generate and inspect sample questions quickly. The script prints `visualData` objects — this is useful to confirm template IDs, params, and `visualData.type`/`shape_type` values.
- To verify visuals in-context: run `npm run dev`, open the site, navigate to Practice/Test pages and trigger the skill/topic that contains your templates.

## Common tasks you may need to do
- Add synonyms for answers (e.g., accept both `Cuboid` and `Rectangular prism`): update `src/templateEngine.js` answer normalization or add multiple acceptable answer strings in the template (or accept case-insensitive match logic in the UI comparison).
- Add new param generators (e.g., generate an array of points): extend `templateEngine.js` helpers and param types parsing.
- Improve artwork for a visual: update drawing code in `src/QuestionVisualizer.jsx` and watch for canvas scaling differences across sizes.

## Commit / PR guidance
- Keep changes focused: one concept per PR (e.g., "Add triangular prism nets" vs "Refactor visualizer").
- Run `npm run build` or at least `node .\scripts\sample_generate.mjs` before opening a PR to catch syntax/runtime issues.
- Reference template IDs changed/added in the PR description and mention visual changes so reviewers can check the UI.

## Notes / Gotchas
- The template engine performs string substitution for `visualData` fields. If you put parameter names as strings in `visualData` (e.g., `"values": ["v1","v2"]`) the engine will replace those with actual numbers when generating a question.
- Canvas coordinates assume 400×300 by default. If adding a large/complex visual, use `visualData.canvasWidth` / `canvasHeight` to request a different canvas size.
- Hints may use `dangerouslySetInnerHTML` to render inline SVG — review security/escaping if you accept external content.

## Quick contacts / next steps
- If you want, I can:
  - Add numbered angle labels to the parallel-transversal visual and templates that ask for angle numbers.
  - Improve net artwork and add face labels.
  - Add answer-synonym matching (e.g., cuboid/rectangular prism).

---
Saved as `DEVELOPER_ONBOARDING.md` in the project root.
