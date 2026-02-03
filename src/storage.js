// Simple localStorage-based user management and progress tracking
import CryptoJS from 'crypto-js'

const USERS_KEY = 'mathx_users'
const CURRENT_USER_KEY = 'mathx_current_user'
const LEADERBOARD_KEY = 'mathx_leaderboard'

// Encryption key - in a production app with a backend, this should be user-specific
// and stored securely. For client-side only, this provides protection against
// casual inspection and basic XSS attacks reading localStorage directly.
const ENCRYPTION_KEY = 'mathx_secure_key_v1_' + window.location.hostname

// Encrypt data before storing
function encryptData(data) {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return data // Fallback to unencrypted if encryption fails
  }
}

// Decrypt data after retrieving
function decryptData(encryptedData) {
  if (!encryptedData) return null

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    return decryptedText || null
  } catch (error) {
    console.error('Decryption error:', error)
    // Try returning the data as-is (might be old unencrypted data)
    return encryptedData
  }
}

// Secure localStorage wrapper
function secureSetItem(key, value) {
  const encrypted = encryptData(value)
  localStorage.setItem(key, encrypted)
}

function secureGetItem(key) {
  const encrypted = localStorage.getItem(key)
  return decryptData(encrypted)
}

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

  secureSetItem(USERS_KEY, JSON.stringify(users))
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
  secureSetItem(CURRENT_USER_KEY, normalizedUsername)
  return { success: true, user }
}

export function getCurrentUser() {
  const currentUsername = secureGetItem(CURRENT_USER_KEY)
  if (!currentUsername) return null

  const users = getAllUsers()
  return users[currentUsername] || null
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getAllUsers() {
  const usersJson = secureGetItem(USERS_KEY)
  return usersJson ? JSON.parse(usersJson) : {}
}

export function getSavedUsernames() {
  const users = getAllUsers()
  return Object.values(users)
    .map(user => user.username)
    .sort()
}

export function importUserData(importedData) {
  const currentUsername = secureGetItem(CURRENT_USER_KEY)
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

  secureSetItem(USERS_KEY, JSON.stringify(users))
}

// Progress Tracking
export function saveProgress(skillId, correct, year) {
  const user = getCurrentUser()
  if (!user) return

  const users = getAllUsers()
  const currentUsername = secureGetItem(CURRENT_USER_KEY)

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

  secureSetItem(USERS_KEY, JSON.stringify(users))
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
  const currentUsername = secureGetItem(CURRENT_USER_KEY)

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

  secureSetItem(USERS_KEY, JSON.stringify(users))
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

  secureSetItem(LEADERBOARD_KEY, JSON.stringify(top100))
}

export function getLeaderboard(year = null) {
  const leaderboardJson = secureGetItem(LEADERBOARD_KEY)
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
  const currentUsername = secureGetItem(CURRENT_USER_KEY)

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

  secureSetItem(USERS_KEY, JSON.stringify(users))
}

export function getPracticeHistory(limit = 20) {
  const user = getCurrentUser()
  if (!user || !user.practiceHistory) return []

  return user.practiceHistory.slice(0, limit)
}
