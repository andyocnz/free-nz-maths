#!/usr/bin/env node
/**
 * Audit all curriculum files to find templates in wrong year sections
 */

import fs from 'fs';
import path from 'path';

const files = [
  './src/curriculumDataFull.json',
  './src/curriculumDataNew.json',
  './src/curriculumDataNew_Y10.json',
  './src/curriculumDataNew_Y11.json',
  './src/curriculumDataNew_Y12.json',
  './src/curriculumDataNew_Y13.json',
  './src/year11Curriculum.json',
  './src/year12Curriculum.json',
  './src/year13Curriculum.json',
  './src/olympiadCurriculum.json'
];

console.log('Auditing all curriculum files for year mismatches...\n');

let totalIssues = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const filename = path.basename(filePath);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));

  let fileIssues = 0;

  for (const yearData of data.years || []) {
    const year = yearData.year;
    const expectedPrefix = `Y${year}`;

    for (const skill of yearData.skills || []) {
      for (const template of skill.templates || []) {
        const templateId = template.id;
        if (!templateId) continue;

        // Check if ID matches year section
        const idPrefix = templateId.split('.')[0];

        // Special case: Olympiad should be OLYMP or Y13
        if (year === 'Olympiad') {
          if (!templateId.startsWith('OLYMP') && !templateId.startsWith('Y13')) {
            console.log(`❌ ${filename} - Year ${year}:`);
            console.log(`   Template ${templateId} doesn't start with OLYMP or Y13`);
            fileIssues++;
            totalIssues++;
          }
        } else {
          // Regular years should match
          if (idPrefix !== expectedPrefix) {
            console.log(`❌ ${filename} - Year ${year}:`);
            console.log(`   Template ID: ${templateId} (says ${idPrefix}, but in ${expectedPrefix} section)`);
            console.log(`   Skill: ${skill.id}`);
            fileIssues++;
            totalIssues++;
          }
        }
      }
    }
  }

  if (fileIssues === 0) {
    console.log(`✓ ${filename} - all templates in correct year sections`);
  }
}

console.log(`\nTotal issues found: ${totalIssues}`);
if (totalIssues === 0) {
  console.log('All curriculum files are correctly organized by year!');
} else {
  console.log('⚠️  Please fix the issues above');
}
