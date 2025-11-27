function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFrom(arr) {
  return arr[rand(0, arr.length - 1)]
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a, b) {
  return (a * b) / gcd(a, b)
}

function simplifyFraction(num, den) {
  const g = gcd(num, den)
  return { num: num / g, den: den / g }
}

// Question Templates by Type
export const questionTemplates = {
  // NUMBER - Number Structure
  evaluate_power: () => {
    const base = 10
    const exponent = rand(2, 5)
    const answer = Math.pow(base, exponent)
    return {
      question: `10^{${exponent}} =`,
      answer: answer.toString()
    }
  },

  find_hcf: () => {
    const num1 = rand(12, 48)
    const num2 = rand(12, 48)
    const answer = gcd(num1, num2)
    return {
      question: `\\text{Find the HCF of } ${num1} \\text{ and } ${num2}`,
      answer: answer.toString()
    }
  },

  find_lcm: () => {
    const num1 = rand(4, 12)
    const num2 = rand(4, 12)
    const answer = lcm(num1, num2)
    return {
      question: `\\text{Find the LCM of } ${num1} \\text{ and } ${num2}`,
      answer: answer.toString()
    }
  },

  square_root: () => {
    const root = rand(2, 12)
    const num = root * root
    return {
      question: `\\sqrt{${num}} =`,
      answer: root.toString()
    }
  },

  // NUMBER - Operations
  round_whole: () => {
    const num = rand(1234, 9876)
    const places = randFrom(['tens', 'hundreds'])
    const divisor = places === 'tens' ? 10 : 100
    const answer = Math.round(num / divisor) * divisor
    return {
      question: `\\text{Round } ${num} \\text{ to the nearest ${places}}`,
      answer: answer.toString()
    }
  },

  multiply: () => {
    const num1 = rand(12, 99)
    const num2 = rand(2, 12)
    return {
      question: `${num1} \\times ${num2} =`,
      answer: (num1 * num2).toString()
    }
  },

  divide: () => {
    const divisor = rand(2, 12)
    const quotient = rand(5, 20)
    const num1 = divisor * quotient
    return {
      question: `${num1} \\div ${divisor} =`,
      answer: quotient.toString()
    }
  },

  order_ops: () => {
    const a = rand(2, 9)
    const b = rand(2, 9)
    const c = rand(2, 9)
    const answer = a + b * c
    return {
      question: `${a} + ${b} \\times ${c} =`,
      answer: answer.toString()
    }
  },

  add_integers: () => {
    const num1 = rand(-20, 20)
    const num2 = rand(-20, 20)
    return {
      question: `${num1} + (${num2}) =`,
      answer: (num1 + num2).toString()
    }
  },

  // NUMBER - Rational Numbers
  add_fractions: () => {
    const num1 = rand(1, 5)
    const den1 = rand(2, 8)
    const num2 = rand(1, 5)
    const den2 = rand(2, 8)
    const resultNum = num1 * den2 + num2 * den1
    const resultDen = den1 * den2
    const simplified = simplifyFraction(resultNum, resultDen)
    return {
      question: `\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}} = \\text{ ?}`,
      answer: `${simplified.num}/${simplified.den}`,
      visualData: {
        type: 'fraction_add',
        num1, den1, num2, den2,
        width: 400,
        height: 300
      }
    }
  },

  fraction_to_percent: () => {
    const percentages = [
      { num: 1, den: 2, percent: 50 },
      { num: 1, den: 4, percent: 25 },
      { num: 3, den: 4, percent: 75 },
      { num: 1, den: 5, percent: 20 },
      { num: 2, den: 5, percent: 40 },
      { num: 1, den: 10, percent: 10 }
    ]
    const choice = randFrom(percentages)
    return {
      question: `\\text{Convert } \\frac{${choice.num}}{${choice.den}} \\text{ to a percentage}`,
      answer: choice.percent.toString()
    }
  },

  percent_of: () => {
    const percent = rand(10, 90)
    const num = rand(20, 200)
    const answer = Math.round((percent / 100) * num)
    return {
      question: `${percent}\\% \\text{ of } ${num} =`,
      answer: answer.toString()
    }
  },

  add_decimals: () => {
    const num1 = (rand(10, 99) / 10).toFixed(1)
    const num2 = (rand(10, 99) / 10).toFixed(1)
    const answer = (parseFloat(num1) + parseFloat(num2)).toFixed(1)
    return {
      question: `${num1} + ${num2} =`,
      answer: answer
    }
  },

  // NUMBER - Financial Mathematics
  calculate_change: () => {
    const cost = rand(5, 45)
    const notes = [50, 20, 10]
    const paid = randFrom(notes.filter(n => n > cost))
    const change = paid - cost
    return {
      question: `\\text{You pay \\$${paid} for items costing \\$${cost}. What is your change?}`,
      answer: change.toString()
    }
  },

  percent_discount: () => {
    const price = rand(20, 100)
    const discount = randFrom([10, 20, 25, 50])
    const salePrice = price - (price * discount / 100)
    return {
      question: `\\text{A \\$${price} item has a ${discount}\\% discount. What is the sale price?}`,
      answer: salePrice.toString()
    }
  },

  // ALGEBRA
  solve_equation: () => {
    const x = rand(2, 30)
    const coef = rand(2, 9)
    return {
      question: `\\text{Solve: } ${coef}x = ${coef * x}`,
      answer: x.toString()
    }
  },

  evaluate_expression: () => {
    const x = rand(2, 10)
    const a = rand(2, 5)
    const b = rand(1, 10)
    const answer = a * x + b
    return {
      question: `\\text{If } x = ${x}, \\text{ what is } ${a}x + ${b}?`,
      answer: answer.toString()
    }
  },

  number_sequence: () => {
    const start = rand(2, 10)
    const diff = rand(2, 8)
    const seq = [start, start + diff, start + 2 * diff, start + 3 * diff]
    const answer = start + 4 * diff
    return {
      question: `\\text{Next number: } ${seq.join(', ')}, \\text{ ?}`,
      answer: answer.toString()
    }
  },

  // MEASUREMENT
  convert_metric: () => {
    const conversions = [
      { value: rand(2, 9), from: 'km', to: 'm', factor: 1000 },
      { value: rand(2000, 9000), from: 'm', to: 'km', factor: 0.001 },
      { value: rand(2, 9), from: 'kg', to: 'g', factor: 1000 },
      { value: rand(200, 900), from: 'cm', to: 'm', factor: 0.01 }
    ]
    const choice = randFrom(conversions)
    const answer = choice.value * choice.factor
    return {
      question: `\\text{Convert } ${choice.value}\\text{ ${choice.from} to ${choice.to}}`,
      answer: answer.toString()
    }
  },

  calculate_speed: () => {
    const time = rand(2, 5)
    const speed = rand(40, 80)
    const distance = speed * time
    return {
      question: `\\text{A car travels ${distance} km in ${time} hours. Speed in km/h?}`,
      answer: speed.toString()
    }
  },

  rectangle_area: () => {
    const length = rand(5, 20)
    const width = rand(3, 15)
    return {
      question: `\\text{Area of rectangle } ${length}\\text{ cm} \\times ${width}\\text{ cm =}`,
      answer: (length * width).toString()
    }
  },

  triangle_area: () => {
    const base = rand(4, 20)
    const height = rand(4, 20)
    const area = (base * height) / 2
    return {
      question: `\\text{Area of triangle: base ${base} cm, height ${height} cm}`,
      answer: area.toString()
    }
  },

  perimeter: () => {
    const length = rand(5, 20)
    const width = rand(3, 15)
    const perimeter = 2 * (length + width)
    return {
      question: `\\text{Perimeter of rectangle } ${length}\\text{ cm} \\times ${width}\\text{ cm}`,
      answer: perimeter.toString()
    }
  },

  // GEOMETRY
  classify_triangle: () => {
    const a = rand(3, 15)
    const b = rand(3, 15)
    const c = rand(3, 15)
    const longest = Math.max(a, b, c)
    return {
      question: `\\text{What is the longest side?}`,
      answer: longest.toString(),
      visualData: {
        type: 'triangle',
        a, b, c,
        width: 400,
        height: 300
      }
    }
  },

  angles_line: () => {
    const angle1 = rand(30, 150)
    const angle2 = 180 - angle1
    return {
      question: `\\text{Find the missing angle (marked with ?)}`,
      answer: angle2.toString(),
      visualData: {
        type: 'angles_line',
        angle1,
        angle2,
        width: 400,
        height: 300
      }
    }
  },

  vertical_angles: () => {
    const angle = rand(30, 150)
    return {
      question: `\\text{Find the vertically opposite angle (marked with ?)}`,
      answer: angle.toString(),
      visualData: {
        type: 'vertical_angles',
        angle,
        width: 400,
        height: 300
      }
    }
  },

  plot_point: () => {
    const x = rand(-5, 5)
    const y = rand(-5, 5)
    return {
      question: `\\text{What is the x-coordinate of the red point?}`,
      answer: x.toString(),
      visualData: {
        type: 'coordinate_grid',
        x, y,
        showPoint: true,
        width: 400,
        height: 300
      }
    }
  },

  // STATISTICS
  calculate_mean: () => {
    const count = rand(4, 6)
    const numbers = Array.from({ length: count }, () => rand(5, 20))
    const sum = numbers.reduce((a, b) => a + b, 0)
    const mean = sum / count
    return {
      question: `\\text{Find the mean of these values}`,
      answer: mean.toString(),
      visualData: {
        type: 'bar_chart',
        numbers,
        width: 400,
        height: 300
      }
    }
  },

  calculate_median: () => {
    const numbers = [rand(5, 15), rand(16, 25), rand(26, 35)].sort((a, b) => a - b)
    return {
      question: `\\text{Find the median}`,
      answer: numbers[1].toString(),
      visualData: {
        type: 'bar_chart',
        numbers,
        width: 400,
        height: 300
      }
    }
  },

  calculate_mode: () => {
    const mode = rand(5, 20)
    const other1 = rand(5, 20)
    const other2 = rand(5, 20)
    // Make sure mode appears twice, others once
    const numbers = [mode, mode, other1, other2].sort((a, b) => a - b)
    return {
      question: `\\text{Find the mode (most frequent value)}`,
      answer: mode.toString(),
      visualData: {
        type: 'bar_chart',
        numbers,
        width: 400,
        height: 300
      }
    }
  },

  calculate_range: () => {
    const numbers = Array.from({ length: 5 }, () => rand(5, 50)).sort((a, b) => a - b)
    const range = numbers[numbers.length - 1] - numbers[0]
    return {
      question: `\\text{Find the range (max - min)}`,
      answer: range.toString(),
      visualData: {
        type: 'bar_chart',
        numbers,
        width: 400,
        height: 300
      }
    }
  },

  // PROBABILITY
  simple_probability: () => {
    const favorable = rand(1, 5)
    const total = rand(6, 12)
    const gcdVal = gcd(favorable, total)
    const simplified = simplifyFraction(favorable, total)
    return {
      question: `\\text{What is the probability of getting one of ${favorable} favorable outcomes from ${total} total outcomes?}`,
      answer: `${simplified.num}/${simplified.den}`
    }
  },

  list_outcomes: () => {
    const sides = rand(4, 8)
    return {
      question: `\\text{How many possible outcomes when rolling a ${sides}-sided die?}`,
      answer: sides.toString()
    }
  }
}

