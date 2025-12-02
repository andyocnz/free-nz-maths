// Simple localStorage-based user management and progress tracking

const USERS_KEY = 'mathx_users'
const CURRENT_USER_KEY = 'mathx_current_user'
const LEADERBOARD_KEY = 'mathx_leaderboard'

// User Management
export function registerUser(username) {
  if (!username || username.trim().length < 2) {
    return { success: false, error: 'Username must be at least 2 characters' }
  }

  const users = getAllUsers()
  const normalizedUsername = username.trim().toLowerCase()

  if (users[normalizedUsername]) {
    return { success: false, error: 'Username already exists' }
  }

  users[normalizedUsername] = {
    username: username.trim(),
    createdAt: new Date().toISOString(),
    progress: {},
    testResults: [],
    totalScore: 0,
    questionsAnswered: 0
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return { success: true, user: users[normalizedUsername] }
}

export function loginUser(username) {
  if (!username || username.trim().length < 2) {
    return { success: false, error: 'Username must be at least 2 characters' }
  }

  const users = getAllUsers()
  const normalizedUsername = username.trim().toLowerCase()

  if (!users[normalizedUsername]) {
    // Auto-register if user doesn't exist
    return registerUser(username)
  }

  const user = users[normalizedUsername]
  localStorage.setItem(CURRENT_USER_KEY, normalizedUsername)
  return { success: true, user }
}

export function getCurrentUser() {
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY)
  if (!currentUsername) return null

  const users = getAllUsers()
  return users[currentUsername] || null
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getAllUsers() {
  const usersJson = localStorage.getItem(USERS_KEY)
  return usersJson ? JSON.parse(usersJson) : {}
}

export function importUserData(importedData) {
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY)
  if (!currentUsername) {
    throw new Error('No user is currently logged in.')
  }

  const users = getAllUsers()

  // The key for the user object is the normalized (lowercase) username
  const userKey = currentUsername.toLowerCase()

  if (!users[userKey]) {
    throw new Error('Current user not found in the database.')
  }
  
  // Overwrite the existing user's data with the imported data
  users[userKey] = {
    username: users[userKey].username, // Keep the original username casing
    createdAt: importedData.createdAt || users[userKey].createdAt,
    progress: importedData.progress || {},
    testResults: importedData.testResults || [],
    practiceHistory: importedData.practiceHistory || [],
    totalScore: importedData.totalScore || 0,
    questionsAnswered: importedData.questionsAnswered || 0,
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Progress Tracking
export function saveProgress(skillId, correct, year) {
  const user = getCurrentUser()
  if (!user) return

  const users = getAllUsers()
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY)

  if (!users[currentUsername].progress[year]) {
    users[currentUsername].progress[year] = {}
  }

  if (!users[currentUsername].progress[year][skillId]) {
    users[currentUsername].progress[year][skillId] = {
      attempted: 0,
      correct: 0,
      lastPracticed: null
    }
  }

  users[currentUsername].progress[year][skillId].attempted++
  if (correct) {
    users[currentUsername].progress[year][skillId].correct++
    users[currentUsername].totalScore++
  }
  users[currentUsername].progress[year][skillId].lastPracticed = new Date().toISOString()
  users[currentUsername].questionsAnswered++

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getProgress(year, skillId) {
  const user = getCurrentUser()
  if (!user || !user.progress[year]) return null

  return user.progress[year][skillId] || null
}

// Test Results
export function saveTestResult(year, score, total, timestamp) {
  const user = getCurrentUser()
  if (!user) return

  const users = getAllUsers()
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY)

  const result = {
    year,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: timestamp || new Date().toISOString()
  }

  users[currentUsername].testResults.push(result)

  // Update leaderboard
  updateLeaderboard(user.username, result.percentage, year, result.timestamp)

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getTestResults() {
  const user = getCurrentUser()
  if (!user) return []

  return user.testResults || []
}

// Leaderboard
function updateLeaderboard(username, percentage, year, timestamp) {
  const leaderboard = getLeaderboard()

  const entry = {
    username,
    percentage,
    year,
    timestamp
  }

  leaderboard.push(entry)

  // Keep only top 100 scores
  leaderboard.sort((a, b) => b.percentage - a.percentage)
  const top100 = leaderboard.slice(0, 100)

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top100))
}

export function getLeaderboard(year = null) {
  const leaderboardJson = localStorage.getItem(LEADERBOARD_KEY)
  let leaderboard = leaderboardJson ? JSON.parse(leaderboardJson) : []

  if (year) {
    leaderboard = leaderboard.filter(entry => entry.year === year)
  }

  return leaderboard
}

export function getTopScores(year, limit = 10) {
  const leaderboard = getLeaderboard(year)
  return leaderboard.slice(0, limit)
}

// Practice History
export function savePracticeSession(skillName, year, score, total, timestamp) {
  const user = getCurrentUser()
  if (!user) return

  const users = getAllUsers()
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY)

  if (!users[currentUsername].practiceHistory) {
    users[currentUsername].practiceHistory = []
  }

  const session = {
    skillName,
    year,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: timestamp || new Date().toISOString(),
    date: new Date(timestamp || Date.now()).toLocaleDateString()
  }

  users[currentUsername].practiceHistory.unshift(session) // Add to beginning

  // Keep only last 50 sessions
  if (users[currentUsername].practiceHistory.length > 50) {
    users[currentUsername].practiceHistory = users[currentUsername].practiceHistory.slice(0, 50)
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getPracticeHistory(limit = 20) {
  const user = getCurrentUser()
  if (!user || !user.practiceHistory) return []

  return user.practiceHistory.slice(0, limit)
}
