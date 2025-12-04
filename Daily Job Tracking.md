# Daily Job Tracking – Free NZ Maths

**Last Updated:** 2025-12-04  
**Focus:** Import remaining templates from `phase/phase 10 year 11-13.json`

---

## Remaining Phases & Responsibilities
| Phase Item | Skills / Templates | Helper or Strategy Needed |
|------------|--------------------|---------------------------|
| **Y11 Quadratic Equations** (`Y11.A.QUADRATIC_EQS.T1/T2/T4`) | Factoring, quadratic formula, discriminant nature | Generate roots first or add helpers for `solution1/solution2` and `discriminant_nature`; consider MCQ for nature-of-roots prompt |
| **Y11 Linear Systems** (`Y11.A.LINEAR_SYSTEMS.T1/T2`) | Two-equation systems (elimination / substitution) | Need deterministic solver helper (protect `ae-bd ≠ 0`) or switch to multiple choice with evaluated answers |
| **Y11 Polynomial Operations** (`Y11.A.POLYNOMIALS.T2`) | Factor quadratics | Use multiple choice pattern (correct factorisation + FOIL distractors) or add factoring helper |
| **Y11 Trig Identities** (`Y11.G.TRIG_IDENTITIES.T2`) | Proof-style prompt | Convert to conceptual MCQ (match identity steps) – free-form proof not supported |
| **Y10 Surds / Ratios / Polynomial / Simultaneous** (`Y10.N.SURDS_*`, `Y10.A.POLYNOMIALS_FACTOR.T1`, `Y10.L.SIMULTANEOUS_GRAPH.T1`) | Radical simplification, rationalising, best buy, factoring, parabola-line intersection | Add helpers: `simplify_surd`, `rationalise_surd`, `best_buy`, `factor_quadratic`, `solve_parabola_line` or convert to MCQ |
| **Y11 Discriminant + Normal Distribution + Trig Exact** (`Y11.A.QUADRATICS_DISCRIMINANT.T1`, `Y11.S.NORMAL_PERCENT.T1`, `Y11.T.TRIG_EXACT.T1`) | Analytical outputs | Helpers for discriminant nature, normal CDF, exact sin values |
| **Y11 Matrices & Complex** (`Y11.M.MATRIX_INVERSE_2X2.T1`) | 2×2 inverse | Helper to format matrix/inverse safely (ensure `ad-bc ≠ 0`) |
| **Y12 Matrix Ops / Circle Geometry / Bivariate Data** (`Y12.A.MATRIX_OPS`, `Y12.G.CIRCLE_GEOMETRY.T2`, `Y12.S.BIVARIATE_DATA.T1`) | Matrix multiplication/inverse, completing square for circle, correlation | Add `formatMatrix`, determinant helper, circle-completion helper, and either correlation helper or MCQ describing trend |
| **Y12 Complex Polar** (`Y12.C.COMPLEX_POLAR.T1`) | Rectangular→polar conversion | Helper for `sqrt(a^2+b^2)` with rounding + `atan2` degrees |
| **Y13 Calculus & Complex Numbers** (`Y13.C.CALCULUS_APPLICATIONS.T1`, `Y13.A.COMPLEX_NUMBERS.T7`, `Y13.A.POLYNOMIALS.T3`) | Critical points, complex square roots, factor theorem | Helpers for derivative roots (`solveQuadratic` reuse), `sqrt_complex`, and solving for coefficient `b` |
| **Statistics Median** (`Y11.S.DESCRIPTIVE_STATS.T2`) | Median of five numbers | Helper `median5(a,b,c,d,e)` |

---

## Action Plan
1. **Helper Library Expansion**
   - Add the missing math utilities (surds, rationalise, best-buy, normal CDF approximation, matrix formatting, complex polar/roots, correlation, median5, circle completion, etc.).
   - Each helper should include simple guard rails (e.g., reject zero denominators) to keep question generation stable.
2. **Template Conversion**
   - Revisit each template in `phase/phase 10 year 11-13.json`, deciding between direct numeric answers (using new helpers) or the multiple-choice pattern rolled out for polynomials.
   - Prioritise small batches (e.g., “Quadratic equations set”, “Linear systems set”) so changes remain reviewable.
3. **Validation & Docs**
   - After each batch, run `node scripts/sample_generate.mjs | Select-String "<ID>"` plus spot-check in `npm run dev`.
   - Extend `DEVELOPER_ONBOARDING.md` as new helper patterns emerge (e.g., documenting surd/complex helpers once added).

---

Keep this file focused on the outstanding phase items above. Once a group is completed (helpers merged + templates imported), remove it from the table and log the next batch.###*** End Patch to=functions.apply_patch
