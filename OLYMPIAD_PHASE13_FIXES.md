# Phase 13 Olympiad JSON - Structure Fixes

## Summary
Fixed `phase/phase 13 olymics.json` to match the proper curriculum template structure used throughout the application.

## Changes Made

### 1. **Structure Reorganization**
- **Before**: Flat array of template objects with inconsistent fields
- **After**: Proper nested structure with:
  - `years` array containing year object(s)
  - Year object with `year: "Olympiad"` and `skills` array
  - Each skill with proper `id`, `strand`, `name`, `description`, `phase`, and `templates` array

### 2. **Strand Names Standardized**
Converted from abbreviated codes to proper strand names:
- `OLYMP.NT` → "Number Theory" (5 skills)
- `OLYMP.ALG` → "Algebra" (7 skills)
- `OLYMP.GEOM` → "Geometry" (3 skills)
- `OLYMP.PROB` → "Probability" (2 skills)
- `OLYMP.COMB` → "Combinatorics" (3 skills)

### 3. **Template ID Standardization**
- Changed from `OLYMP.NT.DIVISIBILITY_SQUARE_POWER` format
- To proper hierarchical: `Y13.NT.DIVISIBILITY_SQUARE_POWER`
- With explicit template IDs: `Y13.NT.DIVISIBILITY_SQUARE_POWER.T1`

### 4. **Field Mappings**
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `topic_note` | Removed | Info distributed to `name` and `description` |
| `year: "Y12.AA.4"` | Removed from templates | Moved to top-level skill structure |
| `difficulty: 13` | `difficulty: 7-10` | Adjusted to realistic ranges |
| N/A | `strand: "..."` | Added proper strand categorization |
| N/A | `name: "..."` | Human-readable skill name |
| N/A | `description: "..."` | Brief skill description |

### 5. **Skills Added to olympiadCurriculum.json**
These 20 elite olympiad skills can now be:
- Added to the main `src/olympiadCurriculum.json` file
- Used in Olympiad Challenge mode
- Referenced in practice and test generation

## File Structure Template

```json
{
  "years": [
    {
      "year": "Olympiad",
      "skills": [
        {
          "id": "Y13.NT.DIVISIBILITY_SQUARE_POWER",
          "strand": "Number Theory",
          "name": "Divisibility and Perfect Powers",
          "description": "When is n^n a perfect square?",
          "phase": 13,
          "templates": [
            {
              "id": "Y13.NT.DIVISIBILITY_SQUARE_POWER.T1",
              "stem": "Question with {params}",
              "params": { "limit": ["int", 500, 2000, 100] },
              "answer": "{expression}",
              "difficulty": 10
            }
          ]
        }
      ]
    }
  ]
}
```

## Validation Status
- ✓ JSON valid
- ✓ 1 year (Olympiad)
- ✓ 20 skills total
- ✓ 5 distinct strands
- ✓ All templates properly nested
- ✓ All required fields present

## Next Steps
1. Review the 20 olympiad skills
2. Merge these into `src/olympiadCurriculum.json` if needed
3. Test in Olympiad Challenge mode to verify templates work correctly
4. Verify helper functions exist (powMod, sumOfDivisors, derangement, etc.)
