#!/usr/bin/env node

/**
 * Find all templates with truly hardcoded answers across the entire curriculum
 *
 * A "truly hardcoded" answer means:
 * - The answer is a literal string (not an expression, not a JS function call)
 * - No parameter references in the answer (no {param} placeholders)
 * - Despite having parameters that vary, the answer is always the same
 */

import fs from 'fs';
import path from 'path';

const CURRICULUM_FILES = [
  'src/curriculumDataNew_Y6.json',
  'src/curriculumDataNew_Y7.json',
  'src/curriculumDataNew_Y8.json',
  'src/curriculumDataNew_Y9.json',
  'src/curriculumDataNew_Y10.json',
  'src/curriculumDataNew_Y11.json',
  'src/curriculumDataNew_Y12.json',
  'src/curriculumDataNew_Y13.json',
  'src/olympiadCurriculum.json',
  'src/algoCurriculum.json'
];

function isLiteralString(str) {
  // Check if string is a plain literal (not a JS expression)
  if (!str || typeof str !== 'string') return false;

  // Exclude expressions that start with common patterns
  if (str.startsWith('{')) return false;  // Param reference or JS object
  if (str.startsWith('round(')) return false;  // Function call
  if (str.startsWith('Math.')) return false;  // Math function
  if (str.includes('===') || str.includes('==')) return false;  // Comparison
  if (str.includes('=>')) return false;  // Arrow function

  // Check for parameter references
  if (str.includes('{')) return false;

  return true;
}

function analyzeTemplate(template, skill, year) {
  const result = {
    id: template.id,
    year: year,
    skill: skill,
    stem: (template.stem || '').substring(0, 70),
    answer: template.answer,
    paramCount: Object.keys(template.params || {}).length,
    issue: null
  };

  const answer = template.answer;
  const params = template.params || {};

  // Check for truly hardcoded answer
  if (isLiteralString(answer) && Object.keys(params).length > 0) {
    result.issue = 'TRULY_HARDCODED';
    return result;
  }

  return null;
}

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const hardcoded = [];

    if (data.years && Array.isArray(data.years)) {
      for (const year of data.years) {
        for (const skill of year.skills || []) {
          for (const template of skill.templates || []) {
            const result = analyzeTemplate(template, skill.id, year.year);
            if (result && result.issue) {
              hardcoded.push(result);
            }
          }
        }
      }
    }

    return hardcoded;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
}

// Main execution
console.log('Searching for truly hardcoded answers across all curriculum files...\n');

const allHardcoded = [];

for (const file of CURRICULUM_FILES) {
  const results = processFile(file);
  allHardcoded.push(...results);
}

// Sort by year and ID
allHardcoded.sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  return a.id.localeCompare(b.id);
});

console.log(`Found ${allHardcoded.length} templates with truly hardcoded answers:\n`);
console.log('=' .repeat(100));

if (allHardcoded.length === 0) {
  console.log('✓ No truly hardcoded answers found!');
} else {
  for (const item of allHardcoded) {
    console.log(`\nID: ${item.id}`);
    console.log(`Year: ${item.year} | Skill: ${item.skill}`);
    console.log(`Stem: ${item.stem}...`);
    console.log(`Answer: ${item.answer}`);
    console.log(`Has ${item.paramCount} parameters but answer is always the same!`);
    console.log('-'.repeat(100));
  }
}

console.log('\n' + '='.repeat(100));
console.log(`\nSummary: ${allHardcoded.length} critical issues found`);
console.log('These templates will always show the same answer regardless of parameter variation.');
