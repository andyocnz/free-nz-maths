import { useState } from 'react'

export default function LoginRecommendationModal({ onLogin, onSkip }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter your name')
      return
    }
    onLogin(username.trim())
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
              <span className="text-3xl font-bold text-white">Σ</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              mathx<span className="text-gradient">.nz</span>
            </h2>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Save Your Progress?</h3>
          <p className="text-gray-600">Enter your name to track your progress and earn certificates</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0077B6] focus:outline-none text-lg"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-[#0077B6] hover:bg-sky-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors"
            >
              Save Progress
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              Continue Without Saving
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your progress will be saved locally in your browser
          </p>
        </form>
      </div>
    </div>
  )
}
