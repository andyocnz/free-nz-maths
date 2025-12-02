import { useState, useEffect, useRef } from 'react'

const numberPuzzles = [
  // Existing Puzzles
  { prompt: "Next term?", sequence: "1, 4, 9, 16, 25, ?", answer: 36, explanation: "Square numbers (n²)" },
  { prompt: "Next number?", sequence: "3, 6, 12, 24, ?", answer: 48, explanation: "Multiply by 2" },
  { prompt: "Pattern?", sequence: "1, 1, 2, 3, 5, 8, ?", answer: 13, explanation: "Fibonacci Sequence" },

  // New Additions
  { prompt: "What comes next?", sequence: "2, 3, 5, 7, 11, ?", answer: 13, explanation: "Prime numbers" },
  { prompt: "Next in sequence?", sequence: "1, 8, 27, 64, ?", answer: 125, explanation: "Cube numbers (n³)" },
  { prompt: "Find the next number.", sequence: "1, 3, 6, 10, 15, ?", answer: 21, explanation: "Triangular numbers (add successive integers)" },
  { prompt: "What's the pattern?", sequence: "1, 2, 6, 24, 120, ?", answer: 720, explanation: "Factorials (n!)" },
  { prompt: "Next number?", sequence: "10, 7, 4, 1, ?", answer: -2, explanation: "Subtract 3 each time" },
  { prompt: "Find the next term.", sequence: "2, 5, 10, 17, 26, ?", answer: 37, explanation: "n² + 1" },
  { prompt: "What follows?", sequence: "4, 6, 9, 13, 18, ?", answer: 24, explanation: "Add 2, then 3, then 4, etc." },
  { prompt: "Continue the sequence.", sequence: "9, 18, 16, 32, 30, ?", answer: 60, explanation: "Alternate multiplying by 2 and subtracting 2" },
  { prompt: "Next in line?", sequence: "100, 50, 52, 26, 28, ?", answer: 14, explanation: "Alternate dividing by 2 and adding 2" }
]

