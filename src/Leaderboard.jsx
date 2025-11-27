import { useState, useEffect } from 'react'
import { getTopScores } from './storage.js'

export default function Leaderboard({ year }) {
  const [topScores, setTopScores] = useState([])

  useEffect(() => {
    const scores = getTopScores(year, 10)
    setTopScores(scores)
  }, [year])

  if (topScores.length === 0) {
    return (
      <div className="bg-white/80 p-6 rounded-xl card-shadow border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Top Scores - Year {year}
        </h3>
        <p className="text-gray-500 text-center py-8">
          No scores yet. Be the first to complete an assessment!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 p-6 rounded-xl card-shadow border border-white/50">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-3xl">🏆</span>
        Top Scores - Year {year}
      </h3>

      <div className="space-y-2">
        {topScores.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400'
                : index === 1
                ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400'
                : index === 2
                ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${
                index === 0 ? 'text-yellow-600' :
                index === 1 ? 'text-gray-600' :
                index === 2 ? 'text-orange-600' :
                'text-gray-400'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{entry.username}</div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0077B6]">
              {entry.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
