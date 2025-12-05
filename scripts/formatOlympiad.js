
import fs from 'fs';

const inputFile = 'src/olympiadCurriculum.json';
const outputFile = 'src/olympiadCurriculumFix.json';

try {
    // Read the original file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const originalData = JSON.parse(rawData);

    // Deep copy the original data to modify it
    const newData = JSON.parse(JSON.stringify(originalData));

    // Iterate through each skill and reformat it
    for (const skill of newData.skills) {
        const originalName = skill.name || "";
        const parts = originalName.split('/').map(p => p.trim());

        if (parts.length >= 3) {
            // Assumes a pattern like "Category / Strand / Name"
            // Or "Year Range / Category / Name"
            const strand = parts[1];
            const name = parts[2];

            skill.strand = strand;
            skill.name = name;
            skill.description = `An Olympiad-level question in the strand of ${strand} about ${name}.`;
        } else {
            // If the pattern doesn't match, we can create a generic description
            skill.description = `An Olympiad-level question about ${originalName}.`;
        }
    }

    // Write the corrected data to the new file
    fs.writeFileSync(outputFile, JSON.stringify(newData, null, 2));

    console.log(`Successfully fixed and wrote Olympiad curriculum data to ${outputFile}`);

} catch (error) {
    console.error('An error occurred during the fix process:', error);
}
