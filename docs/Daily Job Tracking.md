# Daily Job Tracking – Free NZ Maths

**Last Updated:** 2025-12-04  
**Focus:** Phase 10.18 – Helper batches & Olympiad prep (Phase 10.17 quick wins completed)

## Daily Progress Snapshot
| KPI | Progress (Today) |
|-----|------------------|
| Phase 10.17 quick wins | 7 / 7 templates (100% complete) |
| Helper Batch A (4 templates) | 0 / 4 (0% - next focus) |
| Helper Batch B (2 templates) | 0 / 2 (0% - queued) |
| Helper Batch C (5 templates) | 0 / 5 (0% - queued) |

---

## Phase 10.16 Workboard
| Priority | Template Group (File) | Plan of Attack | Notes |
|----------|----------------------|----------------|-------|
| ✅ **Phase 10.17 (done)** | Quadratics/linear/polynomial MC conversions | Templates tagged `phase: 10.17` now live (factorisation, quadratic formula, discriminant, linear systems, trig identity). | No further action. |
| ⚙ **Helper Batch A** | Surds, ratios, quadratic factor T1, parabola/line intersection (`Y10.N.SURDS_*`, `Y10.N.RATIOS_BESTBUY.T1`, `Y10.L.SIMULTANEOUS_GRAPH.T1`) | Add helpers: `simplifySurd`, `rationaliseSurd`, `bestValue`, `solveParabolaLine`. Tag resulting templates `phase: 10.18`. | Next up. |
| ⚙ **Helper Batch B** | Normal distribution %, trig exact values (`Y11.S.NORMAL_PERCENT.T1`, `Y11.T.TRIG_EXACT.T1`) | `normalCdfApprox(z)` + `exactSin(angle)` (30/45/60). | Needed after Batch A. |
| ⚙ **Helper Batch C** | Matrix ops/inverse, complex polar/square root (`Y11.M.MATRIX_INVERSE_2X2.T1`, `Y12.A.MATRIX_OPS.*`, `Y12.C.COMPLEX_POLAR.T1`, `Y13.A.COMPLEX_NUMBERS.T7`) | Helpers: `matrixMultiply2x2`, `inverse2x2`, `formatMatrix`, `polarForm`, `sqrtComplex`. Guard against singular matrices. | Enables both standard + Olympiad templates. |
| 🧠 **Advanced / later** | Calculus critical points, factor theorem (`Y13.C.CALCULUS_APPLICATIONS.T1`, `Y13.A.POLYNOMIALS.T3`) | Consider helper `criticalPointsCubic` + `solveForB`, or convert to curated MC. | Leave until helper batches merged. |

## Olympiad Queue (`phase/phase 13 olymics.json`)
| Priority | Template | Strategy | Status |
|----------|----------|----------|--------|
| ✅ Easy wins | `OLYM.N.HCF_LCM_CLASSIC`, `OLYM.N.BASE_CONVERSION`, `OLYM.A.VIETA_PRIMES`, `OLYM.N.SUM_OF_DIVISORS` | Import early (sum-of-divisors helper needed). Can be MC or numeric. | After helper ready. |
| ⚙ Helper-needed | `OLYM.A.DIOPHANTINE_LINEAR`, `OLYM.A.FUNCTIONAL_EQ`, `OLYM.A.SCALING_FUNCTION` | Build helpers (`countDiophantinePositive`, `functionalEquationSolve`, `scalingFunctionSolve`). | Mid-term. |
| 🧠 Hard set | `OLYM.N.DIVISIBILITY_SQUARE_POWERS`, `OLYM.N.MODULAR_BINOMIAL`, `OLYM.A.TAN_RECURRENCE`, `OLYM.A.TELESCOPING_HARMONIC` … | Either craft step-based MC or postpone until dedicated helpers exist. | Backlog. |

---

## Implementation Order
1. **MC conversions** – Quadratic/linear/polynomial/trig identity (no new helpers).
2. **Helper Batch A** – Surds/ratios/parabola -> import linked templates.
3. **Helper Batch B** – Normal distribution + exact trig.
4. **Helper Batch C** – Matrix + complex helpers; unlock related templates and Olympiad easy wins (sum-of-divisors, base conversion, etc.).
5. **Olympiad helper batch** – Diophantine/function/scaling.
6. **Advanced leftovers** – Calculus, modular/binomial olympiad, etc. (MC rewrite if faster).


**Curriculum files:** When adding helper-enabled templates, update `phase/phase 10 year 11-13.json` and `phase/phase 13 olymics.json` so the curriculum stays in sync.

For every batch:
- Rephrase stems to fit the system (no hardcoded answers, no proofs).
- Prefer multiple choice when it reduces complexity.
- Test via `node scripts/sample_generate.mjs | Select-String "<ID>"` and spot-check in `npm run dev`.
- Update `DEVELOPER_ONBOARDING.md` with any new helper pattern.
- Remove rows from this document once merged; add new ones if additional helper work appears.

### Open Items / Next Up
- ✅ Helper Batch A (surds, ratios, parabola-line helpers) merged and live; continue QA to ensure the new helper-driven templates are sampled in dev view.
- ✅ Olympiad curriculum split into `src/olympiadCurriculum.json`; dev UI now toggles between Year views and Olympiad, but verify remaining math symbols render cleanly in the QA export (extend `normalizeMathDisplay` if needed).
- 🔄 **Year 13 clean-up:** many Year 13 templates (e.g. calculus, vectors) still need style/encoding pass and helper verification—review `phase/phase 10 year 11-13.json` entries tagged `phase: 10.18` before moving to Olympiad backlog.
- 🔄 **Olympiad QA**: dev/QA pipeline still shows mojibake for some symbols (`ΓêÆ`, `Ç Γëê`). Continue augmenting the sanitizer so QA JSON and tables are human-readable.
- 🔜 After Year 13 and Olympiad QA stabilise, resume helper batches B/C (normal distribution/trig exact, matrix ops/inverse) and ensure Year 12/13 curriculum JSON stays in sync.

---
