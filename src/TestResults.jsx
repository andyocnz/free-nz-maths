import Certificate from './Certificate.jsx'

export default function TestResults({ results, onBackToMenu, onPracticeSkill, username, year }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
            <span className="text-3xl font-bold text-white">Σ</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            mathx<span style={{ backgroundImage: 'linear-gradient(to right, #0077B6, #00BFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.nz</span>
          </h2>
        </div>

        <h1 className="text-5xl font-bold text-center text-[#0077B6] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>Test Results</h1>

        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="text-7xl font-bold text-[#4CAF50] mb-4">
            {results.grade}
          </div>
          <div className="text-4xl font-semibold mb-3">
            {results.percentageScore}%
          </div>
          <div className="text-xl text-gray-600">
            {results.correctAnswers} correct out of {results.totalQuestions} questions
          </div>
          {results.unanswered > 0 && (
            <div className="text-orange-600 mt-3 font-semibold">
              ({results.unanswered} unanswered)
            </div>
          )}
        </div>

        {/* Performance by Strand */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Performance by Topic Area</h2>
        <div className="space-y-4 mb-8">
          {Object.keys(results.byStrand).map(strandName => {
            const strand = results.byStrand[strandName]
            const percentage = strand.total > 0 ? Math.round((strand.correct / strand.total) * 100) : 0
            const barColor = percentage >= 70 ? 'bg-[#4CAF50]' : percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
            const textColor = percentage >= 70 ? 'text-[#4CAF50]' : percentage >= 50 ? 'text-orange-500' : 'text-red-500'

            return (
              <div key={strandName} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex justify-between mb-3">
                  <strong className="text-lg">{strandName}</strong>
                  <span className={`${textColor} font-bold`}>
                    {strand.correct}/{strand.total} ({percentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Show topics within this strand */}
                {percentage < 70 && (
                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    {Object.keys(strand.topics).map(topicName => {
                      const topic = strand.topics[topicName]
                      const topicPercentage = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0

                      if (topicPercentage < 70) {
                        return (
                          <div key={topicName} className="ml-4">
                            • {topicName}: {topic.correct}/{topic.total} ({topicPercentage}%)
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        {results.recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-6">
              Areas to Practice for Improvement
            </h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
              {results.recommendations.map((rec, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h3 className="text-xl font-semibold text-orange-700 mb-3">
                    {rec.strand} ({rec.percentage}%)
                  </h3>
                  {rec.topics.map((topic, topicIdx) => (
                    <div key={topicIdx} className="ml-6 mb-4">
                      <strong className="text-gray-800">{topic.topic}</strong>
                      <span className="text-gray-600"> ({topic.percentage}%)</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topic.skills.map((skill, skillIdx) => (
                          <button
                            key={skillIdx}
                            onClick={() => onPracticeSkill(skill)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm"
                          >
                            Practice: {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive feedback for good performance */}
        {results.percentageScore >= 80 && (
          <div className="bg-green-50 border-l-4 border-[#4CAF50] rounded-lg p-6 mb-8 text-center">
            <h3 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h3>
            <p className="text-gray-700 text-lg">
              You're doing great! Keep up the excellent work and continue practicing to maintain your skills.
            </p>
          </div>
        )}

        {/* Certificate Section */}
        {username && results.percentageScore >= 50 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Certificate</h2>
            <Certificate
              username={username}
              year={year}
              score={results.correctAnswers}
              total={results.totalQuestions}
              topicName="Full Assessment"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="text-center">
          <button
            onClick={onBackToMenu}
            className="px-8 py-4 text-lg bg-[#4CAF50] text-white rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
