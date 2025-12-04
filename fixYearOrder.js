import fs from 'fs';

const curriculum = JSON.parse(fs.readFileSync('./src/curriculumDataNew.json'));

// Sort years in ascending order
curriculum.years.sort((a, b) => a.year - b.year);

// Remove duplicates (keep first occurrence)
const seenYears = new Set();
curriculum.years = curriculum.years.filter(year => {
  if (seenYears.has(year.year)) {
    console.log(`⚠️  Removed duplicate Year ${year.year}`);
    return false;
  }
  seenYears.add(year.year);
  return true;
});

fs.writeFileSync('./src/curriculumDataNew.json', JSON.stringify(curriculum, null, 2) + '\n');

console.log('✅ Year order fixed and sorted:\n');
curriculum.years.forEach(y => {
  console.log(`  Year ${y.year}: ${y.skills.length} skills`);
});
