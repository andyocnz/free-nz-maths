import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Find and fix Y13.A.COMPLEX_NUMBERS.T6
curriculum.years.forEach(year => {
  if (year.year === 13) {
    year.skills.forEach(skill => {
      skill.templates.forEach(template => {
        if (template.id === 'Y13.A.COMPLEX_NUMBERS.T6') {
          // Update to use cleaner formatting
          template.stem = 'Find the complex conjugate of {a} {sign} {abs_b}i';
          template.params = {
            a: ['int', -15, 15],
            b: ['int', -15, 15, 1],
            sign: '{b >= 0 ? "+" : "-"}',
            abs_b: '{abs(b)}'
          };
          template.answer = '{a} {answer_sign} {abs_b}i';
          template.answer_sign = '{b >= 0 ? "-" : "+"}';
        }
      });
    });
  }
});

// Save updated curriculum
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log('✅ Fixed Y13.A.COMPLEX_NUMBERS.T6 - Complex conjugate template');
console.log('\nBefore: "Find the complex conjugate of 1 + -1i" → "1 - -1i"');
console.log('After:  "Find the complex conjugate of 1 - 1i" → "1 + 1i"');
