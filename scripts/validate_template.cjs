#!/usr/bin/env node
/**
 * Template Validator
 *
 * Validates a template JSON before adding it to curriculum files.
 * Catches common issues like:
 * - Missing {} around x/y variables
 * - Backticks instead of proper syntax
 * - Variable prefixes in answers
 * - Missing parameters
 * - Invalid answer expressions
 *
 * Usage:
 *   node scripts/validate_template.cjs '{"id":"Y6.N.TEST.T1",...}'
 *   OR provide file path:
 *   node scripts/validate_template.cjs templates/my_template.json
 */

const fs = require('fs');
const path = require('path');

// Load mathHelpers to validate function calls
const mathHelpersPath = path.join(__dirname, '../src/mathHelpers.js');
let mathHelpers = {};
try {
  // Convert ES module to something we can use
  const content = fs.readFileSync(mathHelpersPath, 'utf8');
  const exportMatches = content.matchAll(/export function (\w+)/g);
  mathHelpers = {};
  for (const match of exportMatches) {
    mathHelpers[match[1]] = true;
  }
} catch (e) {
  console.warn('⚠️  Could not load mathHelpers.js, function validation disabled');
}

const issues = [];
const warnings = [];
const suggestions = [];

function validateTemplate(template) {
  issues.length = 0;
  warnings.length = 0;
  suggestions.length = 0;

  // 1. Required fields
  if (!template.id) issues.push('❌ Missing required field: id');
  if (!template.stem) issues.push('❌ Missing required field: stem');
  if (!template.params) issues.push('❌ Missing required field: params');
  if (!template.answer) issues.push('❌ Missing required field: answer');

  if (issues.length > 0) return { valid: false, issues, warnings, suggestions };

  // 2. ID format validation
  if (!/^Y\d{1,2}\.[A-Z]\.[A-Z_]+\.T\d+$/.test(template.id)) {
    issues.push('❌ Invalid ID format. Expected: Y{year}.{strand}.{TOPIC}.T{number}');
  }

  // 3. Answer expression validation
  validateAnswerExpression(template);

  // 4. Parameter validation
  validateParameters(template);

  // 5. Visual data validation
  if (template.visualData) {
    validateVisualData(template);
  }

  // 6. Difficulty validation
  if (template.difficulty) {
    if (typeof template.difficulty !== 'number' || template.difficulty < 1 || template.difficulty > 10) {
      warnings.push('⚠️  Difficulty should be a number between 1-10');
    }
  } else {
    suggestions.push('💡 Consider adding a difficulty rating (1-10)');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    suggestions
  };
}

