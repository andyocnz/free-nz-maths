import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Mapping of current skill IDs to official NZ curriculum codes
// For skills without Y prefix, we'll add it based on year
// Format: "N.FINANCIAL_RATES" → "D.8" (will become Y10.D.8)
const skillMapping = {
  // Year 10 - without Y prefix (for newly added skills)
  'N.FINANCIAL_RATES': 'D.8',
  'N.FINANCIAL_COMPOUND': 'D.7',
  'M.PRECISION_ERROR': 'E.3',
  'M.VOLUME_SIMILAR': 'F.15',
  'C.COORD_DISTANCE': 'G.3',
  'C.COORD_GRADIENT': 'O.3',
  'L.NONLINEAR_GRAPH': 'O.2',
  'G.SIMILAR_TRIANGLES': 'F.10',
  'G.CONGRUENT_SSS': 'F.8',
  'S.UNIVARIATE_BOXPLOT': 'L.5',
  'S.BIVARIATE_CORRELATION': 'L.6',

  // Year 11 - without Y prefix (for newly added skills)
  'A.QUADRATICS_COMPLETE_SQUARE': 'Q.6',
  'A.QUADRATIC_EQS': 'Q.7',
  'A.POLYNOMIALS': 'O',
  'M.SURFACE_AREA_PYRAMID': 'JJ.3',
  'M.VOLUME_SPHERE': 'JJ.6',
  'T.TRIG_GRAPH': 'GG.9',
  'M.MATRIX_ADD': 'O',
  'M.MATRIX_MULTIPLY_2X2': 'O',
  'G.TRIG_RATIOS': 'GG.1',
  'G.TRIG_IDENTITIES': 'Y',
  'G.COORDINATE_GEOMETRY': 'D',
  'S.DESCRIPTIVE_STATS': 'NN.1',
  'C.CALCULUS_DIFF': 'EE.2',

  // Year 12 - without Y prefix
  'C.COMPLEX_ADD': 'G.2',
  'V.VECTOR_DOT': 'M.5',
  'V.VECTOR_ANGLE': 'M.5',
  'ALG.RECURSION': 'AA.4',
  'A.MATRIX_OPS': 'M.5',
  'A.EXPONENTIALS_LOGS': 'P.8',
  'C.CALCULUS_APPLICATIONS': 'EE.1',
  'G.VECTOR_OPS': 'M.5',

  // Year 13
  'A.COMPLEX_NUMBERS': 'G.3'
};

let updateCount = 0;
const updates = [];

// Traverse curriculum and update skill IDs
curriculum.years.forEach(year => {
  year.skills.forEach(skill => {
    const skillId = skill.id;

    // Check if this skill needs updating
    for (const [oldId, newId] of Object.entries(skillMapping)) {
      if (skillId === oldId) {
        const oldSkillId = skill.id;
        const yearPrefix = `Y${year.year}`;

        // Update the skill ID to match official NZ curriculum
        skill.id = `${yearPrefix}.${newId}`;

        updates.push(`Y${year.year}: ${oldSkillId} → ${skill.id}`);
        updateCount++;
        break;
      }
    }
  });
});

// Save updated curriculum
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log(`\n✅ Fixed ${updateCount} skill IDs to match official NZ curriculum`);
console.log('\n📋 Updated skills:');
updates.forEach(update => console.log(`  ${update}`));
