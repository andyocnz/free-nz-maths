import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Official NZ curriculum skill names and descriptions
const skillNames = {
  'Y10.D.8': {
    name: 'Percent of a number: GST, discount and more',
    strand: 'Numbers & Algebra'
  },
  'Y10.D.7': {
    name: 'Compound interest',
    strand: 'Numbers & Algebra'
  },
  'Y10.E.3': {
    name: 'Greatest possible error',
    strand: 'Measurement'
  },
  'Y10.F.15': {
    name: 'Volume and surface area of similar solids',
    strand: 'Geometry & Measurement'
  },
  'Y10.G.3': {
    name: 'Distance between two points',
    strand: 'Coordinate Plane'
  },
  'Y10.O.3': {
    name: 'Find the gradient from two points',
    strand: 'Linear functions'
  },
  'Y10.O.2': {
    name: 'Find the gradient of a graph',
    strand: 'Linear functions'
  },
  'Y10.F.10': {
    name: 'Similar triangles and indirect measurement',
    strand: 'Geometry & Measurement'
  },
  'Y10.F.8': {
    name: 'Congruent figures: side lengths and angle measures',
    strand: 'Geometry & Measurement'
  },
  'Y10.L.5': {
    name: 'Interpret box-and-whisker plots',
    strand: 'Data and graphs'
  },
  'Y10.L.6': {
    name: 'Interpret a scatter plot',
    strand: 'Data and graphs'
  },

  'Y11.Q.6': {
    name: 'Complete the square',
    strand: 'Quadratic equations'
  },
  'Y11.JJ.3': {
    name: 'Surface area of pyramids and cones',
    strand: 'Surface area and volume'
  },
  'Y11.JJ.6': {
    name: 'Surface area and volume of spheres',
    strand: 'Surface area and volume'
  },
  'Y11.GG.9': {
    name: 'Symmetry and periodicity of trigonometric functions',
    strand: 'Trigonometry'
  },
  'Y11.O': {
    name: 'Polynomials & Matrices',
    strand: 'Polynomials & Matrices'
  },
  'Y11.GG.1': {
    name: 'Trigonometric ratios: sin, cos and tan',
    strand: 'Trigonometry'
  },
  'Y11.Y': {
    name: 'Trigonometric identities',
    strand: 'Trigonometric identities'
  },
  'Y11.D': {
    name: 'Coordinate plane & Distance formula',
    strand: 'Coordinate plane'
  },
  'Y11.NN.1': {
    name: 'Mean, median, mode and range',
    strand: 'Statistics'
  },
  'Y11.EE.2': {
    name: 'Power rule for derivatives',
    strand: 'Introduction to derivatives'
  },
  'Y11.Q.7': {
    name: 'Solve a quadratic equation by completing the square',
    strand: 'Quadratic equations'
  },

  'Y12.G.2': {
    name: 'Add and subtract complex numbers',
    strand: 'Complex numbers'
  },
  'Y12.M.5': {
    name: 'Multiply and divide rational expressions',
    strand: 'Rational functions and expressions'
  },
  'Y12.AA.4': {
    name: 'Find terms of a recursive sequence',
    strand: 'Sequences and series'
  },
  'Y12.P.8': {
    name: 'Product property of logarithms',
    strand: 'Logarithms'
  },
  'Y12.EE.1': {
    name: 'Sum and difference rules',
    strand: 'Introduction to derivatives'
  },

  'Y13.G.3': {
    name: 'Complex conjugates',
    strand: 'Complex numbers'
  }
};

let updateCount = 0;
const updates = [];

curriculum.years.forEach(year => {
  year.skills.forEach(skill => {
    if (skillNames[skill.id]) {
      const nameUpdate = skillNames[skill.id];
      const oldName = skill.name;

      skill.name = nameUpdate.name;
      skill.strand = nameUpdate.strand;

      updateCount++;
      updates.push(`${skill.id}: "${oldName}" → "${skill.name}"`);
    }
  });
});

fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log(`\n✅ Updated ${updateCount} skill names and strands to match official NZ curriculum`);
console.log('\n📋 Updated names:');
updates.forEach(update => console.log(`  ${update}`));
