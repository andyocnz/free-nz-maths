import { useState, useEffect, useRef } from 'react'

const numberPuzzles = [
  { prompt: "Next term?", sequence: "1, 4, 9, 16, 25, ?", answer: 36, explanation: "Square numbers (n²)" },
  { prompt: "Next number?", sequence: "3, 6, 12, 24, ?", answer: 48, explanation: "Multiply by 2" },
  { prompt: "Pattern?", sequence: "1, 1, 2, 3, 5, 8, ?", answer: 13, explanation: "Fibonacci Sequence" },
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

const mathRiddles = [
  {
    prompt: "If a brick weighs 1kg plus half a brick, how much does the brick weigh?",
    answer: 2,
    explanation: "If it weighs 1kg + half its weight, then half = 1kg, so full brick = 2kg"
  },
  {
    prompt: "I'm thinking of a number. If you add 5 and then multiply by 2, you get 24. What's my number?",
    answer: 7,
    explanation: "(7 + 5) × 2 = 24"
  },
  {
    prompt: "A snail climbs 3m up a wall during the day and slips 2m down at night. On which day will it reach the top of a 10m wall?",
    answer: 8,
    explanation: "On day 8, it climbs from 7m to 10m and reaches the top before slipping"
  },
  {
    prompt: "If 5 cats catch 5 mice in 5 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
    answer: 5,
    explanation: "Each cat catches 1 mouse per 5 minutes, so 5 cats catch 100 mice in 100 minutes"
  },
  {
    prompt: "What is the smallest whole number that is divisible by both 6 and 8?",
    answer: 24,
    explanation: "LCM of 6 and 8 is 24"
  },
  {
    prompt: "A book has 500 pages. How many times does the digit 1 appear in the page numbers?",
    answer: 200,
    explanation: "Count appearances in units (50), tens (50), and hundreds (100) = 200 total"
  }
]

const geometryPuzzles = [
  {
    type: 'angle',
    prompt: "Two angles in a triangle are 45° and 65°. What's the third angle?",
    answer: 70,
    explanation: "Angles in a triangle sum to 180°. 180 - 45 - 65 = 70°"
  },
  {
    type: 'angle',
    prompt: "Three angles meet at a point: 120°, 85°, and x. Find x.",
    answer: 155,
    explanation: "Angles around a point sum to 360°. 360 - 120 - 85 = 155°"
  },
  {
    type: 'angle',
    prompt: "A straight line is split by a ray into 110° and x. Find x.",
    answer: 70,
    explanation: "Angles on a straight line sum to 180°. 180 - 110 = 70°"
  },
  {
    type: 'area',
    prompt: "A rectangle is 8cm long and 5cm wide. What's its area?",
    answer: 40,
    unit: "cm²",
    explanation: "Area = length × width = 8 × 5 = 40cm²"
  },
  {
    type: 'area',
    prompt: "A square has sides of 7m. What's its perimeter?",
    answer: 28,
    unit: "m",
    explanation: "Perimeter = 4 × side = 4 × 7 = 28m"
  },
  {
    type: 'area',
    prompt: "A triangle has base 10cm and height 6cm. What's its area?",
    answer: 30,
    unit: "cm²",
    explanation: "Area = ½ × base × height = ½ × 10 × 6 = 30cm²"
  }
]

const logicPuzzles = [
  {
    type: 'bridge',
    prompt: "Four people need to cross a bridge at night with one lantern. They take 1, 2, 5, and 10 minutes to cross. Maximum 2 people can cross at once, and the lantern must be carried back. What's the minimum time in minutes?",
    answer: 17,
    explanation: "Solution: 1&2 cross (2 min), 1 returns (1 min), 5&10 cross (10 min), 2 returns (2 min), 1&2 cross (2 min). Total: 17 minutes"
  },
  {
    type: 'ropes',
    prompt: "You have two ropes that each take exactly 60 minutes to burn completely. They burn unevenly (not at a constant rate). How can you measure exactly 45 minutes?",
    answer: 45,
    explanation: "Light rope 1 at both ends and rope 2 at one end. When rope 1 burns out (30 min), light rope 2's other end. It will burn in 15 more minutes. Total: 45 minutes"
  },
  {
    type: 'river',
    prompt: "A farmer must cross a river with a wolf, a goat, and a cabbage. The boat holds the farmer plus only one item. If left alone, the wolf eats the goat, or the goat eats the cabbage. How many trips does the farmer make?",
    answer: 7,
    explanation: "7 trips: Take goat across (1), return (2), take wolf/cabbage (3), bring goat back (4), take cabbage/wolf (5), return (6), take goat (7)"
  },
  {
    type: 'utilities',
    prompt: "There are 3 houses and 3 utilities (gas, water, electricity). Can you connect each house to all 3 utilities without any lines crossing? Type 1 for YES, 0 for NO.",
    answer: 0,
    explanation: "It's impossible! This is a classic problem in graph theory. The graph K₃,₃ is non-planar and cannot be drawn without crossings"
  },
  {
    type: 'pirates',
    prompt: "Five pirates (A smartest, B, C, D, E dumbest) must divide 100 gold coins. A proposes first. If majority votes yes, it's accepted. If no, A dies and B proposes next, etc. Pirates are greedy but rational. How many coins does pirate A propose for himself?",
    answer: 98,
    explanation: "Working backwards: A proposes {A:98, B:0, C:1, D:0, E:1}. C and E vote yes (better than getting nothing if A dies), giving A the majority he needs"
  },
  {
    type: 'monty',
    prompt: "You're on a game show with 3 doors. Behind one is a car, behind the others are goats. You pick Door 1. The host (who knows what's behind each door) opens Door 3, revealing a goat. If you SWITCH to Door 2, what's your probability of winning the car? (Enter as percentage 0-100)",
    answer: 67,
    explanation: "Switching gives you 2/3 (67%) chance! When you first picked, you had 1/3 chance. The host's reveal doesn't change that. By switching, you win if your first pick was wrong (2/3 chance)"
  },
  {
    type: 'hanoi3',
    prompt: "Tower of Hanoi: You have 3 disks stacked on the left peg (largest at bottom). You can move one disk at a time, and never place a larger disk on a smaller one. What's the minimum number of moves to transfer all disks to the right peg?",
    answer: 7,
    explanation: "Minimum moves = 2³ - 1 = 7. The pattern is: 1 disk = 1 move, 2 disks = 3 moves, 3 disks = 7 moves, n disks = 2ⁿ - 1 moves"
  },
  {
    type: 'hanoi4',
    prompt: "Tower of Hanoi: You have 4 disks stacked on the left peg (largest at bottom). You can move one disk at a time, and never place a larger disk on a smaller one. What's the minimum number of moves to transfer all disks to the right peg?",
    answer: 15,
    explanation: "Minimum moves = 2⁴ - 1 = 15. The pattern is: n disks = 2ⁿ - 1 moves"
  },
  {
    type: 'knights',
    prompt: "On an island, knights always tell the truth and knaves always lie. Person A says: 'We are both knaves.' What is A? (Type 1 for KNIGHT, 0 for KNAVE)",
    answer: 0,
    explanation: "A must be a KNAVE (0). If A were a knight (truth-teller), the statement 'we are both knaves' would be false, contradicting knights always telling truth. So A is a knave, lying about both being knaves"
  },
  {
    type: 'knights2',
    prompt: "Knights always tell truth, knaves always lie. Person A says: 'I am a knave.' What is A? (Type 1 for KNIGHT, 0 for KNAVE, 2 for IMPOSSIBLE)",
    answer: 2,
    explanation: "IMPOSSIBLE! A knight can't say 'I am a knave' (that would be a lie). A knave can't say 'I am a knave' (that would be truth). This statement is paradoxical and cannot be made by either"
  },
  {
    type: 'handshake10',
    prompt: "At a party with 10 people, everyone shakes hands exactly once with every other person. How many total handshakes occur?",
    answer: 45,
    explanation: "Formula: n(n-1)/2 where n = number of people. For 10 people: 10 × 9 / 2 = 45 handshakes"
  },
  {
    type: 'handshake8',
    prompt: "At a meeting with 8 people, everyone shakes hands exactly once with every other person. How many total handshakes occur?",
    answer: 28,
    explanation: "Formula: n(n-1)/2 where n = number of people. For 8 people: 8 × 7 / 2 = 28 handshakes"
  }
]

function generateMagicSquare() {
  // Generate a 3x3 magic square puzzle with one missing number
  const magicSquares = [
    { grid: [[2, 7, 6], [9, 5, 1], [4, 3, 8]], missing: { row: 1, col: 2 }, answer: 1 },
    { grid: [[8, 1, 6], [3, 5, 7], [4, 9, 2]], missing: { row: 2, col: 1 }, answer: 9 },
    { grid: [[6, 1, 8], [7, 5, 3], [2, 9, 4]], missing: { row: 0, col: 2 }, answer: 8 },
    { grid: [[4, 9, 2], [3, 5, 7], [8, 1, 6]], missing: { row: 1, col: 0 }, answer: 3 }
  ]
  return magicSquares[Math.floor(Math.random() * magicSquares.length)]
}

function generateMiniSudoku() {
  // 4x4 Sudoku with one missing number
  const sudokus = [
    { grid: [[1, 2, 3, 4], [3, 4, 1, 2], [2, 3, 4, 1], [4, 1, 2, 3]], missing: { row: 1, col: 0 }, answer: 3 },
    { grid: [[3, 4, 1, 2], [1, 2, 3, 4], [4, 1, 2, 3], [2, 3, 4, 1]], missing: { row: 2, col: 0 }, answer: 4 },
    { grid: [[2, 1, 4, 3], [4, 3, 2, 1], [1, 2, 3, 4], [3, 4, 1, 2]], missing: { row: 0, col: 1 }, answer: 1 },
    { grid: [[4, 3, 2, 1], [2, 1, 4, 3], [3, 4, 1, 2], [1, 2, 3, 4]], missing: { row: 3, col: 2 }, answer: 3 }
  ]
  return sudokus[Math.floor(Math.random() * sudokus.length)]
}

function generatePatternPuzzle() {
  // Pattern matching: identify the rule and find missing number
  const patterns = [
    {
      grid: [[2, 4, 8], [3, 9, 27], [4, 16, '?']],
      answer: 64,
      explanation: "Pattern: row values are [n, n², n³]",
      missing: { row: 2, col: 2 }
    },
    {
      grid: [[1, 2, 3], [2, 4, 6], [3, 6, '?']],
      answer: 9,
      explanation: "Pattern: multiply row and column numbers",
      missing: { row: 2, col: 2 }
    },
    {
      grid: [[5, 10, 15], [4, 8, 12], [3, 6, '?']],
      answer: 9,
      explanation: "Pattern: first column × 3 = third column",
      missing: { row: 2, col: 2 }
    },
    {
      grid: [[1, 1, 2], [2, 3, 5], [3, 5, '?']],
      answer: 8,
      explanation: "Pattern: Fibonacci-style - add previous two numbers in each row",
      missing: { row: 2, col: 2 }
    }
  ]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

function generateNumberPyramid() {
  // Number pyramid: each number is the sum of the two below it
  const pyramids = [
    {
      pyramid: [[15], [7, 8], [3, '?', 5]],
      answer: 4,
      explanation: "Each number is the sum of the two below: 7 = 3 + 4, so ? = 4",
      missing: { row: 2, col: 1 }
    },
    {
      pyramid: [[26], ['?', 11], [8, 7, 4]],
      answer: 15,
      explanation: "Each number is the sum of the two below: 26 = 15 + 11, so ? = 15",
      missing: { row: 1, col: 0 }
    },
    {
      pyramid: [[30], [13, 17], [5, 8, '?']],
      answer: 9,
      explanation: "Each number is the sum of the two below: 17 = 8 + 9, so ? = 9",
      missing: { row: 2, col: 2 }
    }
  ]
  return pyramids[Math.floor(Math.random() * pyramids.length)]
}

export default function DailyChallenge({ devMode = false, onPlayMore }) {
  const puzzleTypes = ['number', 'algebra', 'riddle', 'geometry', 'magicSquare', 'sudoku', 'pattern', 'pyramid', 'logicPuzzle']

  // Create flat array of ALL individual puzzles for dev mode
  const getAllPuzzles = () => {
    const allPuzzles = []

    // Add all number puzzles
    numberPuzzles.forEach((p, i) => {
      allPuzzles.push({ type: 'number', index: i, data: p })
    })

    // Add algebra variations
    for (let i = 0; i < 5; i++) {
      allPuzzles.push({ type: 'algebra', index: i })
    }

    // Add all riddles
    mathRiddles.forEach((p, i) => {
      allPuzzles.push({ type: 'riddle', index: i, data: p })
    })

    // Add all geometry puzzles
    geometryPuzzles.forEach((p, i) => {
      allPuzzles.push({ type: 'geometry', index: i, data: p })
    })

    // Add all magic squares (get from generator)
    const magicSquares = [
      { grid: [[2, 7, 6], [9, 5, 1], [4, 3, 8]], missing: { row: 1, col: 2 }, answer: 1 },
      { grid: [[8, 1, 6], [3, 5, 7], [4, 9, 2]], missing: { row: 2, col: 1 }, answer: 9 },
      { grid: [[6, 1, 8], [7, 5, 3], [2, 9, 4]], missing: { row: 0, col: 2 }, answer: 8 },
      { grid: [[4, 9, 2], [3, 5, 7], [8, 1, 6]], missing: { row: 1, col: 0 }, answer: 3 }
    ]
    magicSquares.forEach((p, i) => {
      allPuzzles.push({ type: 'magicSquare', index: i, data: p })
    })

    // Add all sudokus
    const sudokus = [
      { grid: [[1, 2, 3, 4], [3, 4, 1, 2], [2, 3, 4, 1], [4, 1, 2, 3]], missing: { row: 1, col: 0 }, answer: 3 },
      { grid: [[3, 4, 1, 2], [1, 2, 3, 4], [4, 1, 2, 3], [2, 3, 4, 1]], missing: { row: 2, col: 0 }, answer: 4 },
      { grid: [[2, 1, 4, 3], [4, 3, 2, 1], [1, 2, 3, 4], [3, 4, 1, 2]], missing: { row: 0, col: 1 }, answer: 1 },
      { grid: [[4, 3, 2, 1], [2, 1, 4, 3], [3, 4, 1, 2], [1, 2, 3, 4]], missing: { row: 3, col: 2 }, answer: 3 }
    ]
    sudokus.forEach((p, i) => {
      allPuzzles.push({ type: 'sudoku', index: i, data: p })
    })

    // Add all pattern puzzles
    const patterns = [
      {
        grid: [[2, 4, 8], [3, 9, 27], [4, 16, '?']],
        answer: 64,
        explanation: "Pattern: row values are [n, n², n³]",
        missing: { row: 2, col: 2 }
      },
      {
        grid: [[1, 2, 3], [2, 4, 6], [3, 6, '?']],
        answer: 9,
        explanation: "Pattern: multiply row and column numbers",
        missing: { row: 2, col: 2 }
      },
      {
        grid: [[5, 10, 15], [4, 8, 12], [3, 6, '?']],
        answer: 9,
        explanation: "Pattern: first column × 3 = third column",
        missing: { row: 2, col: 2 }
      },
      {
        grid: [[1, 1, 2], [2, 3, 5], [3, 5, '?']],
        answer: 8,
        explanation: "Pattern: Fibonacci-style - add previous two numbers in each row",
        missing: { row: 2, col: 2 }
      }
    ]
    patterns.forEach((p, i) => {
      allPuzzles.push({ type: 'pattern', index: i, data: p })
    })

    // Add all pyramids
    const pyramids = [
      {
        pyramid: [[15], [7, 8], [3, '?', 5]],
        answer: 4,
        explanation: "Each number is the sum of the two below: 7 = 3 + 4, so ? = 4",
        missing: { row: 2, col: 1 }
      },
      {
        pyramid: [[26], ['?', 11], [8, 7, 4]],
        answer: 15,
        explanation: "Each number is the sum of the two below: 26 = 15 + 11, so ? = 15",
        missing: { row: 1, col: 0 }
      },
      {
        pyramid: [[30], [13, 17], [5, 8, '?']],
        answer: 9,
        explanation: "Each number is the sum of the two below: 17 = 8 + 9, so ? = 9",
        missing: { row: 2, col: 2 }
      }
    ]
    pyramids.forEach((p, i) => {
      allPuzzles.push({ type: 'pyramid', index: i, data: p })
    })

    // Add all logic puzzles
    logicPuzzles.forEach((p, i) => {
      allPuzzles.push({ type: 'logicPuzzle', index: i, data: p })
    })

    return allPuzzles
  }

  const [puzzleType, setPuzzleType] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const canvasRef = useRef(null)

  // Dev mode navigation state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const allPuzzles = devMode ? getAllPuzzles() : []

  // Magic square state
  const [magicSquare, setMagicSquare] = useState(null)

  // Sudoku state
  const [sudoku, setSudoku] = useState(null)

  // Pattern puzzle state
  const [patternPuzzle, setPatternPuzzle] = useState(null)

  // Number pyramid state
  const [pyramidPuzzle, setPyramidPuzzle] = useState(null)

  // Logic puzzle state
  const [logicPuzzle, setLogicPuzzle] = useState(null)

  // Function to load a specific puzzle (dev mode) or random (normal mode)
  const loadPuzzle = (puzzleConfig) => {
    setUserAnswer('')
    setFeedback('')
    setWrongAttempts(0)

    // Clear all puzzle states
    setPuzzle(null)
    setMagicSquare(null)
    setSudoku(null)
    setPatternPuzzle(null)
    setPyramidPuzzle(null)
    setLogicPuzzle(null)

    setPuzzleType(puzzleConfig.type)

    if (puzzleConfig.type === 'number') {
      setPuzzle(puzzleConfig.data)
    } else if (puzzleConfig.type === 'algebra') {
      const x = Math.floor(Math.random() * 10) + 1
      const a = Math.floor(Math.random() * 5) + 2
      const b = Math.floor(Math.random() * 20) + 1
      const c = a * x + b
      setPuzzle({ a, b, c, x, equation: `${a}x + ${b} = ${c}` })
    } else if (puzzleConfig.type === 'riddle') {
      setPuzzle(puzzleConfig.data)
    } else if (puzzleConfig.type === 'geometry') {
      setPuzzle(puzzleConfig.data)
    } else if (puzzleConfig.type === 'magicSquare') {
      setMagicSquare(puzzleConfig.data)
    } else if (puzzleConfig.type === 'sudoku') {
      setSudoku(puzzleConfig.data)
    } else if (puzzleConfig.type === 'pattern') {
      setPatternPuzzle(puzzleConfig.data)
    } else if (puzzleConfig.type === 'pyramid') {
      setPyramidPuzzle(puzzleConfig.data)
    } else if (puzzleConfig.type === 'logicPuzzle') {
      setLogicPuzzle(puzzleConfig.data)
    }
  }

  // Function to load a random puzzle (for normal mode)
  const loadRandomPuzzle = () => {
    // Weighted selection: logic puzzles appear 50% of the time
    // Other 8 types share the remaining 50%
    const rand = Math.random()
    let type

    if (rand < 0.5) {
      // 50% chance for logic puzzles
      type = 'logicPuzzle'
    } else {
      // 50% chance distributed among other 8 types
      const otherTypes = ['number', 'algebra', 'riddle', 'geometry', 'magicSquare', 'sudoku', 'pattern', 'pyramid']
      type = otherTypes[Math.floor(Math.random() * otherTypes.length)]
    }

    if (type === 'number') {
      const randomPuzzle = numberPuzzles[Math.floor(Math.random() * numberPuzzles.length)]
      loadPuzzle({ type: 'number', data: randomPuzzle })
    } else if (type === 'algebra') {
      loadPuzzle({ type: 'algebra', index: 0 })
    } else if (type === 'riddle') {
      const randomRiddle = mathRiddles[Math.floor(Math.random() * mathRiddles.length)]
      loadPuzzle({ type: 'riddle', data: randomRiddle })
    } else if (type === 'geometry') {
      const randomGeometry = geometryPuzzles[Math.floor(Math.random() * geometryPuzzles.length)]
      loadPuzzle({ type: 'geometry', data: randomGeometry })
    } else if (type === 'magicSquare') {
      loadPuzzle({ type: 'magicSquare', data: generateMagicSquare() })
    } else if (type === 'sudoku') {
      loadPuzzle({ type: 'sudoku', data: generateMiniSudoku() })
    } else if (type === 'pattern') {
      loadPuzzle({ type: 'pattern', data: generatePatternPuzzle() })
    } else if (type === 'pyramid') {
      loadPuzzle({ type: 'pyramid', data: generateNumberPyramid() })
    } else if (type === 'logicPuzzle') {
      const randomLogic = logicPuzzles[Math.floor(Math.random() * logicPuzzles.length)]
      loadPuzzle({ type: 'logicPuzzle', data: randomLogic })
    }
  }

  // Initial load or dev mode navigation
  useEffect(() => {
    if (devMode) {
      // In dev mode, load the specific puzzle at current index
      loadPuzzle(allPuzzles[currentPuzzleIndex])
    } else {
      // Regular mode: randomly choose puzzle
      loadRandomPuzzle()
    }
  }, [currentPuzzleIndex, devMode])

  useEffect(() => {
    if ((magicSquare || sudoku || patternPuzzle || pyramidPuzzle || logicPuzzle) && canvasRef.current) {
      drawGridPuzzle()
    }
  }, [magicSquare, sudoku, patternPuzzle, pyramidPuzzle, logicPuzzle])

  // Dev mode navigation functions
  const goToPreviousPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev - 1 + allPuzzles.length) % allPuzzles.length)
  }

  const goToNextPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev + 1) % allPuzzles.length)
  }

  const drawGridPuzzle = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (magicSquare) drawMagicSquare(ctx)
    else if (sudoku) drawSudoku(ctx)
    else if (patternPuzzle) drawPattern(ctx)
    else if (pyramidPuzzle) drawPyramid(ctx)
    else if (logicPuzzle) drawLogicPuzzle(ctx, logicPuzzle)
  }

  const drawMagicSquare = (ctx) => {
    const size = 300
    const cellSize = size / 3
    const grid = magicSquare.grid
    const missing = magicSquare.missing

    ctx.fillStyle = '#f0f9ff'
    ctx.fillRect(0, 0, size, size)

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellSize
        const y = row * cellSize

        // Draw cell background
        if (row === missing.row && col === missing.col) {
          ctx.fillStyle = '#fef3c7'
        } else {
          ctx.fillStyle = 'white'
        }
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

        // Draw cell border
        ctx.strokeStyle = '#0d1a2b'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, cellSize, cellSize)

        // Draw number
        if (!(row === missing.row && col === missing.col)) {
          ctx.fillStyle = '#0d1a2b'
          ctx.font = 'bold 36px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(grid[row][col], x + cellSize / 2, y + cellSize / 2)
        } else {
          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 48px Arial'
          ctx.fillText('?', x + cellSize / 2, y + cellSize / 2)
        }
      }
    }
  }

  const drawSudoku = (ctx) => {
    const size = 300
    const cellSize = size / 4
    const grid = sudoku.grid
    const missing = sudoku.missing

    ctx.fillStyle = '#fef2f2'
    ctx.fillRect(0, 0, size, size)

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = col * cellSize
        const y = row * cellSize

        // Highlight 2x2 blocks
        const blockRow = Math.floor(row / 2)
        const blockCol = Math.floor(col / 2)
        if ((blockRow + blockCol) % 2 === 0) {
          ctx.fillStyle = '#fee2e2'
        } else {
          ctx.fillStyle = 'white'
        }

        if (row === missing.row && col === missing.col) {
          ctx.fillStyle = '#fef3c7'
        }

        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

        // Draw cell border
        ctx.strokeStyle = row % 2 === 0 && col % 2 === 0 ? '#991b1b' : '#fca5a5'
        ctx.lineWidth = row % 2 === 0 && col % 2 === 0 ? 3 : 1
        ctx.strokeRect(x, y, cellSize, cellSize)

        // Draw number
        if (!(row === missing.row && col === missing.col)) {
          ctx.fillStyle = '#0d1a2b'
          ctx.font = 'bold 32px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(grid[row][col], x + cellSize / 2, y + cellSize / 2)
        } else {
          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 42px Arial'
          ctx.fillText('?', x + cellSize / 2, y + cellSize / 2)
        }
      }
    }
  }

  const drawPattern = (ctx) => {
    const size = 300
    const cellSize = size / 3
    const grid = patternPuzzle.grid
    const missing = patternPuzzle.missing

    ctx.fillStyle = '#f5f3ff'
    ctx.fillRect(0, 0, size, size)

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellSize
        const y = row * cellSize

        // Gradient background
        const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize)
        gradient.addColorStop(0, '#ffffff')
        gradient.addColorStop(1, row === missing.row && col === missing.col ? '#fef3c7' : '#e9d5ff')
        ctx.fillStyle = gradient
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

        // Draw border
        ctx.strokeStyle = '#7c3aed'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, cellSize, cellSize)

        // Draw value
        const value = grid[row][col]
        ctx.fillStyle = '#5b21b6'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(value, x + cellSize / 2, y + cellSize / 2)
      }
    }
  }

  const drawPyramid = (ctx) => {
    const pyramid = pyramidPuzzle.pyramid
    const size = 300
    const levels = pyramid.length
    const baseWidth = size * 0.8
    const cellWidth = baseWidth / levels
    const startY = 40

    ctx.fillStyle = '#f0fdf4'
    ctx.fillRect(0, 0, size, size)

    for (let level = 0; level < levels; level++) {
      const row = pyramid[level]
      const numCells = row.length
      const y = startY + level * 80
      const levelWidth = numCells * cellWidth
      const startX = (size - levelWidth) / 2

      for (let i = 0; i < numCells; i++) {
        const x = startX + i * cellWidth
        const value = row[i]

        // Draw cell
        ctx.fillStyle = value === '?' ? '#fef3c7' : '#dcfce7'
        ctx.fillRect(x + 5, y, cellWidth - 10, 60)

        ctx.strokeStyle = '#16a34a'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 5, y, cellWidth - 10, 60)

        // Draw value
        ctx.fillStyle = value === '?' ? '#f59e0b' : '#15803d'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(value, x + cellWidth / 2, y + 30)
      }
    }
  }

  const drawLogicPuzzle = (ctx, puzzle) => {
    if (!puzzle) return
    switch (puzzle.type) {
      case 'bridge':
        drawBridge(ctx)
        break
      case 'ropes':
        drawRopes(ctx)
        break
      case 'river':
        drawRiver(ctx)
        break
      case 'utilities':
        drawUtilities(ctx)
        break
      case 'pirates':
        drawPirates(ctx)
        break
      case 'monty':
        drawMontyHall(ctx)
        break
      case 'hanoi3':
        drawTowerOfHanoi(ctx, 3)
        break
      case 'hanoi4':
        drawTowerOfHanoi(ctx, 4)
        break
      case 'knights':
      case 'knights2':
        drawKnightsAndKnaves(ctx)
        break
      case 'handshake10':
        drawHandshake(ctx, 10)
        break
      case 'handshake8':
        drawHandshake(ctx, 8)
        break
    }
  }

  const drawBridge = (ctx) => {
    const size = 300
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, size, size)

    // Draw bridge
    ctx.fillStyle = '#8b7355'
    ctx.fillRect(50, 140, 200, 40)

    // Bridge lines
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(50 + i * 50, 140)
      ctx.lineTo(50 + i * 50, 180)
      ctx.stroke()
    }

    // Draw 4 stick figures with times
    const people = [
      { x: 30, time: '1' },
      { x: 80, time: '2' },
      { x: 130, time: '5' },
      { x: 180, time: '10' }
    ]

    people.forEach(person => {
      // Head
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(person.x, 120, 8, 0, Math.PI * 2)
      ctx.fill()

      // Body
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(person.x, 128)
      ctx.lineTo(person.x, 150)
      ctx.stroke()

      // Arms
      ctx.beginPath()
      ctx.moveTo(person.x - 8, 135)
      ctx.lineTo(person.x + 8, 135)
      ctx.stroke()

      // Legs
      ctx.beginPath()
      ctx.moveTo(person.x, 150)
      ctx.lineTo(person.x - 6, 165)
      ctx.moveTo(person.x, 150)
      ctx.lineTo(person.x + 6, 165)
      ctx.stroke()

      // Time label
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(person.time + 'm', person.x, 105)
    })

    // Draw lantern
    ctx.fillStyle = '#fde047'
    ctx.strokeStyle = '#ca8a04'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(250, 120, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Lantern rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(250 + Math.cos(angle) * 12, 120 + Math.sin(angle) * 12)
      ctx.lineTo(250 + Math.cos(angle) * 18, 120 + Math.sin(angle) * 18)
      ctx.stroke()
    }

    // Moon
    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(250, 40, 15, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawRopes = (ctx) => {
    const size = 300

    // Background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, size, size)

    // Draw two ropes
    const drawRope = (x, label) => {
      // Rope body (wavy line)
      ctx.strokeStyle = '#a16207'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.moveTo(x, 50)
      for (let y = 50; y < 250; y += 10) {
        const wave = Math.sin(y / 20) * 8
        ctx.lineTo(x + wave, y)
      }
      ctx.stroke()

      // Flames at top and bottom
      const drawFlame = (fx, fy) => {
        ctx.fillStyle = '#fb923c'
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fx - 10, fy + 15)
        ctx.lineTo(fx, fy + 12)
        ctx.lineTo(fx + 10, fy + 15)
        ctx.fill()

        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.moveTo(fx, fy + 3)
        ctx.lineTo(fx - 6, fy + 12)
        ctx.lineTo(fx, fy + 9)
        ctx.lineTo(fx + 6, fy + 12)
        ctx.fill()
      }

      drawFlame(x, 35)
      drawFlame(x, 250)

      // Label
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, 25)
    }

    drawRope(90, 'Rope 1')
    drawRope(210, 'Rope 2')

    // "60 min" labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('60 min', 90, 280)
    ctx.fillText('60 min', 210, 280)
  }

  const drawRiver = (ctx) => {
    const size = 300

    // Sky
    ctx.fillStyle = '#bae6fd'
    ctx.fillRect(0, 0, size, size / 2)

    // Water with waves
    ctx.fillStyle = '#0ea5e9'
    ctx.fillRect(0, size / 2, size, size / 2)

    ctx.strokeStyle = '#7dd3fc'
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 160 + i * 15)
      for (let x = 0; x < size; x += 20) {
        ctx.lineTo(x, 160 + i * 15 + Math.sin(x / 10) * 3)
      }
      ctx.stroke()
    }

    // Left bank
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(0, 120, 80, 30)

    // Right bank
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(220, 120, 80, 30)

    // Simple boat
    ctx.fillStyle = '#78350f'
    ctx.beginPath()
    ctx.moveTo(130, 170)
    ctx.lineTo(120, 185)
    ctx.lineTo(180, 185)
    ctx.lineTo(170, 170)
    ctx.closePath()
    ctx.fill()

    // Draw entities on left bank
    const drawWolf = (x, y) => {
      ctx.fillStyle = '#6b7280'
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 5, y, 10, 15)
      // Ears
      ctx.beginPath()
      ctx.moveTo(x - 8, y - 8)
      ctx.lineTo(x - 5, y - 15)
      ctx.lineTo(x - 2, y - 8)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(x + 2, y - 8)
      ctx.lineTo(x + 5, y - 15)
      ctx.lineTo(x + 8, y - 8)
      ctx.fill()
    }

    const drawGoat = (x, y) => {
      ctx.fillStyle = '#f3f4f6'
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 4, y, 8, 12)
    }

    const drawCabbage = (x, y) => {
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      // Leaves
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, 5, 3, angle, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawFarmer = (x, y) => {
      ctx.fillStyle = '#d97706'
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 3, y, 6, 12)
    }

    drawWolf(20, 130)
    drawGoat(40, 130)
    drawCabbage(60, 130)
    drawFarmer(148, 175)

    // Labels
    ctx.fillStyle = '#000'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('W', 20, 155)
    ctx.fillText('G', 40, 155)
    ctx.fillText('C', 60, 155)
  }

  const drawUtilities = (ctx) => {
    const size = 300

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, size, size)

    // Draw 3 houses at top
    const houses = [50, 150, 250]
    ctx.fillStyle = '#dc2626'
    houses.forEach(x => {
      // Roof
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x - 20, 70)
      ctx.lineTo(x + 20, 70)
      ctx.closePath()
      ctx.fill()

      // House body
      ctx.fillStyle = '#fef3c7'
      ctx.fillRect(x - 15, 70, 30, 30)
      ctx.fillStyle = '#dc2626'

      // Door
      ctx.fillStyle = '#78350f'
      ctx.fillRect(x - 5, 85, 10, 15)
    })

    // Draw 3 utilities at bottom
    const utilities = [
      { x: 50, symbol: '⚡', color: '#eab308', label: 'Electric' },
      { x: 150, symbol: '💧', color: '#0ea5e9', label: 'Water' },
      { x: 250, symbol: '🔥', color: '#f97316', label: 'Gas' }
    ]

    utilities.forEach(util => {
      ctx.fillStyle = util.color
      ctx.beginPath()
      ctx.arc(util.x, 230, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(util.symbol, util.x, 230)

      ctx.fillStyle = '#475569'
      ctx.font = '11px Arial'
      ctx.fillText(util.label, util.x, 255)
    })

    // Draw some example crossing lines (incomplete)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(50, 100)
    ctx.lineTo(50, 215)
    ctx.moveTo(150, 100)
    ctx.lineTo(150, 215)
    ctx.stroke()
    ctx.setLineDash([])

    // Question mark in center
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', 150, 155)
  }

  const drawPirates = (ctx) => {
    const size = 300

    // Ocean background
    ctx.fillStyle = '#0c4a6e'
    ctx.fillRect(0, 0, size, size)

    // Waves
    ctx.strokeStyle = '#0369a1'
    ctx.lineWidth = 3
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      for (let x = 0; x < size; x += 20) {
        ctx.lineTo(x, 250 + i * 15 + Math.sin(x / 15) * 5)
      }
      ctx.stroke()
    }

    // Draw 5 pirates
    const pirates = [
      { x: 30, label: 'A', color: '#dc2626' },
      { x: 80, label: 'B', color: '#ea580c' },
      { x: 150, label: 'C', color: '#ca8a04' },
      { x: 220, label: 'D', color: '#16a34a' },
      { x: 270, label: 'E', color: '#2563eb' }
    ]

    pirates.forEach(pirate => {
      // Pirate hat
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.moveTo(pirate.x - 15, 80)
      ctx.lineTo(pirate.x, 65)
      ctx.lineTo(pirate.x + 15, 80)
      ctx.closePath()
      ctx.fill()

      // Skull
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('☠', pirate.x, 75)

      // Head
      ctx.fillStyle = '#f5deb3'
      ctx.beginPath()
      ctx.arc(pirate.x, 95, 12, 0, Math.PI * 2)
      ctx.fill()

      // Eye patch
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(pirate.x - 8, 92, 8, 3)

      // Body (shirt)
      ctx.fillStyle = pirate.color
      ctx.fillRect(pirate.x - 10, 107, 20, 25)

      // Arms
      ctx.strokeStyle = pirate.color
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(pirate.x - 10, 115)
      ctx.lineTo(pirate.x - 20, 125)
      ctx.moveTo(pirate.x + 10, 115)
      ctx.lineTo(pirate.x + 20, 125)
      ctx.stroke()

      // Label
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(pirate.label, pirate.x, 155)
    })

    // Gold coins pile
    ctx.fillStyle = '#eab308'
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.arc(140 + (i % 4) * 10, 220 + Math.floor(i / 4) * 8, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('100 coins', 150, 245)
  }

  const drawMontyHall = (ctx) => {
    const size = 300

    // Stage background
    ctx.fillStyle = '#7c2d12'
    ctx.fillRect(0, 0, size, size)

    // Draw 3 doors
    const doorX = [40, 125, 210]
    const doorLabels = ['Door 1', 'Door 2', 'Door 3']

    doorX.forEach((x, i) => {
      // Door
      ctx.fillStyle = '#92400e'
      ctx.fillRect(x, 80, 60, 120)

      // Door frame
      ctx.strokeStyle = '#451a03'
      ctx.lineWidth = 4
      ctx.strokeRect(x, 80, 60, 120)

      // Door handle
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(x + 50, 140, 4, 0, Math.PI * 2)
      ctx.fill()

      // Door number
      ctx.fillStyle = '#fef3c7'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(doorLabels[i], x + 30, 220)
    })

    // YOUR PICK arrow
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('YOUR PICK', 70, 250)
    ctx.beginPath()
    ctx.moveTo(60, 260)
    ctx.lineTo(70, 270)
    ctx.lineTo(80, 260)
    ctx.fill()

    // Door 3 opened - show goat
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.arc(240, 130, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(240 - 8, 130, 16, 25)

    // Goat label
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 14px Arial'
    ctx.fillText('GOAT!', 240, 170)
    ctx.font = '10px Arial'
    ctx.fillText('(revealed)', 240, 183)

    // Behind Door 2 hint
    ctx.fillStyle = '#fbbf24'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', 155, 140)

    // Title
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Monty Hall Problem', 150, 30)
  }

  const drawTowerOfHanoi = (ctx, numDisks) => {
    const size = 300

    // Background
    ctx.fillStyle = '#fef3c7'
    ctx.fillRect(0, 0, size, size)

    // Draw 3 pegs
    const pegX = [75, 150, 225]
    const baseY = 240
    const pegHeight = 120

    pegX.forEach(x => {
      // Base
      ctx.fillStyle = '#78350f'
      ctx.fillRect(x - 35, baseY, 70, 10)

      // Peg
      ctx.fillStyle = '#92400e'
      ctx.fillRect(x - 3, baseY - pegHeight, 6, pegHeight)
    })

    // Draw disks on left peg
    const diskColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
    const diskWidths = [60, 50, 40, 30, 20]

    for (let i = 0; i < numDisks; i++) {
      const diskIndex = numDisks - 1 - i
      const y = baseY - 10 - (i * 15)
      const width = diskWidths[i]

      ctx.fillStyle = diskColors[i]
      ctx.fillRect(pegX[0] - width / 2, y - 12, width, 12)

      ctx.strokeStyle = '#78350f'
      ctx.lineWidth = 2
      ctx.strokeRect(pegX[0] - width / 2, y - 12, width, 12)
    }

    // Labels
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Start', pegX[0], 270)
    ctx.fillText('Helper', pegX[1], 270)
    ctx.fillText('Goal', pegX[2], 270)

    // Title
    ctx.font = 'bold 16px Arial'
    ctx.fillText(`Tower of Hanoi (${numDisks} disks)`, 150, 25)

    // Arrow from left to right
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(100, 50)
    ctx.lineTo(200, 50)
    ctx.stroke()
    // Arrow head
    ctx.beginPath()
    ctx.moveTo(195, 45)
    ctx.lineTo(205, 50)
    ctx.lineTo(195, 55)
    ctx.closePath()
    ctx.fill()
  }

  const drawKnightsAndKnaves = (ctx) => {
    const size = 300

    // Island background
    ctx.fillStyle = '#bae6fd'
    ctx.fillRect(0, 0, size, size)

    // Sun
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(250, 50, 20, 0, Math.PI * 2)
    ctx.fill()

    // Island ground
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.ellipse(150, 250, 120, 40, 0, 0, Math.PI * 2)
    ctx.fill()

    // Person A (Knight/Knave)
    const drawPerson = (x, label, isKnight) => {
      if (isKnight) {
        // Knight - armor
        ctx.fillStyle = '#94a3b8'
        // Helmet
        ctx.beginPath()
        ctx.arc(x, 120, 18, 0, Math.PI * 2)
        ctx.fill()
        // Visor
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(x - 15, 120, 30, 8)
        // Body (armor)
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(x - 15, 138, 30, 40)
        // Shield
        ctx.fillStyle = '#dc2626'
        ctx.beginPath()
        ctx.moveTo(x - 25, 145)
        ctx.lineTo(x - 25, 165)
        ctx.lineTo(x - 15, 175)
        ctx.lineTo(x - 5, 165)
        ctx.lineTo(x - 5, 145)
        ctx.closePath()
        ctx.fill()
      } else {
        // Knave - suspicious looking
        ctx.fillStyle = '#f5deb3'
        // Head
        ctx.beginPath()
        ctx.arc(x, 120, 15, 0, Math.PI * 2)
        ctx.fill()
        // Evil eyebrows
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - 10, 115)
        ctx.lineTo(x - 5, 118)
        ctx.moveTo(x + 5, 118)
        ctx.lineTo(x + 10, 115)
        ctx.stroke()
        // Body
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(x - 12, 135, 24, 40)
        // Cape
        ctx.fillStyle = '#7c3aed'
        ctx.beginPath()
        ctx.moveTo(x - 12, 135)
        ctx.lineTo(x - 20, 140)
        ctx.lineTo(x - 15, 175)
        ctx.lineTo(x - 12, 175)
        ctx.closePath()
        ctx.fill()
      }

      // Label
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, 210)
    }

    drawPerson(80, 'A', false)
    drawPerson(220, 'B', true)

    // Speech bubble from A
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(25, 45, 110, 45, 10)
    ctx.fill()
    ctx.stroke()

    // Speech bubble tail
    ctx.beginPath()
    ctx.moveTo(70, 90)
    ctx.lineTo(75, 100)
    ctx.lineTo(80, 90)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#0f172a'
    ctx.font = '11px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Statement', 80, 60)
    ctx.font = 'bold 12px Arial'
    ctx.fillText('from A', 80, 75)

    // Question mark
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 32px Arial'
    ctx.fillText('?', 220, 60)
  }

  const drawHandshake = (ctx, numPeople) => {
    const size = 300
    const centerX = 150
    const centerY = 150
    const radius = 100

    // Background
    ctx.fillStyle = '#f0f9ff'
    ctx.fillRect(0, 0, size, size)

    // Draw people in a circle
    const people = []
    for (let i = 0; i < numPeople; i++) {
      const angle = (i * 2 * Math.PI) / numPeople - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      people.push({ x, y })
    }

    // Draw handshake lines (light gray)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    for (let i = 0; i < numPeople; i++) {
      for (let j = i + 1; j < numPeople; j++) {
        ctx.beginPath()
        ctx.moveTo(people[i].x, people[i].y)
        ctx.lineTo(people[j].x, people[j].y)
        ctx.stroke()
      }
    }

    // Draw people (circles)
    people.forEach((person, i) => {
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(person.x, person.y, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#1e40af'
      ctx.lineWidth = 2
      ctx.stroke()

      // Person number
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText((i + 1).toString(), person.x, person.y)
    })

    // Title
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`${numPeople} People`, 150, 20)
    ctx.font = '12px Arial'
    ctx.fillText('Everyone shakes hands once', 150, 40)
  }

  const checkAnswer = () => {
    const val = parseInt(userAnswer)
    let correctAnswer = null
    let isCorrect = false
    let successMessage = ''
    let explanation = ''

    if (puzzleType === 'number' && puzzle) {
      correctAnswer = puzzle.answer
      isCorrect = val === puzzle.answer
      successMessage = `✅ Correct! ${puzzle.explanation}`
      explanation = puzzle.explanation
    } else if (puzzleType === 'algebra' && puzzle) {
      correctAnswer = puzzle.x
      isCorrect = val === puzzle.x
      successMessage = `✅ Correct! The value of x is ${puzzle.x}.`
      explanation = `The value of x is ${puzzle.x}`
    } else if (puzzleType === 'riddle' && puzzle) {
      correctAnswer = puzzle.answer
      isCorrect = val === puzzle.answer
      successMessage = `✅ Correct! ${puzzle.explanation}`
      explanation = puzzle.explanation
    } else if (puzzleType === 'geometry' && puzzle) {
      correctAnswer = puzzle.answer
      isCorrect = val === puzzle.answer
      successMessage = `✅ Correct! ${puzzle.explanation}`
      explanation = puzzle.explanation
    } else if (puzzleType === 'magicSquare' && magicSquare) {
      correctAnswer = magicSquare.answer
      isCorrect = val === magicSquare.answer
      successMessage = `✅ Correct! In a magic square, all rows, columns, and diagonals sum to the same number.`
      explanation = 'In a magic square, all rows, columns, and diagonals sum to the same number'
    } else if (puzzleType === 'sudoku' && sudoku) {
      correctAnswer = sudoku.answer
      isCorrect = val === sudoku.answer
      successMessage = `✅ Correct! Each row, column, and 2×2 box contains the numbers 1-4.`
      explanation = 'Each row, column, and 2×2 box contains the numbers 1-4'
    } else if (puzzleType === 'pattern' && patternPuzzle) {
      correctAnswer = patternPuzzle.answer
      isCorrect = val === patternPuzzle.answer
      successMessage = `✅ Correct! ${patternPuzzle.explanation}`
      explanation = patternPuzzle.explanation
    } else if (puzzleType === 'pyramid' && pyramidPuzzle) {
      correctAnswer = pyramidPuzzle.answer
      isCorrect = val === pyramidPuzzle.answer
      successMessage = `✅ Correct! ${pyramidPuzzle.explanation}`
      explanation = pyramidPuzzle.explanation
    } else if (puzzleType === 'logicPuzzle' && logicPuzzle) {
      correctAnswer = logicPuzzle.answer
      isCorrect = val === logicPuzzle.answer
      successMessage = `✅ Correct! ${logicPuzzle.explanation}`
      explanation = logicPuzzle.explanation
    }

    if (isCorrect) {
      setFeedback(successMessage)
      setWrongAttempts(0) // Reset on correct answer
    } else {
      const newWrongAttempts = wrongAttempts + 1
      setWrongAttempts(newWrongAttempts)

      if (newWrongAttempts >= 2) {
        setFeedback(`❌ The correct answer is ${correctAnswer}. ${explanation}`)
      } else {
        setFeedback(`❌ Try again. (Attempt ${newWrongAttempts}/2)`)
      }
    }
  }

  if (!puzzleType) return null

  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl card-shadow border border-white/50 w-full max-w-lg mx-auto transform transition duration-500 hover:scale-[1.01]">
      <h3 className="text-2xl font-bold text-[#0077B6] mb-2 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Daily Challenge
      </h3>

      {devMode && (
        <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-400 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Dev Mode Navigation</span>
            <span className="text-xs text-amber-700 font-medium">
              {currentPuzzleIndex + 1} / {allPuzzles.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousPuzzle}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>
            <button
              onClick={goToNextPuzzle}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {puzzleType === 'number' && puzzle && (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">{puzzle.prompt}</p>
          <p className="text-3xl font-extrabold text-slate-800 mb-6 bg-slate-50/50 border border-slate-200/50 p-3 rounded-lg text-center font-mono tracking-widest">
            {puzzle.sequence.split('?')[0]}<span className="text-red-500">?</span>
          </p>
        </>
      )}

      {puzzleType === 'algebra' && puzzle && (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">Solve for x:</p>
          <p className="text-3xl font-extrabold text-slate-800 mb-6 bg-slate-50/50 border border-slate-200/50 p-3 rounded-lg text-center font-mono tracking-widest">
            {puzzle.equation}
          </p>
        </>
      )}

      {puzzleType === 'riddle' && puzzle && (
        <>
          <div className="text-base font-medium text-slate-700 mb-6 bg-amber-50/50 border border-amber-200/50 p-4 rounded-lg">
            {puzzle.prompt}
          </div>
        </>
      )}

      {puzzleType === 'geometry' && puzzle && (
        <>
          <div className="text-base font-medium text-slate-700 mb-6 bg-blue-50/50 border border-blue-200/50 p-4 rounded-lg">
            {puzzle.prompt}
          </div>
        </>
      )}

      {puzzleType === 'logicPuzzle' && logicPuzzle && (
        <>
          <div className="text-base font-medium text-slate-700 mb-4 bg-purple-50/50 border border-purple-200/50 p-4 rounded-lg">
            {logicPuzzle.prompt}
          </div>
        </>
      )}

      {(magicSquare || sudoku || patternPuzzle || pyramidPuzzle || logicPuzzle) && (
        <>
          {magicSquare && (
            <p className="text-sm font-medium text-slate-600 mb-3 text-center">
              Find the missing number so all rows, columns, and diagonals sum to the same value.
            </p>
          )}
          {sudoku && (
            <p className="text-sm font-medium text-slate-600 mb-3 text-center">
              Each row, column, and 2×2 box must contain the numbers 1, 2, 3, and 4.
            </p>
          )}
          {patternPuzzle && (
            <p className="text-sm font-medium text-slate-600 mb-3 text-center">
              Find the pattern and determine the missing number.
            </p>
          )}
          {pyramidPuzzle && (
            <p className="text-sm font-medium text-slate-600 mb-3 text-center">
              Each number is the sum of the two numbers below it.
            </p>
          )}

          <div className="mb-4 flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-lg border-2 border-gray-300 shadow-md"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </>
      )}

      <div className="flex gap-3 mb-4">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder={puzzleType === 'algebra' ? 'x = ?' : '?'}
          className="flex-grow p-3 border-2 border-gray-200 bg-white/60 rounded-lg focus:border-[#0077B6] outline-none text-lg font-mono text-center"
        />
        <button
          onClick={checkAnswer}
          className="px-6 py-3 bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
        >
          Check
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg border-l-4 text-sm ${
          feedback.includes('Correct')
            ? 'bg-green-50 border-green-500 text-green-800'
            : feedback.includes('The correct answer is')
            ? 'bg-amber-50 border-amber-500 text-amber-900'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {feedback}
        </div>
      )}

      {onPlayMore && (
        <div className="text-center mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={onPlayMore}
            className="text-sm text-[#0077B6] hover:text-[#005fa3] font-medium transition-colors"
          >
            🎮 Play Interactive Games
          </button>
        </div>
      )}
    </div>
  )
}
