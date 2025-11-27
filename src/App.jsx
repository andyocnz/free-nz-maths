import { useState, useEffect, useRef } from 'react'
import { generateQuestionForSkill, getStrandsForYear, getAvailableYears } from './templateEngine.js'
import curriculumData from './curriculumDataFull.json'
import { generateTest, calculateTestResults } from './testGenerator.js'
import QuestionVisualizer from './QuestionVisualizer.jsx'
import TestResults from './TestResults.jsx'
import CurriculumMap, { CurriculumMapToggle } from './CurriculumMap.jsx'
import HintModal from './HintModal.jsx'
import CanvasBackground from './CanvasBackground.jsx'
import DailyChallenge from './DailyChallenge.jsx'
import LoginModal from './LoginModal.jsx'
import LoginRecommendationModal from './LoginRecommendationModal.jsx'
import PracticeHistory from './PracticeHistory.jsx'
import { getCurrentUser, loginUser, logoutUser, saveProgress, saveTestResult, savePracticeSession } from './storage.js'
import { generateReportURL } from './config.js'
import { normalizeFraction } from './mathHelpers.js'
import WordDropdown from './WordDropdown.jsx'

// Alternating Text Component
function AlternatingText() {
  const [textIndex, setTextIndex] = useState(0)

  const texts = [
    "Mathx.nz is a free, adaptive platform that identifies your knowledge gaps and provides targeted practice until you achieve fluency in every topic.",
    "We don't have all the fancy games and cartoons...yet. But we have the important stuff: clear lessons and practice problems that help. We keep it free forever and no ads because every kid deserves a fair go."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % texts.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-xl md:text-2xl text-slate-600 mb-8 font-light leading-relaxed transition-opacity duration-500">
      {texts[textIndex]}
    </p>
  )
}

