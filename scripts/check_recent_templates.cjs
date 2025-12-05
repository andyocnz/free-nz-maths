#!/usr/bin/env node

/**
 * Script to find recently added templates and check if they have phase tags
 * Usage: node check_recent_templates.js [commits-back]
 * Example: node check_recent_templates.js 5  (check last 5 commits)
 */

const { execSync } = require('child_process');
const fs = require('fs');

const commitsBack = process.argv[2] || 10;

console.log(`\n📋 Checking templates added in last ${commitsBack} commits...\n`);

// Get recent commits
const commits = execSync(`git log --oneline HEAD~${commitsBack}..HEAD -- src/curriculumDataNew.json`)
  .toString()
  .trim()
  .split('\n')
  .filter(line => line.length > 0);

console.log(`Found ${commits.length} recent commits\n`);

// For each commit, show what templates were added
let allAddedTemplates = new Set();

commits.forEach(line => {
  const [hash, ...message] = line.split(' ');
  console.log(`\n📝 Commit: ${hash}`);
  console.log(`   Message: ${message.join(' ')}`);

  try {
    // Get added template IDs from this commit
    const diff = execSync(`git show ${hash}:src/curriculumDataNew.json`)
      .toString();
    const data = JSON.parse(diff);

    // Extract all template IDs
    data.years.forEach(year => {
      year.skills.forEach(skill => {
        if (skill.templates) {
          skill.templates.forEach(template => {
            allAddedTemplates.add({
              id: template.id,
              phase: template.phase,
              hash: hash
            });
          });
        }
      });
    });
  } catch (e) {
    // Ignore if can't parse
  }
});

// Load current curriculum
const current = JSON.parse(fs.readFileSync('src/curriculumDataNew.json', 'utf8'));
const currentTemplates = new Map();

current.years.forEach(year => {
  year.skills.forEach(skill => {
    if (skill.templates) {
      skill.templates.forEach(template => {
        currentTemplates.set(template.id, template.phase);
      });
    }
  });
});

// Check for templates without phase
console.log('\n\n🔍 ANALYSIS:\n');

let missing = [];
let withPhase = [];

allAddedTemplates.forEach(template => {
  const currentPhase = currentTemplates.get(template.id);
  if (!currentPhase) {
    missing.push(template.id);
  } else {
    withPhase.push({ id: template.id, phase: currentPhase });
  }
});

console.log(`✅ Templates WITH phase tags: ${withPhase.length}`);
withPhase.slice(0, 10).forEach(t => console.log(`   ${t.id}: phase ${t.phase}`));
if (withPhase.length > 10) console.log(`   ... and ${withPhase.length - 10} more`);

if (missing.length > 0) {
  console.log(`\n❌ Templates MISSING phase tags: ${missing.length}`);
  missing.forEach(id => console.log(`   ${id}`));
} else {
  console.log(`\n🎉 All templates have phase tags!`);
}

// Group by phase
console.log(`\n\n📊 Templates by Phase:\n`);
const byPhase = {};
withPhase.forEach(t => {
  if (!byPhase[t.phase]) byPhase[t.phase] = [];
  byPhase[t.phase].push(t.id);
});

Object.keys(byPhase).sort().forEach(phase => {
  console.log(`Phase ${phase}: ${byPhase[phase].length} templates`);
  byPhase[phase].slice(0, 5).forEach(id => console.log(`  - ${id}`));
  if (byPhase[phase].length > 5) console.log(`  ... and ${byPhase[phase].length - 5} more`);
});

console.log('\n');
