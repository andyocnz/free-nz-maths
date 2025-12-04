import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Template fixes for identified issues
const fixes = {
  // Y10.S.BIVARIATE_CORRELATION.T1 - Missing question content, only shows {desc}
  'Y10.S.BIVARIATE_CORRELATION.T1': {
    stem: 'The scatter plot shows {desc}. Which best describes the correlation?',
    params: {
      type: [0, 1, 2, 3, 4, 5, 6]
    },
    answer: "{['strong positive','moderate positive','weak positive','no correlation','weak negative','moderate negative','strong negative'][type]}",
  },

  // Y10.C.COORD_GRADIENT.T1 - Has NaN in answer
  'Y10.C.COORD_GRADIENT.T1': {
    stem: 'Find the gradient of the line passing through ({x1}, {y1}) and ({x2}, {y2}). Simplify fully.',
    params: {
      x1: ['int', -10, 10],
      y1: ['int', -15, 15],
      dx: ['int', 1, 10],
      dy: ['int', -12, 12],
      x2: '{x1 + dx}',
      y2: '{y1 + dy}'
    },
    answer: '{dy}/{dx}'
  },

  // Y10.M.PRECISION_ERROR.T1 - unit can be 0 which causes issues
  'Y10.M.PRECISION_ERROR.T1': {
    stem: 'A length is measured as {m} cm, correct to the nearest {unit} cm. What is the greatest possible error?',
    params: {
      m: ['decimal', 1, 150, 0.1],
      unit: [0.001, 0.01, 0.1, 1]
    },
    answer: '{unit / 2} cm'
  },

  // Y11.M.VOLUME_SPHERE.T1 - Has NaN (pi issue)
  'Y11.M.VOLUME_SPHERE.T1': {
    stem: 'Find the volume of a sphere with radius {r} cm. Use π ≈ 3.14 and round to the nearest whole number.',
    params: {
      r: ['int', 3, 25]
    },
    answer: '{round(4/3 * 3.14 * r**3)}'
  },

  // Y11.G.TRIG_RATIOS.T3 - opposite > hypotenuse (impossible triangle)
  'Y11.G.TRIG_RATIOS.T3': {
    stem: 'A right triangle has hypotenuse {hyp} cm and opposite side {opp} cm. Find sin θ exactly.',
    params: {
      hyp: ['int', 5, 25],
      opp: ['int', 3, 24],
      validate: '{opp < hyp ? 1 : 0}' // Ensure opp < hyp
    },
    answer: '{opp}/{hyp}'
  },

  // Y11.G.COORDINATE_GEOMETRY.T1 - Wrong answer calculation
  'Y11.G.COORDINATE_GEOMETRY.T1': {
    stem: 'Find the gradient of the line passing through ({x1},{y1}) and ({x2},{y2}).',
    params: {
      x1: ['int', -10, 10],
      y1: ['int', -15, 15],
      dx: ['int', 1, 10],
      dy: ['int', -12, 12],
      x2: '{x1 + dx}',
      y2: '{y1 + dy}'
    },
    answer: '{dy}/{dx}'
  },

  // Y11.G.COORDINATE_GEOMETRY.T2 - Wrong answer (shows intermediate, not simplified)
  'Y11.G.COORDINATE_GEOMETRY.T2': {
    stem: 'Find the distance between ({x1},{y1}) and ({x2},{y2}). Give exact simplified form.',
    params: {
      x1: ['int', -12, 12],
      y1: ['int', -12, 12],
      dx: ['int', -10, 10],
      dy: ['int', -10, 10],
      x2: '{x1 + dx}',
      y2: '{y1 + dy}'
    },
    answer: '√({dx}² + {dy}²)'
  },

  // Y12.V.VECTOR_ANGLE.T1 - Answer formula not computed
  'Y12.V.VECTOR_ANGLE.T1': {
    stem: 'Find the angle between <{a},{b}> and <{c},{d}> to the nearest degree.',
    params: {
      a: ['int', 2, 12],
      b: ['int', 2, 12],
      c: ['int', 2, 12],
      d: ['int', 2, 12]
    },
    answer: '{round(acos((a*c + b*d)/(sqrt(a*a + b*b)*sqrt(c*c + d*d))) * 180 / pi)}°'
  },

  // Y12.A.EXPONENTIALS_LOGS.T2 - Wrong answer format
  'Y12.A.EXPONENTIALS_LOGS.T2': {
    stem: 'Simplify {log}({a}) + {log}({b}) where the logarithm has the same base',
    params: {
      base: ['log₂', 'log₃', 'log₅', 'log₁₀', 'ln'],
      a: ['int', 2, 30],
      b: ['int', 2, 30]
    },
    log: '{base}',
    answer: '{base}({a*b})'
  }
};

let fixCount = 0;
const fixedTemplates = [];

// Find and fix templates
curriculum.years.forEach(year => {
  year.skills.forEach(skill => {
    skill.templates.forEach(template => {
      if (fixes[template.id]) {
        const fix = fixes[template.id];
        const oldAnswer = template.answer;

        // Apply fixes
        Object.assign(template, fix);

        fixCount++;
        fixedTemplates.push({
          id: template.id,
          issue: getIssueType(oldAnswer),
          fixed: true
        });
      }
    });
  });
});

function getIssueType(answer) {
  if (!answer || answer === '') return 'Missing answer';
  if (answer.includes('NaN')) return 'NaN in answer';
  if (answer.includes('{') && !answer.includes('}')) return 'Malformed formula';
  return 'Logic error';
}

// Save fixed curriculum
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log(`\n✅ Fixed ${fixCount} template issues\n`);
console.log('📋 Fixed templates:');
fixedTemplates.forEach(t => {
  console.log(`  ${t.id}: ${t.issue}`);
});
