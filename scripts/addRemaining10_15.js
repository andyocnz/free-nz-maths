import fs from 'fs';

const review1 = JSON.parse(fs.readFileSync('./ready for review.json'));
const review2 = JSON.parse(fs.readFileSync('./ready to review 2.json'));
const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Combine all templates
const allReviewTemplates = [...review1, ...review2];

// Get existing template IDs
const existingIds = new Set();
curriculum.years.forEach(year => {
  year.skills.forEach(skill => {
    skill.templates.forEach(t => {
      existingIds.add(t.id);
    });
  });
});

// Find templates to add
const toAdd = allReviewTemplates.filter(t => !existingIds.has(t.id));

console.log(`Found ${toAdd.length} templates to add as phase 10.15\n`);

// Parse template ID and organize by skill
const skillMap = {};

toAdd.forEach(template => {
  const idParts = template.id.split('.');
  const yearStr = idParts[0];
  const year = parseInt(yearStr.substring(1));
  const skillId = idParts.slice(1, -1).join('.');

  // Find or create year
  let yearEntry = curriculum.years.find(y => y.year === year);
  if (!yearEntry) {
    yearEntry = { year: year, skills: [] };
    curriculum.years.push(yearEntry);
  }

  // Find or create skill
  let skill = yearEntry.skills.find(s => s.id === skillId);
  if (!skill) {
    // Create new skill with proper name and strand
    const skillName = generateSkillName(skillId);
    const strand = getStrandName(idParts[1]);

    skill = {
      id: skillId,
      strand: strand,
      name: skillName,
      description: `${skillName} questions for Year ${year}`,
      templates: []
    };
    yearEntry.skills.push(skill);
  }

  // Add template with phase 10.15
  const { topic_note, ...templateData } = template;
  templateData.phase = 10.15;
  skill.templates.push(templateData);

  if (!skillMap[skillId]) {
    skillMap[skillId] = [];
  }
  skillMap[skillId].push(template.id);
});

// Sort years
curriculum.years.sort((a, b) => a.year - b.year);

// Save
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log('✅ Added all remaining templates with phase 10.15\n');
console.log('📋 Skills updated:');
Object.entries(skillMap).sort().forEach(([skillId, templates]) => {
  console.log(`\n  ${skillId}:`);
  templates.forEach(t => console.log(`    + ${t}`));
});

console.log(`\n\n📊 SUMMARY:`);
console.log(`  Total templates added: ${toAdd.length}`);
console.log(`  New/Updated skills: ${Object.keys(skillMap).length}`);

function generateSkillName(skillId) {
  const parts = skillId.split('.');
  const name = parts.slice(1).join(' ').toLowerCase();
  return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getStrandName(strandCode) {
  const strandMap = {
    'N': 'Numbers & Algebra',
    'A': 'Algebra & Sequences',
    'M': 'Measurement & Geometry',
    'C': 'Calculus & Coordinates',
    'L': 'Algebra & Functions',
    'G': 'Geometry & Trigonometry',
    'S': 'Statistics & Probability',
    'T': 'Trigonometry',
    'V': 'Vectors & Matrices'
  };
  return strandMap[strandCode] || 'General';
}
