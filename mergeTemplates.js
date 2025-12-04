import fs from 'fs';
import path from 'path';

// Read the files
const review1 = JSON.parse(fs.readFileSync('./ready for review.json', 'utf8'));
const review2 = JSON.parse(fs.readFileSync('./ready to review 2.json', 'utf8'));
const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json', 'utf8'));

// Combine all templates from both review files
const allNewTemplates = [...review1, ...review2];

console.log(`\nProcessing ${allNewTemplates.length} templates from review files...`);

let addedCount = 0;
let createdSkillCount = 0;
const skillMap = {}; // Track which skills received templates
const createdSkills = {}; // Track newly created skills

// Helper function to generate skill name from ID
function generateSkillName(skillId) {
  // Convert N.FINANCIAL_RATES to Financial rates
  const parts = skillId.split('.');
  const name = parts.slice(1).join(' ').toLowerCase();
  return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Helper function to map strand code to full name
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

// For each template, extract the skill ID and year
allNewTemplates.forEach(template => {
  const idParts = template.id.split('.');
  if (idParts.length < 3) {
    console.log(`⚠️  Invalid template ID format: ${template.id}`);
    return;
  }

  const yearStr = idParts[0]; // Y10, Y11, Y12, Y13
  const year = parseInt(yearStr.substring(1));
  const strandCode = idParts[1]; // N, A, M, C, etc.
  const skillId = idParts.slice(1, -1).join('.'); // N.FINANCIAL_RATES -> N.FINANCIAL_RATES

  // Find or create the year in curriculum
  let yearEntry = curriculum.years.find(y => y.year === year);
  if (!yearEntry) {
    yearEntry = {
      year: year,
      skills: []
    };
    curriculum.years.push(yearEntry);
  }

  // Find or create the skill in that year
  let skill = yearEntry.skills.find(s => s.id === skillId);
  if (!skill) {
    skill = {
      id: skillId,
      strand: getStrandName(strandCode),
      name: generateSkillName(skillId),
      description: `${generateSkillName(skillId)} questions for Year ${year}`,
      templates: []
    };
    yearEntry.skills.push(skill);
    createdSkillCount++;
    if (!createdSkills[year]) {
      createdSkills[year] = [];
    }
    createdSkills[year].push(skillId);
  }

  // Add the template to the skill
  // Remove the topic_note field if it exists (not in the main curriculum format)
  const { topic_note, ...templateToAdd } = template;
  skill.templates.push(templateToAdd);

  addedCount++;
  if (!skillMap[skillId]) {
    skillMap[skillId] = [];
  }
  skillMap[skillId].push(template.id);
});

// Sort years before saving
curriculum.years.sort((a, b) => a.year - b.year);

// Save the updated curriculum
fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log(`\n✅ Merge complete!`);
console.log(`\n📊 Summary:`);
console.log(`  • Templates processed: ${allNewTemplates.length}`);
console.log(`  • Templates added: ${addedCount}`);
console.log(`  • New skills created: ${createdSkillCount}`);
console.log(`\n📝 Skills that received new templates:`);
Object.entries(skillMap).sort().forEach(([skillId, templateIds]) => {
  console.log(`  • ${skillId}: ${templateIds.length} template(s)`);
  templateIds.forEach(id => console.log(`    - ${id}`));
});

if (Object.keys(createdSkills).length > 0) {
  console.log(`\n🆕 Newly created skills by year:`);
  Object.entries(createdSkills).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([year, skills]) => {
    console.log(`  • Year ${year}: ${skills.length} skill(s)`);
    skills.forEach(id => console.log(`    - ${id}`));
  });
}
