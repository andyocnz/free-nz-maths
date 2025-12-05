import { generateQuestionForSkill, getSkillsForYear } from './templateEngine.js'
import curriculumData from './curriculumDataMerged.js'

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

export function generateTest(year = 7, totalQuestions = 60, options = {}, activeCurriculum = null) {
  const { onlyNew = false, allYears = false, onePerTemplate = false } = options
  const curriculum = activeCurriculum || curriculumData
  const testQuestions = []

  // Collect skills either for a single year or across all years
  let skills = []
  if (allYears) {
    curriculum.years.forEach(y => {
      const s = getSkillsForYear(curriculum, y.year)
      skills = skills.concat(s)
    })
  } else {
    skills = getSkillsForYear(curriculum, year)
  }

  // Filter to only new skills if requested
  if (onlyNew) {
    skills = skills.filter(s => s && s.isNew)
  }

  if (!skills || skills.length === 0) return []

  // Audit mode: one question per template/skill
  if (onePerTemplate) {
    for (const skill of skills) {
      if (!skill) continue
      const q = generateQuestionForSkill(curriculum, skill.id)
      if (!q) continue
      testQuestions.push({
        ...q,
        userAnswer: '',
        userFeedback: '',
        isCorrect: false,
        answered: false
      })
      if (testQuestions.length >= totalQuestions) break
    }
    return testQuestions.slice(0, totalQuestions)
  }

  // Otherwise distribute questions across skills as before
  const questionsPerSkill = Math.ceil(totalQuestions / skills.length)

  for (const skill of skills) {
    const numQuestions = Math.max(1, questionsPerSkill)
    for (let i = 0; i < numQuestions; i++) {
      if (testQuestions.length >= totalQuestions) break
      const question = generateQuestionForSkill(curriculum, skill.id)
      if (!question) continue
      testQuestions.push({
        ...question,
        userAnswer: '',
        userFeedback: '',
        isCorrect: false,
        answered: false
      })
    }
    if (testQuestions.length >= totalQuestions) break
  }

  // Shuffle questions so they're not in order
  const shuffled = shuffle(testQuestions)
  return shuffled.slice(0, totalQuestions)
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

  // Calculate percentage
  const answered = results.correctAnswers + results.incorrectAnswers
  if (answered > 0) {
    results.percentageScore = Math.round((results.correctAnswers / answered) * 100)
  }

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
