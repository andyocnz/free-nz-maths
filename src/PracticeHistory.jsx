import { useState, useEffect } from 'react'
import { getPracticeHistory } from './storage.js'

export default function PracticeHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const sessions = getPracticeHistory(20)
    setHistory(sessions)
  }, [])

  if (history.length === 0) {
    return (
      <div className="bg-white/80 p-6 rounded-xl card-shadow border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Practice History
        </h3>
        <p className="text-gray-500 text-center py-8">
          No practice sessions yet. Start practicing to see your history!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 p-6 rounded-xl card-shadow border border-white/50">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Practice History
      </h3>

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
    </div>
  )
}
