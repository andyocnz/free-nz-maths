import { generateQuestionForSkill } from './templateEngine.js'
import curriculumData from './curriculumDataFull.json'

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateTest(year = 7, totalQuestions = 60) {
  const yearData = curriculumData.years.find(y => y.year === year)
  if (!yearData || !yearData.skills || yearData.skills.length === 0) return []

  const skills = yearData.skills

  const DIFFICULTY_RANGES = {
    6: [1, 4],
    7: [3, 6],
    8: [5, 8],
    9: [7, 10]
  }

  const [minDiff, maxDiff] = DIFFICULTY_RANGES[year] || [1, 10]

  const validSkills = skills.filter(skill =>
    Array.isArray(skill.templates) &&
    skill.templates.some(t => {
      const d = typeof t.difficulty === 'number' ? t.difficulty : 5
      return d >= minDiff && d <= maxDiff
    })
  )

  const pool = validSkills.length > 0 ? validSkills : skills

  const testQuestions = []

  // PHASE 1: Guarantee EVERY skill appears at least once
  const shuffledSkills = shuffle([...pool])
  for (const skill of shuffledSkills) {
    if (testQuestions.length >= totalQuestions) break
    const q = generateQuestionForSkill(curriculumData, skill.id)
    if (q) {
      testQuestions.push({
        ...q,
        userAnswer: '',
        userFeedback: '',
        isCorrect: false,
        answered: false
      })
    }
  }

  // PHASE 2: Fill remaining questions fairly across all skills
  const remaining = totalQuestions - testQuestions.length
  if (remaining > 0) {
    const baseExtras = Math.floor(remaining / pool.length)
    const bonusSkills = remaining % pool.length

    pool.forEach((skill, index) => {
      const extras = baseExtras + (index < bonusSkills ? 1 : 0)
      for (let i = 0; i < extras; i++) {
        if (testQuestions.length >= totalQuestions) return
        const q = generateQuestionForSkill(curriculumData, skill.id)
        if (q) {
          testQuestions.push({
            ...q,
            userAnswer: '',
            userFeedback: '',
            isCorrect: false,
            answered: false
          })
        }
      }
    })
  }

  // Final shuffle and return exact number
  return shuffle(testQuestions).slice(0, totalQuestions)
}

export function calculateTestResults(questions) {
  const results = {
    totalQuestions: questions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 0,
    percentageScore: 0,
    grade: '',
    byStrand: {},
    recommendations: []
  }

  // Count answers
  questions.forEach(q => {
    if (!q.answered) {
      results.unanswered++
    } else if (q.isCorrect) {
      results.correctAnswers++
    } else {
      results.incorrectAnswers++
    }

    // Track by strand
    if (!results.byStrand[q.strand]) {
      results.byStrand[q.strand] = {
        total: 0,
        correct: 0,
        topics: {}
      }
    }

    results.byStrand[q.strand].total++
    if (q.isCorrect) {
      results.byStrand[q.strand].correct++
    }

    // Track by topic
    if (!results.byStrand[q.strand].topics[q.topic]) {
      results.byStrand[q.strand].topics[q.topic] = {
        total: 0,
        correct: 0,
        skills: {}
      }
    }

    results.byStrand[q.strand].topics[q.topic].total++
    if (q.isCorrect) {
      results.byStrand[q.strand].topics[q.topic].correct++
    }

    // Track by skill
    if (!results.byStrand[q.strand].topics[q.topic].skills[q.skill]) {
      results.byStrand[q.strand].topics[q.topic].skills[q.skill] = {
        total: 0,
        correct: 0
      }
    }

    results.byStrand[q.strand].topics[q.topic].skills[q.skill].total++
    if (q.isCorrect) {
      results.byStrand[q.strand].topics[q.topic].skills[q.skill].correct++
    }
  })

  // Correct Australian school scoring: unanswered = 0 marks
  results.percentageScore = Math.round((results.correctAnswers / results.totalQuestions) * 100)

  // Optional: Add a "completed %" if you want to show engagement
  results.completionRate = Math.round(((results.correctAnswers + results.incorrectAnswers) / results.totalQuestions) * 100)

  // Assign grade
  if (results.percentageScore >= 90) results.grade = 'A+'
  else if (results.percentageScore >= 85) results.grade = 'A'
  else if (results.percentageScore >= 80) results.grade = 'A-'
  else if (results.percentageScore >= 75) results.grade = 'B+'
  else if (results.percentageScore >= 70) results.grade = 'B'
  else if (results.percentageScore >= 65) results.grade = 'B-'
  else if (results.percentageScore >= 60) results.grade = 'C+'
  else if (results.percentageScore >= 55) results.grade = 'C'
  else if (results.percentageScore >= 50) results.grade = 'C-'
  else results.grade = 'D'

  // Generate recommendations
  Object.keys(results.byStrand).forEach(strandName => {
    const strand = results.byStrand[strandName]
    const strandPercentage = strand.total > 0 ? (strand.correct / strand.total) * 100 : 0

    // If strand performance is below 70%, recommend practice
    if (strandPercentage < 70) {
      // Find weakest topics in this strand
      const weakTopics = []
      Object.keys(strand.topics).forEach(topicName => {
        const topic = strand.topics[topicName]
        const topicPercentage = topic.total > 0 ? (topic.correct / topic.total) * 100 : 0

        if (topicPercentage < 70) {
          // Find weakest skills
          const weakSkills = []
          Object.keys(topic.skills).forEach(skillName => {
            const skill = topic.skills[skillName]
            const skillPercentage = skill.total > 0 ? (skill.correct / skill.total) * 100 : 0

            if (skillPercentage < 70) {
              weakSkills.push(skillName)
            }
          })

          if (weakSkills.length > 0) {
            weakTopics.push({
              topic: topicName,
              skills: weakSkills,
              percentage: Math.round(topicPercentage)
            })
          }
        }
      })

      if (weakTopics.length > 0) {
        results.recommendations.push({
          strand: strandName,
          percentage: Math.round(strandPercentage),
          topics: weakTopics
        })
      }
    }
  })

  return results
}
