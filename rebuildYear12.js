import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Get Year 12
const y12 = curriculum.years.find(y => y.year === 12);
if (!y12) {
  console.log('Creating Year 12...');
  curriculum.years.push({ year: 12, skills: [] });
}

const y12Data = curriculum.years.find(y => y.year === 12);

// Define all Year 12 skills with their templates
const y12Skills = {
  'Y12.G.2': {
    name: 'Add and subtract complex numbers',
    strand: 'Complex numbers',
    description: 'Complex number operations',
    templates: [
      {
        id: 'Y12.C.COMPLEX_ADD.T1',
        stem: 'Simplify ({a} + {b}i) + ({c} + {d}i).',
        params: {
          a: ['int', -12, 12],
          b: ['int', -15, 15],
          c: ['int', -12, 12],
          d: ['int', -15, 15]
        },
        answer: '{a+c} + {b+d}i',
        difficulty: 7,
        phase: 10.14
      }
    ]
  },
  'Y12.G.3': {
    name: 'Dot product',
    strand: 'Vectors & Matrices',
    description: 'Vector dot product',
    templates: [
      {
        id: 'Y12.V.VECTOR_DOT.T1',
        stem: 'Find the dot product of <{a},{b}> and <{c},{d}>.',
        params: {
          a: ['int', -10, 10],
          b: ['int', -10, 10],
          c: ['int', -10, 10],
          d: ['int', -10, 10]
        },
        answer: '{a*c + b*d}',
        difficulty: 7,
        phase: 10.14
      }
    ]
  },
  'Y12.G.4': {
    name: 'Angle between vectors',
    strand: 'Vectors & Matrices',
    description: 'Find angle between vectors',
    templates: [
      {
        id: 'Y12.V.VECTOR_ANGLE.T1',
        stem: 'Find the angle between <{a},{b}> and <{c},{d}> to the nearest degree.',
        params: {
          a: ['int', 2, 12],
          b: ['int', 2, 12],
          c: ['int', 2, 12],
          d: ['int', 2, 12]
        },
        answer: '{Math.round(Math.acos((a*c + b*d)/(Math.sqrt(a*a + b*b)*Math.sqrt(c*c + d*d))) * 180 / Math.PI)}°',
        difficulty: 9,
        phase: 10.14
      }
    ]
  },
  'Y12.G.5': {
    name: 'Matrix operations',
    strand: 'Vectors & Matrices',
    description: 'Matrix operations',
    templates: [
      {
        id: 'Y12.A.MATRIX_OPS.T2',
        stem: 'Find the determinant of the matrix [[{a},{b}],[{c},{d}]]',
        params: {
          a: ['int', -10, 10],
          b: ['int', -10, 10],
          c: ['int', -10, 10],
          d: ['int', -10, 10]
        },
        answer: '{a*d - b*c}',
        difficulty: 8,
        phase: 10.14
      }
    ]
  },
  'Y12.G.6': {
    name: 'Vector operations',
    strand: 'Vectors & Matrices',
    description: 'Vector operations',
    templates: [
      {
        id: 'Y12.G.VECTOR_OPS.T3',
        stem: 'Calculate the dot product <{a},{b}> · <{c},{d}>',
        params: {
          a: ['int', -10, 10, 1],
          b: ['int', -10, 10, 1],
          c: ['int', -10, 10, 1],
          d: ['int', -10, 10, 1]
        },
        answer: '{a*c + b*d}',
        difficulty: 8,
        phase: 10.14
      }
    ]
  },
  'Y12.AA.4': {
    name: 'Find terms of a recursive sequence',
    strand: 'Sequences and series',
    description: 'Recursive sequences',
    templates: [
      {
        id: 'Y12.ALG.RECURSION.T1',
        stem: 'A sequence is defined by T(1) = {t1}, T(n) = {a}·T(n-1) + {b} for n ≥ 2. Find T({n}).',
        params: {
          t1: ['int', 1, 20],
          a: ['int', 1, 5],
          b: ['int', 0, 15],
          n: ['int', 3, 8]
        },
        answer: '{a == 1 ? t1 + b*(n-1) : t1 * a**(n-1) + b*(a**(n-1) - 1)/(a - 1)}',
        difficulty: 9,
        phase: 10.14
      }
    ]
  },
  'Y12.P.8': {
    name: 'Product property of logarithms',
    strand: 'Logarithms',
    description: 'Logarithm properties',
    templates: [
      {
        id: 'Y12.A.EXPONENTIALS_LOGS.T2',
        stem: 'Simplify {log}({a}) + {log}({b}) where the logarithm has the same base',
        params: {
          base: ['log₂', 'log₃', 'log₅', 'log₁₀', 'ln'],
          a: ['int', 2, 30],
          b: ['int', 2, 30]
        },
        log: '{base}',
        answer: '{base}({a*b})',
        difficulty: 7,
        phase: 10.14
      }
    ]
  },
  'Y12.EE.1': {
    name: 'Sum and difference rules',
    strand: 'Introduction to derivatives',
    description: 'Derivative rules',
    templates: [
      {
        id: 'Y12.C.CALCULUS_APPLICATIONS.T2',
        stem: 'A particle moves according to s(t) = {a}t² + {b}t + {c}. Find its velocity at t = {t}.',
        params: {
          a: ['int', -5, 5, 1],
          b: ['int', -20, 20],
          c: ['int', -50, 50],
          t: ['int', 0, 10]
        },
        answer: '{2*a*t + b}',
        difficulty: 9,
        phase: 10.14
      }
    ]
  }
};

// Clear existing Y12 skills
y12Data.skills = [];

// Add all skills
Object.entries(y12Skills).forEach(([skillId, skillData]) => {
  y12Data.skills.push({
    id: skillId,
    name: skillData.name,
    strand: skillData.strand,
    description: skillData.description,
    templates: skillData.templates
  });
});

fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log('✅ Year 12 completely rebuilt with correct skill organization');
console.log('\nYear 12 Skills:');
y12Data.skills.forEach(s => {
  console.log(`  ${s.id}: ${s.name} (${s.templates.length} templates)`);
});
