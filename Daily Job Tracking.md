# Daily Job Tracking – Free NZ Maths

**Last Updated:** 2025-12-04  
**Focus:** Phase 10.16 – Year 11‑13 backlog + Olympiad pool (easy-first strategy)

---

## Phase 10.16 Workboard
| Priority | Template Group (File) | Plan of Attack | Notes |
|----------|----------------------|----------------|-------|
| ✅ **MC conversions (no helpers)** | Quadratic factoring/roots, discriminant, linear systems, polynomial operations (`phase/phase 10 year 11-13.json`) | Rephrase into multiple choice (correct answer + FOIL / elimination distractors). Use existing formatting helpers. | Start here – fastest wins. |
| ✅ **Conceptual cleanups** | Trig identity proof (`Y11.G.TRIG_IDENTITIES.T2`) | Rewrite as “Which step completes the identity?” MC. | Avoid free-form text answers. |
| ⚙ **Helper Batch A** | Surds, ratios, quadratic factor T1, parabola/line intersection (`Y10.N.SURDS_*`, `Y10.N.RATIOS_BESTBUY.T1`, `Y10.L.SIMULTANEOUS_GRAPH.T1`) | Add helpers: `simplifySurd`, `rationaliseSurd`, `bestValue`, `solveParabolaLine`. | Implement after MC conversions merged. |
| ⚙ **Helper Batch B** | Normal distribution %, trig exact values (`Y11.S.NORMAL_PERCENT.T1`, `Y11.T.TRIG_EXACT.T1`) | `normalCdfApprox(z)` + `exactSin(angle)` (30/45/60). | Required before importing these templates. |
| ⚙ **Helper Batch C** | Matrix ops/inverse, complex polar/square root (`Y11.M.MATRIX_INVERSE_2X2.T1`, `Y12.A.MATRIX_OPS.*`, `Y12.C.COMPLEX_POLAR.T1`, `Y13.A.COMPLEX_NUMBERS.T7`) | Helpers: `matrixMultiply2x2`, `inverse2x2`, `formatMatrix`, `polarForm`, `sqrtComplex`. Guard against singular matrices. | Impacts both phase 10 file + Olympiad set. |
| 🧠 **Advanced / later** | Calculus critical points, factor theorem (`Y13.C.CALCULUS_APPLICATIONS.T1`, `Y13.A.POLYNOMIALS.T3`) | Consider helper `criticalPointsCubic` + `solveForB`, or convert to curated MC. | Leave until preceding batches merged. |

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

For every batch:
- Rephrase stems to fit the system (no hardcoded answers, no proofs).
- Prefer multiple choice when it reduces complexity.
- Test via `node scripts/sample_generate.mjs | Select-String "<ID>"` and spot-check in `npm run dev`.
- Update `DEVELOPER_ONBOARDING.md` with any new helper pattern.
- Remove rows from this document once merged; add new ones if additional helper work appears.

---
