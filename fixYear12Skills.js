import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Correct mapping for Year 12 skills based on template IDs
const year12Corrections = {
  'Y12.V.VECTOR_DOT.T1': {
    skillId: 'Y12.G.3',
    skillName: 'Dot product',
    strand: 'Vectors & Matrices'
  },
  'Y12.V.VECTOR_ANGLE.T1': {
    skillId: 'Y12.G.4',
    skillName: 'Angle between vectors',
    strand: 'Vectors & Matrices'
  },
  'Y12.A.MATRIX_OPS.T2': {
    skillId: 'Y12.G.5',
    skillName: 'Matrix operations',
    strand: 'Vectors & Matrices'
  },
  'Y12.G.VECTOR_OPS.T3': {
    skillId: 'Y12.G.6',
    skillName: 'Vector operations',
    strand: 'Vectors & Matrices'
  }
};

const y12 = curriculum.years.find(y => y.year === 12);

// Remove old Y12.M.5 skill
y12.skills = y12.skills.filter(s => s.id !== 'Y12.M.5');

// For each misplaced template, create correct skill
Object.entries(year12Corrections).forEach(([templateId, { skillId, skillName, strand }]) => {
  // Find the template
  let foundTemplate = null;
  let oldSkill = null;

  y12.skills.forEach(skill => {
    const template = skill.templates.find(t => t.id === templateId);
    if (template) {
      foundTemplate = JSON.parse(JSON.stringify(template));
      oldSkill = skill;
    }
  });

  if (foundTemplate && oldSkill) {
    // Remove from old skill
    oldSkill.templates = oldSkill.templates.filter(t => t.id !== templateId);

    // Check if skill exists
    let skill = y12.skills.find(s => s.id === skillId);
    if (!skill) {
      skill = {
        id: skillId,
        strand: strand,
        name: skillName,
        description: `${skillName} questions for Year 12`,
        templates: []
      };
      y12.skills.push(skill);
    }

    // Add template to correct skill
    skill.templates.push(foundTemplate);
    console.log(`✓ Moved ${templateId} to ${skillId}`);
  }
});

// Save
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log('\n✅ Year 12 skills corrected!');