export default function DailyChallenge() {
  const [puzzleType, setPuzzleType] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')

  // Canvas puzzle state
  const canvasRef = useRef(null)
  const [gridCells, setGridCells] = useState([])
  const [targetCount, setTargetCount] = useState(0)
  const [totalCells, setTotalCells] = useState(9)

  // Algebra puzzle state
  const [algebraPuzzle, setAlgebraPuzzle] = useState(null)

  const generateAlgebraPuzzle = () => {
    const x = Math.floor(Math.random() * 10) + 1 // Answer: 1-10
    const a = Math.floor(Math.random() * 5) + 2 // Coefficient: 2-6
    const b = Math.floor(Math.random() * 20) + 1 // Addend: 1-20
    const c = a * x + b
    return { a, b, c, x, equation: `${a}x + ${b} = ${c}` }
  }

  useEffect(() => {
    // Randomly choose puzzle type
    const puzzleTypes = ['number', 'fraction', 'algebra']
    const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)]
    setPuzzleType(type)

    if (type === 'number') {
      const randomPuzzle = numberPuzzles[Math.floor(Math.random() * numberPuzzles.length)]
      setPuzzle(randomPuzzle)
    } else if (type === 'fraction') {
      // Initialize fraction grid puzzle
      const cells = Array(9).fill(false)
      const target = Math.floor(Math.random() * 5) + 3 // 3-7 cells to shade
      setGridCells(cells)
      setTargetCount(target)
      setTotalCells(9)
    } else if (type === 'algebra') {
      setAlgebraPuzzle(generateAlgebraPuzzle())
    }
  }, [])

  useEffect(() => {
    if (puzzleType === 'fraction' && canvasRef.current) {
      drawGrid()
    }
  }, [gridCells, puzzleType])

  const drawGrid = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cellSize = size / 3

    ctx.clearRect(0, 0, size, size)

    // Draw background
    ctx.fillStyle = '#e0f2fe'
    ctx.fillRect(0, 0, size, size)

    // Draw cells
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col
        const x = col * cellSize
        const y = row * cellSize

        ctx.fillStyle = gridCells[index] ? '#FFC107' : 'white'
        ctx.fillRect(x, y, cellSize, cellSize)

        ctx.strokeStyle = '#0d1a2b'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, cellSize, cellSize)
      }
    }
  }

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const cellSize = canvas.width / 3
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    const index = row * 3 + col

    const newCells = [...gridCells]
    newCells[index] = !newCells[index]
    setGridCells(newCells)
    setFeedback('')
  }

  const checkNumberAnswer = () => {
    if (!puzzle) return

    const val = parseInt(userAnswer)
    if (val === puzzle.answer) {
      setFeedback(`✅ Correct! ${puzzle.explanation}`)
    } else {
      setFeedback('❌ Try again.')
    }
  }

  const checkFractionAnswer = () => {
    const shadedCount = gridCells.filter(c => c).length
    if (shadedCount === targetCount) {
      setFeedback(`✅ Correct! You shaded ${shadedCount}/${totalCells}.`)
    } else {
      setFeedback(`❌ Try again. You shaded ${shadedCount}/${totalCells}, but you need to shade ${targetCount}/${totalCells}.`)
    }
  }

  const checkAlgebraAnswer = () => {
    if (!algebraPuzzle) return

    const val = parseInt(userAnswer)
    if (val === algebraPuzzle.x) {
      setFeedback(`✅ Correct! The value of x is ${algebraPuzzle.x}.`)
    } else {
      setFeedback('❌ Try again.')
    }
  }

  const resetFractionPuzzle = () => {
    setGridCells(Array(9).fill(false))
    setFeedback('')
  }

  if (!puzzleType) return null

  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl card-shadow border border-white/50 w-full max-w-lg mx-auto transform transition duration-500 hover:scale-[1.01]">
      <h3 className="text-2xl font-bold text-[#0077B6] mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Daily Challenge
      </h3>

      {puzzleType === 'number' && puzzle && (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">{puzzle.prompt}</p>
          <p className="text-3xl font-extrabold text-slate-800 mb-6 bg-slate-50/50 border border-slate-200/50 p-3 rounded-lg text-center font-mono tracking-widest">
            {puzzle.sequence.split('?')[0]}<span className="text-red-500">?</span>
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkNumberAnswer()}
              placeholder="?"
              className="flex-grow p-3 border-2 border-gray-200 bg-white/60 rounded-lg focus:border-[#0077B6] outline-none text-lg font-mono text-center"
            />
            <button
              onClick={checkNumberAnswer}
              className="px-6 py-3 bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
            >
              Check
            </button>
          </div>
        </>
      )}

      {puzzleType === 'algebra' && algebraPuzzle && (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">Solve for x:</p>
          <p className="text-3xl font-extrabold text-slate-800 mb-6 bg-slate-50/50 border border-slate-200/50 p-3 rounded-lg text-center font-mono tracking-widest">
            {algebraPuzzle.equation}
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAlgebraAnswer()}
              placeholder="x = ?"
              className="flex-grow p-3 border-2 border-gray-200 bg-white/60 rounded-lg focus:border-[#0077B6] outline-none text-lg font-mono text-center"
            />
            <button
              onClick={checkAlgebraAnswer}
              className="px-6 py-3 bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
            >
              Check
            </button>
          </div>
        </>
      )}

      {puzzleType === 'fraction' && (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">
            Click to shade <span className="font-bold text-[#0077B6]">{targetCount}/{totalCells}</span> of the grid
          </p>

          <div className="mb-4 flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onClick={handleCanvasClick}
              className="cursor-pointer rounded-lg border-2 border-gray-300"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div className="text-center mb-4">
            <p className="text-xl font-bold text-[#0077B6]">
              Shaded: {gridCells.filter(c => c).length}/{totalCells}
            </p>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={checkFractionAnswer}
              className="flex-1 px-6 py-3 bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
            >
              Check
            </button>
            <button
              onClick={resetFractionPuzzle}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {feedback && (
        <div className={`p-3 rounded-lg border-l-4 text-sm ${
          feedback.includes('Correct')
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {feedback}
        </div>
      )}
    </div>
  )
}
