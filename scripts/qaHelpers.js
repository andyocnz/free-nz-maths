/**
 * QA Helper Functions for Question Template Generation
 * Provides utility functions for generating and formatting test data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load curriculum data from JSON file
 * @param {string} filePath - Path to curriculum JSON file
 * @returns {object} Parsed curriculum data
 */
function loadCurriculumData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading curriculum data: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Get all templates from curriculum data
 * @param {object} curriculumData - Curriculum data object
 * @param {boolean} includeVisuals - Include only templates with visualData
 * @returns {array} Array of template objects with metadata
 */
function getAllTemplates(curriculumData, includeVisuals = false) {
  const templates = [];

  if (!curriculumData.years || !Array.isArray(curriculumData.years)) {
    console.error('Invalid curriculum data format');
    return templates;
  }

  curriculumData.years.forEach((yearData) => {
    const year = yearData.year;

    if (!yearData.skills || !Array.isArray(yearData.skills)) {
      return;
    }

    yearData.skills.forEach((skill) => {
      const skillId = skill.id;
      const strand = skill.strand;
      const skillName = skill.name;

      if (!skill.templates || !Array.isArray(skill.templates)) {
        return;
      }

      skill.templates.forEach((template) => {
        // Filter based on visual requirement
        const hasVisual = template.visualData && Object.keys(template.visualData).length > 0;

        if (includeVisuals && !hasVisual) {
          return; // Skip templates without visuals
        }

        if (!includeVisuals && hasVisual) {
          return; // Skip templates with visuals
        }

        templates.push({
          templateId: template.id,
          skillId: skillId,
          skillName: skillName,
          strand: strand,
          year: year,
          template: template
        });
      });
    });
  });

  return templates;
}

/**
 * USES THE WEBSITE'S ACTUAL TEMPLATE ENGINE
 * This ensures QA tests generate EXACTLY the same questions as the website
 */
import { generateQuestionFromTemplate } from '../src/templateEngine.js';

/**
 * Generate a question using the website's actual template engine
 * This ensures QA tests generate EXACTLY the same output as the website
 * @param {object} templateData - Template with metadata from curriculum
 * @returns {object} Formatted question object matching website output
 */
function generateQuestion(templateData) {
  const template = templateData.template;

  // Use the website's actual generateQuestionFromTemplate function
  // skill param should be the skill name (string), not an object
  const websiteResult = generateQuestionFromTemplate(
    template,
    templateData.skillName,  // Pass skill name as string
    templateData.year
  );

  // Format for QA output
  return {
    topic: templateData.skillName,
    templateId: templateData.templateId,
    year: templateData.year,
    strand: templateData.strand,
    skillId: templateData.skillId,
    question: websiteResult.question,
    answer: websiteResult.answer,
    formattedAnswer: websiteResult.formattedAnswer || websiteResult.answer,
    params: websiteResult.params,
    visual: websiteResult.visualData || undefined
  };
}

/**
 * Save questions to JSON file
 * @param {array} questions - Array of question objects
 * @param {string} outputPath - Output file path
 * @returns {boolean} Success status
 */
function saveQuestionsToFile(questions, outputPath) {
  try {
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputPath,
      JSON.stringify(questions, null, 2),
      'utf-8'
    );

    console.log(`✓ Saved ${questions.length} questions to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error saving questions: ${error.message}`);
    return false;
  }
}

/**
 * Get templates by year
 * @param {array} templates - Array of templates
 * @param {number} year - Year to filter by
 * @returns {array} Filtered templates
 */
function getTemplatesByYear(templates, year) {
  return templates.filter((t) => t.year === year);
}

/**
 * Get templates by strand
 * @param {array} templates - Array of templates
 * @param {string} strand - Strand name to filter by
 * @returns {array} Filtered templates
 */
function getTemplatesByStrand(templates, strand) {
  return templates.filter((t) => t.strand === strand);
}

/**
 * Get templates by skill
 * @param {array} templates - Array of templates
 * @param {string} skillId - Skill ID to filter by
 * @returns {array} Filtered templates
 */
function getTemplatesBySkill(templates, skillId) {
  return templates.filter((t) => t.skillId === skillId);
}

export {
  loadCurriculumData,
  getAllTemplates,
  generateQuestion,
  saveQuestionsToFile,
  getTemplatesByYear,
  getTemplatesByStrand,
  getTemplatesBySkill
};
