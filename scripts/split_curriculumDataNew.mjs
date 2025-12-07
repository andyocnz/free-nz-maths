#!/usr/bin/env node
/**
 * Split curriculumDataNew.json into year-specific files (Y10, Y11, Y12, Y13)
 * to make it easier to work on each year separately
 */

import fs from 'fs';
import path from 'path';

const srcDir = './src';
const inputFile = path.join(srcDir, 'curriculumDataNew.json');

// Read the merged file with BOM handling
const rawData = fs.readFileSync(inputFile, 'utf-8');
const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));

console.log('📖 Splitting curriculumDataNew.json by year...\n');

// Filter years 10-13 from curriculumDataNew.json
const yearsToProcess = [10, 11, 12, 13];

yearsToProcess.forEach(year => {
  const yearData = data.years.find(y => y.year === year);

  if (!yearData) {
    console.warn(`⚠️  Year ${year} not found in curriculumDataNew.json`);
    return;
  }

  // Create year-specific file structure
  const yearFile = {
    years: [yearData]
  };

  const outputFile = path.join(srcDir, `curriculumDataNew_Y${year}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(yearFile, null, 2));

  const skills = yearData.skills.length;
  const templates = yearData.skills.reduce((sum, s) => sum + (s.templates?.length || 0), 0);

  console.log(`✓ Y${year}: ${skills} skills, ${templates} templates → ${outputFile}`);
});

console.log('\n✅ Split complete!');
console.log('\nNext steps:');
console.log('1. Update curriculumDataMerged.js to import from split files');
console.log('2. Run: npm run build');
console.log('3. Delete old curriculumDataNew.json');