// Map skills to template functions
export const skillToTemplate = {
  "Powers of ten": "evaluate_power",
  "Factors and HCF": "find_hcf",
  "LCM": "find_lcm",
  "Square roots": "square_root",
  "Rounding": "round_whole",
  "Multiplication": "multiply",
  "Division": "divide",
  "Order of operations": "order_ops",
  "Integer operations": "add_integers",
  "Fractions": "add_fractions",
  "Decimals": "add_decimals",
  "Percentages": "percent_of",
  "Conversions": "fraction_to_percent",
  "Calculate change": "calculate_change",
  "Percentage discount": "percent_discount",
  "Solve one-step equations": "solve_equation",
  "Evaluate expressions": "evaluate_expression",
  "Number sequences": "number_sequence",
  "Convert metric units": "convert_metric",
  "Calculate speed": "calculate_speed",
  "Rectangle area": "rectangle_area",
  "Triangle area": "triangle_area",
  "Perimeter": "perimeter",
  "Classify triangles": "classify_triangle",
  "Angles on a line": "angles_line",
  "Vertically opposite angles": "vertical_angles",
  "Plot coordinates": "plot_point",
  "Calculate mean": "calculate_mean",
  "Calculate median": "calculate_median",
  "Calculate mode": "calculate_mode",
  "Calculate range": "calculate_range",
  "Simple probability": "simple_probability",
  "List outcomes": "list_outcomes"
}

export function generateQuestionForSkill(skill) {
  const templateKey = skillToTemplate[skill]
  if (!templateKey) {
    console.error(`Missing skill mapping for: "${skill}"`)
    // Return a simple placeholder
    return {
      question: `\\text{Missing template for: ${skill}}`,
      answer: "0"
    }
  }
  if (!questionTemplates[templateKey]) {
    console.error(`Missing question template for: "${templateKey}"`)
    return {
      question: `\\text{Missing template function: ${templateKey}}`,
      answer: "0"
    }
  }
  return questionTemplates[templateKey]()
}