export default function App() {
  // Check URL parameters for year and skill
  const urlParams = new URLSearchParams(window.location.search)
  const yearFromUrl = urlParams.get('year')
  const skillFromUrl = urlParams.get('skill')

  const [mode, setMode] = useState(
    skillFromUrl ? 'practice' : yearFromUrl ? 'menu' : 'landing'
  )
  const [selectedYear, setSelectedYear] = useState(yearFromUrl ? parseInt(yearFromUrl) : null)
  const [selectedStrand, setSelectedStrand] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [history, setHistory] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [isTestMode, setIsTestMode] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [hintModal, setHintModal] = useState({ isOpen: false, title: '', message: '' })
  const [attempts, setAttempts] = useState(0)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [curriculumMapYear, setCurriculumMapYear] = useState(6) // Year selector for curriculum map
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoginRecommendation, setShowLoginRecommendation] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // Store {type: 'practice'|'test', skillId: string}
  const [practiceResults, setPracticeResults] = useState(null) // Store practice session results
  const initialized = useRef(false)
  const nextLockedRef = useRef(false)
  const [nextLocked, setNextLocked] = useState(false)

  // Toggle landing-only body background (grid) for main page
  useEffect(() => {
    if (mode === 'landing') {
      document.body.classList.add('landing-grid')
    } else {
      document.body.classList.remove('landing-grid')
    }
  }, [mode])

  // Check for existing user on load
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    // Don't show login modal on load, only when starting practice
  }, [])

  // Set default year to 6 if not set
  useEffect(() => {
    if (!selectedYear && !yearFromUrl) {
      setSelectedYear(6)
    }
  }, [])

  const handleLogin = (username) => {
    const result = loginUser(username)
    if (result.success) {
      setCurrentUser(result.user)
      setShowLoginModal(false)
      setShowLoginRecommendation(false)

      // Check for pending actions from recommendation modal
      if (pendingAction) {
        const action = pendingAction
        setPendingAction(null)

        setTimeout(() => {
          if (action.type === 'practice') {
            startPracticeInternal(action.skillId)
          } else if (action.type === 'test') {
            startTestInternal()
          }
        }, 100)
        return
      }

      // Check for pending actions from sessionStorage (old flow)
      const pendingSkill = sessionStorage.getItem('pendingSkill')
      const pendingTest = sessionStorage.getItem('pendingTest')

      if (pendingSkill) {
        sessionStorage.removeItem('pendingSkill')
        setTimeout(() => startPractice(pendingSkill), 100)
      } else if (pendingTest) {
        sessionStorage.removeItem('pendingTest')
        setTimeout(() => startTest(), 100)
      }
    }
  }

  const handleSkipLogin = () => {
    setShowLoginRecommendation(false)

    // Execute pending action without logging in
    if (pendingAction) {
      const action = pendingAction
      setPendingAction(null)

      if (action.type === 'practice') {
        startPracticeInternal(action.skillId)
      } else if (action.type === 'test') {
        startTestInternal()
      }
    }
  }

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to logout?\n\nAll your practice history will be lost if you logout.'
    )

    if (confirmed) {
      logoutUser()
      setCurrentUser(null)
      setMode('landing')
      // Don't show login modal after logout
    }
  }

  const question = history[currentIndex]
  const availableYears = getAvailableYears(curriculumData)

  useEffect(() => {
    if (!initialized.current && mode === 'practice') {
      initialized.current = true
      // If skill from URL, start practice with that skill
      if (skillFromUrl && selectedYear) {
        // Set skill first before mode changes
        const yearData = curriculumData.years.find(y => y.year === selectedYear)
        if (yearData) {
          const skill = yearData.skills.find(s => s.id === skillFromUrl)
          if (skill) {
            setSelectedStrand(skill.strand)
            setSelectedTopic(skill.name)
            setSelectedSkill(skillFromUrl)
            // Generate first question
            const newQ = {
              ...generateQuestionForSkill(curriculumData, skillFromUrl),
              userAnswer: '',
              userFeedback: '',
              isCorrect: false
            }
            setHistory([newQ])
            setCurrentIndex(0)
          }
        }
      } else {
        newQuestion()
      }
    }
  }, [mode])

  useEffect(() => {
    if (question) {
      const elem = document.getElementById('math-question')
      if (elem) {
        let cleanQuestion = question.question
        // Replace LaTeX commands with proper math symbols
        cleanQuestion = cleanQuestion.replace(/\\text\{([^}]*)\}/g, '$1')
        cleanQuestion = cleanQuestion.replace(/\\times/g, '×')
        cleanQuestion = cleanQuestion.replace(/\\div/g, '÷')
        cleanQuestion = cleanQuestion.replace(/\\cdot/g, '·')
        cleanQuestion = cleanQuestion.replace(/\\pm/g, '±')
        cleanQuestion = cleanQuestion.replace(/\\le/g, '≤')
        cleanQuestion = cleanQuestion.replace(/\\ge/g, '≥')
        cleanQuestion = cleanQuestion.replace(/\\ne/g, '≠')
        cleanQuestion = cleanQuestion.replace(/\\approx/g, '≈')
        cleanQuestion = cleanQuestion.replace(/\\sqrt/g, '√')

        // Replace exponents with superscript Unicode characters (including negative)
        cleanQuestion = cleanQuestion.replace(/\^-(\d)/g, (match, digit) => {
          const superscripts = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
          return '⁻' + superscripts[digit]
        })
        cleanQuestion = cleanQuestion.replace(/\^0/g, '⁰')
        cleanQuestion = cleanQuestion.replace(/\^1/g, '¹')
        cleanQuestion = cleanQuestion.replace(/\^2/g, '²')
        cleanQuestion = cleanQuestion.replace(/\^3/g, '³')
        cleanQuestion = cleanQuestion.replace(/\^4/g, '⁴')
        cleanQuestion = cleanQuestion.replace(/\^5/g, '⁵')
        cleanQuestion = cleanQuestion.replace(/\^6/g, '⁶')
        cleanQuestion = cleanQuestion.replace(/\^7/g, '⁷')
        cleanQuestion = cleanQuestion.replace(/\^8/g, '⁸')
        cleanQuestion = cleanQuestion.replace(/\^9/g, '⁹')

        // Format mixed numbers: "4 2/10" → display with proper spacing
        // This regex finds patterns like "digit space digit/digit"
        cleanQuestion = cleanQuestion.replace(/(\d+)\s+(\d+)\/(\d+)/g, '$1 \u00A0$2/$3')

        // Replace other common patterns
        cleanQuestion = cleanQuestion.replace(/\*/g, '×')
        cleanQuestion = cleanQuestion.replace(/x /g, '× ')

        // Clean up any remaining LaTeX backslashes
        cleanQuestion = cleanQuestion.replace(/\\/g, '')

        // Use HTML for better fraction display
        elem.innerHTML = cleanQuestion.replace(/(\d+)\/(\d+)/g, '<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;font-size:0.8em;border-bottom:1px solid currentColor;padding:0 3px;">$1</span><span style="display:block;font-size:0.8em;padding:0 3px;">$2</span></span>')
      }
      setAnswer(question.userAnswer || '')
      setFeedback(question.userFeedback || '')
    }
  }, [currentIndex, question])

  // Reset Next lock whenever we move to a new question or mode
  useEffect(() => {
    nextLockedRef.current = false
    setNextLocked(false)
  }, [currentIndex, mode])

  const newQuestion = () => {
    // Move to next question if available
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setAnswer('')
      setFeedback('')
    } else {
      // No more questions, optionally generate more or go back to menu
      backToMenu()
    }
  }

  // Internal function that actually starts practice (called after login decision)
  const startPracticeInternal = (skillId) => {
    const yearData = curriculumData.years.find(y => y.year === selectedYear)
    if (yearData) {
      const skill = yearData.skills.find(s => s.id === skillId)
      if (skill) {
        setSelectedStrand(skill.strand)
        setSelectedTopic(skill.name)
      }
    }

    setSelectedSkill(skillId)
    setScore(0)
    setIsTestMode(false)
    setSidebarCollapsed(false)
    setAttempts(0)
    setShowCorrectAnswer(false)
    initialized.current = false

    // Generate 20 questions for this skill
    const questions = []
    for (let i = 0; i < 20; i++) {
      const newQ = {
        ...generateQuestionForSkill(curriculumData, skillId),
        userAnswer: '',
        userFeedback: '',
        isCorrect: false,
        answered: false
      }
      questions.push(newQ)
    }

    setHistory(questions)
    setCurrentIndex(0)
    setAnswer('')
    setFeedback('')

    // Only change mode if not already in practice
    if (mode !== 'practice') {
      setMode('practice')
    }
  }

  // Public function to start practice (shows login recommendation if needed)
  const startPractice = (skillId) => {
    // Check if user is logged in
    if (!currentUser) {
      // Set skill info to show in practice page
      const yearData = curriculumData.years.find(y => y.year === selectedYear)
      if (yearData) {
        const skill = yearData.skills.find(s => s.id === skillId)
        if (skill) {
          setSelectedStrand(skill.strand)
          setSelectedTopic(skill.name)
          setSelectedSkill(skillId)
        }
      }

      // Set pending action
      setPendingAction({ type: 'practice', skillId })
      // Prevent auto-generation of questions
      initialized.current = true
      // Navigate to practice page
      setMode('practice')
      // Show recommendation modal (will appear on practice page)
      setShowLoginRecommendation(true)
      return
    }

    // User is logged in, start practice directly
    startPracticeInternal(skillId)
  }

  // Internal function that actually starts test (called after login decision)
  const startTestInternal = () => {
    const testQuestions = generateTest(selectedYear, 60)  // Generate exactly 60 questions
    setHistory(testQuestions)
    setCurrentIndex(0)
    setScore(0)
    setIsTestMode(true)
    setSelectedSkill(null)
    setAnswer('')
    setFeedback('')
    initialized.current = true
    setMode('test')
  }

  // Public function to start test (shows login recommendation if needed)
  const startTest = () => {
    // Check if user is logged in
    if (!currentUser) {
      // Set pending action
      setPendingAction({ type: 'test' })
      // Prevent auto-generation of questions
      initialized.current = true
      // Navigate to test page
      setMode('test')
      // Show recommendation modal (will appear on test page)
      setShowLoginRecommendation(true)
      return
    }

    // User is logged in, start test directly
    startTestInternal()
  }

  const finishTest = () => {
    // Calculate and store test results, then navigate to results view
    const results = calculateTestResults(history)
    setTestResults(results)

    // Save test result to storage and practice history
    if (selectedYear && currentUser) {
      saveTestResult(selectedYear, results.correctAnswers, results.totalQuestions)
      savePracticeSession(
        'Full Assessment',
        selectedYear,
        results.correctAnswers,
        results.totalQuestions,
        new Date().toISOString()
      )
    }

    setMode('test-results')
    initialized.current = false
  }

  const finishPractice = () => {
    // Show practice results, then save
    if (!isTestMode && history.length > 0) {
      const answeredQuestions = history.filter(q => q.answered)
      const correctCount = answeredQuestions.filter(q => q.isCorrect).length
      const unansweredCount = history.length - answeredQuestions.length

      // Get skill name for the practice session
      const yearData = curriculumData.years.find(y => y.year === selectedYear)
      let skillName = 'Practice Session'
      if (yearData && selectedSkill) {
        const skill = yearData.skills.find(s => s.id === selectedSkill)
        if (skill) {
          skillName = skill.name
        }
      }

        // Score: correct answers / total questions (skipped count as attempted)
        const totalQuestions = history.length
        const percentageScore = totalQuestions > 0 
          ? Math.round((correctCount / totalQuestions) * 100) 
          : 0

      const practiceResultsData = {
        skillName,
          correctAnswers: correctCount,
          totalQuestions: totalQuestions,
          answeredQuestions: answeredQuestions.length,
          unanswered: unansweredCount,
          percentageScore: percentageScore
      }

      setPracticeResults(practiceResultsData)

      // Save to storage
      if (currentUser) {
        try {
            // Persist practice summary; total includes skipped questions
            savePracticeSession(
              skillName,
              selectedYear,
              correctCount,
              totalQuestions,
              new Date().toISOString()
            )
        } catch (e) {
          console.warn('Failed to save practice session', e)
        }
      }

      // Switch to results view
      setMode('practice-results')
      initialized.current = false
    }
  }

  const backToMenu = () => {
    setMode('landing')
    setSelectedStrand(null)
    setSelectedTopic(null)
    setSelectedSkill(null)
    setHistory([])
    setCurrentIndex(-1)
    setScore(0)
    setIsTestMode(false)
    setTestResults(null)
    setPracticeResults(null)
    initialized.current = false
  }

  const backToYearSelect = () => {
    setMode('year-select')
    setSelectedYear(null)
    setSelectedStrand(null)
    setSelectedTopic(null)
    setSelectedSkill(null)
    setHistory([])
    setCurrentIndex(-1)
    setScore(0)
    setIsTestMode(false)
    setTestResults(null)
    initialized.current = false
  }

  const practiceFromResults = (skill) => {
      startPractice(skill)
    }
  
    const goBack = () => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
  
  const goForward = () => {
    if (!question) return

    const isWordsQuestion =
      question?.skillId?.includes('PLACE_VALUE') &&
      (question?.question || '').toLowerCase().includes('in words')

    // In tests, don't allow skipping number-to-words questions with no answer
    if (!question.answered && !answer.trim() && isWordsQuestion) {
      setFeedback('Please click words above to build your answer first.')
      return
    }

    // Auto-check answer if not already checked
    if (!question.answered && answer.trim()) {
      checkAnswer()
      // Wait a moment for user to see result, then move to next
      setTimeout(() => {
        setAttempts(0)
        setShowCorrectAnswer(false)
        if (currentIndex < history.length - 1) {
          setCurrentIndex(prev => prev + 1)
        }
      }, 1500)
    } else {
      // Already answered or no answer, just move to next
      setAttempts(0)
      setShowCorrectAnswer(false)
      if (currentIndex < history.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    }
  }

    const checkAnswer = () => {
      if (!answer.trim()) {
        // For number-to-words questions, gently prompt the student to build an answer
        if (question?.skillId?.includes('PLACE_VALUE') && (question?.question || '').toLowerCase().includes('in words')) {
          setFeedback('Please click words above to build your answer first.')
        }
        return
      }

    try {
      let newFeedback = ''
      let isCorrect = false

      // Word-based place-value questions ("Write the number ... in words")
      if (question?.skillId?.includes('PLACE_VALUE') && (question?.question || '').toLowerCase().includes('in words')) {
        const userNorm = normalizeNumberWords(answer.trim())
        const correctNorm = normalizeNumberWords(question.answer)
        if (userNorm === correctNorm) {
          newFeedback = 'Correct! ✅'
          isCorrect = true
        }
      } else {
        // Numeric/fraction comparison with tolerance
        const userAnswer = normalizeFraction(answer.trim())
        const correctAnswer = normalizeFraction(question.answer)

        if (Math.abs(userAnswer - correctAnswer) < 0.01) {
          newFeedback = 'Correct! ✅'
          isCorrect = true
        }
      }

      if (isCorrect) {
        if (question.userFeedback !== 'Correct! ✅') {
          setScore(s => s + 1)
          if (selectedSkill && selectedYear) {
            saveProgress(selectedSkill, true, selectedYear)
          }
        }
      } else {
        if (selectedSkill && selectedYear) {
          saveProgress(selectedSkill, false, selectedYear)
        }
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (isTestMode) {
          newFeedback = `Wrong ❌ Answer: ${question.answer}`
        } else {
          if (newAttempts >= 2) {
            setShowCorrectAnswer(true)
            newFeedback = `Wrong ❌ The correct answer is: ${question.answer}`
          } else {
            newFeedback = `Wrong ❌ Try again! (Attempt ${newAttempts} of 2)`
          }
        }
      }

      setFeedback(newFeedback)

      setHistory(prev => {
        const updated = [...prev]
        updated[currentIndex] = {
          ...updated[currentIndex],
          userAnswer: answer,
          userFeedback: newFeedback,
          isCorrect: isCorrect,
          answered: true
        }
        return updated
      })

      return isCorrect
    } catch (e) {
      const errorFeedback = 'Invalid answer format'
      setFeedback(errorFeedback)
      setHistory(prev => {
        const updated = [...prev]
        updated[currentIndex] = {
          ...updated[currentIndex],
          userAnswer: answer,
          userFeedback: errorFeedback,
          isCorrect: false,
          answered: true
        }
        return updated
      })
      return false
    }
  }

  const handleReportIssue = () => {
    if (!question) return

    const reportData = {
      question: question.question || 'N/A',
      answer: `User: ${answer || 'N/A'}, Correct: ${question.answer || 'N/A'}`,
      year: selectedYear || 'N/A',
      topic: `${question.strand || ''} - ${question.topic || ''} - ${question.skill || ''}`.trim()
    }

    const reportURL = generateReportURL(reportData)
    window.open(reportURL, '_blank')
  }

    const handleNext = () => {
      if (!question) return

      const isWordsQuestion =
        question?.skillId?.includes('PLACE_VALUE') &&
        (question?.question || '').toLowerCase().includes('in words')

      // In practice, don't allow skipping number-to-words questions with no answer
      if (!question.answered && !answer.trim() && isWordsQuestion) {
        setFeedback('Please click words above to build your answer first.')
        return
      }

      // In practice mode, lock Next to avoid double-click skips
      if (!isTestMode) {
        if (nextLockedRef.current) return
        nextLockedRef.current = true
        setNextLocked(true)
      }

      // Auto-check answer if not already checked
      if (!question.answered && answer.trim()) {
        checkAnswer()
        // Wait a moment for user to see result, then move to next
        setTimeout(() => {
          setAttempts(0)
          setShowCorrectAnswer(false)
          if (currentIndex < history.length - 1) {
            newQuestion()
          } else if (!isTestMode) {
            // Finish practice and show results
            finishPractice()
          }
        }, 1500)
      } else {
        // Already answered or no answer, just move to next
        setAttempts(0)
        setShowCorrectAnswer(false)
        if (currentIndex < history.length - 1) {
          newQuestion()
        } else if (!isTestMode) {
          // Finish practice and show results
          finishPractice()
        }
      }
    }

  

  const buildSkillSpecificHint = (skillMeta, qText) => {
    const { id, name, description } = skillMeta;
    const skillName = name.toLowerCase();
    let hint = `What this skill is about:\n${description}\n\n`;

    if (skillName.includes('fraction')) {
      hint += 'Strategy for fractions:\n1. Identify if you need to add, subtract, multiply, or divide.\n2. For +/- find a common denominator.\n3. For ×, multiply numerators and denominators.\n4. For ÷, flip the second fraction and multiply.\n5. Always simplify your final answer.';
    } else if (skillName.includes('percent')) {
      hint += 'Strategy for percentages:\n1. Remember "percent" means "out of 100".\n2. To find a percent of a number, turn the percent into a decimal (e.g., 25% = 0.25) and multiply.\n3. To find a percent change, use: (New - Old) / Old × 100.';
    } else if (skillName.includes('decimal')) {
      hint += 'Strategy for decimals:\n1. When adding or subtracting, line up the decimal points.\n2. When multiplying, count the total decimal places in the numbers you are multiplying; your answer needs that many.\n3. When dividing, make the divisor a whole number by moving the decimal point in both numbers.';
    } else if (skillName.includes('area')) {
      hint += 'Strategy for Area:\n1. Identify the shape (rectangle, triangle, circle).\n2. Use the correct formula:\n   - Rectangle: Area = length × width\n   - Triangle: Area = (base × height) / 2\n   - Circle: Area = π × radius²\n3. Make sure you use the right measurements for each part of the formula.';
    } else if (skillName.includes('perimeter')) {
      hint += 'Strategy for Perimeter:\n1. Perimeter is the total distance around the outside of a shape.\n2. Add up the lengths of all the sides.\n3. For a circle, this is called the circumference (2 × π × radius).';
    } else if (skillName.includes('volume')) {
      hint += 'Strategy for Volume:\n1. Volume measures 3D space inside a shape.\n2. Common formulas:\n   - Rectangular prism: length × width × height\n   - Triangular prism: (base area) × height\n   - Cylinder: π × radius² × height\n3. Volume is always in cubic units (cm³, m³, etc.).';
    } else if (skillName.includes('angle')) {
      hint += 'Strategy for Angles:\n1. Remember: angles on a straight line = 180°\n2. Angles in a triangle = 180°\n3. Vertically opposite angles are equal\n4. Complementary angles add to 90°\n5. Supplementary angles add to 180°';
    } else if (skillName.includes('sequence') || skillName.includes('pattern')) {
      hint += 'Strategy for sequences:\n1. Look at the numbers and find the rule that connects them.\n2. Is it an arithmetic sequence (adding/subtracting the same number each time)?\n3. Is it a geometric sequence (multiplying/dividing by the same number each time)?\n4. Apply the rule to find the next number.';
    } else if (skillName.includes('exponent') || skillName.includes('power') || skillName.includes('index')) {
      hint += 'Strategy for exponents:\n1. x² means x × x\n2. x³ means x × x × x\n3. When multiplying: x² × x³ = x⁵ (add the powers)\n4. When dividing: x⁵ ÷ x² = x³ (subtract the powers)\n5. x⁰ = 1 (anything to the power of 0 equals 1)';
    } else if (skillName.includes('ratio')) {
      hint += 'Strategy for ratios:\n1. A ratio compares two quantities (e.g., 3:5).\n2. To simplify, divide both numbers by their highest common factor.\n3. To find a missing value, use equivalent ratios (like equivalent fractions).';
    } else if (skillName.includes('probability')) {
      hint += 'Strategy for probability:\n1. Probability = (Number of favorable outcomes) / (Total number of possible outcomes)\n2. Probability is between 0 (impossible) and 1 (certain).\n3. The sum of all probabilities for an event = 1.\n4. For independent events, multiply their probabilities.';
    } else if (skillName.includes('time')) {
      hint += 'Strategy for time:\n1. Remember: 60 minutes = 1 hour, 24 hours = 1 day\n2. To find elapsed time, subtract start time from end time.\n3. If crossing midnight, add 24 hours to the end time first.\n4. Use a number line to visualize time intervals.';
    } else if (skillName.includes('coordinate') || skillName.includes('graph')) {
      hint += 'Strategy for coordinates:\n1. A coordinate is written as (x, y)\n2. x is the horizontal position, y is the vertical position\n3. To find distance between two points on a line: subtract coordinates\n4. For diagonal distance, use: √[(x₂-x₁)² + (y₂-y₁)²]';
    } else if (skillName.includes('equation') || skillName.includes('solve')) {
      hint += 'Strategy for equations:\n1. Your goal is to isolate the variable (get x by itself).\n2. Use inverse operations: + ↔ −, × ↔ ÷\n3. Whatever you do to one side, do to the other.\n4. Work backwards from the order of operations.';
    } else if (skillName.includes('integer') || skillName.includes('negative')) {
      hint += 'Strategy for integers:\n1. Adding a negative is like subtracting: 5 + (−3) = 5 − 3\n2. Subtracting a negative is like adding: 5 − (−3) = 5 + 3\n3. Multiplying/dividing: same signs = positive, different signs = negative\n4. Use a number line to visualize.';
    } else if (skillName.includes('prime') || skillName.includes('factor')) {
      hint += 'Strategy for factors and primes:\n1. Factors are numbers that divide evenly (no remainder).\n2. Prime numbers have exactly 2 factors (1 and itself).\n3. To find prime factors, divide by smallest primes: 2, 3, 5, 7, 11...\n4. HCF = Highest Common Factor, LCM = Lowest Common Multiple';
    } else if (skillName.includes('money') || skillName.includes('financial')) {
      hint += 'Strategy for money problems:\n1. Read carefully to see if you are earning, spending, saving, or calculating a discount.\n2. Use addition for earnings/income and subtraction for spending.\n3. For discounts, calculate the discount amount (e.g., 10% of $50) and subtract it from the original price.';
    } else if (skillName.includes('data') || skillName.includes('stat')) {
        hint += 'Strategy for data questions:\n1. Mean: Add all values, then divide by the number of values.\n2. Median: Order values from smallest to largest and find the middle one.\n3. Mode: Find the value that appears most often.\n4. Range: Subtract the smallest value from the largest value.';
    } else if (skillName.includes('quadratic') || skillName.includes('polynomial')) {
      hint += 'Strategy for quadratics:\n1. Standard form: ax² + bx + c\n2. To expand (x+a)(x+b): use FOIL or multiply each term\n3. To factorize: find two numbers that multiply to c and add to b\n4. Look for common factors first.';
    } else {
      return null; // No specific hint found
    }
    return hint;
  }
  
  const buildQuestionTextHint = (qText) => {
    const q = qText.toLowerCase();

    // Fractions
    if (q.includes('/') || q.includes('fraction')) {
      return 'General Fraction Tip:\nRemember that the top number is the numerator and the bottom is the denominator. When adding or subtracting, you need a common denominator.';
    }

    // Algebra/Equations
    if (q.includes('solve for') || q.includes('solve:') || q.includes('algebra') || (q.includes('=') && (q.includes('x') || q.includes('y')))) {
        return 'General Algebra Tip:\nYour goal is to get the variable (like x) by itself on one side of the equals sign. Use inverse operations (like + and -, or × and ÷) to move numbers away from the variable.';
    }

    // Geometry - specific shapes
    if (q.includes('triangle')) {
        return 'Triangle Tip:\n- Area = (base × height) / 2\n- Perimeter = add all three sides\n- Angles in a triangle always add to 180°';
    }
    if (q.includes('rectangle') || q.includes('square')) {
        return 'Rectangle Tip:\n- Area = length × width\n- Perimeter = 2 × (length + width)\n- A square has all sides equal';
    }
    if (q.includes('circle')) {
        return 'Circle Tip:\n- Circumference = 2 × π × radius (or π × diameter)\n- Area = π × radius²\n- Remember π ≈ 3.14';
    }
    if (q.includes('volume') || q.includes('prism') || q.includes('cylinder')) {
        return 'Volume Tip:\nVolume measures 3D space. Multiply the base area by the height for prisms. Answer is in cubic units (cm³, m³).';
    }
    if (q.includes('area') || q.includes('perimeter')) {
        return 'General Geometry Tip:\nIdentify the shape and what you need to find (area, perimeter, etc.). Use the correct formula from your memory or textbook. Pay attention to the units (like cm, m, cm², etc.).';
    }

    // Angles
    if (q.includes('angle') || q.includes('degree') || q.includes('°')) {
        return 'Angle Tip:\n- Straight line = 180°\n- Triangle = 180°\n- Vertically opposite angles are equal\n- Complementary = 90°, Supplementary = 180°';
    }

    // Statistics
    if (q.includes('mean') || q.includes('median') || q.includes('mode') || q.includes('range') || q.includes('average')) {
        return 'General Statistics Tip:\n- Mean is the average (add all values ÷ count).\n- Median is the middle value when ordered.\n- Mode is the most frequent value.\n- Range is the difference between highest and lowest.';
    }

    // Percentages
    if (q.includes('%') || q.includes('percent')) {
        return 'General Percentage Tip:\nTo find a percentage of a number, convert the percentage to a decimal and multiply. For example, 30% of 150 is 0.30 × 150.';
    }

    // Probability
    if (q.includes('probability') || q.includes('chance') || q.includes('likely')) {
        return 'Probability Tip:\nProbability = (favorable outcomes) / (total possible outcomes)\nThe answer is between 0 and 1 (or 0% to 100%).';
    }

    // Ratios
    if (q.includes('ratio') || q.includes(':')) {
        return 'Ratio Tip:\nA ratio compares quantities. Simplify by dividing both sides by their highest common factor. To find unknowns, use equivalent ratios.';
    }

    // Time
    if (q.includes('time') || q.includes(':') && (q.includes('am') || q.includes('pm') || q.includes('hour') || q.includes('minute'))) {
        return 'Time Tip:\nTo find elapsed time, subtract the start time from the end time. If crossing midnight, add 24 hours first. Remember: 60 minutes = 1 hour.';
    }

    // Distance/Speed
    if (q.includes('distance') || q.includes('speed') || q.includes('km') || q.includes('velocity')) {
        return 'Distance/Speed Tip:\nRemember: Distance = Speed × Time\nRearrange as needed: Speed = Distance / Time, Time = Distance / Speed';
    }

    // Exponents/Powers
    if (q.includes('exponent') || q.includes('power') || q.includes('^') || q.includes('²') || q.includes('³')) {
        return 'Exponent Tip:\nx² = x × x, x³ = x × x × x\nWhen multiplying same base: add powers (x² × x³ = x⁵)\nWhen dividing same base: subtract powers (x⁵ ÷ x² = x³)';
    }

    // Coordinates
    if (q.includes('coordinate') || q.includes('point') || q.includes('(') && q.includes(',') && q.includes(')')) {
        return 'Coordinate Tip:\nPoints are written as (x, y). x is horizontal, y is vertical.\nTo find distance, you may need to subtract coordinates or use the distance formula.';
    }

    // Prime numbers/Factors
    if (q.includes('prime') || q.includes('factor') || q.includes('divisor') || q.includes('multiple')) {
        return 'Prime/Factor Tip:\nPrime numbers only divide by 1 and themselves. Factors divide evenly with no remainder.\nTo find prime factors, divide by 2, 3, 5, 7, 11... until you reach 1.';
    }

    // Rounding/Estimation
    if (q.includes('round') || q.includes('estimate') || q.includes('nearest')) {
        return 'Rounding Tip:\nLook at the digit to the right of where you\'re rounding. If it\'s 5 or more, round up. If it\'s 4 or less, round down.';
    }

    // Word problems with "in words"
    if (q.includes('in words') || q.includes('write the number')) {
        return 'Number Words Tip:\nWrite numbers as you would say them. Use hyphens for numbers 21-99 (like twenty-one). Use "and" between hundreds and smaller parts (like "two hundred and fifty").';
    }

    return null;
  }

  const generateHint = () => {
    if (!question) return

    const qText = question.question || '';
    let hint = '';

    // 1. Try to get a skill-specific hint from curriculum data
    const skillId = question.skillId || selectedSkill;
    const year = question.year || selectedYear;
    let skillMeta = null;

    if (skillId && year) {
        const yearData = curriculumData.years.find(y => y.year === year);
        if (yearData) {
            skillMeta = yearData.skills.find(s => s.id === skillId);
        }
    }

    if (skillMeta) {
        hint = buildSkillSpecificHint(skillMeta, qText);
    }

    // 2. If no skill-specific hint, fall back to text-based hint
    if (!hint) {
        hint = buildQuestionTextHint(qText);
    }

    // 3. If still no hint, use a generic fallback
    if (!hint) {
        hint = 'How to approach a word problem:\n1. Read the question carefully to understand what it\'s asking.\n2. Identify the key numbers and words.\n3. Decide which operation (+, -, ×, ÷) you need to use.\n4. Break the problem into smaller, simpler steps.';
    }

    setHintModal({
      isOpen: true,
      title: '💡 Hint',
      message: hint
    })
  }

  if (mode === 'test-results') {
    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        {showLoginRecommendation && <LoginRecommendationModal onLogin={handleLogin} onSkip={handleSkipLogin} />}
        <TestResults
          results={testResults}
          onBackToMenu={backToMenu}
          onPracticeSkill={practiceFromResults}
          username={currentUser?.username}
          year={selectedYear}
        />
      </>
    )
  }

  if (mode === 'practice-results' && practiceResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
              <span className="text-3xl font-bold text-white">Σ</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-800">
              mathx<span style={{ backgroundImage: 'linear-gradient(to right, #0077B6, #00BFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.nz</span>
            </h2>
          </div>

          <h1 className="text-5xl font-bold text-center text-[#0077B6] mb-8">Practice Complete!</h1>

          {/* Results Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{practiceResults.skillName}</h2>
            
            <div className="text-7xl font-bold text-[#4CAF50] mb-4">
              {practiceResults.percentageScore}%
            </div>
            
            <div className="text-2xl font-semibold mb-3 text-gray-700">
              {practiceResults.correctAnswers} correct out of {practiceResults.totalQuestions} questions
            </div>

            <div className="text-lg text-gray-600 mb-4">
              <span className="font-semibold">{practiceResults.answeredQuestions}</span> answered, 
              <span className="font-semibold ml-1 text-orange-600">{practiceResults.unanswered} skipped</span>
            </div>

            <div className="text-sm text-gray-500 mb-8 italic">
              Skipped questions count as 0 marks
            </div>

            {/* Progress bar */}
            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-8">
              <div
                className="bg-[#4CAF50] h-full transition-all duration-500"
                style={{ width: `${practiceResults.percentageScore}%` }}
              ></div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => {
                  setSelectedYear(null)
                  backToMenu()
                }}
                className="px-8 py-4 bg-[#0077B6] hover:bg-sky-700 text-white font-bold rounded-lg shadow-lg transition"
              >
                Back to Home
              </button>
              <button
                onClick={() => startPractice(selectedSkill)}
                className="px-8 py-4 bg-[#4CAF50] hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition"
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing Page
  if (mode === 'landing') {
    // Get strands for selected curriculum map year
    const selectedYearData = curriculumData.years.find(y => y.year === curriculumMapYear)
    const strands = {}
    if (selectedYearData) {
      selectedYearData.skills.forEach(skill => {
        if (!strands[skill.strand]) strands[skill.strand] = []
        strands[skill.strand].push({ ...skill, year: selectedYearData.year })
      })
    }

    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        {mode === 'landing' && <CanvasBackground />}
        <div className="min-h-screen" style={{ position: 'relative' }}>
          {/* User Profile Corner */}
          {currentUser && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-gray-800">{currentUser.username}</div>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-semibold transition-colors ml-2"
              >
                Logout
              </button>
            </div>
          )}

          {/* Hero Section */}
          <section className="pt-12 pb-20 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-left animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg">
                    <span className="text-2xl font-bold text-white">Σ</span>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      mathx<span className="text-gradient">.nz</span>
                    </h1>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-100/80 rounded-full backdrop-blur-sm">
                  Free Maths Practice Forever
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 leading-tight">
                  Master Your <br/><span className="text-gradient">Math Curriculum</span>
                </h2>
                <AlternatingText />
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      document.getElementById('year-selection').scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-8 py-4 text-lg bg-[#0077B6] hover:bg-sky-700 text-white rounded-full font-semibold shadow-lg transition transform hover:-translate-y-1"
                  >
                    Start Learning
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById('curriculum-map').scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-8 py-4 text-lg bg-white/90 hover:bg-white text-gray-800 rounded-full font-semibold border-2 border-gray-300 backdrop-blur-md transition"
                  >
                    Explore Map
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <DailyChallenge />
              </div>
            </div>
          </section>

          {/* Year Selection */}
          <div id="year-selection" className="bg-blue-50/50 py-16 mb-8 backdrop-blur-sm border-t border-b border-blue-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Choose Your Level</h2>
              <p className="text-lg md:text-xl text-slate-500 mb-12">Select the year that corresponds to your current curriculum.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {availableYears.map((year, idx) => (
                  <div
                    key={year}
                    onClick={() => {
                      setSelectedYear(year)
                      setCurriculumMapYear(year)
                      document.getElementById('curriculum-map').scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="year-card bg-white/80 p-8 rounded-2xl border-2 border-[#0077B6] card-shadow block cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="text-6xl font-bold text-[#0077B6] mb-4 font-mono">{year}</div>
                    <h3 className="text-xl font-semibold text-gray-800">Year {year}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {year <= 7 ? 'Foundation' : year === 8 ? 'Intermediate' : 'Advanced'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Curriculum Map */}
          <div id="curriculum-map" className="py-16 bg-slate-100/40 backdrop-blur-sm">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-left p-8 bg-white/80 rounded-2xl card-shadow border border-white/50 pt-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 text-center">Curriculum Map</h2>
                <p className="text-lg md:text-xl text-slate-500 mb-8 text-center">Explore all topics - click any skill to start practicing!</p>

                {/* Year Selector Buttons */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year)
                        setCurriculumMapYear(year)
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                        curriculumMapYear === year
                          ? 'bg-[#0077B6] text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#0077B6] hover:text-[#0077B6]'
                      }`}
                    >
                      Year {year}
                    </button>
                  ))}
                </div>

                {/* Take Full Assessment Button */}
                <div className="mb-12">
                  <div className="max-w-3xl mx-auto bg-white/90 p-6 rounded-xl border-2 border-red-400 card-shadow transition-all">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-red-600 mb-2">Take Full Assessment</h3>
                        <p className="text-gray-700 mb-1">Comprehensive test covering all curriculum areas for Year {selectedYear || 6}</p>
                        <p className="text-sm text-gray-500 mb-4">~60 questions • 45-60 minutes • Get detailed feedback</p>
                        <button
                          onClick={startTest}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                        >
                          Start Test for Year {selectedYear || 6} Now →
                        </button>
                      </div>
                      <div className="hidden md:block">
                        <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curriculum for Selected Year */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold mb-6 text-[#0077B6]">Year {curriculumMapYear}</h3>

                  {Object.entries(strands).map(([strandName, skills]) => (
                    <div key={strandName} className="mb-8">
                      <h4 className="text-xl font-semibold text-gray-700 mb-4 uppercase tracking-wide">{strandName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skills.map(skill => (
                          <div
                            key={skill.id}
                            onClick={() => {
                              setSelectedYear(skill.year)
                              startPractice(skill.id)
                            }}
                            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                          >
                            <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">{skill.name}</div>
                            <div className="text-sm text-gray-500">{skill.description || 'Click to practice'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Practice History Section */}
          {currentUser && (
            <div className="py-16 bg-white/40 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PracticeHistory />
              </div>
            </div>
          )}

          {/* Mission & Parent Note Combined Section */}
          <section className="py-16 bg-white/60 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6">
                Free to learn. Free to grow.
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                We believe that every child deserves a strong foundation in mathematics. Our mission is to provide 100% free, high-quality, and comprehensive math resources, turning access into achievement for students everywhere.
              </p>

              {/* Note for Parents and Teachers */}
              <div className="mt-12">
                <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-lg p-6 text-left">
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    This website is built by people who want to help. While we work hard to make sure everything is correct, there's always a small chance a mistake might slip through.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Please use this as an alternative tool, but always double-check with your own knowledge or the student's school materials.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Think of it like a practice worksheet we've made for you – it's really useful, but it's always good to have a teacher or a textbook to confirm the answers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Full Assessment Call to Action */}
          {selectedYear && (
            <section className="py-12 bg-slate-100/40 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h3 className="text-3xl font-bold text-slate-800 mb-4">Ready to Test Your Skills?</h3>
                <p className="text-lg text-slate-600 mb-6">
                  Take a comprehensive assessment covering all areas for Year {selectedYear}
                </p>
                <button
                  onClick={startTest}
                  className="px-10 py-4 text-lg bg-[#4CAF50] hover:bg-green-600 text-white rounded-full font-bold shadow-lg transition transform hover:-translate-y-1"
                >
                  Take Full Assessment (60 Questions)
                </button>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-6 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
              © 2025 MathX.nz Platform. Free to learn. Free to grow.
            </div>
          </footer>
        </div>
      </>
    )
  }

  // Year Selection Screen
  if (mode === 'year-select') {
    return (
      <div className="container fade-in">
        <div style={{textAlign:'center', marginBottom:'60px'}}>
          <h1>Free NZ Maths</h1>
          <p style={{fontSize:'1.2em', color:'rgba(255,255,255,0.9)', marginTop:'10px'}}>
            Master the NZ curriculum with interactive practice
          </p>
        </div>

        <h2 style={{
          textAlign:'center',
          margin:'30px 0',
          color:'white',
          fontSize:'1.5em',
          fontWeight:'500'
        }}>
          Select Your Year Level
        </h2>

        <div className="grid-2">
          {availableYears.map((year) => (
            <div
              key={year}
              className="card"
              style={{cursor:'pointer', textAlign:'center'}}
              onClick={() => {
                setSelectedYear(year)
                setMode('menu')
              }}
            >
              <h2 style={{
                fontSize:'3em',
                marginBottom:'15px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text'
              }}>
                Year {year}
              </h2>
              <p style={{fontSize:'1em', color:'#666'}}>
                Click to explore curriculum
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Removed old menu mode - now integrated into landing page
  if (mode === 'menu') {
    // Redirect to landing page
    setMode('landing')
    return null
  }

  if (mode === 'topic-select' && selectedStrand) {
    const strands = getStrandsForYear(curriculumData, selectedYear)
    const currentStrandData = strands.find(s => s.strand === selectedStrand)

    return (
      <div className="container fade-in">
        <button className="btn-secondary" onClick={backToMenu} style={{marginBottom:'30px'}}>
          ← Back to Strands
        </button>

        <div style={{marginBottom:'40px'}}>
          <h1 style={{
            background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            marginBottom:'10px'
          }}>
            {selectedStrand}
          </h1>
          <p style={{fontSize:'1.1em', color:'rgba(255,255,255,0.85)'}}>
            Select a skill to practice
          </p>
        </div>

        <div className="card" style={{marginBottom:'25px'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'12px'}}>
            {currentStrandData && currentStrandData.skills.map((skill, skillIdx) => (
              <button
                key={skillIdx}
                onClick={() => startPractice(skill.id)}
                style={{
                  padding:'16px 20px',
                  backgroundColor:'#f8f9fa',
                  border:'2px solid #e0e0e0',
                  borderRadius:'10px',
                  cursor:'pointer',
                  fontSize:'0.95em',
                  transition:'all 0.2s',
                  textAlign:'left',
                  fontWeight:'500'
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = '#667eea'
                  e.target.style.color = 'white'
                  e.target.style.borderColor = '#667eea'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = '#f8f9fa'
                  e.target.style.color = 'black'
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div style={{fontWeight:'600', marginBottom:'5px'}}>{skill.name}</div>
                <div style={{fontSize:'0.85em', opacity:'0.8'}}>{skill.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Practice and Test Mode
  if (mode === 'practice' || mode === 'test') {
    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        {showLoginRecommendation && <LoginRecommendationModal onLogin={handleLogin} onSkip={handleSkipLogin} />}

        {/* User Profile Corner */}
        {currentUser && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-gray-800">{currentUser.username}</div>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-semibold transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        )}

        {/* Curriculum Map Sidebar */}
        <CurriculumMap
          currentStrand={isTestMode ? question?.strand : selectedStrand}
          currentTopic={isTestMode ? question?.topic : selectedTopic}
          currentSkill={selectedSkill}
          onSelectSkill={!isTestMode ? startPractice : null}
          collapsed={sidebarCollapsed}
          year={selectedYear}
        />
        <CurriculumMapToggle
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="container-narrow fade-in" style={{
          marginLeft: !sidebarCollapsed ? '320px' : '0',
          marginRight: '20px',
          transition: 'margin-left 0.3s ease'
        }}>
          <div style={{position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
            <button className="btn-secondary" onClick={backToMenu}>
              ← Home
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow">
                <span className="text-xl font-bold text-white">Σ</span>
              </div>
              <span className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>mathx<span className="text-gradient">.nz</span></span>
            </div>
          </div>

        <div className="card" style={{textAlign:'center', position:'relative'}}>
          {isTestMode ? (
            <div style={{marginBottom:'20px'}}>
              <h3 style={{color:'#eb3349', marginBottom:'5px'}}>Full Assessment</h3>
              <div style={{fontSize:'0.9em', color:'#666'}}>
                {question?.strand} • {question?.topic}
              </div>
            </div>
          ) : selectedTopic ? (
            <h3 style={{
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              marginBottom:'20px'
            }}>
              {selectedTopic}
            </h3>
          ) : null}

          {/* Score and Progress */}
          <div style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            padding:'15px 20px',
            backgroundColor:'#f5f5f5',
            borderRadius:'12px',
            marginBottom:'30px'
          }}>
            <div>
              <div style={{fontSize:'0.85em', color:'#666'}}>Score</div>
              <div style={{fontSize:'1.8em', fontWeight:'bold', color:'#11998e'}}>{score}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'0.85em', color:'#666'}}>Question</div>
              <div style={{fontSize:'1.3em', fontWeight:'600'}}>{currentIndex + 1} / {history.length}</div>
            </div>
          </div>
          {question && (
            <>
              <QuestionVisualizer visualData={question.visualData} />
              <div id="math-question" style={{fontSize:'1.8em', margin: '30px 0', minHeight:'50px'}}></div>

              {/* Show WordDropdown for "write in words" questions, regular input for others */}
              {question?.skillId?.includes('PLACE_VALUE') && question?.question?.toLowerCase().includes('in words') ? (
                <WordDropdown
                  number={question.params?.n || 0}
                  onAnswer={(selectedAnswer) => {
                    setAnswer(selectedAnswer)
                  }}
                />
              ) : (
                <input
                  className="input-primary"
                  value={answer}
                  onChange={e=>setAnswer(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="Your answer"
                />
              )}

              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop:'30px'}}>
                <button
                  className="btn-secondary"
                  onClick={goBack}
                  disabled={currentIndex === 0}
                  style={{
                    opacity: currentIndex === 0 ? 0.5 : 1,
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={generateHint}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#FFA726',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)'
                  }}
                  onMouseOver={e => e.target.style.backgroundColor = '#FB8C00'}
                  onMouseOut={e => e.target.style.backgroundColor = '#FFA726'}
                >
                  💡 Hint
                </button>
                <button className="btn-success" onClick={checkAnswer}>Check Answer</button>
                {isTestMode ? (
                  currentIndex < history.length - 1 ? (
                    <button className="btn-primary" onClick={goForward}>Next →</button>
                  ) : (
                    <button className="btn-danger" onClick={finishTest}>
                      Finish Test
                    </button>
                  )
                ) : (
                  <button className="btn-primary" onClick={handleNext}>Next →</button>
                )}
              </div>

              {feedback && (
                <div style={{
                  marginTop:'30px',
                  padding:'20px',
                  borderRadius:'12px',
                  backgroundColor: feedback.includes('Correct') ? '#E8F5E9' : '#FFEBEE',
                  color: feedback.includes('Correct') ? '#2E7D32' : '#C62828',
                  fontSize:'1.3em',
                  fontWeight:'600'
                }}>
                  {feedback}
                </div>
              )}
            </>
          )}

          {/* Report Issue Button - Bottom Right */}
          <button
            onClick={handleReportIssue}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '0.65em',
              padding: '4px 8px',
              backgroundColor: '#e5e7eb',
              color: '#4b5563',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#d1d5db'}
            onMouseOut={e => e.target.style.backgroundColor = '#e5e7eb'}
            title="Report an issue with this question"
          >
            🚩 Report an issue
          </button>
          </div>
        </div>

        <HintModal
          isOpen={hintModal.isOpen}
          onClose={() => setHintModal({ ...hintModal, isOpen: false })}
          title={hintModal.title}
          message={hintModal.message}
        />
      </>
    )
  }

  return null
}
