#!/usr/bin/env node

/**
 * Generate Question Templates WITH Visual Requirements
 *
 * This script extracts all question templates that require visual rendering
 * and generates sample questions with visual data in JSON format for testing purposes.
 *
 * Usage:
 *   node generateQuestionsWithVisuals.js [options]
 *
 * Options:
 *   --year <number>       Filter by year (6-13)
 *   --strand <name>       Filter by strand name
 *   --skill <skillId>     Filter by skill ID
 *   --type <vizType>      Filter by visualization type
 *   --output <path>       Output file path (default: qa-output/questions-with-visuals.json)
 *   --count <number>      Number of questions per template (default: 1)
 *   --help                Show help
 *
 * Supported Visualization Types:
 *   - stem_and_leaf
 *   - net
 *   - histogram
 *   - parallel_transversal
 *   - scatter_plot
 *   - coordinate_grid
 *   - box_plot
 *   - car_on_road
 *   - circle_theorem_angle_center
 *   - graph_inequality
 *   - graph_parabola
 *   - matrix_2x2
 *   - rectangular_prism
 *   - triangular_prism
 *   - venn_diagram_two
 *   - triangle
 *   - circle
 *
 * Output Format:
 * {
 *   "generatedAt": "ISO timestamp",
 *   "totalQuestions": number,
 *   "visualizationTypes": ["stem_and_leaf", ...],
 *   "filterApplied": object,
 *   "questions": [
 *     {
 *       "topic": "Skill name",
 *       "templateId": "Y6.N.ADDITION.T1",
 *       "year": 6,
 *       "strand": "Number",
 *       "skillId": "Y6.N.ADDITION",
 *       "question": "What is 5 + 3?",
 *       "answer": "8",
 *       "formattedAnswer": "8",
 *       "params": { "a": 5, "b": 3 },
 *       "visual": {
 *         "type": "stem_and_leaf",
 *         "stems": [6, 7, 8],
 *         "leaves": { "6": [5, 8], ... },
 *         "key": "8 | 0 = 80"
 *       }
 *     }
 *   ]
 * }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as helpers from './qaHelpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    year: null,
    strand: null,
    skill: null,
    type: null,
    output: 'qa-output/questions-with-visuals.json',
    count: 1,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--year':
        options.year = parseInt(args[++i], 10);
        break;
      case '--strand':
        options.strand = args[++i];
        break;
      case '--skill':
        options.skill = args[++i];
        break;
      case '--type':
        options.type = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--count':
        options.count = parseInt(args[++i], 10);
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Generate Question Templates WITH Visual Requirements

Usage:
  node generateQuestionsWithVisuals.js [options]

Options:
  --year <number>       Filter by year (6-13)
  --strand <name>       Filter by strand name
  --skill <skillId>     Filter by skill ID
  --type <vizType>      Filter by visualization type
  --output <path>       Output file path (default: qa-output/questions-with-visuals.json)
  --count <number>      Number of questions per template (default: 1)
  --help                Show this help message

Visualization Types:
  stem_and_leaf, net, histogram, parallel_transversal, scatter_plot,
  coordinate_grid, box_plot, car_on_road, circle_theorem_angle_center,
  graph_inequality, graph_parabola, matrix_2x2, rectangular_prism,
  triangular_prism, venn_diagram_two, triangle, circle

Examples:
  # Generate all visual questions
  node generateQuestionsWithVisuals.js

  # Generate 3 questions per template for Year 11
  node generateQuestionsWithVisuals.js --year 11 --count 3

  # Generate only histogram visualizations
  node generateQuestionsWithVisuals.js --type histogram

  # Generate visual questions for Geometry strand
  node generateQuestionsWithVisuals.js --strand "Geometry & Measurement"
  `);
}


function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('📊 Generating questions WITH visual requirements...\n');

  // Load curriculum data
  const curriculumPath = path.join(
    __dirname,
    '..',
    'src',
    'curriculumDataNew.json'
  );

  console.log(`📂 Loading curriculum from: ${curriculumPath}`);
  const curriculumData = helpers.loadCurriculumData(curriculumPath);

  // Get templates with visuals
  console.log('🔍 Extracting templates with visual requirements...');
  let templates = helpers.getAllTemplates(curriculumData, true); // true = with visuals

  console.log(`✓ Found ${templates.length} templates with visuals\n`);

  // Apply filters
  if (options.year) {
    templates = helpers.getTemplatesByYear(templates, options.year);
    console.log(`✓ Filtered by year ${options.year}: ${templates.length} templates`);
  }

  if (options.strand) {
    templates = helpers.getTemplatesByStrand(templates, options.strand);
    console.log(`✓ Filtered by strand "${options.strand}": ${templates.length} templates`);
  }

  if (options.skill) {
    templates = helpers.getTemplatesBySkill(templates, options.skill);
    console.log(`✓ Filtered by skill "${options.skill}": ${templates.length} templates`);
  }

  if (options.type) {
    templates = templates.filter((t) => t.template.visualData?.type === options.type);
    console.log(`✓ Filtered by visualization type "${options.type}": ${templates.length} templates\n`);
  }

  if (templates.length === 0) {
    console.warn('⚠️  No templates found matching criteria');
    process.exit(0);
  }

  // Generate questions
  console.log(`🎯 Generating ${options.count} question(s) per template...\n`);

  const questions = [];
  const visualizationTypes = new Set();
  let count = 0;

  templates.forEach((templateData) => {
    for (let i = 0; i < options.count; i++) {
      // Use website's actual question generation engine
      // This ensures identical output to what users see
      const question = helpers.generateQuestion(templateData);
      questions.push(question);

      if (question.visual && question.visual.type) {
        visualizationTypes.add(question.visual.type);
      }

      count++;
    }
  });

  // Create output object
  const output = {
    generatedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    templatesUsed: templates.length,
    questionsPerTemplate: options.count,
    visualizationTypes: Array.from(visualizationTypes).sort(),
    filterApplied: {
      year: options.year,
      strand: options.strand,
      skillId: options.skill,
      visualizationType: options.type
    },
    questions: questions
  };

  // Save to file
  const success = helpers.saveQuestionsToFile(output, options.output);

  if (success) {
    console.log(`\n✅ Complete!`);
    console.log(`   Total questions generated: ${output.totalQuestions}`);
    console.log(`   Templates used: ${output.templatesUsed}`);
    console.log(`   Visualization types: ${output.visualizationTypes.join(', ')}`);
    console.log(`   Output file: ${path.resolve(options.output)}`);
  } else {
    process.exit(1);
  }
}

main();
