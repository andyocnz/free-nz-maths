import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Replace math functions that need Math. prefix
function fixFormula(formula) {
  // Add Math. prefix to functions that need it
  let fixed = formula;

  // Replace sqrt( with Math.sqrt( (but not if already Math.sqrt)
  fixed = fixed.replace(/(?<!Math\.)sqrt\(/g, 'Math.sqrt(');

  // Replace acos( with Math.acos( (but not if already Math.acos)
  fixed = fixed.replace(/(?<!Math\.)acos\(/g, 'Math.acos(');

  // Replace atan( with Math.atan( (but not if already Math.atan)
  fixed = fixed.replace(/(?<!Math\.)atan\(/g, 'Math.atan(');

  // Replace pi with Math.PI (but not if already Math.PI)
  fixed = fixed.replace(/(?<!Math\.)pi\b/g, 'Math.PI');

  // Replace round( with Math.round( (but only if it's not already Math.round)
  fixed = fixed.replace(/(?<!Math\.)round\(/g, 'Math.round(');

  return fixed;
}

let fixCount = 0;
const fixes = [];

// Go through all templates and fix formulas
curriculum.years.forEach(year => {
  year.skills.forEach(skill => {
    if (skill.templates) {
      skill.templates.forEach(template => {
        if (template.answer && typeof template.answer === 'string') {
          const oldAnswer = template.answer;
          const newAnswer = fixFormula(oldAnswer);

          if (oldAnswer !== newAnswer) {
            template.answer = newAnswer;
            fixCount++;
            fixes.push({
              id: template.id,
              old: oldAnswer,
              new: newAnswer
            });
          }
        }
      });
    }
  });
});

fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log(`✅ Fixed ${fixCount} formulas\n`);
if (fixes.length > 0) {
  console.log('Fixed formulas:');
  fixes.forEach(f => {
    console.log(`\n${f.id}:`);
    console.log(`  Old: ${f.old}`);
    console.log(`  New: ${f.new}`);
  });
}
