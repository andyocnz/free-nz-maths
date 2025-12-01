import { useState, useEffect, useRef } from 'react'
import { getPracticeHistory, getCurrentUser, importUserData } from './storage.js'

export default function PracticeHistory() {
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)

  const refreshHistory = () => {
    const sessions = getPracticeHistory(20)
    setHistory(sessions)
  }

  useEffect(() => {
    refreshHistory()
  }, [])

  const handleExport = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      alert('You must be logged in to export your data.')
      return
    }

    const dataToExport = {
      username: currentUser.username,
      createdAt: currentUser.createdAt,
      progress: currentUser.progress || {},
      testResults: currentUser.testResults || [],
      practiceHistory: currentUser.practiceHistory || [],
      totalScore: currentUser.totalScore || 0,
      questionsAnswered: currentUser.questionsAnswered || 0,
    }

    const filename = `mathx_user_data_${currentUser.username}.json`
    const jsonStr = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        
        if (
          !importedData ||
          typeof importedData.username !== 'string' ||
          !importedData.practiceHistory
        ) {
          throw new Error('Invalid or corrupted data file.')
        }

        importUserData(importedData)
        alert('Import successful! Your data has been updated.')
        refreshHistory() // Re-fetch and update the history displayed

      } catch (error) {
        alert(`Import failed: ${error.message}`)
      } finally {
        // Reset file input so the same file can be selected again
        if(fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white/80 p-6 rounded-xl card-shadow border border-white/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Practice History
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-semibold"
          >
            Export Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            id="import-file"
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
          <label
            htmlFor="import-file"
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer text-sm font-semibold"
          >
            Import Data
          </label>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No practice sessions yet. Start practicing to see your history!
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Topic</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Year</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Score</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-gray-700">{session.date}</td>
                    <td className="py-2 px-3 text-gray-800 font-medium">{session.skillName || 'Full Assessment'}</td>
                    <td className="py-2 px-3 text-center text-gray-600">Year {session.year}</td>
                    <td className="py-2 px-3 text-center font-semibold text-gray-700">
                      {session.score}/{session.total}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full font-bold text-xs ${
                        session.percentage >= 80 ? 'bg-green-100 text-green-700' :
                        session.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {session.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Showing last {history.length} practice sessions
          </div>
        </>
      )}
    </div>
  )
}