function validateAnswerExpression(template) {
  const answer = template.answer;

  // Check for backticks (template literals)
  if (answer.includes('`')) {
    issues.push('❌ Answer contains backticks (`). Use regular strings with {} placeholders instead');
    suggestions.push(`   Fix: Replace \`${answer}\` with proper format`);
  }

  // Check for dollar signs (template literal syntax)
  if (answer.includes('${')) {
    issues.push('❌ Answer contains ${} syntax. This is JavaScript template literal syntax - use {} instead');
  }

  // Check for x or y without curly braces
  const hasXorY = /\bx\b|\by\b/.test(answer);
  const hasCurlyBraces = answer.includes('{');

  if (hasXorY && !hasCurlyBraces) {
    issues.push('❌ Answer contains "x" or "y" but no {}. Wrap the expression: {your expression}');
    suggestions.push(`   Fix: Change "${answer}" to "{${answer}}"`);
  }

  // Check for assignment operators (looks like variable assignment)
  if (/^\w+\s*=\s*/.test(answer.trim())) {
    warnings.push('⚠️  Answer starts with variable assignment (e.g., "x = ..."). Students usually don\'t need to type the variable name');
    suggestions.push('   Consider: Remove the variable prefix if students should just type the value');
    suggestions.push(`   Example: Change "${answer}" to just the value part`);
  }

  // Check for common prefixes that students shouldn't need to type
  const commonPrefixes = [
    { regex: /^f'\(x\)\s*=\s*/, name: "f'(x) = " },
    { regex: /^dy\/dx\s*=\s*/, name: "dy/dx = " },
    { regex: /^v\s*=\s*/, name: "v = " },
    { regex: /^[a-z]\s*=\s*/, name: "variable = " }
  ];

  for (const prefix of commonPrefixes) {
    if (prefix.regex.test(answer)) {
      warnings.push(`⚠️  Answer starts with "${prefix.name}" prefix`);
      suggestions.push('   Consider: Remove prefix to simplify answer entry');
      break;
    }
  }

  // Check for missing round() when dividing
  if (answer.includes('/') && !answer.includes('round(')) {
    suggestions.push('💡 Answer contains division. Consider using round(expression, 2) for cleaner display');
  }

  // Check for function calls
  const functionCalls = answer.match(/\b([a-z_]\w+)\(/gi);
  if (functionCalls && Object.keys(mathHelpers).length > 0) {
    for (const call of functionCalls) {
      const funcName = call.slice(0, -1); // Remove (
      if (funcName !== 'round' && funcName !== 'Math' && !mathHelpers[funcName]) {
        warnings.push(`⚠️  Function "${funcName}" not found in mathHelpers.js. Did you implement it?`);
      }
    }
  }

  // Check for curly braces in simple expressions
  if (hasCurlyBraces && !hasXorY && !/=/.test(answer)) {
    suggestions.push('💡 Answer has {} but no x/y variables. You can remove {} for simpler expressions');
  }
}

function validateParameters(template) {
  const params = template.params;
  const answer = template.answer;
  const stem = template.stem;

  // Extract parameter names from answer
  const answerParams = new Set();
  // Match word boundaries to avoid matching inside function names
  const matches = answer.matchAll(/\b([a-z]\w*)\b/gi);
  for (const match of matches) {
    const word = match[1];
    // Skip keywords and common functions
    if (!['round', 'Math', 'sqrt', 'abs', 'min', 'max', 'true', 'false', 'null'].includes(word)) {
      answerParams.add(word);
    }
  }

  // Extract parameters from stem {param}
  const stemParams = new Set();
  const stemMatches = stem.matchAll(/\{(\w+)\}/g);
  for (const match of stemMatches) {
    stemParams.add(match[1]);
  }

  // Check all stem params are defined
  for (const param of stemParams) {
    if (!params[param]) {
      issues.push(`❌ Parameter "{${param}}" used in stem but not defined in params`);
    }
  }

  // Check all answer params are defined (excluding known functions)
  for (const param of answerParams) {
    if (!params[param] && !mathHelpers[param]) {
      warnings.push(`⚠️  Variable "${param}" used in answer but not in params. Is this a function or missing parameter?`);
    }
  }

  // Validate parameter format
  for (const [name, spec] of Object.entries(params)) {
    if (!Array.isArray(spec)) {
      issues.push(`❌ Parameter "${name}" should be an array, got: ${JSON.stringify(spec)}`);
      continue;
    }

    const [type, ...args] = spec;

    switch (type) {
      case 'int':
        if (args.length !== 2) {
          issues.push(`❌ "int" parameter "${name}" should have [min, max], got: ${JSON.stringify(spec)}`);
        } else if (args[0] >= args[1]) {
          issues.push(`❌ Parameter "${name}": min (${args[0]}) must be less than max (${args[1]})`);
        }
        break;

      case 'decimal':
        if (args.length < 3 || args.length > 4) {
          issues.push(`❌ "decimal" parameter "${name}" should have [min, max, precision] or [min, max, precision, step], got: ${JSON.stringify(spec)}`);
        }
        break;

      case 'choice':
        if (args.length < 2) {
          issues.push(`❌ "choice" parameter "${name}" needs at least 2 options, got: ${JSON.stringify(spec)}`);
        }
        break;

      default:
        warnings.push(`⚠️  Unknown parameter type "${type}" for "${name}"`);
    }
  }

  // Check for potential division by zero
  if (answer.includes('/')) {
    for (const [name, spec] of Object.entries(params)) {
      if (spec[0] === 'int' && spec[1] <= 0 && spec[2] >= 0) {
        warnings.push(`⚠️  Parameter "${name}" range includes 0 and answer has division. Risk of division by zero!`);
        suggestions.push(`   Fix: Use conditional or adjust range to avoid 0`);
      }
    }
  }
}

function validateVisualData(template) {
  const vd = template.visualData;

  if (!vd.type) {
    issues.push('❌ visualData.type is required');
    return;
  }

  // Known visual types (add more as needed)
  const knownTypes = [
    'net', 'histogram', 'parallel_transversal', 'scatter_plot', 'stem_and_leaf',
    'coordinate_grid', 'graph_parabola', 'triangle', 'circle', 'bar_chart',
    'pie_chart', 'box_plot', 'venn_diagram', 'fraction_visual'
  ];

  if (!knownTypes.includes(vd.type)) {
    warnings.push(`⚠️  Unknown visualData.type "${vd.type}". Make sure it's implemented in QuestionVisualizer.jsx`);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate_template.cjs <template-json-string-or-file>');
    console.log('\nExamples:');
    console.log('  node validate_template.cjs \'{"id":"Y6.N.TEST.T1", "stem":"Test", "params":{}, "answer":"42"}\'');
    console.log('  node validate_template.cjs templates/my_template.json');
    process.exit(1);
  }

  let templateJson = args[0];

  // Check if it's a file path
  if (fs.existsSync(templateJson)) {
    templateJson = fs.readFileSync(templateJson, 'utf8');
  }

  let template;
  try {
    template = JSON.parse(templateJson);
  } catch (e) {
    console.error('❌ Invalid JSON:', e.message);
    process.exit(1);
  }

  console.log('🔍 Validating template...\n');
  console.log(`Template ID: ${template.id || '(missing)'}\n`);

  const result = validateTemplate(template);

  if (result.issues.length > 0) {
    console.log('❌ ISSUES (must fix):');
    result.issues.forEach(issue => console.log('  ' + issue));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS (should review):');
    result.warnings.forEach(warning => console.log('  ' + warning));
    console.log('');
  }

  if (result.suggestions.length > 0) {
    console.log('💡 SUGGESTIONS:');
    result.suggestions.forEach(suggestion => console.log('  ' + suggestion));
    console.log('');
  }

  if (result.valid) {
    console.log('✅ Template is valid!');
    if (result.warnings.length === 0 && result.suggestions.length === 0) {
      console.log('   No issues found. Ready to add to curriculum.');
    } else {
      console.log('   Consider addressing warnings and suggestions above.');
    }
    process.exit(0);
  } else {
    console.log('❌ Template has issues. Fix them before adding to curriculum.');
    process.exit(1);
  }
}

module.exports = { validateTemplate };
