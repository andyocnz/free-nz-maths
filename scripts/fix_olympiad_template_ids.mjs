#!/usr/bin/env node
/**
 * Fix malformed olympiad template IDs
 * Examples of bad IDs:
 *   Y9.OLYMP.VECTORS.T1.T1 → Y13.OLY.VECTORS.T1
 *   Y10.OLYMP.UNITS_DIGIT.T1.T1 → Y13.OLY.UNITS_DIGIT.T1
 *   Y10.UKMT.PERM_ORDER.T1.T1 → Y13.OLY.PERM_ORDER.T1
 */

import fs from 'fs';
import path from 'path';

const olympiadFile = './src/olympiadCurriculum.json';

// Read file
const rawData = fs.readFileSync(olympiadFile, 'utf-8');
const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));

console.log('Fixing malformed olympiad template IDs...\n');

let fixedCount = 0;
const fixes = [];

// Process each year
for (const yearData of data.years) {
  for (const skill of yearData.skills) {
    for (const template of skill.templates || []) {
      const oldId = template.id;
      if (!oldId) continue;

      let newId = null;

      // Pattern: Y9.OLYMP.SKILL.T1.T1 or Y10.OLYMP.SKILL.T1.T1
      const olympMatch = oldId.match(/^Y\d+\.OLYMP\.(.+)\.T\d+\.T(\d+)$/);
      if (olympMatch) {
        const skillPart = olympMatch[1];
        const templateNum = olympMatch[2];
        newId = `Y13.OLY.${skillPart}.T${templateNum}`;
      }

      // Pattern: Y10.UKMT.SKILL.T1.T1
      const ukmtMatch = oldId.match(/^Y\d+\.UKMT\.(.+)\.T\d+\.T(\d+)$/);
      if (ukmtMatch) {
        const skillPart = ukmtMatch[1];
        const templateNum = ukmtMatch[2];
        newId = `Y13.OLY.${skillPart}.T${templateNum}`;
      }

      if (newId && newId !== oldId) {
        template.id = newId;
        fixes.push({ old: oldId, new: newId });
        fixedCount++;
      }
    }
  }
}

// Write back
fs.writeFileSync(olympiadFile, JSON.stringify(data, null, 2));

console.log(`Fixed ${fixedCount} template IDs:\n`);
for (const { old, new: newId } of fixes) {
  console.log(`  ${old} → ${newId}`);
}

console.log('\nDone!');
