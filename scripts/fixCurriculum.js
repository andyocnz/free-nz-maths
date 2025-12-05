
import fs from 'fs';

const inputFile = 'src/curriculumDataNew.json';
const outputFile = 'src/curriculumDataFixed.json';

// Define which skill IDs need to be moved and to which year.
const skillsToMove = {
    // From Year 11 to Year 12
    'C.CALCULUS_DIFF': 12,
    'T.TRIG_GRAPH': 12,
    'M.MATRIX_ADD': 12,
    'M.MATRIX_MULTIPLY_2X2': 12,
    'Y11.T.TRIG_EXACT': 12,
    'Y11.M.MATRIX_INVERSE_2X2': 12,
    'Y11.S.NORMAL_PERCENT': 12,

    // From Year 11 to Year 13
    'Y11.S.STATS_INFERENCE': 13,

    // From Year 10 to Year 11
    'Y10.A.QUADRATIC_FORMULA': 11,
    'Y10.G.TRIG_RULES': 11,
    'Y10.A.ALGEBRAIC_FRACTIONS': 11,
    'Y10.G.CIRCLE_THEOREMS': 11,
    'Y10.S.BIVARIATE': 11,

    // From Year 10 to Year 12
    'Y10.S.PROB_ADVANCED': 12,
    'Y10.G.TRIG_3D': 12,

    // From Year 9 to Year 10
    'Y9.A.SYSTEMS_LINEAR': 10,
    'Y9.S.BOX_PLOTS': 10,

    // From Year 9 to Year 11
    'Y9.A.GEOMETRIC_SEQUENCES': 11,
};

try {
    // Read the original file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const originalData = JSON.parse(rawData);

    // Create a new structure to hold the reorganized data
    const newData = {
        years: originalData.years.map(y => ({ year: y.year, skills: [] }))
    };

    const yearMap = {};
    for (const yearObj of newData.years) {
        yearMap[yearObj.year] = yearObj;
    }

    // Iterate through all skills in the original data and move them to the correct year in the new structure
    for (const yearObj of originalData.years) {
        for (const skill of yearObj.skills) {
            const targetYear = skillsToMove[skill.id];
            if (targetYear && yearMap[targetYear]) {
                yearMap[targetYear].skills.push(skill);
            } else {
                // If not in the move list, keep it in its original year
                yearMap[yearObj.year].skills.push(skill);
            }
        }
    }

    // Write the corrected data to the new file
    fs.writeFileSync(outputFile, JSON.stringify(newData, null, 2));

    console.log(`Successfully fixed and wrote curriculum data to ${outputFile}`);

} catch (error) {
    console.error('An error occurred during the fix process:', error);
}
