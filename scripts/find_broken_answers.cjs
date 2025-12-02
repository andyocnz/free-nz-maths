const fs = require('fs');

function checkFile(filepath, filename) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const broken = [];
  const displayIssues = [];

  data.years.forEach(year => {
    year.skills.forEach(skill => {
      skill.templates.forEach(template => {
        const answer = template.answer || '';

        // Check for missing {}
        const hasProblematicChars = /\bx\b/.test(answer) || /\by\b/.test(answer) || /=/.test(answer);
        const hasBraces = answer.includes('{');

        if (hasProblematicChars && !hasBraces) {
          broken.push({
            file: filename,
            id: template.id,
            year: year.year,
            skill: skill.id,
            skillName: skill.name,
            answer: answer
          });
        }

        // Check for display issues (backticks or dollar signs)
        if (answer.includes('`') || answer.includes('$')) {
          displayIssues.push({
            file: filename,
            id: template.id,
            year: year.year,
            skill: skill.id,
            answer: answer
          });
        }
      });
    });
  });

  return { broken, displayIssues };
}

const files = [
  ['./src/curriculumDataFull.json', 'curriculumDataFull.json'],
  ['./src/curriculumDataNew.json', 'curriculumDataNew.json'],
  ['./src/year11Curriculum.json', 'year11Curriculum.json'],
  ['./src/year12Curriculum.json', 'year12Curriculum.json'],
  ['./src/year13Curriculum.json', 'year13Curriculum.json']
];

let allBroken = [];
let allDisplayIssues = [];

files.forEach(([path, name]) => {
  try {
    const result = checkFile(path, name);
    allBroken = allBroken.concat(result.broken);
    allDisplayIssues = allDisplayIssues.concat(result.displayIssues);
  } catch(e) {
    // File doesn't exist, skip
  }
});

console.log('=' .repeat(80));
console.log('BROKEN TEMPLATES - MISSING {} IN ANSWERS');
console.log('=' .repeat(80));
console.log(`Found ${allBroken.length} templates:\n`);

allBroken.forEach(item => {
  console.log(`✗ ${item.id}`);
  console.log(`  File: ${item.file}`);
  console.log(`  Skill: ${item.skillName}`);
  console.log(`  Answer: ${item.answer}`);
  console.log('');
});

console.log('=' .repeat(80));
console.log('DISPLAY ISSUES - BACKTICKS OR DOLLAR SIGNS');
console.log('=' .repeat(80));
console.log(`Found ${allDisplayIssues.length} templates:\n`);

allDisplayIssues.forEach(item => {
  console.log(`⚠ ${item.id}`);
  console.log(`  File: ${item.file}`);
  console.log(`  Answer: ${item.answer}`);
  console.log('');
});
