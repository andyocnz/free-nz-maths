import { useState, useEffect, useRef } from 'react'
import { generateQuestionForSkill, getStrandsForYear, getAvailableYears, generateQuestionFromTemplate, getSkillsForYear } from './templateEngine.js'
import curriculumData from './curriculumDataMerged.js'
import { generateTest, calculateTestResults } from './testGenerator.js'
import { generateGroupTest } from './groupTestEngine.js'
import QuestionVisualizer from './QuestionVisualizer.jsx'
import TestResults from './TestResults.jsx'
import CurriculumMap, { CurriculumMapToggle } from './CurriculumMap.jsx'
import HintModal from './HintModal.jsx'
import KnowledgeModal from './KnowledgeModal.jsx'
import PastPapersIndex from './PastPapersIndex.jsx'
import CanvasBackground from './CanvasBackground.jsx'
import DailyChallenge from './DailyChallenge.jsx'
import LoginModal from './LoginModal.jsx'
import LoginRecommendationModal from './LoginRecommendationModal.jsx'
import PracticeHistory from './PracticeHistory.jsx'
import { getCurrentUser, loginUser, logoutUser, saveProgress, saveTestResult, savePracticeSession } from './storage.js'
import { config, generateReportURL } from './config.js'
import { normalizeFraction } from './mathHelpers.js'
import WordDropdown from './WordDropdown.jsx'
import knowledgeSnippets from './knowledgeSnippets.json'
import { nceaLevel1YearOverviews } from './pastPapersData.js'
import { nceaExamPdfs } from './nceaPdfs.js'
import { buildNceaTrialQuestionsForStandard } from './nceaStructuredData.js'
import { resolveNceaResource } from './nceaResources.js'
import { registerGroup, submitScore, getRegistry, fetchGroupScores } from './googleApi.js'
import legalDisclaimerContent from '../phase/legal disclaimer.txt?raw'
import footerLogo from '../favicon/favicon-32x32.png'

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
    }, 15000) // Change every 9 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-xl md:text-2xl text-slate-600 mb-8 font-light leading-relaxed transition-opacity duration-500">
      {texts[textIndex]}
    </p>
  )
}

function generateTeacherPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function App() {
  // Check URL parameters and path for deep links
  const urlParams = new URLSearchParams(window.location.search)
  const yearFromUrl = urlParams.get('year')
  const skillFromUrl = urlParams.get('skill')
  const modeFromUrl = urlParams.get('mode')
  const isDevMode = urlParams.has('dev') || urlParams.get('dev') === 'true'
  const phaseFromUrl = urlParams.get('phase')
  const groupCodeFromUrl = urlParams.get('group')
  const phaseFilter = phaseFromUrl ? parseFloat(phaseFromUrl) : null
  const path = window.location.pathname || '/'

  let initialMode
  if (path === '/results') {
    initialMode = 'group-results'
  } else if (path === '/ixl-alternative') {
    initialMode = 'ixl-alternative'
  } else if (modeFromUrl === 'ncea-index') {
    initialMode = 'ncea-index'
  } else if (groupCodeFromUrl) {
    initialMode = 'group-lobby'
  } else if (skillFromUrl) {
    initialMode = 'practice'
  } else if (yearFromUrl) {
    initialMode = 'menu'
  } else {
    initialMode = 'landing'
  }

  const [mode, setMode] = useState(initialMode)
  const [selectedYear, setSelectedYear] = useState(yearFromUrl ? parseInt(yearFromUrl) : null)
  const [selectedStrand, setSelectedStrand] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [history, setHistory] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [answer, setAnswer] = useState('')
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [testScopeAllYears, setTestScopeAllYears] = useState(false)
  const [onlyNewInTest, setOnlyNewInTest] = useState(false)
  const [auditOnePerTemplate, setAuditOnePerTemplate] = useState(false)
  const [score, setScore] = useState(0)
  const [isTestMode, setIsTestMode] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [hintModal, setHintModal] = useState({ isOpen: false, title: '', message: '' })
  const [knowledgeModal, setKnowledgeModal] = useState({ isOpen: false, snippet: null })
  const [attempts, setAttempts] = useState(0)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [curriculumMapYear, setCurriculumMapYear] = useState(6) // Year selector for curriculum map
  const [isOlympiadMode, setIsOlympiadMode] = useState(false) // Toggle for Olympiad content preview
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoginRecommendation, setShowLoginRecommendation] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // Store {type: 'practice'|'test', skillId: string}
  const [practiceResults, setPracticeResults] = useState(null) // Store practice session results
  const [activeNceaPaperId, setActiveNceaPaperId] = useState(null)
  const [activeNceaPaper, setActiveNceaPaper] = useState(null)
  const [nceaPdfLevel, setNceaPdfLevel] = useState(1)
  const [nceaPdfYear, setNceaPdfYear] = useState(() => {
    const level1Years = nceaExamPdfs.filter(p => p.level === 1).map(p => p.year)
    return level1Years.length ? Math.max(...level1Years) : null
  })
  const [nceaPdfActive, setNceaPdfActive] = useState(null)
  const initialized = useRef(false)
  const nextLockedRef = useRef(false)
  const [nextLocked, setNextLocked] = useState(false)
  const [devTemplateSamples, setDevTemplateSamples] = useState([])
  const [devTemplateFilterSkill, setDevTemplateFilterSkill] = useState(null)

  // State for Group Test Mode
  const [groupCode, setGroupCode] = useState(null)
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [groupRegistryEntry, setGroupRegistryEntry] = useState(null)
  const [groupRegistryLoading, setGroupRegistryLoading] = useState(false)
  const [groupRegistryError, setGroupRegistryError] = useState('')
  const [groupSetupForm, setGroupSetupForm] = useState(() => ({
    teacherEmail: '',
    teacherPin: generateTeacherPin(),
    testTitle: '',
    year: selectedYear || config.defaultYear || 7,
    totalQuestions: 30,
    mode: 'full',
    focusedSkill: ''
  }))
  const [groupSetupStatus, setGroupSetupStatus] = useState({ submitting: false, success: false, error: '' })
  const [groupSetupResult, setGroupSetupResult] = useState(null)
  const [groupStudentName, setGroupStudentName] = useState('')
  const [groupStartTime, setGroupStartTime] = useState(null)
  const [groupScoreStatus, setGroupScoreStatus] = useState({ state: 'idle', message: '' })
  const [groupScores, setGroupScores] = useState([])
  const [groupScoresLoading, setGroupScoresLoading] = useState(false)
  const [groupScoresError, setGroupScoresError] = useState('')
  const [groupScoresFetchedAt, setGroupScoresFetchedAt] = useState(null)
  const [clientIp, setClientIp] = useState('')
  const [groupInputValue, setGroupInputValue] = useState(groupCodeFromUrl || '')
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [showGroupSetupSection, setShowGroupSetupSection] = useState(false)
  const [groupResultsPin, setGroupResultsPin] = useState('')
  const [resultLookupCode, setResultLookupCode] = useState('')
  const [resultLookupPin, setResultLookupPin] = useState('')
  const [resultLookupStatus, setResultLookupStatus] = useState({ state: 'idle', message: '' })
  const [resultLookupEntry, setResultLookupEntry] = useState(null)
  const [resultLookupScores, setResultLookupScores] = useState([])


  // Normalize number words for PLACE_VALUE "write in words" questions
  function normalizeNumberWords(str) {
    if (!str) return ''
    return String(str)
      .toLowerCase()
      // Treat hyphens as spaces so "twenty-five" == "twenty five"
      .replace(/-/g, ' ')
      // Ignore the word "and" so both "one hundred twenty three" and
      // "one hundred and twenty three" are accepted.
      .replace(/\band\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const openKnowledgeModal = () => {
    if (!question) return
    const skillId = question.skillId || selectedSkill
    if (!skillId) return

    const snippet = knowledgeSnippets[skillId] || null

    if (snippet) {
      setKnowledgeModal({ isOpen: true, snippet })
    } else {
      setKnowledgeModal({
        isOpen: true,
        snippet: {
          title: 'Concept reminder',
          summary: 'No specific concept reminder is available for this skill yet.',
          key_formulas: [],
          example: '',
          common_misconceptions: []
        }
      })
    }
  }

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
            // pass through any options supplied when the action was queued
            startTestInternal(action.options || {})
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
        startTestInternal(action.options || {})
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

  const sanitizeGroupCode = (value) => String(value || '').replace(/\D/g, '').slice(0, 7)
  const sanitizePin = (value) => String(value || '').replace(/\D/g, '').slice(0, 4)
  const sanitizeDigits = (value, maxLength) => String(value || '').replace(/\D/g, '').slice(0, maxLength)

  const updateGroupUrl = (targetPath, code) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.pathname = targetPath
    if (code) {
      url.searchParams.set('group', code)
    } else {
      url.searchParams.delete('group')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const CopyButton = ({ value, className = '', title = 'Copy to clipboard', variant = 'dark' }) => {
    const [copied, setCopied] = useState(false)
    const baseClasses =
      variant === 'light'
        ? 'text-xs px-2 py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 bg-white transition inline-flex items-center gap-1'
        : 'text-xs px-2 py-1 rounded-lg border border-white/30 text-white/80 hover:text-white hover:border-white transition inline-flex items-center gap-1'
    const handleCopy = () => {
      navigator.clipboard?.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    return (
      <button
        type="button"
        title={title}
        className={`${baseClasses} ${className}`}
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : '⧉'}
      </button>
    )
  }

  const scrollToCurriculumMap = () => {
    if (typeof document === 'undefined') return
    const el = document.getElementById('curriculum-map')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGroupSetupChange = (field, value) => {
    let nextValue = value
    if (field === 'teacherPin') {
      nextValue = sanitizePin(value)
    } else if (field === 'totalQuestions') {
      nextValue = sanitizeDigits(value, 3)
    }
    setGroupSetupForm(prev => {
      const updated = { ...prev, [field]: nextValue }
      if (field === 'mode' && value !== 'focused') {
        updated.focusedSkill = ''
      }
      if (field === 'year' && prev.focusedSkill) {
        updated.focusedSkill = ''
      }
      return updated
    })
  }

  const regenerateTeacherPin = () => {
    setGroupSetupForm(prev => ({ ...prev, teacherPin: generateTeacherPin() }))
  }

  const generateGroupCode = () => String(Math.floor(1000000 + Math.random() * 9000000))

  const createGroupTest = async (event) => {
    event?.preventDefault()
    if (groupSetupStatus.submitting) return

    const email = (groupSetupForm.teacherEmail || '').trim()
    if (!email || !email.includes('@')) {
      setGroupSetupStatus({ submitting: false, success: false, error: 'Enter a valid teacher email.' })
      return
    }
    const teacherPin = sanitizePin(groupSetupForm.teacherPin || '')
    if (teacherPin.length < 4) {
      setGroupSetupStatus({ submitting: false, success: false, error: 'Enter a 4-digit teacher PIN.' })
      return
    }

    const yearValue = parseInt(groupSetupForm.year, 10) || config.defaultYear || 7
    const totalQuestions = Math.max(5, Math.min(200, parseInt(groupSetupForm.totalQuestions, 10) || 30))
    const selectedMode = groupSetupForm.mode || 'full'

    // Validate focused mode has a skill selected
    if (selectedMode === 'focused' && !groupSetupForm.focusedSkill) {
      setGroupSetupStatus({ submitting: false, success: false, error: 'Please select a topic for focused mode.' })
      return
    }

    const modeValue = selectedMode.startsWith('focused:')
      ? selectedMode
      : selectedMode === 'focused' && groupSetupForm.focusedSkill
        ? `focused:${groupSetupForm.focusedSkill}`
        : selectedMode

    const payload = {
      groupCode: generateGroupCode(),
      teacherEmail: email,
      teacherPin,
      testTitle: groupSetupForm.testTitle || `Year ${yearValue} group test`,
      year: String(yearValue),
      mode: modeValue,
      totalQuestions: String(totalQuestions)
    }
    console.log('=== PAYLOAD DEBUG ===')
    console.log('Full payload:', payload)
    console.log('teacherPin in payload:', payload.teacherPin)
    console.log('teacherPin type:', typeof payload.teacherPin)
    console.log('teacherPin length:', payload.teacherPin?.length)
    console.log('groupSetupForm.teacherPin (raw):', groupSetupForm.teacherPin)
    console.log('sanitized teacherPin variable:', teacherPin)
    console.log('=== END DEBUG ===')

    setGroupSetupStatus({ submitting: true, success: false, error: '' })
    setGroupSetupResult(null)

    try {
      const response = await registerGroup(payload)
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || 'Failed to create group test.')
      }
      setGroupSetupStatus({ submitting: false, success: true, error: '' })
      setGroupSetupResult(payload)
    } catch (error) {
      setGroupSetupStatus({
        submitting: false,
        success: false,
        error: error?.message || 'Could not create group test. Try again.'
      })
    }
  }

  const loadGroupFromRegistry = async (code, options = {}) => {
    const normalizedCode = sanitizeGroupCode(code)
    if (!normalizedCode) {
      setGroupRegistryEntry(null)
      return
    }

    setGroupRegistryLoading(true)
    setGroupRegistryError('')

    try {
      const registryParams = { groupCode: normalizedCode }
      if (options.teacherPin) {
        registryParams.teacherPin = options.teacherPin
      }
      const data = await getRegistry(registryParams)
      const rows = Array.isArray(data) ? data : data?.rows || []
      const matches = rows.filter(row => sanitizeGroupCode(row.groupCode || row.groupcode) === normalizedCode)

      if (!matches.length) {
        throw new Error('Group code not found yet. Check the code with your teacher.')
      }

      let selected = matches[matches.length - 1]
      if (options.teacherPin) {
        const pinMatches = matches.filter(row => sanitizePin(row.teacherPin || row.teacherpin || '') === options.teacherPin)
        if (!pinMatches.length) {
          throw new Error('Incorrect teacher PIN or group code.')
        }
        selected = pinMatches[pinMatches.length - 1]
      }

      const entry = {
        groupCode: normalizedCode,
        teacherEmail: selected.teacherEmail || selected.teacheremail || '',
        testTitle: selected.testTitle || selected.testtitle || '',
        year: parseInt(selected.year, 10) || null,
        mode: selected.mode || 'full',
        totalQuestions: parseInt(selected.totalQuestions, 10) || 30,
        created: selected.created || selected.Created || selected.Timestamp || ''
      }

      setGroupRegistryEntry(entry)
      setGroupRegistryError('')
      setIsGroupMode(true)
    } catch (error) {
      const message = error?.message || 'Could not load group info.'
      setGroupRegistryEntry(null)
      setGroupRegistryError(message)
      if (options.teacherPin) {
        setGroupScores([])
        setGroupScoresError(message)
        throw new Error(message)
      }
    } finally {
      setGroupRegistryLoading(false)
    }
  }

  const handleGroupCodeSubmit = async (event, targetMode) => {
    event.preventDefault()
    const normalized = sanitizeGroupCode(groupInputValue)
    if (!normalized) {
      setGroupRegistryError('Enter a 7-digit group code.')
      return
    }
    let pinForResults = ''
    if (targetMode === 'results') {
      setGroupRegistryEntry(null)
      setGroupScores([])
      setGroupScoresError('')
      pinForResults = sanitizePin(groupResultsPin)
      if (pinForResults.length < 4) {
        setGroupRegistryError('Enter your teacher PIN to unlock group results.')
        return
      }
      setGroupResultsPin(pinForResults)
    } else {
      setGroupResultsPin('')
    }
    setGroupRegistryError('')
    setGroupScores([])
    setGroupCode(normalized)
    if (targetMode === 'results') {
      try {
        await unlockGroupResults(normalized, pinForResults)
        updateGroupUrl('/results', normalized)
        setMode('group-results')
      } catch (error) {
        const message = error?.message || 'Could not load group info.'
        setGroupRegistryError(message)
        return
      }
    } else {
      updateGroupUrl('/', '')
      setMode('group-lobby')
    }
  }

  const startGroupTestSession = () => {
    if (!groupRegistryEntry) {
      setGroupRegistryError('Group details are still loading. Please wait a moment.')
      return
    }

    const studentName = groupStudentName.trim()
    if (!studentName) {
      setGroupRegistryError('Enter your name so your teacher can see your score.')
      return
    }

    const totalQuestions = Math.max(5, parseInt(groupRegistryEntry.totalQuestions, 10) || 30)
    const yearForTest = groupRegistryEntry.year || selectedYear || config.defaultYear || 7
    const questions = generateGroupTest(
      { year: yearForTest, totalQuestions, seed: groupRegistryEntry.groupCode, mode: groupRegistryEntry.mode },
      curriculumData
    )

    if (!questions.length) {
      setGroupRegistryError('No questions available for this year. Try another year level.')
      return
    }

    setHistory(questions)
    setCurrentIndex(0)
    setScore(0)
    setIsTestMode(true)
    setIsGroupMode(true)
    setSelectedSkill(null)
    setAnswer('')
    setSelectedChoiceIndex(null)
    setFeedback('')
    setGroupStartTime(new Date())
    setGroupScoreStatus({ state: 'idle', message: '' })
    setMode('test')
  }

  const submitGroupResults = async (results, scoringHistory = null) => {
    if (!groupCode || !groupRegistryEntry) return

    const endTime = new Date()
    const durationSec = groupStartTime ? Math.max(0, Math.round((endTime - groupStartTime) / 1000)) : 0
    const sourceHistory = Array.isArray(scoringHistory) ? scoringHistory : history
    const wrongQuestions = sourceHistory
      .filter(q => q.answered && !q.isCorrect)
      .map(q => ({
        qid: q.id || q.templateId || q.skill || q.skillId || 'unknown',
        topic: q.topic || q.skill || q.skillName || '',
        studentAnswer: q.userAnswer || '',
        correctAnswer: q.answer || ''
      }))

    const payload = {
      groupCode,
      studentName: groupStudentName.trim() || 'Anonymous',
      score: String(results.correctAnswers),
      totalQuestions: String(results.totalQuestions),
      percent: String(results.percentageScore),
      startTime: groupStartTime ? groupStartTime.toISOString() : '',
      endTime: endTime.toISOString(),
      durationSec: String(durationSec),
      ipAddress: clientIp || '',
      wrongQuestions: JSON.stringify(wrongQuestions)
    }

    setGroupScoreStatus({ state: 'saving', message: 'Sending your score to your teacher...' })
    try {
      const response = await submitScore(payload)
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || 'Failed to submit score.')
      }
      setGroupScoreStatus({ state: 'success', message: 'Score sent to your teacher.' })
    } catch (error) {
      setGroupScoreStatus({
        state: 'error',
        message: error?.message || 'Could not send your score. You can retry from this page.'
      })
    }
  }

  const loadGroupScores = async (code, options = {}) => {
    const normalizedCode = sanitizeGroupCode(code)
    if (!normalizedCode) return

    const pinForScores = options.teacherPin ? sanitizePin(options.teacherPin) : ''
    setGroupScoresLoading(true)
    setGroupScoresError('')

    try {
      const data = await fetchGroupScores(normalizedCode, pinForScores)
      const rows = Array.isArray(data) ? data : data?.rows || []
      const parsed = rows
        .filter(row => sanitizeGroupCode(row.groupCode || row.groupcode) === normalizedCode)
        .map(row => {
          let wrong = []
          try {
            const raw = row.wrongQuestions || row.wrongquestions || '[]'
            wrong = JSON.parse(raw || '[]')
          } catch (e) {
            wrong = []
          }
          return {
            timestamp: row.Timestamp || row.timestamp || '',
            studentName: row.studentName || row.studentname || 'Anonymous',
            score: Number(row.score) || 0,
            totalQuestions: Number(row.totalQuestions || row.totalquestions) || 0,
            percent: Number(row.percent) || 0,
            startTime: row.startTime || row.starttime || '',
            endTime: row.endTime || row.endtime || '',
            durationSec: Number(row.durationSec || row.durationsec) || null,
            ipAddress: row.ipAddress || row.ipaddress || '',
            wrongQuestions: Array.isArray(wrong) ? wrong : []
          }
        })
        .sort((a, b) => b.percent - a.percent)

      setGroupScores(parsed)
      setGroupScoresFetchedAt(new Date())
    } catch (error) {
      const message = error?.message || 'Could not load scores.'
      setGroupScoresError(message)
      setGroupScores([])
    } finally {
      setGroupScoresLoading(false)
    }
  }

  const lookupGroupResults = async (event) => {
    event?.preventDefault()
    const code = sanitizeGroupCode(resultLookupCode)
    const pin = sanitizePin(resultLookupPin)
    if (!code || pin.length < 4) {
      setResultLookupStatus({ state: 'error', message: 'Enter the group code and 4-digit teacher PIN.' })
      return
    }

    setResultLookupStatus({ state: 'loading', message: 'Loading results...' })
    setResultLookupEntry(null)
    setResultLookupScores([])

    try {
      const registryData = await getRegistry({ groupCode: code, teacherPin: pin })
      const registryRows = Array.isArray(registryData) ? registryData : registryData?.rows || []
      const filtered = registryRows.filter(row => sanitizeGroupCode(row.groupCode || row.groupcode) === code)
      const pinMatches = filtered.filter(row => sanitizePin(row.teacherPin || row.teacherpin || '') === pin)
      if (!pinMatches.length) {
        throw new Error('Incorrect teacher PIN or group code.')
      }
      const match = pinMatches[pinMatches.length - 1]

      const entry = {
        groupCode: code,
        teacherEmail: match.teacherEmail || match.teacheremail || '',
        testTitle: match.testTitle || match.testtitle || '',
        year: match.year || '',
        mode: match.mode || 'full',
        totalQuestions: match.totalQuestions || match.totalquestions || '',
        created: match.created || match.Created || match.Timestamp || ''
      }
      setResultLookupEntry(entry)

      const scoresData = await fetchGroupScores(code)
      const scoreRows = Array.isArray(scoresData) ? scoresData : scoresData?.rows || []
      const parsedScores = scoreRows
        .filter(row => sanitizeGroupCode(row.groupCode || row.groupcode) === code)
        .map(row => ({
          groupCode: row.groupCode || row.groupcode || '',
          studentName: row.studentName || row.studentname || 'Anonymous',
          score: Number(row.score || row.Score || 0),
          total: Number(row.totalQuestions || row.totalquestions || 0),
          percent: Number(row.percent || row.Percent || 0),
          submitted: row.endTime || row.endtime || row.Timestamp || new Date().toISOString(),
          wrongTopics: (() => {
            try {
              const raw = row.wrongQuestions || row.wrongquestions || '[]'
              const parsed = JSON.parse(raw)
              if (!Array.isArray(parsed)) return []
              return parsed
                .map(item => item.topic || item.skill || item.qid || '')
                .filter(Boolean)
                .slice(0, 5)
            } catch {
              return []
            }
          })()
        }))

      setResultLookupScores(parsedScores)
      setResultLookupStatus({
        state: 'success',
        message: parsedScores.length
          ? `Loaded ${parsedScores.length} student attempts.`
          : 'Group found, but no student attempts yet.'
      })
    } catch (error) {
      setResultLookupEntry(null)
      setResultLookupScores([])
      setResultLookupStatus({ state: 'error', message: error?.message || 'Failed to load group results.' })
    }
  }

  const unlockGroupResults = async (code, pin) => {
    const normalizedCode = sanitizeGroupCode(code)
    const normalizedPin = sanitizePin(pin)
    if (!normalizedCode || normalizedPin.length < 4) {
      setGroupRegistryError('Enter your group code and 4-digit teacher PIN.')
      setGroupScores([])
      setGroupScoresError('')
      return
    }
    setGroupScoresError('')
    await loadGroupFromRegistry(normalizedCode, { teacherPin: normalizedPin })
    await loadGroupScores(normalizedCode, { teacherPin: normalizedPin })
  }

  const formatDuration = (seconds) => {
    if (seconds === null || typeof seconds === 'undefined') return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins <= 0) return `${secs}s`
    return `${mins}m ${secs.toString().padStart(2, '0')}s`
  }

  const exitGroupMode = () => {
    setIsGroupMode(false)
    setGroupCode(null)
    setGroupRegistryEntry(null)
    setGroupRegistryError('')
    setGroupStudentName('')
    setGroupStartTime(null)
    setGroupScoreStatus({ state: 'idle', message: '' })
    setShowGroupMenu(false)
    setGroupResultsPin('')
    if (typeof window !== 'undefined') {
      updateGroupUrl('/', '')
    }
  }

  const openGroupSetup = () => {
    setShowGroupSetupSection(true)
    setShowGroupMenu(false)
    setTimeout(() => {
      const el = document.getElementById('group-test-setup')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const openEnterGroupCode = () => {
    setIsGroupMode(true)
    setGroupRegistryEntry(null)
    setGroupRegistryError('')
    setGroupStudentName('')
    setGroupCode('')
    setGroupInputValue('')
    setGroupResultsPin('')
    setShowGroupMenu(false)
    setMode('group-lobby')
    updateGroupUrl('/', '')
  }

  useEffect(() => {
    if (groupCodeFromUrl) {
      console.log('Group mode activated via URL. Code:', groupCodeFromUrl)
      setIsGroupMode(true)
      setGroupCode(groupCodeFromUrl)
      if (path === '/results') {
        setMode('group-results')
      } else {
        setMode('group-lobby')
      }
    }
  }, [groupCodeFromUrl, path])

  useEffect(() => {
    setGroupInputValue(groupCode || '')
  }, [groupCode])

  useEffect(() => {
    if (!groupCode) return
    if (mode !== 'group-lobby') return
    loadGroupFromRegistry(groupCode)
  }, [groupCode, mode])

  useEffect(() => {
    if (!isGroupMode || clientIp) return
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIp(data?.ip || ''))
      .catch(() => {})
  }, [isGroupMode, clientIp])

  const question = history[currentIndex]
  const isWordsQuestion = question?.skillId?.includes('PLACE_VALUE') &&
    (question?.question || '').toLowerCase().includes('in words')
  const isMultipleChoice = Array.isArray(question?.choices) && question.choices.length > 0
  const availableYears = getAvailableYears(curriculumData)
  const lastQuestionIndexRef = useRef(-1)

  // Mark questions as finalised once we navigate away from them, so score/progress
  // can't be changed later (except in dev mode).
  useEffect(() => {
    const last = lastQuestionIndexRef.current
    if (last !== -1 && last !== currentIndex) {
      setHistory(prev => {
        if (last < 0 || last >= prev.length) return prev
        const updated = [...prev]
        updated[last] = { ...updated[last], finalised: true }
        return updated
      })
    }
    lastQuestionIndexRef.current = currentIndex
  }, [currentIndex])

  // Build a simple step-by-step solution explanation for selected harder templates
  const buildSolutionSteps = (q) => {
    if (!q || !q.templateId || !q.params) return null
    const id = q.templateId
    const p = q.params

    // Year 12/13 calculus velocity and area
    if (id === 'Y13.C.CALCULUS_INTEGRAL.T5') {
      const a = p.a
      const b = p.b
      const value = (a * b * b) / 2
      return `Work: ∫₀^${b} ${a}x dx = [${a}x²/2]₀^${b} = ${a}·${b}²/2 = ${value}.`
    }
    if (id === 'Y13.C.CALCULUS_INTEGRAL.T6') {
      const a = p.a
      const b = p.b
      const value = (a * b * b * b) / 3
      return `Work: ∫₀^${b} ${a}x² dx = [${a}x³/3]₀^${b} = ${a}·${b}³/3 = ${value}.`
    }
    if (id === 'Y13.C.CALCULUS_APPLICATIONS.T4') {
      const a = p.a
      const t = p.t
      const b = p.b
      const value = 2 * a * t + b
      return `Work: s(t) = ${a}t² + ${b}t ⇒ v(t) = 2·${a}·t + ${b}. At t = ${t}, v = 2·${a}·${t} + ${b} = ${value}.`
    }
    if (id === 'Y12.C.CALCULUS_APPLICATIONS.T2') {
      const a = p.a
      const t0 = p.t0
      const b = p.b
      const value = 2 * a * t0 + b
      return `Work: s(t) = ${a}t² + ${b}t ⇒ v(t) = 2·${a}·t + ${b}. At t = ${t0}, v = 2·${a}·${t0} + ${b} = ${value}.`
    }
    if (id === 'Y12.G.VECTOR_OPS.T2') {
      const a = p.a
      const b = p.b
      const inside = a * a + b * b
      return `Work: |⟨${a}, ${b}⟩| = √(${a}² + ${b}²) = √(${inside}).`
    }
    if (id === 'Y12.A.MATRIX_OPS.T2') {
      const a = p.a
      const b = p.b
      const c = p.c
      const d = p.d
      const det = a * d - b * c
      return `Work: det([[${a}, ${b}], [${c}, ${d}]]) = ${a}·${d} − ${b}·${c} = ${det}.`
    }
    if (id === 'Y11.C.CALCULUS_DIFF.T1') {
      const a = p.a
      const b = p.b
      return `Work: f(x) = ${a}x² + ${b}x + ${p.c} ⇒ f'(x) = 2·${a}·x + ${b}.`
    }
    if (id === 'Y11.C.CALCULUS_DIFF.T2') {
      const a = p.a
      const b = p.b
      return `Work: y = ${a}x³ + ${b}x² ⇒ dy/dx = 3·${a}·x² + 2·${b}·x.`
    }
    if (id === 'Y11.C.CALCULUS_DIFF.T3') {
      const a = p.a
      const x0 = p.x0
      const value = 2 * a * x0
      return `Work: y = ${a}x² ⇒ dy/dx = 2·${a}·x. At x = ${x0}, gradient = 2·${a}·${x0} = ${value}.`
    }

    return null
  }

  // Dev helper: build JSON for template inspector (respects current filter)
  const buildDevTemplatesJson = () => {
    const allTemplates = curriculumData.years
      .filter(y => y.year === curriculumMapYear)
      .flatMap(y =>
        (y.skills || []).flatMap(skill =>
          (skill.templates || []).map(t => ({
            year: y.year,
            skillId: skill.id,
            skillName: skill.name,
            template: t
          }))
        )
      )

    const filtered = devTemplateFilterSkill
      ? allTemplates.filter(t => t.skillId === devTemplateFilterSkill)
      : allTemplates

    return JSON.stringify(filtered, null, 2)
  }

  // Dynamic SEO: update document title and meta description based on view
  useEffect(() => {
    let title = 'Mathx.nz – Free NZ Maths Practice'
    let description =
      'Practice New Zealand maths curriculum questions for Years 6–10 and NCEA, free and adaptive with no ads.'

    const yearLabel = selectedYear ? `Year ${selectedYear}` : null

    if (mode === 'practice' && selectedSkill) {
      // Find the skill metadata
      const yearData = curriculumData.years.find(y => y.year === selectedYear)
      const skill =
        yearData && yearData.skills.find(s => s.id === selectedSkill)

      if (skill) {
        title = `Practice ${yearLabel} – ${skill.name} | Mathx.nz`
        description = skill.description
          ? `${skill.description} Practice questions for ${yearLabel} on Mathx.nz.`
          : `Practice ${skill.name} for ${yearLabel} on Mathx.nz.`
      }
    } else if (mode === 'test') {
      if (selectedYear) {
        title = `Full ${yearLabel} Maths Test | Mathx.nz`
        description = `Take a full adaptive maths assessment for ${yearLabel}, covering all strands of the NZ curriculum.`
      } else if (activeNceaPaperId) {
        title = `NCEA Trial Exam – ${activeNceaPaperId} | Mathx.nz`
        description = 'Sit a timed NCEA-style trial exam using real exam-style questions.'
      } else {
        title = 'Full Maths Assessment | Mathx.nz'
        description =
          'Take a full adaptive maths assessment across multiple years and strands to identify strengths and gaps.'
      }
    } else if (mode === 'test-results') {
      const hasCertificate =
        !!currentUser?.username &&
        typeof testResults?.percentageScore === 'number' &&
        testResults.percentageScore >= 50

      if (hasCertificate) {
        title = "Congratulations, You've Earned Your Certification! | Mathx.nz"
        description =
          'You have earned your Mathx.nz certificate. Review your strengths and keep practicing to stay sharp.'
      } else {
        title = "Ready to try again? Here's what to review... | Mathx.nz"
        description =
          'Review your maths assessment results, see which topics you are strong in and where you can improve before your next attempt.'
      }
    } else if (mode === 'practice-results') {
      title = 'Practice Session Summary | Mathx.nz'
      description =
        'See how you performed in your recent practice session and which skills to focus on next.'
    } else if (mode === 'ncea-index') {
      title = 'NCEA Trial Exams – Level 1 | Mathx.nz'
      description =
        'Browse and start NCEA Level 1 trial exams built from real exam-style questions, including algebra and reasoning.'
    } else if (mode === 'ixl-alternative') {
      title = 'A Free Alternative to IXL for NZ Maths Practice | Mathx.nz'
      description =
        'Learn how Mathx.nz offers a free, New Zealand curriculum–focused alternative to IXL, with no ads and no paywalls.'
    } else if (mode === 'landing') {
      title = 'Mathx.nz – Free Maths Practice for NZ Students'
      description =
        'Free, adaptive maths practice for New Zealand students. Identify knowledge gaps and build fluency in every topic from Year 6 to NCEA.'
    }

    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [mode, selectedYear, selectedSkill, activeNceaPaperId, curriculumData])

  // Dev-only: generate a sample question/answer for every template in the selected year
  useEffect(() => {
    if (!isDevMode) {
      setDevTemplateSamples([])
      return
    }

    const rows = []
    curriculumData.years.forEach(year => {
      if (year.year !== curriculumMapYear) return
      year.skills.forEach(skill => {
        const templates = skill.templates || []
        templates.forEach(template => {
          // Optional phase filter for dev mode (e.g., ?dev=true&phase=8)
          const tmplPhase = typeof template.phase === 'number' ? template.phase : null
          const skillPhase = typeof skill.phase === 'number' ? skill.phase : null
          if (phaseFilter && tmplPhase !== phaseFilter && skillPhase !== phaseFilter) {
            return
          }
          try {
            const q = generateQuestionFromTemplate(template, skill.name, year.year)
            rows.push({
              templateId: template.id || '',
              skillId: skill.id,
              skillName: skill.name,
              year: year.year,
              question: q.question,
              answer: q.formattedAnswer || q.answer,
              isNew: !!(template.isNew || skill.isNew)
            })
          } catch (e) {
            rows.push({
              templateId: template.id || '',
              skillId: skill.id,
              skillName: skill.name,
              year: year.year,
              question: 'Error generating question',
              answer: '0',
              isNew: !!(template.isNew || skill.isNew)
            })
          }
        })
      })
    })

    setDevTemplateSamples(rows)
  }, [isDevMode, curriculumMapYear])

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

        // Handle exponents and fractions for display
        const superscripts = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

        // Buffer exponent fractions like ^(1/2) so they are rendered inline (not stacked)
        const expPlaceholders = []
        cleanQuestion = cleanQuestion.replace(/\^\(([^)]+)\)/g, (m, inner) => {
          const s = inner.trim()
          if (/^-?\d+$/.test(s)) {
            // integer exponent -> convert each digit to superscript (preserve minus)
            return Array.from(s).map(ch => ch === '-' ? '⁻' : superscripts[ch] || ch).join('')
          }
          if (/^-?\d+\s*\/\s*\d+$/.test(s)) {
            // fractional exponent -> keep as inline superscript but avoid stacked fraction conversion
            const idx = expPlaceholders.length
            expPlaceholders.push(`<sup>${s.replace(/\s+/g, '')}</sup>`)
            return `__EXP_FRAC_${idx}__`
          }
          // general fallback: wrap in <sup>
          return `<sup>${s}</sup>`
        })

        // Replace simple caret exponents like ^2 or ^-3
        cleanQuestion = cleanQuestion.replace(/\^-(\d)/g, (m, d) => '⁻' + (superscripts[d] || d))
        cleanQuestion = cleanQuestion.replace(/\^(\d)/g, (m, d) => superscripts[d] || d)

        // Format mixed numbers: "4 2/10" → display with proper spacing
        cleanQuestion = cleanQuestion.replace(/(\d+)\s+(\d+)\/(\d+)/g, '$1 \u00A0$2/$3')

        // Replace other common patterns
        cleanQuestion = cleanQuestion.replace(/\*/g, '×')
        // NOTE: avoid replacing the variable 'x' (common in algebra). Do not convert 'x' to multiplication symbol.

        // Clean up any remaining LaTeX backslashes
        cleanQuestion = cleanQuestion.replace(/\\/g, '')

        // Use HTML for better fraction display, but do not convert exponent placeholders
        const fractionHtml = '<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;font-size:0.8em;border-bottom:1px solid currentColor;padding:0 3px;">$1</span><span style="display:block;font-size:0.8em;padding:0 3px;">$2</span></span>'
        let html = cleanQuestion.replace(/(\d+)\/(\d+)/g, fractionHtml)
        html = html.replace(/__EXP_FRAC_(\d+)__/g, (m, idx) => expPlaceholders[parseInt(idx, 10)] || '')
        elem.innerHTML = html
      }
      setAnswer(question.userAnswer || '')
      if (Array.isArray(question.choices) && question.choices.length > 0) {
        const idx = question.choices.findIndex(choice => choice === (question.userAnswer || ''))
        setSelectedChoiceIndex(idx >= 0 ? idx : null)
      } else {
        setSelectedChoiceIndex(null)
      }
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
      setSelectedChoiceIndex(null)
      setFeedback('')
    } else {
      // No more questions, optionally generate more or go back to menu
      backToMenu()
    }
  }

  const appendSymbol = (symbol) => {
    setSelectedChoiceIndex(null)
    setAnswer(prev => prev + symbol)
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
    // Prevent the practice-mode useEffect from auto-advancing to the next question
    // when we have just seeded a fresh question set here.
    initialized.current = true

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
    setSelectedChoiceIndex(null)
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
  // Accepts optional overrides: { onlyNew, allYears, onePerTemplate, totalQuestions }
  const startTestInternal = (opts = {}) => {
    const options = {
      onlyNew: typeof opts.onlyNew !== 'undefined' ? opts.onlyNew : onlyNewInTest,
      allYears: typeof opts.allYears !== 'undefined' ? opts.allYears : testScopeAllYears,
      onePerTemplate: typeof opts.onePerTemplate !== 'undefined' ? opts.onePerTemplate : auditOnePerTemplate
    }
    const totalQ = typeof opts.totalQuestions !== 'undefined' ? opts.totalQuestions : 60
    const yearForTest = selectedYear || 6 // Always have a valid year for generator
    const testQuestions = generateTest(yearForTest, totalQ, options)  // Generate requested number of questions
    setHistory(testQuestions)
    setCurrentIndex(0)
    setScore(0)
    setIsTestMode(true)
    setSelectedSkill(null)
    setAnswer('')
    setSelectedChoiceIndex(null)
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

  // Start an all-years test (non-audit) — public API that respects login flow
  const startAllYearsTest = () => {
    const opts = { allYears: true, onlyNew: false, onePerTemplate: false, totalQuestions: 100 }
    if (!currentUser) {
      setPendingAction({ type: 'test', options: opts })
      initialized.current = true
      setMode('test')
      setShowLoginRecommendation(true)
      return
    }
    startTestInternal(opts)
  }

  const gradeFromPercentage = percentage => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 80) return 'A-'
    if (percentage >= 75) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 65) return 'B-'
    if (percentage >= 60) return 'C+'
    if (percentage >= 55) return 'C'
    if (percentage >= 50) return 'C-'
    return 'D'
  }

  const finishTest = () => {
    // Check the current question's answer if it hasn't been checked yet
    if (question && !question.answered && answer.trim()) {
      // Manually check the answer and update history inline to avoid state timing issues
      let isCorrect = false

      try {
        // Word-based place-value questions
        if (question?.skillId?.includes('PLACE_VALUE') && (question?.question || '').toLowerCase().includes('in words')) {
          const userNorm = normalizeNumberWords(answer.trim())
          const correctNorm = normalizeNumberWords(question.answer)
          isCorrect = userNorm === correctNorm
        } else {
          // Try numeric/fraction comparison
          const userAnswerNum = normalizeFraction(answer.trim())
          const correctAnswerNum = normalizeFraction(question.answer)

          if (!Number.isNaN(userAnswerNum) && !Number.isNaN(correctAnswerNum)) {
            isCorrect = Math.abs(userAnswerNum - correctAnswerNum) < 0.01
          } else {
            // Text comparison
            const ua = String(answer).trim().toLowerCase().replace(/["'\s]+/g, ' ')
            const ca = String(question.answer).trim().toLowerCase().replace(/["'\s]+/g, ' ')
            const normalizeText = s => s.replace(/\b(a |an |the )\b/g, '').replace(/\bsquares?\b/g, 'square').trim()
            isCorrect = normalizeText(ua) === normalizeText(ca)
          }
        }
      } catch (e) {
        isCorrect = false
      }

      // Update history with the checked answer
      const updatedHistory = [...history]
      const feedbackMsg = isCorrect ? 'Correct! ✅' : (isGroupMode && !isDevMode ? 'Wrong ❌' : `Wrong ❌ Answer: ${question.formattedAnswer || question.answer}`)
      updatedHistory[currentIndex] = {
        ...updatedHistory[currentIndex],
        userAnswer: answer,
        userFeedback: feedbackMsg,
        isCorrect: isCorrect,
        answered: true
      }

      // Update state and show feedback briefly before finishing
      setHistory(updatedHistory)
      setFeedback(feedbackMsg)

      // Update score if correct
      if (isCorrect) {
        setScore(s => s + 1)
      }

      // Give user a moment to see the feedback, then finish
      setTimeout(() => {
        finishTestInternal(updatedHistory)
      }, 800)
      return
    }

    finishTestInternal()
  }

  const finishTestInternal = (historyToUse = null) => {
    const baseHistory = historyToUse || history
    const scoringHistory = isGroupMode
      ? baseHistory.map(q => (q.answered ? q : { ...q, answered: true, isCorrect: false }))
      : baseHistory

    const results = calculateTestResults(scoringHistory)
    const normalizedResults = { ...results }
    if (isGroupMode) {
      normalizedResults.incorrectAnswers += normalizedResults.unanswered
      normalizedResults.unanswered = 0
      const total = normalizedResults.totalQuestions
      normalizedResults.percentageScore = total > 0
        ? Math.round((normalizedResults.correctAnswers / total) * 100)
        : 0
      normalizedResults.grade = gradeFromPercentage(normalizedResults.percentageScore)
    }

    // Ensure grade is always set even for non-group tests
    if (!normalizedResults.grade) {
      normalizedResults.grade = gradeFromPercentage(normalizedResults.percentageScore)
    }

    console.log('=== TEST RESULTS DEBUG ===')
    console.log('Percentage:', normalizedResults.percentageScore)
    console.log('Grade:', normalizedResults.grade)
    console.log('Correct:', normalizedResults.correctAnswers, '/', normalizedResults.totalQuestions)
    console.log('=== END DEBUG ===')

    setTestResults(normalizedResults)
    if (isGroupMode && groupCode) {
      submitGroupResults(normalizedResults, scoringHistory)
    }

    // Save test result to storage and practice history for normal curriculum tests.
    // For NCEA trials, we skip storage (selectedYear will be null).
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
    if (isGroupMode) {
      exitGroupMode()
    }
    // If we're in an NCEA trial, return to the NCEA index instead of the main landing page
    if (isTestMode && activeNceaPaper) {
      setMode('ncea-index')
      setHistory([])
      setCurrentIndex(-1)
      setScore(0)
      setIsTestMode(false)
      setTestResults(null)
      setPracticeResults(null)
      setActiveNceaPaper(null)
      setActiveNceaPaperId(null)
      initialized.current = false
      return
    }

    // Normal curriculum flow
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

    // In test mode, lock Next to avoid double-click skips while feedback shows
    if (isTestMode) {
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
          setCurrentIndex(prev => prev + 1)
        }
        // Unlock Next after navigation
        if (isTestMode) {
          nextLockedRef.current = false
          setNextLocked(false)
        }
      }, 1500)
    } else {
      // Already answered or no answer, just move to next
      setAttempts(0)
      setShowCorrectAnswer(false)
      if (currentIndex < history.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
      // Unlock Next after navigation
      if (isTestMode) {
        nextLockedRef.current = false
        setNextLocked(false)
      }
    }
  }

    const checkAnswer = () => {
        if (!question) return
        // Prevent re-answering when a question is finalised or the correct answer was already revealed,
        // except in dev mode where auditing is allowed.
        const alreadyRevealed = (question.userFeedback || '').includes('The correct answer is')
        if (!isDevMode && (question.finalised || alreadyRevealed)) return

        if (!answer.trim()) {
        // For number-to-words questions, gently prompt the student to build an answer
        if (isWordsQuestion) {
          setFeedback('Please click words above to build your answer first.')
        }
        return
      }

    try {
      let newFeedback = ''
      let isCorrect = false

      if (isMultipleChoice) {
        const userChoice = answer.trim()
        const correctChoice = String(question.answer || '').trim()
        if (userChoice && userChoice === correctChoice) {
          newFeedback = 'Correct! ✅.'
          isCorrect = true
        }
      } else if (question?.skillId?.includes('PLACE_VALUE') && (question?.question || '').toLowerCase().includes('in words')) {
        const userNorm = normalizeNumberWords(answer.trim())
        const correctNorm = normalizeNumberWords(question.answer)
        if (userNorm === correctNorm) {
          newFeedback = 'Correct! ✅'
          isCorrect = true
        }
      } else {
        // Try numeric/fraction comparison first
        const userAnswerNum = normalizeFraction(answer.trim())
        const correctAnswerNum = normalizeFraction(question.answer)

        if (!Number.isNaN(userAnswerNum) && !Number.isNaN(correctAnswerNum)) {
          if (Math.abs(userAnswerNum - correctAnswerNum) < 0.01) {
            newFeedback = 'Correct! ✅'
            isCorrect = true
          }
        } else {
          // Fallback: text comparison for word answers (e.g., 'Cube')
          const ua = String(answer).trim().toLowerCase().replace(/["'\s]+/g, ' ')
          const ca = String(question.answer).trim().toLowerCase().replace(/["'\s]+/g, ' ')
          // Accept some simple synonyms and normalize plurals
          const normalizeText = s => s.replace(/\b(a |an |the )\b/g, '').replace(/\bsquares?\b/g, 'square').trim()
          if (normalizeText(ua) === normalizeText(ca)) {
            newFeedback = 'Correct! ✅'
            isCorrect = true
          }
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

        const displayAnswer = question.formattedAnswer || question.answer
        if (isTestMode) {
          // In group mode, hide answers unless dev mode is enabled (teacher can add &dev=true to URL)
          if (isGroupMode && !isDevMode) {
            newFeedback = `Wrong ❌`
          } else {
            newFeedback = `Wrong ❌ Answer: ${displayAnswer}`
          }
        } else {
          if (newAttempts >= 2) {
            setShowCorrectAnswer(true)
            newFeedback = `Wrong ❌ The correct answer is: ${displayAnswer}`
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

    // Default (regular curriculum) context
    let yearField = selectedYear || 'N/A'
    let topicField = `${question.strand || ''} - ${question.topic || ''} - ${question.skill || ''}`.trim()

    // If this is an NCEA trial question, prefer exam metadata
    if (question.source === 'NCEA') {
      const std = question.examStandard || activeNceaPaper?.standard
      const yr = question.examYear || activeNceaPaper?.year
      const qNum = question.examQuestionNumber
      const part = question.examPartLabel

      if (std || yr) {
        yearField = `NCEA Level 1 ${yr || ''} (Standard ${std || ''})`.trim()
      }

      const partsLabel =
        qNum != null
          ? `Q${qNum}${part ? ` (${part})` : ''}`
          : ''

      topicField = [
        'NCEA Level 1',
        std ? `Std ${std}` : '',
        yr ? `Year ${yr}` : '',
        partsLabel
      ]
        .filter(Boolean)
        .join(' - ')
    }

    const reportData = {
      question: question.question || 'N/A',
      answer: `User: ${answer || 'N/A'}, Correct: ${question.answer || 'N/A'}`,
      year: yearField,
      topic: topicField
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
          // Unlock Next button after navigation/finish
          nextLockedRef.current = false
          setNextLocked(false)
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
        // Unlock Next button after navigation/finish
        nextLockedRef.current = false
        setNextLocked(false)
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
    } else if (skillName.includes('transversal') || skillName.includes('transversals') || id && id.includes('TRANSVERSALS')) {
      hint += 'Transversals & Angle Relationships:\n';
      hint += '\n- Alternate interior angles: equal (e.g. the two interior angles on opposite sides of the transversal are equal).';
      hint += '\n- Corresponding angles: equal (same relative corner position at each intersection).';
      hint += '\n- Alternate exterior angles: equal (outside the parallel lines, opposite sides of the transversal).';
      hint += '\n- Same-side interior (consecutive interior) angles: supplementary (add to 180°).';
      hint += '\n- Same-side exterior (consecutive exterior) angles: supplementary (add to 180°).';
      hint += '\n- Vertical (opposite) angles at an intersection: equal.';
      hint += '\n\nTip: Find the given angle position first (interior/exterior, left/right, above/below). Then use the relationship above to find the target angle.';
      hint += '\n\nLegend (visual colours may vary in diagrams):\n- Given angle = green\n- Angle to find = red\n\nExamples:';
      hint += '\n• Given alternate interior 76° → corresponding alternate interior = 76° (equal)';
      hint += '\n• Given same-side interior 76° → partner = 180 − 76 = 104° (supplementary)';
      hint += '\n• Given vertical 76° → vertically opposite = 76° (equal)';
      hint += '\n\nIf the diagram uses numbered angles (1..8), locate the angle number with the given measure and use the relation to pick the matching number.';
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
    } else if (skillName.includes('stem') || skillName.includes('stem-and-leaf') || skillName.includes('stem and leaf')) {
      hint += 'Stem-and-Leaf Tip:\n1. A stem-and-leaf plot shows distribution: stems are leading digits, leaves are trailing digits.\n2. Read each row as numbers built from stem + leaf (e.g., stem 12 leaf 3 -> 123).\n3. Use it to spot clusters, modes, and median.\n4. Preserve the order of leaves to show exact values where needed.';
    } else if (skillName.includes('histogram')) {
      hint += 'Histogram Tip:\n1. A histogram groups continuous data into bins (ranges) on the x-axis and shows counts on the y-axis.\n2. Taller bars mean more values fall into that bin.\n3. Check bin widths and make sure you read counts, not bar heights alone.\n4. Use the histogram to estimate mean, spread, and skew.';
    } else if (skillName.includes('venn')) {
      hint += 'Venn Diagram Tip (Two Sets):\n1. A Venn diagram with two overlapping circles shows the counts in each region: left-only, right-only, and overlap.\n2. The overlap is the intersection (items in both sets).\n3. Use union = left + right - intersection if asked for total in either set.\n4. When given counts, fill every region carefully and double-check totals.';
    } else if (skillName.includes('box') || skillName.includes('box plot') || skillName.includes('box-plot')) {
      hint += 'Box Plot Tip:\n1. A box plot shows median (middle line), lower and upper quartiles (box edges), and whiskers (range excluding outliers).\n2. The box contains the middle 50% of the data (Q1 to Q3).\n3. Median tells you the central tendency; whisker length indicates spread and skew.\n4. Outliers are points beyond whiskers; check definitions if asked.';
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

    // Special: if this is a transversal skill, show a small illustrative SVG in the hint modal
    const skillIdLower = (skillId || '').toLowerCase()
    if (skillIdLower.includes('transversal') || skillIdLower.includes('transversals') || (skillMeta && (skillMeta.name || '').toLowerCase().includes('transversal'))) {
        // inline SVG illustrating relationships (compact, uses colours matching visual)
        const svg = `
          <div style="font-family: Arial, sans-serif; color:#222;">
            <div style="display:flex;gap:12px;align-items:center">
              <svg width="260" height="120" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg">
                <!-- two parallel lines and one transversal, show alternate interior (red) and corresponding (pink) -->
                <line x1="10" y1="20" x2="250" y2="20" stroke="#111" stroke-width="3" />
                <line x1="10" y1="80" x2="250" y2="80" stroke="#111" stroke-width="3" />
                <line x1="40" y1="-10" x2="200" y2="130" stroke="#111" stroke-width="3" />

                <!-- alternate interior (red) -->
                <path d="M120 64 A28 28 0 0 1 140 44" fill="none" stroke="#e53935" stroke-width="6" stroke-linecap="round" />
                <text x="142" y="46" font-size="12" fill="#e53935">Alt int</text>

                <!-- corresponding (pink) -->
                <path d="M80 34 A24 24 0 0 1 100 14" fill="none" stroke="#f06292" stroke-width="6" stroke-linecap="round" />
                <text x="102" y="16" font-size="12" fill="#f06292">Corr</text>

                <!-- same-side interior (purple) -->
                <path d="M160 64 A22 22 0 0 1 180 44" fill="none" stroke="#8e24aa" stroke-width="6" stroke-linecap="round" />
                <text x="182" y="46" font-size="12" fill="#8e24aa">Same-side</text>
              </svg>
              <div style="font-size:13px;line-height:1.3;max-width:360px">
                <b>Angle relationships (quick guide)</b><br/>
                <span style="color:#e53935"><b>Alternate interior</b></span>: equal.<br/>
                <span style="color:#f06292"><b>Corresponding</b></span>: equal.<br/>
                <span style="color:#8e24aa"><b>Same-side interior</b></span>: supplementary (add to 180°).<br/>
                <span style="color:#2e7d32"><b>Given</b></span> = green, <span style="color:#c62828"><b>Find</b></span> = red in diagrams.<br/>
                Use the diagram to locate the given angle (interior/exterior, left/right), then apply the rule above.
              </div>
            </div>
          </div>
        `

        setHintModal({ isOpen: true, title: 'Angle relationships', message: null, htmlContent: svg })
        return
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
        {isGroupMode && (
          <div
            className={`w-full px-4 py-3 text-sm font-semibold text-center ${
              groupScoreStatus.state === 'error'
                ? 'bg-red-50 text-red-700 border-b border-red-200'
                : groupScoreStatus.state === 'success'
                  ? 'bg-green-50 text-green-700 border-b border-green-200'
                  : 'bg-blue-50 text-blue-700 border-b border-blue-200'
            }`}
          >
            <div>Group code: <span className="font-mono">{groupCode}</span></div>
            <div className="text-xs font-normal text-slate-600">
              {groupRegistryEntry?.teacherEmail
                ? `Teacher: ${groupRegistryEntry.teacherEmail || 'Saved securely'}`
                : 'Teacher email saved with this code.'}
            </div>
            <div className="mt-1 text-slate-700 font-normal">
              {groupScoreStatus.state === 'success' && groupScoreStatus.message}
              {groupScoreStatus.state === 'error' && (
                <>
                  {groupScoreStatus.message}{' '}
                  <button
                    type="button"
                    className="underline font-semibold"
                    onClick={() => submitGroupResults(testResults)}
                  >
                    Retry now
                  </button>
                </>
              )}
              {groupScoreStatus.state === 'saving' && groupScoreStatus.message}
              {groupScoreStatus.state === 'idle' && 'Your score is ready. We will send it to your teacher now.'}
            </div>
          </div>
        )}
        <TestResults
          results={testResults}
          onBackToMenu={backToMenu}
          onPracticeSkill={practiceFromResults}
          username={currentUser?.username}
          year={isGroupMode && groupRegistryEntry?.year ? groupRegistryEntry.year : selectedYear}
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

  if (mode === 'ncea-index') {
    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        {showLoginRecommendation && (
          <LoginRecommendationModal onLogin={handleLogin} onSkip={handleSkipLogin} />
        )}
        <PastPapersIndex
          onBack={() => setMode('landing')}
          onStartStandardTrial={({ yearId, standardNumber }) => {
            const result = buildNceaTrialQuestionsForStandard(standardNumber)
            if (!result) {
              window.alert(
                `Structured trial data is not yet available for standard ${standardNumber}.`
              )
              return
            }

            const { paper, questions } = result

            if (!questions.length) {
              window.alert(
                `No questions were found in the structured data for standard ${standardNumber}.`
              )
              return
            }

            const examQuestions = questions.map(q => ({
              question: q.text,
              answer: q.answer,
              strand: 'NCEA',
              topic: q.topic || paper.title,
              skill: `NCEA Level 1 ${paper.standard}`,
              skillId: `NCEA.L1.${paper.standard}`,
              source: 'NCEA',
              // Preserve exam structure for reporting and sidebar
              examStandard: paper.standard,
              examYear: paper.year,
              examQuestionNumber: q.number,
              examPartLabel: q.partLabel,
              visualData: q.visualData || null,
              userAnswer: '',
              userFeedback: '',
              isCorrect: false,
              answered: false
            }))

            setHistory(examQuestions)
            setCurrentIndex(0)
            setScore(0)
            setIsTestMode(true)
            setSelectedSkill(null)
            setSelectedYear(null) // keep separate from normal curriculum tracking
            setAnswer('')
            setSelectedChoiceIndex(null)
            setFeedback('')
            initialized.current = true
            setActiveNceaPaperId(paper.id || `${paper.standard}-${paper.year}`)
            setActiveNceaPaper(paper)
            setMode('test')
          }}
          onStartFullTrial={(yearId) => {
            window.alert(
              `Full Level 1 trial exam for ${yearId} will combine all relevant topics (coming soon).`
            )
          }}
        />
      </>
    )
  }

  if (mode === 'ixl-alternative') {
    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-300 text-slate-700 text-sm font-semibold shadow-sm transition"
            >
              <span className="mr-2">↩</span> Back to main page
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                A Free Alternative to IXL for NZ Maths Practice
              </h1>
              <p className="text-slate-600 text-base md:text-lg mb-4">
                IXL is a well-known maths practice platform used around the world. If you&apos;re
                looking for a completely free, no-ads alternative focused squarely on the New
                Zealand curriculum, Mathx.nz was built for you.
              </p>
              <p className="text-slate-600 text-sm md:text-base">
                Our goal is simple: give every learner in Aotearoa access to high-quality maths
                practice without paywalls, logins, or distractions. You can jump straight into
                questions by year level, practice specific skills, or sit full trial exams.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Mathx.nz vs IXL – at a glance
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs md:text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-slate-700">Feature</th>
                      <th className="px-3 py-2 font-semibold text-slate-700">Mathx.nz</th>
                      <th className="px-3 py-2 font-semibold text-slate-700">IXL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="px-3 py-2 font-semibold text-slate-800">Cost</td>
                      <td className="px-3 py-2 text-slate-700">
                        100% free, no subscription required.
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        Subscription-based after a trial limit.
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50/60">
                      <td className="px-3 py-2 font-semibold text-slate-800">Advertisements</td>
                      <td className="px-3 py-2 text-slate-700">No ads, ever.</td>
                      <td className="px-3 py-2 text-slate-700">
                        Ad-free with subscription.
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        Curriculum Focus
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        Built specifically for the NZ curriculum.
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        International, with an NZ-aligned section.
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50/60">
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        NCEA Preparation
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        Dedicated NCEA past paper practice.
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        General skill practice up to NCEA levels.
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="px-3 py-2 font-semibold text-slate-800">Mission</td>
                      <td className="px-3 py-2 text-slate-700">
                        To provide equitable access to education.
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        Commercial learning platform.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                Who is Mathx.nz for?
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm md:text-base">
                <li>
                  <span className="font-semibold">Students</span> who want extra practice for class
                  tests or NCEA exams without paying for a subscription.
                </li>
                <li>
                  <span className="font-semibold">Parents</span> who want a safe, no-ads practice
                  site that closely follows what their child is doing at school.
                </li>
                <li>
                  <span className="font-semibold">Teachers</span> who want quick practice links to
                  share with their classes, aligned to NZ strands and levels.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 mb-4 text-xs md:text-sm text-slate-500">
              <p>
                IXL is a registered trademark of IXL Learning. Mathx.nz is an independent project
                and is not affiliated with, endorsed by, or sponsored by IXL Learning.
              </p>
          </div>
        </div>

      </div>
    </>
  )
  }

  if (mode === 'group-lobby') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mathx.nz'
    const shareLink = groupRegistryEntry?.groupCode ? `${origin}/?group=${groupRegistryEntry.groupCode}` : ''
    const teacherShareLink = groupRegistryEntry?.groupCode ? `${origin}/results?group=${groupRegistryEntry.groupCode}` : ''

    return (
      <>
        <CanvasBackground />
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-100 py-10 px-4">
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500 font-semibold">Group Quiz</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">Start Your Quiz</h1>
              <p className="text-slate-600 text-base md:text-lg">
                Whole class, same questions. Students only need a 7-digit code and their name—no logins, no ads.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                  placeholder="Enter your name to start the test"
                  value={groupStudentName}
                  onChange={(e) => setGroupStudentName(e.target.value)}
                  disabled={!groupRegistryEntry}
                />
              </div>
              <button
                type="button"
                onClick={startGroupTestSession}
                disabled={!groupRegistryEntry || !groupStudentName.trim()}
                className={`w-full px-6 py-4 rounded-3xl text-lg font-semibold shadow-lg transition ${
                  !groupRegistryEntry || !groupStudentName.trim()
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                Start test now
              </button>
              <p className="text-xs text-slate-500">
                We will automatically send your score to the teacher email saved with this code.
              </p>
            </div>

            {groupRegistryEntry && (
              <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-3xl p-6 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Group</p>
                    <div className="text-3xl font-black font-mono flex items-center gap-2">
                      {groupRegistryEntry.groupCode}
                      <CopyButton value={groupRegistryEntry.groupCode} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Teacher</p>
                    <p className="text-lg font-semibold">{groupRegistryEntry.teacherEmail || 'Saved securely'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Title</p>
                    <p className="font-semibold">{groupRegistryEntry.testTitle || 'Group assessment'}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Year</p>
                    <p className="font-semibold">Year {groupRegistryEntry.year || selectedYear || 7}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Questions</p>
                    <p className="font-semibold">{groupRegistryEntry.totalQuestions}</p>
                  </div>
                </div>
                {shareLink && (
                  <div className="bg-white/10 rounded-2xl p-4 text-sm space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Student link</p>
                    <p className="text-xs text-blue-100">
                      This link loads the test automatically for anyone with your code.
                    </p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <code className="px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs break-all">
                        {shareLink}
                      </code>
                      <CopyButton value={shareLink} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <form
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3"
              onSubmit={(e) => handleGroupCodeSubmit(e, 'lobby')}
            >
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                  Group code
                </label>
                <input
                  type="text"
                  value={groupInputValue}
                  onChange={(e) => setGroupInputValue(sanitizeGroupCode(e.target.value))}
                  inputMode="numeric"
                  maxLength={7}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-mono tracking-[0.4em] text-center"
                  placeholder="1234567"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition"
              >
                Load Test
              </button>
            </form>

            {groupRegistryError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-semibold">
                {groupRegistryError}
              </div>
            )}

            {groupRegistryLoading && (
              <div className="text-center text-slate-500 text-sm">Generating your quiz…</div>
            )}

            <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-sm text-slate-500">
              <button
                type="button"
                onClick={() => {
                  exitGroupMode()
                  backToMenu()
                }}
                className="px-4 py-2 rounded-2xl border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition"
              >
                ← Back to mathx.nz
              </button>
              <div>No logins required · Works on any device · Questions aligned to NZ curriculum</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (mode === 'group-results') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mathx.nz'
    const studentLink = groupRegistryEntry?.groupCode ? `${origin}/?group=${groupRegistryEntry.groupCode}` : ''
    const teacherLink = groupRegistryEntry?.groupCode ? `${origin}/results?group=${groupRegistryEntry.groupCode}` : ''
    const totalSubmissions = groupScores.length
    const averagePercent = totalSubmissions
      ? Math.round(groupScores.reduce((sum, row) => sum + row.percent, 0) / totalSubmissions)
      : 0
    const bestScore = groupScores[0]?.percent || 0
    const lastUpdated = groupScoresFetchedAt
      ? groupScoresFetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null

    return (
      <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[32px] border border-white/10 p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Teacher dashboard</p>
                <h1 className="text-4xl font-extrabold">Group Results</h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  exitGroupMode()
                  backToMenu()
                }}
                className="px-4 py-2 rounded-2xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition"
              >
                ← Back to site
              </button>
            </div>

            <form
              className="bg-white/10 border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-3"
              onSubmit={(e) => handleGroupCodeSubmit(e, 'results')}
            >
              <div className="flex-1">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200 font-semibold block mb-2">
                  Enter group code
                </label>
                <input
                  type="text"
                  value={groupInputValue}
                  onChange={(e) => setGroupInputValue(sanitizeGroupCode(e.target.value))}
                  inputMode="numeric"
                  maxLength={7}
                  className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 font-mono tracking-[0.4em] text-lg text-white placeholder:text-slate-400"
                  placeholder="1234567"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200 font-semibold block mb-2">
                  Teacher PIN
                </label>
                <input
                  type="password"
                  value={groupResultsPin}
                  onChange={(e) => setGroupResultsPin(sanitizePin(e.target.value))}
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 font-mono tracking-[0.4em] text-lg text-white placeholder:text-slate-400"
                  placeholder="••••"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg hover:bg-slate-100 transition"
              >
                Load Results
              </button>
            </form>

            {groupRegistryError && (
              <div className="rounded-2xl border border-red-300 bg-red-500/10 text-red-100 px-4 py-3 text-sm font-semibold">
                {groupRegistryError}
              </div>
            )}

            {groupRegistryEntry && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Group</p>
                    <div className="text-2xl font-black font-mono flex items-center gap-2">
                      {groupRegistryEntry.groupCode}
                      <CopyButton value={groupRegistryEntry.groupCode} />
                    </div>
                  <p className="text-xs text-blue-200 mt-1">{groupRegistryEntry.testTitle || 'Group assessment'}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Teacher</p>
                  <p className="text-lg font-semibold">{groupRegistryEntry.teacherEmail || 'Saved securely'}</p>
                  <p className="text-xs text-blue-200 mt-1">Year {groupRegistryEntry.year || selectedYear || 7}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-4 border border-white/10 space-y-3">
                  {studentLink && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200">Student link</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={studentLink} className="text-sm text-white underline break-all">
                          {studentLink}
                        </a>
                        <CopyButton value={studentLink} />
                      </div>
                    </div>
                  )}
                  {teacherLink && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200">Teacher link</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={teacherLink} className="text-sm text-white underline break-all">
                          {teacherLink}
                        </a>
                        <CopyButton value={teacherLink} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {groupRegistryEntry ? (
          <div className="bg-white text-slate-900 rounded-[32px] shadow-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Live leaderboard</h2>
                <p className="text-sm text-slate-500">
                  {totalSubmissions > 0
                    ? `${totalSubmissions} submissions · Average ${averagePercent}%`
                    : 'Waiting for the first submission'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {lastUpdated && <span className="text-xs text-slate-400">Updated {lastUpdated}</span>}
                <button
                  type="button"
                  onClick={() => groupCode && unlockGroupResults(groupCode, groupResultsPin)}
                  className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-semibold hover:border-slate-300"
                >
                  Refresh
                </button>
              </div>
            </div>

            {groupScoresLoading && (
              <div className="text-center text-slate-500 text-sm">Loading scores from Google Sheets…</div>
            )}

            {!groupScoresLoading && groupScoresError && (
              <div className="rounded-3xl border border-red-100 bg-red-50 text-red-600 px-4 py-3 text-sm font-semibold">
                {groupScoresError}
              </div>
            )}

            {!groupScoresLoading && totalSubmissions === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
                No submissions yet. Share the student link so everyone can take the test.
              </div>
            )}

            {!groupScoresLoading && totalSubmissions > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Submissions</p>
                    <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Average</p>
                    <p className="text-3xl font-bold text-slate-900">{averagePercent}%</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top score</p>
                    <p className="text-3xl font-bold text-slate-900">{bestScore}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupScores.map((entry, idx) => (
                    <div key={`${entry.studentName}-${idx}`} className="border border-slate-200 rounded-3xl p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <p className="text-xl font-bold text-slate-900">{entry.studentName}</p>
                          <p className="text-xs text-slate-500">
                            {entry.endTime
                              ? new Date(entry.endTime).toLocaleString()
                              : entry.timestamp || 'Submitted'}
                          </p>
                        </div>
                        <div className="text-4xl font-extrabold text-blue-600">{entry.percent}%</div>
                      </div>
                      <div className="text-sm text-slate-600 mt-2 flex flex-wrap gap-4">
                        <span>
                          {entry.score}/{entry.totalQuestions} correct
                        </span>
                        <span>Duration: {formatDuration(entry.durationSec)}</span>
                      </div>
                      {entry.wrongQuestions.length > 0 ? (
                        <details className="mt-3 text-sm">
                          <summary className="cursor-pointer font-semibold text-slate-700">
                            Wrong answers ({entry.wrongQuestions.length})
                          </summary>
                          <ul className="mt-2 space-y-2 text-slate-600">
                            {entry.wrongQuestions.map((w, wIdx) => (
                              <li key={wIdx} className="text-xs md:text-sm border border-slate-100 rounded-xl p-2">
                                <div className="font-semibold">{w.topic || w.qid || 'Question'}</div>
                                <div>Student: {w.studentAnswer || '—'}</div>
                                <div>Correct: {w.correctAnswer || '—'}</div>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <div className="mt-3 text-sm text-green-600 font-semibold">Perfect score!</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          ) : (
            <div className="bg-white text-slate-900 rounded-[32px] shadow-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              Enter your group code and teacher PIN above to unlock the live leaderboard.
            </div>
          )}
        </div>
      </div>
    )
  }

  // Landing Page
  if (mode === 'landing') {
    const olympiadCurriculum = {
      year: 'Olympiad Mathematics',
      skills: []
    }

    const selectedYearData = curriculumData.years.find(y => y.year === curriculumMapYear)
    const activeYearData = isOlympiadMode ? olympiadCurriculum : selectedYearData

    // Build strands for the active curriculum (standard year or Olympiad)
    const strands = {}
    if (activeYearData) {
      activeYearData.skills.forEach(skill => {
        if (!strands[skill.strand]) strands[skill.strand] = []
        strands[skill.strand].push({ ...skill, year: activeYearData.year })
      })
    }
    const mapHeading = isOlympiadMode ? 'Olympiad Mathematics' : `Year ${curriculumMapYear}`
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mathx.nz'

    return (
      <>
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        {mode === 'landing' && <CanvasBackground />}

        {/* Inline PDF viewer for NCEA past papers */}
        {nceaPdfActive && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/70"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-screen h-screen md:w-[95vw] md:h-[95vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
                <div className="text-[11px] md:text-sm text-slate-700 font-semibold truncate pr-3">
                  {nceaPdfActive.standard} – {nceaPdfActive.title} ({nceaPdfActive.year})
                </div>
                <button
                  type="button"
                  onClick={() => setNceaPdfActive(null)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 bg-slate-200">
                <iframe
                  src={nceaPdfActive.url}
                  title="NCEA past paper"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

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
                      setShowGroupMenu(true)
                      setShowGroupSetupSection(false)
                      setTimeout(() => {
                        const el = document.getElementById('group-quiz-menu')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }, 50)
                    }}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg transition transform hover:-translate-y-1"
                  >
                    Start Group Quiz
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center p-4">
                <DailyChallenge devMode={isDevMode} />
              </div>
            </div>
          </section>

          {showGroupMenu && (
            <section id="group-quiz-menu" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
              <div className="bg-white/95 border border-slate-200 rounded-[32px] shadow-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">Start a group session</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">How do you want to begin?</h3>
                    <p className="text-slate-600 text-sm md:text-base">
                      Students enter a 7-digit code to join. Teachers can create a new code and share it with the class.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGroupMenu(false)}
                    className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-3xl p-5 flex flex-col gap-3 bg-slate-50/60">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Students</p>
                      <h4 className="text-xl font-bold text-slate-900">Enter Test Code</h4>
                      <p className="text-sm text-slate-600">Join the exact same quiz as your classmates using a 7-digit group code.</p>
                    </div>
                    <button
                      type="button"
                      onClick={openEnterGroupCode}
                      className="w-full px-4 py-3 rounded-2xl bg-[#0077B6] text-white font-semibold shadow hover:bg-sky-700 transition"
                    >
                      Enter test code
                    </button>
                  </div>
                  <div className="border border-amber-200 rounded-3xl p-5 flex flex-col gap-3 bg-amber-50/70">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Teachers</p>
                      <h4 className="text-xl font-bold text-slate-900">Create Group Test</h4>
                      <p className="text-sm text-slate-600">Generate a new code, share it instantly, and see every score in your Google Sheet.</p>
                    </div>
                    <button
                      type="button"
                      onClick={openGroupSetup}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow hover:opacity-95 transition"
                    >
                      Create group test
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {showGroupMenu && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <div className="bg-white rounded-3xl border border-slate-200 shadow p-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">Teacher results lookup</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">Load group test results</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Enter your 7-digit group code and the private teacher PIN you set when creating the test. Mathx.nz will fetch the matching group info and every student attempt saved for that code.
                  </p>
                </div>

                <form className="space-y-3" onSubmit={lookupGroupResults}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={resultLookupCode}
                      onChange={(e) => setResultLookupCode(sanitizeGroupCode(e.target.value))}
                      placeholder="Group code"
                      maxLength={7}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-base font-mono tracking-widest"
                      required
                    />
                    <input
                      type="password"
                      value={resultLookupPin}
                      onChange={(e) => setResultLookupPin(sanitizePin(e.target.value))}
                      placeholder="Teacher PIN"
                      maxLength={4}
                      inputMode="numeric"
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-base font-mono tracking-[0.3em]"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow hover:opacity-95 transition"
                    >
                      View results
                    </button>
                  </div>
                </form>

                {resultLookupStatus.state !== 'idle' && (
                  <p className={`text-sm ${
                    resultLookupStatus.state === 'error'
                      ? 'text-red-600'
                      : resultLookupStatus.state === 'success'
                        ? 'text-green-600'
                        : 'text-slate-500'
                  }`}>
                    {resultLookupStatus.message}
                  </p>
                )}

                {resultLookupEntry && (
                  <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Group code</p>
                      <p className="font-mono text-xl font-bold">{resultLookupEntry.groupCode}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Teacher email</p>
                      <p className="font-semibold">{resultLookupEntry.teacherEmail || 'Saved securely'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Test title</p>
                      <p>{resultLookupEntry.testTitle || 'Untitled group test'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Year & mode</p>
                      <p>Year {resultLookupEntry.year || '?'}, {(() => {
                        const mode = resultLookupEntry.mode || 'full'
                        if (mode.startsWith('focused:')) {
                          const skillId = mode.split(':')[1]
                          const skill = getSkillsForYear(curriculumData, parseInt(resultLookupEntry.year, 10)).find(s => s.id === skillId)
                          return `Focused: ${skill?.name || skillId}`
                        }
                        return mode === 'full' ? 'Full assessment' : mode
                      })()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Questions</p>
                      <p>{resultLookupEntry.totalQuestions || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Created</p>
                      <p>{resultLookupEntry.created ? new Date(resultLookupEntry.created).toLocaleString() : '—'}</p>
                    </div>
                  </div>
                )}

                <div>
                  {resultLookupEntry ? (
                    resultLookupScores.length === 0 ? (
                      resultLookupStatus.state === 'success' ? (
                        <p className="text-sm text-slate-500">No student attempts are stored yet.</p>
                      ) : (
                        <p className="text-sm text-slate-500">Loading student attempts...</p>
                      )
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs md:text-sm">
                          <thead>
                            <tr className="text-left text-slate-500">
                              <th className="px-3 py-2">Student</th>
                              <th className="px-3 py-2">Score</th>
                              <th className="px-3 py-2">Percent</th>
                              <th className="px-3 py-2">Submitted</th>
                              <th className="px-3 py-2">Wrong topics</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...resultLookupScores]
                              .sort((a, b) => b.percent - a.percent)
                              .map((entry, idx) => (
                                <tr key={`${entry.groupCode}-${idx}-${entry.submitted}`} className="border-t border-slate-100">
                                  <td className="px-3 py-2">{entry.studentName}</td>
                                  <td className="px-3 py-2">{entry.score}/{entry.total}</td>
                                  <td className="px-3 py-2">{entry.percent}%</td>
                                  <td className="px-3 py-2 text-slate-500">{new Date(entry.submitted).toLocaleString()}</td>
                                  <td className="px-3 py-2">
                                    {entry.wrongTopics.length === 0 ? (
                                      <span className="text-slate-400">—</span>
                                    ) : (
                                      <div className="flex flex-wrap gap-1">
                                        {entry.wrongTopics.map((topic, topicIdx) => (
                                          <span
                                            key={`${entry.groupCode}-${idx}-topic-${topicIdx}`}
                                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]"
                                          >
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">Enter your group code and teacher PIN above to load the latest results.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {showGroupSetupSection && (
          <section id="group-test-setup" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-white/95 border border-slate-200 rounded-[32px] shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">New • Group Test Mode</p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">Create a group test code</h2>
                  <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed">
                    Enter your email once and Mathx.nz will generate a 7-digit code. Every student who enters that code
                    gets the exact same deterministic test, and we send their results back to your Google Sheet instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupSetupSection(false)
                    setShowGroupMenu(true)
                  }}
                  className="px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg hover:bg-slate-800 transition"
                >
                  ← Back to options
                </button>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Zero logins for students
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Works on any device
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Aligned to NZ curriculum
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={createGroupTest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Teacher email
                    </label>
                    <input
                      type="email"
                      required
                      value={groupSetupForm.teacherEmail}
                      onChange={(e) => handleGroupSetupChange('teacherEmail', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                      placeholder="you@school.nz"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Teacher PIN (4 digits)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={groupSetupForm.teacherPin}
                        onChange={(e) => handleGroupSetupChange('teacherPin', e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base font-mono tracking-[0.4em]"
                        placeholder="1234"
                      />
                      <button
                        type="button"
                        onClick={regenerateTeacherPin}
                        className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-100 transition"
                        title="Generate a new random PIN"
                      >
                        Generate PIN
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Keep this PIN private. You&rsquo;ll need it to view results.</p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Test title
                    </label>
                    <input
                      type="text"
                      value={groupSetupForm.testTitle}
                      onChange={(e) => handleGroupSetupChange('testTitle', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                      placeholder="Year 8 diagnostic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Year level
                    </label>
                    <select
                      value={groupSetupForm.year}
                      onChange={(e) => handleGroupSetupChange('year', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Total questions
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={groupSetupForm.totalQuestions}
                      onChange={(e) => handleGroupSetupChange('totalQuestions', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Mode
                    </label>
                    <select
                      value={groupSetupForm.mode}
                      onChange={(e) => handleGroupSetupChange('mode', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                    >
                      <option value="full">Full assessment (all topics)</option>
                      <option value="focused">Focused on one topic</option>
                    </select>
                  </div>
                </div>

                {groupSetupForm.mode === 'focused' && (
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                      Select Topic
                    </label>
                    <select
                      value={groupSetupForm.focusedSkill}
                      onChange={(e) => handleGroupSetupChange('focusedSkill', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                      required={groupSetupForm.mode === 'focused'}
                    >
                      <option value="">-- Choose a topic --</option>
                      {getSkillsForYear(curriculumData, parseInt(groupSetupForm.year, 10))
                        .sort((a, b) => {
                          if (a.strand !== b.strand) return a.strand.localeCompare(b.strand)
                          return a.name.localeCompare(b.name)
                        })
                        .map(skill => (
                          <option key={skill.id} value={skill.id}>
                            {skill.strand} → {skill.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                      All {groupSetupForm.totalQuestions} questions will be from this topic only.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={groupSetupStatus.submitting || groupSetupStatus.success}
                  className={`w-full md:w-auto px-6 py-4 rounded-3xl text-lg font-semibold shadow-lg transition ${
                    groupSetupStatus.submitting || groupSetupStatus.success
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0077B6] text-white hover:bg-sky-600'
                  }`}
                >
                  {groupSetupStatus.submitting ? 'Generating code…' : groupSetupStatus.success ? 'Code ready' : 'Generate 7-digit code'}
                </button>
              </form>

              {groupSetupStatus.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-semibold">
                  {groupSetupStatus.error}
                </div>
              )}

              {groupSetupResult && (
                <div className="bg-slate-900 text-white rounded-[28px] p-6 space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Your new code</p>
                      <div className="text-4xl font-black font-mono flex items-center gap-2">
                        {groupSetupResult.groupCode}
                        <CopyButton value={groupSetupResult.groupCode} variant="light" />
                      </div>
                    </div>
                    <div className="text-xs text-blue-200 space-y-1">
                      <p>Save this code and links below. Students only need the short link.</p>
                      <p className="font-semibold text-amber-200">Keep your teacher PIN secret it unlocks the results.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-blue-200 mb-1">Student link</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="block text-xs break-all">{`${origin}/?group=${groupSetupResult.groupCode}`}</code>
                        <CopyButton value={`${origin}/?group=${groupSetupResult.groupCode}`} variant="light" />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-blue-200 mb-1">Teacher results</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="block text-xs break-all">{`${origin}/results?group=${groupSetupResult.groupCode}`}</code>
                        <CopyButton value={`${origin}/results?group=${groupSetupResult.groupCode}`} variant="light" />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-blue-200 mb-1">Teacher PIN - keep private</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="block text-xs break-all">{groupSetupResult.teacherPin}</code>
                        <CopyButton value={groupSetupResult.teacherPin} variant="light" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          )}

          {/* Year Selection */}
          <div id="year-selection" className="bg-blue-50/50 py-16 mb-8 backdrop-blur-sm border-t border-b border-blue-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Choose Your Level</h2>
              <p className="text-lg md:text-xl text-slate-500 mb-12">Select the year that corresponds to your current curriculum.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {availableYears.map((year) => (
                    <div
                      key={year}
                      onClick={() => {
                        setSelectedYear(year)
                        setCurriculumMapYear(year)
                        setIsOlympiadMode(false)
                        scrollToCurriculumMap()
                      }}
                      className="year-card bg-white/80 p-8 rounded-2xl border-2 border-[#0077B6] card-shadow block cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="text-6xl font-bold text-[#0077B6] mb-4 font-mono">{year}</div>
                      <h3 className="text-xl font-semibold text-gray-800">Year {year}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {year === 6
                          ? 'Primary'
                          : year === 7 || year === 8
                            ? 'Intermediate'
                            : 'Highschool'}
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
                        setIsOlympiadMode(false)
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                        !isOlympiadMode && curriculumMapYear === year
                          ? 'bg-[#0077B6] text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#0077B6] hover:text-[#0077B6]'
                      }`}
                    >
                      Year {year}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsOlympiadMode(true)
                      scrollToCurriculumMap()
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                      isOlympiadMode
                        ? 'bg-amber-400 text-slate-900 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-amber-400 hover:text-amber-500'
                    }`}
                  >
                    Olympiad
                  </button>
                </div>

                {isOlympiadMode && (!activeYearData || (activeYearData.skills || []).length === 0) && (
                  <div className="text-center text-slate-600 mb-12">
                    Olympiad question bank incoming – templates will appear here as we migrate them from Phase 13.
                  </div>
                )}

                {/* Take Full Assessment Button */}
                {!isOlympiadMode && (
                <div className="mb-12">
                  <div className="max-w-3xl mx-auto bg-white/90 p-6 rounded-xl border-2 border-red-400 card-shadow transition-all">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-red-600 mb-2">Take Full Assessment</h3>
                        <p className="text-gray-700 mb-1">Comprehensive test covering all curriculum areas for Year {selectedYear || 6}</p>
                        <p className="text-sm text-gray-500 mb-4">~60 questions • 45-60 minutes • Get detailed feedback</p>
                        

                        <div className="flex gap-3 items-center">
                          <button
                            onClick={startTest}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                          >
                            Start Test for Year {selectedYear || 6} Now →
                          </button>

                          <button
                            onClick={startAllYearsTest}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                          >
                            Start All-Years Test →
                          </button>

                          {isDevMode && (
                            <button
                              onClick={() => {
                                // Generate every new question across all years for audit
                                const opts = { onlyNew: true, allYears: true, onePerTemplate: true }
                                const questions = generateTest(selectedYear || 6, 100000, opts)
                                setHistory(questions)
                                setCurrentIndex(0)
                                setScore(0)
                                setIsTestMode(true)
                                setSelectedSkill(null)
                                setAnswer('')
                                setSelectedChoiceIndex(null)
                                setFeedback('')
                                initialized.current = true
                                setMode('test')
                              }}
                              className="px-4 py-2 mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm"
                            >
                              Generate All New Questions (Audit all)
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Dev-only: Template sampler table for current year */}
                {isDevMode && !isOlympiadMode && (
                  <div className="mt-12 mb-12">
                    {/* Phase overview across all years (dev helper) */}
                    <div className="mb-3 text-xs text-slate-600">
                      {(() => {
                        try {
                            if (!curriculumData || !Array.isArray(curriculumData.years)) return null
                            const summary = {}
                            curriculumData.years.forEach(y => {
                              (y.skills || []).forEach(skill => {
                                const skillPhase = typeof skill.phase === 'number' ? skill.phase : null
                                ;(skill.templates || []).forEach(t => {
                                  const p = typeof t.phase === 'number' ? t.phase : skillPhase
                                  const key = p != null ? `Phase ${p}` : 'Base'
                                  if (!summary[key]) {
                                    summary[key] = { topics: new Set(), years: new Set(), perYear: {}, phaseNumber: p }
                                  }
                                  summary[key].topics.add(skill.name)
                                  summary[key].years.add(y.year)
                                  const yr = y.year
                                  if (!summary[key].perYear[yr]) summary[key].perYear[yr] = 0
                                  summary[key].perYear[yr] += 1
                                })
                              })
                            })
                          const items = Object.entries(summary)
                          if (!items.length) return null
                          const currentPhaseLabel = phaseFilter ? `Phase ${phaseFilter}` : null
                          const handlePhaseClick = (phaseNumber) => {
                            try {
                              const params = new URLSearchParams(window.location.search)
                              if (phaseNumber != null) {
                                params.set('phase', String(phaseNumber))
                              } else {
                                params.delete('phase')
                              }
                              params.set('dev', 'true')
                              window.location.search = params.toString()
                            } catch {
                              // ignore navigation errors
                            }
                          }
                          return (
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="font-semibold text-slate-700">Loaded phases (all years):</span>
                              <button
                                type="button"
                                onClick={() => handlePhaseClick(null)}
                                className={`px-2 py-1 rounded-full border text-[0.7rem] font-semibold ${
                                  !phaseFilter
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                All phases
                              </button>
                              {/* Simple phase summary table with clickable year filters */}
                              <table className="min-w-max text-[0.7rem] border border-slate-200 bg-white rounded-md overflow-hidden">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-2 py-1 border-b border-slate-200 text-left">Phase</th>
                                    <th className="px-2 py-1 border-b border-slate-200 text-left">Years / Topics</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map(([label, info]) => (
                                    <tr key={label} className="border-t border-slate-100">
                                      <td className="px-2 py-1 font-semibold text-slate-700">{label}</td>
                                        <td className="px-2 py-1">
                                          {Array.from(info.years).sort((a, b) => a - b).map(year => (
                                            <button
                                              key={`${label}-${year}`}
                                              type="button"
                                              onClick={() => {
                                                handlePhaseClick(info.phaseNumber)
                                                setCurriculumMapYear(year)
                                                setSelectedYear(year)
                                              }}
                                              className="inline-flex items-center px-2 py-0.5 mr-1 mb-1 rounded-full border border-slate-300 bg-white hover:bg-slate-100"
                                            >
                                              <span className="mr-1">Year {year}</span>
                                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[0.65rem]">
                                                {info.perYear[year] || 0}
                                              </span>
                                            </button>
                                          ))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        } catch {
                          return null
                        }
                      })()}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Template Samples ({mapHeading})
                      </h3>
                      <span className="text-sm text-slate-500">
                        Total generated: {devTemplateSamples.length}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      Dev view: one generated sample question and expected answer per template for the selected year.
                    </p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm max-h-[500px]">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-gray-700">Template ID</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Skill</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Sample Question</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Expected Answer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {devTemplateSamples.map(row => (
                            <tr key={row.templateId || `${row.skillId}-${row.question}`} className="border-t border-gray-100 align-top">
                              <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-gray-800">


                                <div className="flex items-center gap-2">                                                                                                                                       
    {row.skillId ? (                                                                                                                                                              
      <button                                                                                                                                                                     
        type="button"
        onClick={() => {                                                                                                                                                          
          setSelectedYear(row.year)                                                                                                                                               
          setMode('practice')                                                                                                                                                     
          startPractice(row.skillId)                                                                                                                                              
        }}                                                                                                                                                                        
        className="text-blue-600 hover:text-blue-800 hover:underline"                                                                                                             
      >                                                                                                                                                                           
        {row.templateId || '—'}                                                                                                                                                   
      </button>                                                                                                                                                                   
    ) : (                                                                                                                                                                         
      <span>{row.templateId || '—'}</span>                                                                                                                                        
    )}                                                                                                                                                                            
    {row.isNew && (                                                                                                                                                               
      <span className="inline-flex items-center px-2 py-0.5 text-[0.65rem] font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">                   
        New
      </span>                                                                                                                                                                     
    )}                                                                                                                                                                            
  </div>                                                                                                                                                                          
  <div className="text-[0.7rem] text-gray-500 mt-0.5">{row.skillId}</div>         




                              </td>
                              <td className="px-4 py-2 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                                {row.skillName}
                              </td>
                              <td className="px-4 py-2 text-xs md:text-sm text-gray-800 max-w-md">
                                {row.question}
                              </td>
                              <td className="px-4 py-2 text-xs md:text-sm text-gray-800 max-w-xs">
                                {row.answer}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Dev-only JSON snippet: raw templates (no generated Q/A) */}
                    <div className="mt-6 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[0.7rem] text-slate-500">
                          JSON for templates used in practice/tests for {mapHeading} (raw template objects, no generated questions or answers).
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const jsonText = buildDevTemplatesJson()
                              if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(jsonText).catch(() => {})
                              }
                            } catch (e) {
                              // best-effort only; ignore copy errors in dev
                            }
                          }}
                          className="px-2 py-1 text-[0.7rem] rounded-md border border-slate-500 text-slate-100 bg-slate-800 hover:bg-slate-700"
                        >
                          Copy JSON
                        </button>
                      </div>
                      <div className="bg-slate-900 text-slate-50 rounded-lg p-3 overflow-x-auto max-h-64">
                        <pre className="whitespace-pre text-[0.65rem] leading-snug">
                          {buildDevTemplatesJson()}
                        </pre>
                      </div>

                      {/* Topic badges for filtering JSON */}
                      <div className="mt-4 flex flex-wrap gap-2 items-center">
                        {(() => {
                          const topicCounts = {}
                          devTemplateSamples.forEach(row => {
                            if (!row.skillId) return
                            if (!topicCounts[row.skillId]) {
                              topicCounts[row.skillId] = {
                                skillId: row.skillId,
                                name: row.skillName,
                                count: 0
                              }
                            }
                            topicCounts[row.skillId].count += 1
                          })
                          const topics = Object.values(topicCounts)
                          if (!topics.length) return null

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => setDevTemplateFilterSkill(null)}
                                className={`px-3 py-1 rounded-full border text-[0.7rem] font-semibold ${
                                  devTemplateFilterSkill == null
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                All topics
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                                  {devTemplateSamples.length}
                                </span>
                              </button>

                              {topics.map(t => (
                                <button
                                  key={t.skillId}
                                  type="button"
                                  onClick={() => setDevTemplateFilterSkill(t.skillId)}
                                  className={`px-3 py-1 rounded-full border text-[0.7rem] font-semibold ${
                                    devTemplateFilterSkill === t.skillId
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {t.name}
                                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                                    {t.count}
                                  </span>
                                </button>
                              ))}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum for Selected Year */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold mb-6 text-[#0077B6]">{mapHeading}</h3>

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
                            <div className="text-sm text-gray-500">{(skill.description && skill.description.trim()) ? skill.description : `Practice ${skill.name}`}</div>
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

          {/* Olympiad CTA */}
          <section className="bg-slate-900 text-white py-16">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
              <div className="text-5xl" aria-hidden="true">🥇</div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Olympiad Mathematics</p>
              <h2 className="text-4xl md:text-5xl font-black text-white">Think You’ve Mastered It All?</h2>
              <p className="text-base md:text-lg text-slate-200">
                Welcome to the arena where routine problems surrender. This is Olympiad Mathematics: where the puzzles
                are deep, the logic is king, and “obvious” is often wrong. For those who find normal math a warm-up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOlympiadMode(true)
                    scrollToCurriculumMap()
                  }}
                  className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold shadow-lg text-base"
                >
                  Accept the Challenge
                </button>
                {isOlympiadMode && (
                  <button
                    type="button"
                    onClick={() => setIsOlympiadMode(false)}
                    className="px-6 py-3 rounded-full border border-white/40 text-white hover:bg-white/10 font-semibold text-base shadow-lg"
                  >
                    Back to Standard Practice
                  </button>
                )}
              </div>
            </div>
          </section>

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
                    This website is built by people who want to help. While we work hard to ensure everything is correct, occasional errors may occur.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Please use this as a helpful practice tool, but always confirm key information with your school materials or teacher.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Found something that needs correcting? Please use the <b>"Report an Issue"</b> button to <b>notify</b> us. We greatly appreciate your help in making this resource better!
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

          {/* NCEA Trial Exams preview */}
          <section className="py-16 bg-slate-50/80 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Preparing for NCEA Finals?</h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                Build confidence with deterministic trial exams made from real NZQA questions. Level 1 is ready now,
                and Levels 2 & 3 are coming soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setMode('ncea-index')}
                  className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold shadow-lg text-base transition"
                >
                  Start Level 1 Trial
                </button>
                <button
                  type="button"
                  disabled
                  className="px-6 py-3 rounded-full bg-slate-100 text-slate-400 font-semibold text-base border border-slate-200 cursor-not-allowed"
                >
                  Level 2 (coming soon)
                </button>
                <button
                  type="button"
                  disabled
                  className="px-6 py-3 rounded-full bg-slate-100 text-slate-400 font-semibold text-base border border-slate-200 cursor-not-allowed"
                >
                  Level 3 (coming soon)
                </button>
              </div>
            </div>
          </section>

 {/* NCEA Past Papers (PDF) */}                                                                                                                                        
            <div className="bg-white py-10 border-b border-slate-200">                                                                                                            
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                                                                                                            
                <div className="bg-slate-50 text-slate-900 rounded-3xl p-6 md:p-8 shadow-md border border-slate-200">                                                             
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3">                                                                                                       
                    NCEA Past Papers (PDF)                                                                                                                                        
                  </h2>                                                                                                                                                           
                  <p className="text-sm md:text-base text-slate-600 mb-4 max-w-2xl">                                                                                              
                    Browse all local NCEA maths exam papers by year. Click a topic to open the PDF in a                                                                           
                    viewer.                                                                                                                                                       
                  </p>                                                                                                                                                            
                                                                                                                                                                                  
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs md:text-sm">                                                                     
                    <div className="flex flex-wrap items-center gap-2 mb-2">                                                                                                      
                      <span className="font-semibold text-slate-800">Level:</span>                                                                                                
                      {[1].map(level => (                                                                                                                                         
                        <button                                                                                                                                                   
                          key={level}                                                                                                                                             
                          type="button"                                                                                                                                           
                          onClick={() => {                                                                                                                                        
                            setNceaPdfLevel(level)                                                                                                                                
                            setNceaPdfYear(() => {                                                                                                                                
                              const years = nceaExamPdfs                                                                                                                          
                                .filter(p => p.level === level)                                                                                                                   
                                .map(p => p.year)                                                                                                                                 
                              return years.length ? Math.max(...years) : null                                                                                                     
                            })                                                                                                                                                    
                          }}                                                                                                                                                      
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${                                                                                      
                            nceaPdfLevel === level                                                                                                                                
                              ? 'bg-[#0077B6] text-white border-[#0077B6]'                                                                                                        
                              : 'bg-white text-slate-700 border-slate-300 hover:border-[#0077B6]'                                                                                 
                          }`}                                                                                                                                                     
                        >                                                                                                                                                         
                          Level {level}                                                                                                                                           
                        </button>                                                                                                                                                 
                      ))}                                                                                                                                                         
                      <span className="mx-2 text-slate-300">|</span>                                                                                                              
                      <span className="text-slate-500">Year:</span>                                                                                                               
                      {Array.from(
                        new Set(                                                                                                                                                  
                          nceaExamPdfs                                                                                                                                            
                            .filter(p => p.level === nceaPdfLevel)                                                                                                                
                            .map(p => p.year)                                                                                                                                     
                        )                                                                                                                                                         
                      )                                                                                                                                                           
                        .sort((a, b) => b - a)
                        .map(year => (                                                                                                                                            
                          <button                                                                                                                                                 
                            key={year}                                                                                                                                            
                            type="button"                                                                                                                                         
                            onClick={() => setNceaPdfYear(year)}                                                                                                                  
                            className={`px-2 py-1 rounded-full border text-xs font-semibold ${                                                                                    
                              nceaPdfYear === year                                                                                                                                
                                ? 'bg-white text-[#0077B6] border-[#0077B6]'                                                                                                      
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0077B6]'                                                                               
                            }`}                                                                                                                                                   
                          >                                                                                                                                                       
                            {year}                                                                                                                                                
                          </button>                                                                                                                                               
                        ))}                                                                                                                                                       
                      {!nceaExamPdfs.some(p => p.level === nceaPdfLevel) && (                                                                                                     
                        <span className="text-slate-400 text-xs">                                                                                                                 
                          No local papers for this level yet.                                                                                                                     
                        </span>                                                                                                                                                   
                      )}                                                                                                                                                          
                    </div>                                                                                                                                                        
                                                                                                                                                                                  
                    <div className="max-h-40 overflow-y-auto bg-slate-50 border border-slate-100 rounded-xl">                                                                     
                      <table className="min-w-full text-left text-[11px] md:text-xs">                                                                                             
                        <tbody>                                                                                                                                                   
                          {nceaExamPdfs                                                                                                                                           
                            .filter(p => p.level === nceaPdfLevel)                                                                                                                
                            .filter(p => (nceaPdfYear ? p.year === nceaPdfYear : true))                                                                                           
                            .sort(                                                                                                                                                
                              (a, b) =>                                                                                                                                           
                                b.year - a.year || a.standard.localeCompare(b.standard)                                                                                           
                            )                                                                                                                                                     
                            .map(pdf => (                                                                                                                                         
                              <tr                                                                                                                                                 
                                key={`${pdf.standard}-${pdf.year}`}                                                                                                               
                                className="border-b border-slate-100"                                                                                                             
                              >                                                                                                                                                   
                                <td className="px-3 py-1 whitespace-nowrap font-mono text-slate-900">                                                                             
                                  {pdf.standard}                                                                                                                                  
                                </td>                                                                                                                                             
                                <td className="px-3 py-1 text-slate-800">                                                                                                         
                                  {pdf.title} ({pdf.year})                                                                                                                        
                                </td>                                                                                                                                             
                                <td className="px-3 py-1 whitespace-nowrap text-right">                                                                                           
                                  {pdf.url ? (                                                                                                                                    
                                    <button                                                                                                                                       
                                      type="button"                                                                                                                               
                                      onClick={() => setNceaPdfActive(pdf)}                                                                                                       
                                      className="px-2 py-0.5 rounded-full bg-[#0077B6] hover:bg-sky-700 text-white font-semibold"                                                 
                                    >                                                                                                                                             
                                      View                                                                                                                                        
                                    </button>                                                                                                                                     
                                  ) : (                                                                                                                                           
                                    <span className="text-slate-400">No exam</span>                                                                                               
                                  )}                                                                                                                                              
                                </td>                                                                                                                                             
                              </tr>                                                                                                                                               
                            ))}                                                                                                                                                   
                          {nceaExamPdfs.filter(p => p.level === nceaPdfLevel).length === 0 && (                                                                                   
                            <tr>                                                                                                                                                  
                              <td className="px-3 py-2 text-slate-400" colSpan={3}>                                                                                               
                                No local exam PDFs found for this level yet.                                                                                                      
                              </td>                                                                                                                                               
                            </tr>                                                                                                                                                 
                          )}                                                                                                                                                      
                        </tbody>                                                                                                                                                  
                      </table>                                                                                                                                                    
                    </div>                                                                                                                                                        
                  </div>                                                                                                                                                          
                </div>                                                                                                                                                            
              </div>                                                                                                                                                              
            </div>                       
    {/* Footer */}                                                                                                                                                        
            <footer className="bg-gray-900 text-slate-200 py-8 mt-16 border-t border-slate-800">                                                                                  
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs md:text-sm grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>                                                                                                                                                                                                                                                                              
        <div className="flex items-center gap-2 mb-2">                                                                                                                                                                                                                                   
    <img
      src={footerLogo}
      alt="Mathx.nz logo"
      className="w-6 h-6"
    />
          <h3 className="font-semibold text-slate-100">mathx.nz</h3>                                                                                                                                                                                                                     
        </div>                                                                                                                                                                                                                                                                           
        <p className="text-slate-400">
          Free maths practice for New Zealand students. No subscriptions, no ads - just
          questions aligned to the NZ curriculum.
        </p>
        <button
          type="button"
          onClick={() => setMode('legal')}
          className="mt-4 text-slate-300 hover:text-white underline-offset-2 hover:underline text-sm"
        >
          Legal & Disclaimer
        </button>
      </div>
              <div>
                <h3 className="font-semibold mb-2 text-slate-100">Practice by level</h3>
                <div className="flex flex-col gap-1">
                  {availableYears.map(year => (
                    <a
                      key={year}
                      href={`/?year=${year}`}
                      className="text-slate-300 hover:text-white underline-offset-2 hover:underline"
                    >
                      Year {year}
                    </a>
                  ))}
                </div>
              </div>
                <div>                                                                                                                                                             
                  <h3 className="font-semibold mb-2 text-slate-100">More</h3>                                                                                                     
                  <div className="flex flex-col gap-1">                                                                                                                           
                    <a                                                                                                                                                            
                      href="/ixl-alternative"                                                                                                                                     
                      className="text-slate-300 hover:text-white underline-offset-2 hover:underline"                                                                              
                    >                                                                                                                                                             
                      Free alternative to IXL                                                                                                                                     
                    </a>                                                                                                                                                          
                  </div>                                                                                                                                                          
                  <p className="text-slate-500 mt-3">                                                                                                                             
                    © 2025 Mathx.nz. Free to learn. Free to grow.                                                                                                                 
                  </p>                                               
                                                                                                                                
        <a                                                                                                                                                                              
          href="https://docs.google.com/forms/d/1fBo3CgGwpLxq6ERuCRvEepfl_b_qloVghBntkvneQLs/edit"                                                                                      
          target="_blank"                                                                                                                                                               
          rel="noopener noreferrer"                                                                                                                                                     
          className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-500 text-slate-100 bg-slate-800 hover:bg-slate-700 hover:border-slate-300 transition         
  text-[0.8rem] font-semibold"                                                                                                                                                          
        >                                                                                                                                                                               
          Send us a message                                                                                                                                                
        </a>                                                                                                                       
                </div>                                                                                                                                                            
              </div>                                                                                                                                                              
            </footer>          
        </div>
      </>
    )
  }

  if (mode === 'legal') {
    const legalBlocks = legalDisclaimerContent
      .split(/\r?\n\r?\n/)
      .map(block => block.trim())
      .filter(Boolean)

    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            type="button"
            onClick={() => setMode('landing')}
            className="text-sm text-slate-600 hover:text-slate-900 mb-6 inline-flex items-center gap-2"
          >
            <span aria-hidden="true">←</span> Back to Mathx.nz
          </button>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <h1 className="text-4xl font-extrabold text-slate-900">Legal & Disclaimer</h1>
            <p className="text-slate-500">
              Please read these terms carefully. By using Mathx.nz you agree to the following conditions.
            </p>
            <div className="text-slate-700 leading-relaxed space-y-4">
              {legalBlocks.map((block, idx) => {
                if (block.startsWith('###')) {
                  const text = block.replace(/^###\s*\*\*(.*?)\*\*$/, '$1')
                  return (
                    <h2 key={`legal-h2-${idx}`} className="text-2xl font-bold text-slate-900 mt-4">
                      {text}
                    </h2>
                  )
                }
                if (/^\*\*(.*?)\*\*$/.test(block.split('\n')[0])) {
                  const text = block.replace(/^\*\*(.*?)\*\*$/, '$1')
                  return (
                    <h3 key={`legal-h3-${idx}`} className="text-xl font-semibold text-slate-900 mt-4">
                      {text}
                    </h3>
                  )
                }
                return (
                  <p key={`legal-p-${idx}`}>
                    {block.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                )
              })}
            </div>
          </div>
        </div>
      </div>
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

        {/* Inline PDF viewer for NCEA past papers and resources (available in practice/test too) */}
        {nceaPdfActive && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/70"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-none md:rounded-2xl shadow-2xl w-screen h-screen md:w-[95vw] md:h-[95vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
                <div className="text-[11px] md:text-sm text-slate-700 font-semibold truncate pr-3">
                  {nceaPdfActive.standard} �?" {nceaPdfActive.title} ({nceaPdfActive.year})
                </div>
                <button
                  type="button"
                  onClick={() => setNceaPdfActive(null)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 bg-slate-200">
                <iframe
                  src={nceaPdfActive.url}
                  title="NCEA past paper"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

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

        {/* Sidebar: curriculum map for normal practice, exam structure for NCEA trials */}
        {isTestMode && activeNceaPaper ? (
          <>
            <div style={{
              position: 'fixed',
              left: sidebarCollapsed ? '-280px' : '0',
              top: 0,
              width: '280px',
              height: '100vh',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              overflowY: 'auto',
              transition: 'left 0.3s ease',
              zIndex: 1000,
              padding: '20px',
              boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.9em', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  NCEA Level 1
                </h3>
                <h2 style={{ fontSize: '1.2em', margin: 0, fontWeight: 600 }}>
                  Std {activeNceaPaper.standard} · {activeNceaPaper.year}
                </h2>
                <div style={{ fontSize: '0.8em', color: '#bbb', marginTop: '4px' }}>
                  {activeNceaPaper.title}
                </div>
              </div>

              {(() => {
                const groups = []
                history.forEach((q, idx) => {
                  if (q.source !== 'NCEA') return
                  const num = q.examQuestionNumber
                  if (num == null) return
                  let group = groups.find(g => g.number === num)
                  if (!group) {
                    group = { number: num, parts: [] }
                    groups.push(group)
                  }
                  group.parts.push({
                    label: q.examPartLabel || '',
                    index: idx
                  })
                })

                return groups.map(group => {
                  const isCurrentGroup = group.parts.some(p => p.index === currentIndex)
                  return (
                    <div key={group.number} style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontSize: '0.85em',
                        fontWeight: 600,
                        color: isCurrentGroup ? '#4CAF50' : '#ccc',
                        marginBottom: '6px'
                      }}>
                        Question {group.number}
                      </div>
                      <div style={{ marginLeft: '10px' }}>
                        {group.parts.map((part, i) => {
                          const isCurrentPart = part.index === currentIndex
                          return (
                            <div
                              key={i}
                              style={{
                                fontSize: '0.75em',
                                color: isCurrentPart ? '#4CAF50' : '#999',
                                marginBottom: '4px',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                backgroundColor: isCurrentPart ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                                borderLeft: isCurrentPart ? '3px solid #4CAF50' : '3px solid transparent'
                              }}
                            >
                              {part.label || 'part'}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
            <CurriculumMapToggle
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </>
        ) : (
          <>
            <CurriculumMap
              currentStrand={isTestMode ? question?.strand : selectedStrand}
              currentTopic={isTestMode ? question?.topic : selectedTopic}
              currentSkill={selectedSkill}
              onSelectSkill={!isTestMode ? startPractice : null}
              collapsed={sidebarCollapsed}
              year={isTestMode ? (question?.year || selectedYear || 6) : selectedYear}
            />
            <CurriculumMapToggle
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </>
        )}

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
              {question?.visualData && question.visualData.type === 'image_resource' ? (
                (() => {
                  const url = resolveNceaResource(question.visualData.data)
                  if (!url) return null
                  return (
                    <div style={{ margin: '20px 0' }}>
                      <img
                        src={url}
                        alt="Exam diagram"
                        className="mx-auto max-w-full h-auto rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  )
                })()
              ) : (
                <QuestionVisualizer visualData={question.visualData} />
              )}
              <div id="math-question" style={{fontSize:'1.8em', margin: '30px 0', minHeight:'50px'}}></div>

              {/* Show WordDropdown for "write in words" questions, multiple choice when applicable, regular input for others */}
                {isMultipleChoice ? (
                  <div className="space-y-3 w-full max-w-2xl mx-auto">
                    <p className="text-sm font-semibold text-slate-600 text-left">Choose one:</p>
                    {question.choices.map((choice, idx) => {
                      const isSelected = selectedChoiceIndex === idx
                      return (
                        <button
                          type="button"
                          key={`${choice}-${idx}`}
                          className={`w-full text-left px-4 py-3 border rounded-2xl transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow'
                          }`}
                          onClick={() => {
                            setAnswer(choice)
                            setSelectedChoiceIndex(idx)
                          }}
                        >
                          {choice}
                        </button>
                      )
                    })}
                  </div>
                ) : isWordsQuestion ? (
                  <WordDropdown
                    key={question.templateId || currentIndex}
                    number={question.params?.n || 0}
                    onAnswer={(selectedAnswer) => {
                      setSelectedChoiceIndex(null)
                      setAnswer(selectedAnswer)
                    }}
                  />
                ) : (
                  <>
                    <input
                      className="input-primary"
                      value={answer}
                      onChange={e=>{
                        setSelectedChoiceIndex(null)
                        setAnswer(e.target.value)
                      }}
                      onKeyPress={e => e.key === 'Enter' && checkAnswer()}
                      placeholder="Your answer"
                    />
                    <div className="flex flex-wrap gap-2 justify-center mt-3 text-xs">
                      {/* Common math syntax helpers */}
                      <span className="text-gray-500 mr-2">Common symbols:</span>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={() => appendSymbol('×')}
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={() => appendSymbol('÷')}
                      >
                        ÷
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={() => appendSymbol('√')}
                      >
                        √
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={() => appendSymbol('^2')}
                      >
                        x²
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={() => appendSymbol('^')}
                      >
                        ^
                      </button>
                    </div>
                  </>
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
                  <button
                    type="button"
                    onClick={openKnowledgeModal}
                    className="btn-secondary"
                  >
                    Remind me the knowledge
                  </button>
                  {isTestMode && activeNceaPaper?.resourceUrl && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        const url = resolveNceaResource(activeNceaPaper.resourceUrl)
                        if (!url) {
                          window.alert('Resource PDF not found in the app bundle.')
                          return
                        }
                        setNceaPdfActive({
                          standard: activeNceaPaper.standard,
                          title: 'Resource booklet',
                          year: activeNceaPaper.year,
                          url
                        })
                      }}
                    >
                      View resource
                    </button>
                  )}
                    <button
                      className="btn-success"
                      onClick={checkAnswer}
                      disabled={!isDevMode && question?.answered}
                      aria-disabled={!isDevMode && question?.answered}
                      style={
                        !isDevMode && question?.answered
                          ? { opacity: 0.6, cursor: 'not-allowed' }
                          : undefined
                      }
                    >
                      Check Answer
                    </button>
                    {isDevMode && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setShowCorrectAnswer(true)
                          setFeedback(`Answer: ${question?.answer || 'N/A'}`)
                        }}
                        style={{marginLeft: '8px'}}
                      >
                        Reveal Answer
                      </button>
                    )}
  {isTestMode ? (                                                                                                                                                                       
    currentIndex < history.length - 1 ? (                                                                                                                                               
      <button                                                                                                                                                                           
        className="btn-primary"                                                                                                                                                         
        onClick={goForward}                                                                                                                                                             
        disabled={nextLocked}                                                                                                                                                           
        aria-disabled={nextLocked}                                                                                                                                                      
        style={{                                                                                                                                                                        
          opacity: nextLocked ? 0.6 : 1,                                                                                                                                                
          cursor: nextLocked ? 'not-allowed' : 'pointer'                                                                                                                                
        }}                                                                                                                                                                              
      >                                                                                                                                                                                 
        Next                                                                                                                                                                            
      </button>                                                                                                                                                                         
    ) : (                                                                                                                                                                               
      <button className="btn-danger" onClick={finishTest}>                                                                                                                              
        Finish Test                                                                                                                                                                     
      </button>                                                                                                                                                                         
    )                                                                                                                                                                                   
  ) : (                                                                                                                                                                                 
    <button                                                                                                                                                                             
      className="btn-primary"                                                                                                                                                           
      onClick={handleNext}                                                                                                                                                              
      disabled={nextLocked}                                                                                                                                                             
      aria-disabled={nextLocked}                                                                                                                                                        
      style={{                                                                                                                                                                          
        opacity: nextLocked ? 0.6 : 1,                                                                                                                                                  
        cursor: nextLocked ? 'not-allowed' : 'pointer'                                                                                                                                  
      }}                                                                                                                                                                                
    >                                                                                                                                                                                   
      Next                                                                                                                                                                              
    </button>                                                                                                                                                                           
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

              {showCorrectAnswer && question && (
                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  fontSize: '1.05em',
                  fontWeight: '600'
                }}>
                  Correct answer: <span style={{color: '#0b6'}}>{question.answer}</span>
                </div>
              )}

              {showCorrectAnswer && question && buildSolutionSteps(question) && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#eef2ff',
                  color: '#1e293b',
                  fontSize: '0.95em',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>How we worked it out:</div>
                  <div>{buildSolutionSteps(question)}</div>
                </div>
              )}
            </>
          )}

          {/* Report Issue Button - Top Right */}
          <button
            onClick={handleReportIssue}
            style={{
              position: 'absolute',
              top: '12px',
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
          htmlContent={hintModal.htmlContent}
        />
        <KnowledgeModal
          isOpen={knowledgeModal.isOpen}
          onClose={() => setKnowledgeModal({ isOpen: false, snippet: null })}
          snippet={knowledgeModal.snippet}
        />
      </>
    )
  }

  return null
}
