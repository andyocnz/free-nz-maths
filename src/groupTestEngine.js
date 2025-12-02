// src/groupTestEngine.js
// Generates deterministic group tests so every student sharing a code sees identical questions.

import { generateQuestionForSkill, getSkillsForYear } from './templateEngine.js'

/**
 * Creates a deterministic, seeded pseudo-random number generator.
 * Uses the mulberry32 algorithm.
 * @param {number} seed - The seed for the PRNG.
 * @returns {() => number} Function returning the next pseudo random number between 0-1.
 */
function createSeededRng(seed) {
  let s = seed >>> 0
  return function next() {
    s |= 0
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  const str = String(value || '')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

/**
 * Generates a deterministic list of questions for a group test.
 * The same config + seed will always produce the same ordered list of questions.
 *
 * @param {object} config - Configuration for the group test.
 * @param {number} config.year - Year level for the test.
 * @param {number} config.totalQuestions - Total number of questions to produce.
 * @param {number|string} config.seed - Seed derived from the group code.
 * @param {string} config.mode - Mode for the test (e.g., 'full' or 'focused:SKILL_ID').
 * @param {object} curriculumData - Full curriculum data.
 * @returns {Array<object>} Question objects ready for the main test runner.
 */
export function generateGroupTest(config, curriculumData) {
  const { year, totalQuestions = 30, seed, mode = 'full' } = config || {}
  const normalizedSeed = hashSeed(seed)
  const rng = createSeededRng(normalizedSeed)
  const questions = []

  if (!year || !curriculumData) return questions

  const skillsForYear = getSkillsForYear(curriculumData, year)
  if (!skillsForYear || !skillsForYear.length) return questions

  // Check if mode is focused on a specific skill
  let targetSkills = skillsForYear
  if (mode && mode.startsWith('focused:')) {
    const focusedSkillId = mode.split(':')[1]
    if (focusedSkillId) {
      const focusedSkill = skillsForYear.find(s => s.id === focusedSkillId)
      if (focusedSkill) {
        targetSkills = [focusedSkill]
      } else {
        // If the focused skill is not found, fall back to all skills to avoid breaking
        console.warn(`Focused skill "${focusedSkillId}" not found for year ${year}. Using all skills.`)
      }
    }
  }

  // Keep skill order deterministic to avoid drifting selections across clients.
  const orderedSkills = [...targetSkills].sort((a, b) => a.id.localeCompare(b.id))

  // Override Math.random while generating questions so templateEngine becomes deterministic.
  const originalRandom = Math.random
  Math.random = rng

  try {
    while (questions.length < totalQuestions) {
      const index = Math.floor(rng() * orderedSkills.length)
      const skill = orderedSkills[index]
      if (!skill) continue
      const generated = generateQuestionForSkill(curriculumData, skill.id)
      if (!generated) continue
      questions.push({
        ...generated,
        userAnswer: '',
        userFeedback: '',
        isCorrect: false,
        answered: false
      })
    }
  } finally {
    Math.random = originalRandom
  }

  return questions.slice(0, totalQuestions)
}
