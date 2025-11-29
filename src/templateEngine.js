import * as mathHelpers from './mathHelpers.js'

// Random integer between min and max (inclusive)
// Automatically caps values to reasonable ranges for educational purposes
function randInt(min, max) {
  // Cap maximum values to keep numbers reasonable for students
  const MAX_REASONABLE = 10000
  const cappedMax = Math.min(max, MAX_REASONABLE)
  const cappedMin = Math.min(min, MAX_REASONABLE)

  return Math.floor(Math.random() * (cappedMax - cappedMin + 1)) + cappedMin
}

// Difficulty-aware random integer (locks each year into an appropriate sub-range)
// difficulty is on a 1â€“10 scale (1 = very easy, 10 = very hard)
function randIntWithDifficulty(min, max, year, difficulty) {
  const cappedMin = Math.min(min, 10000)
  const cappedMax = Math.min(max, 10000)
  if (cappedMax <= cappedMin) return cappedMin

  // Derive a default difficulty from year if none provided
  let effDifficulty = typeof difficulty === 'number' ? difficulty : undefined
  if (effDifficulty === undefined) {
    if (typeof year === 'number') {
      if (year <= 6) effDifficulty = 3   // easier band
      else if (year === 7) effDifficulty = 5 // mid band
      else if (year === 8) effDifficulty = 7 // mid-high
      else effDifficulty = 9               // hardest band
    } else {
      effDifficulty = 5
    }
  }

  // Split the full range into three fixed bands.
  const span = cappedMax - cappedMin
  if (span <= 2) {
    return randInt(cappedMin, cappedMax)
  }

  const bandSize = Math.max(1, Math.floor(span / 3))
  let bandMin = cappedMin
  let bandMax = cappedMax

  if (effDifficulty <= 3) {
    // Easy: always use the lower band
    bandMin = cappedMin
    bandMax = Math.min(cappedMin + bandSize, cappedMax)
  } else if (effDifficulty <= 7) {
    // Medium: middle band
    bandMin = Math.min(cappedMin + bandSize, cappedMax)
    bandMax = Math.min(cappedMin + 2 * bandSize, cappedMax)
  } else {
    // Hard: upper band
    bandMin = Math.min(cappedMin + 2 * bandSize, cappedMax)
    bandMax = cappedMax
  }

  return randInt(bandMin, bandMax)
}

// Random decimal with specified precision
function randDecimal(min, max, decimalPlaces = 2) {
  // Cap maximum values to keep numbers reasonable for students
  const MAX_REASONABLE = 10000
  const cappedMax = Math.min(max, MAX_REASONABLE)
  const cappedMin = Math.min(min, MAX_REASONABLE)

  const value = Math.random() * (cappedMax - cappedMin) + cappedMin
  return parseFloat(value.toFixed(decimalPlaces))
}

// Random time in HH:MM format
function randTime() {
  const hours = randInt(0, 23)
  const minutes = randInt(0, 59)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Parse parameter specification and generate random value
function generateParamValue(spec, year, difficulty) {
  // Allow simple constant specs like [15] or numeric literal params
  if (!Array.isArray(spec)) {
    if (typeof spec === 'number') return spec
  } else if (spec.length === 1 && typeof spec[0] === 'number') {
    return spec[0]
  }

  const [type, ...args] = spec

  switch (type) {
    case 'int':
      return randIntWithDifficulty(args[0], args[1], year, difficulty)

    case 'decimal':
      // For decimals, apply difficulty to the integer part range, then add fractional part
      return randDecimal(args[0], args[1], args[2] || 2)

    case 'time':
      return randTime()

    case 'choice':
      // Random choice from array
      return args[randInt(0, args.length - 1)]

    default:
      console.warn(`Unknown parameter type: ${type}`)
      return 0
  }
}

// Generate all parameters for a template
function generateParams(paramsSpec, year, difficulty) {
  const params = {}

  for (const [paramName, spec] of Object.entries(paramsSpec)) {
    params[paramName] = generateParamValue(spec, year, difficulty)
  }

  return params
}

// OPTIONAL: Infer a rough difficulty (1â€“10) from parameter ranges if not provided.
// Uses max difficulty across params so a single hard range lifts the template.
// OPTIONAL helper: rough difficulty estimate (1–10) from param ranges
export function estimateDifficulty(params) {
  let score = 1
  if (!params) return score

  Object.values(params).forEach(p => {
    if (Array.isArray(p)) {
      const [type, , maxOrPlaces, maybePlaces] = p

      // Large values push difficulty up
      const maxVal = typeof maxOrPlaces === 'number' ? maxOrPlaces : 0
      if (maxVal > 1000) {
        score += 3
      }

      // Decimals with more places are harder
      if (type === 'decimal') {
        const places = typeof maybePlaces === 'number'
          ? maybePlaces
          : (typeof maxOrPlaces === 'number' ? maxOrPlaces : 0)
        if (places > 1) {
          score += 2
        }
      }
    }
  })

  return Math.min(10, score)
}
// Substitute parameters into stem
function substituteStem(stem, params) {
  let result = stem

  for (const [key, value] of Object.entries(params)) {
    let displayValue = value
    // If the param is an array (e.g., ['pentagon', 5]), use the first element for display in the stem.
    if (Array.isArray(displayValue)) {
      displayValue = displayValue[0]
    }
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, displayValue)
  }

  return result
}

// Evaluate answer expression with parameters
function evaluateAnswer(answerExpr, params) {
  try {
    // Create a context with all params and helper functions
    const context = {
      ...params,
      ...mathHelpers,
      Math,
      round: mathHelpers.round // Ensure round is available
    }

    // Create a function that evaluates the expression in the given context
    const contextKeys = Object.keys(context)
    const contextValues = Object.values(context)

    // Create a function body that returns the evaluated expression
    const func = new Function(...contextKeys, `return ${answerExpr}`)

    const result = func(...contextValues)

    // Convert to string, handle different types
    if (typeof result === 'number') {
      // Round to avoid floating point issues
      if (Number.isInteger(result)) {
        return result.toString()
      } else {
        return parseFloat(result.toFixed(10)).toString()
      }
    }

    return result.toString()
  } catch (error) {
    console.error('Error evaluating answer expression:', answerExpr, error)
    return '0'
  }
}

// Generate visualization data based on question type
function generateVisualData(template, params, skill) {
  const stem = template.stem.toLowerCase()
  const skillName = skill.toLowerCase()
  const templateId = template.id || ''

  // Phase 5 Bug Fix #14: NEVER illustrate algebra simplification
  if (skillName.includes('expressions') || skillName.includes('polynomials') || skillName.includes('equation')) {
    return null
  }

  // Phase 5 Bug Fix #9, #11: Only illustrate proper fractions of groups
  if (skillName.includes('fraction') && stem.includes('group has') && params.total) {
    const result = params.total * params.num / params.den
    if (result <= params.total * 1.5) {
      return {
        type: 'fraction_bar',
        numerator: Math.round(result),
        denominator: params.total,
        width: 400,
        height: 120
      }
    }
    return null
  }

  // Phase 5 Bug Fix #12: Coordinate distance with line
  if ((templateId.includes('COORDINATE_PLANE') || stem.includes('distance between')) && params.x1 !== undefined && params.y1 !== undefined && params.x2 !== undefined && params.y2 !== undefined) {
    return {
      type: 'coordinate_grid',
      points: [[params.x1, params.y1], [params.x2, params.y2]],
      showLine: true,
      width: 400,
      height: 300
    }
  }

  // Phase 5 Bug Fix #15: Time journey
  if (skillName.includes('time') && (stem.includes('journey') || stem.includes('movie') || stem.includes('start') && stem.includes('end')) && params.start && params.end) {
    return {
      type: 'time_line',
      start: params.start,
      end: params.end,
      width: 400,
      height: 150
    }
  }

  // Phase 5 Bug Fix #13: Fix hypotenuse calculation
  if (templateId.includes('PYTHAGORAS') || stem.includes('hypotenuse')) {
    if (params.a && params.b) {
      const hyp = Math.sqrt(params.a * params.a + params.b * params.b)
      return {
        type: 'triangle',
        a: params.a,
        b: params.b,
        c: Math.round(hyp * 10) / 10,
        width: 400,
        height: 300
      }
    }
  }

  // Right triangle trigonometry (opp/adj/hyp)
  if (templateId.includes('TRIG_RIGHT') || (params.opp !== undefined && params.adj !== undefined)) {
    const hyp = params.hyp !== undefined
      ? params.hyp
      : Math.sqrt(params.opp * params.opp + params.adj * params.adj)

    return {
      type: 'triangle',
      a: params.opp,
      b: params.adj,
      c: Math.round(hyp * 10) / 10,
      width: 400,
      height: 300
    }
  }

  // Triangle questions
  if (stem.includes('triangle') && (stem.includes('area') || stem.includes('base') || stem.includes('height'))) {
    if (params.b && params.h) {
      return {
        type: 'triangle',
        a: params.h || params.a || 5,
        b: params.b || 8,
        c: params.h || params.a || 5,
        width: 400,
        height: 300
      }
    }
  }

    // Angles on a line / complementary / supplementary
    // Explicit "angles" wording (original behaviour)
    if ((stem.includes('straight line') || stem.includes('supplement')) && stem.includes('angle')) {
      if (params.a) {
        return {
          type: 'angles_line',
          angle1: params.a,
          angle2: 180 - params.a,
          width: 400,
          height: 300
        }
      }
    }

    // Complement questions that don't explicitly say "angle"
    if (stem.includes('complement') && params.a) {
      return {
        type: 'angles_line',
        angle1: params.a,
        angle2: 90 - params.a,
        width: 400,
        height: 300
      }
    }

  // Vertical angles
  if (stem.includes('vertically opposite') && params.a) {
    return {
      type: 'vertical_angles',
      angle: params.a,
      width: 400,
      height: 300
    }
  }

  // Triangle angles
  if (stem.includes('triangle') && stem.includes('angle')) {
    if (params.a && params.b) {
      return {
        type: 'triangle',
        a: 60,
        b: 50,
        c: 70,
        angle1: params.a,
        angle2: params.b,
        angle3: 180 - params.a - params.b,
        width: 400,
        height: 300
      }
    }
  }

  // Parallel lines + transversal -> alternate interior visual
  if ((stem.includes('transversal') || stem.includes('alternate interior') || (stem.includes('parallel') && stem.includes('transversal'))) ) {
    // angle param may be named a, angle, or provided in params
    const angleVal = params.a || params.angle || params.a1 || null
    return {
      type: 'parallel_transversal',
      angle: angleVal || 60,
      width: 400,
      height: 300
    }
  }

  // Coordinate plane questions (single point or basic graph)
  if (stem.includes('coordinate') || stem.includes('point') || stem.includes('graph')) {
    if (params.x !== undefined && params.y !== undefined) {
      return {
        type: 'coordinate_grid',
        x: params.x,
        y: params.y,
        showPoint: true,
        width: 400,
        height: 300
      }
    }
  }

  // Linear relationships (y = mx + c)
  if (templateId.includes('LINEAR_RELATIONS') && stem.includes('y =') && params.m !== undefined && params.c !== undefined && params.x !== undefined) {
    return {
      type: 'coordinate_grid',
      x: params.x,
      y: params.m * params.x + params.c,
      showPoint: true,
      width: 400,
      height: 300
    }
  }

  // Fraction visualization (single fraction)
  if ((stem.includes('fraction') || skillName.includes('fraction')) && !stem.includes('calculate') && !stem.includes('+') && !stem.includes('-') && !stem.includes('Ã—') && !stem.includes('Ã·')) {
    if (params.num && params.den && params.den <= 12) {
      return {
        type: 'fraction_bar',
        numerator: params.num,
        denominator: params.den,
        width: 400,
        height: 250
      }
    }
  }

  // Fraction addition/subtraction
  if ((stem.includes('+') || stem.includes('âˆ’') || stem.includes('-')) && skillName.includes('fraction')) {
    if (params.a && params.b && params.c && params.d) {
      // Check if it's fraction operation
      if (params.b <= 12 && params.d <= 12) {
        return {
          type: 'fraction_add',
          num1: params.a,
          den1: params.b,
          num2: params.c,
          den2: params.d,
          width: 400,
          height: 280
        }
      }
    }
  }

    // Rectangular prism (volume) – visualize as 3D box
    if (stem.includes('rectangular prism') && params.l && params.w && params.h) {
      return {
        type: 'rectangular_prism',
        l: params.l,
        w: params.w,
        h: params.h,
        width: 400,
        height: 300
      }
    }

    // Rectangle/area questions
    if (stem.includes('rectangle') && (stem.includes('area') || stem.includes('perimeter'))) {
      if (params.l && params.w) {
        return {
          type: 'rectangle',
          length: params.l,
          width: params.w,
          canvasWidth: 400,
          canvasHeight: 300
        }
      }
    }

    // Triangular prism volume – show base triangle area and prism height
    if (stem.includes('triangular prism') && params.a && params.h) {
      return {
        type: 'triangular_prism',
        baseArea: params.a,
        height: params.h,
        width: 400,
        height: 300
      }
    }

    // Composite shapes (rectangle + triangle)
    if (templateId.includes('COMPOSITE_SHAPES') && params.l && params.w && params.b && params.h) {
      return {
        type: 'composite_rect_tri',
        rectL: params.l,
        rectW: params.w,
        triB: params.b,
        triH: params.h,
        canvasWidth: 400,
        canvasHeight: 300
      }
    }

  // Circle questions
  if (stem.includes('circle') && (params.r || params.d)) {
    return {
      type: 'circle',
      radius: params.r || params.d / 2,
      width: 400,
      height: 300
    }
  }

  // Statistics - bar chart
  if (stem.includes('mean') || stem.includes('median') || stem.includes('mode') || stem.includes('range')) {
    const numbers = []
    if (params.a !== undefined) numbers.push(params.a)
    if (params.b !== undefined) numbers.push(params.b)
    if (params.c !== undefined) numbers.push(params.c)
    if (params.d !== undefined) numbers.push(params.d)
    if (params.e !== undefined) numbers.push(params.e)

    if (numbers.length >= 3) {
      return {
        type: 'bar_chart',
        numbers: numbers,
        width: 400,
        height: 300
      }
    }
  }

  return null
}

// Generate a question from a template
export function generateQuestionFromTemplate(template, skill, year) {
  // Optional per-template difficulty field (1â€“10). If absent, year decides.
  let templateDifficulty = typeof template.difficulty === 'number' ? template.difficulty : undefined

  // STEP 3 (optional): auto-calculate difficulty from params when not tagged
  if (templateDifficulty === undefined) {
    const inferred = estimateDifficulty(template.params)
    if (typeof inferred === 'number') {
      templateDifficulty = inferred
    }
  }

  const params = generateParams(template.params, year, templateDifficulty)

  // Ensure Y9 quadratics factorisation questions always have integer roots.
  // For QUADRATICS.T2, regenerate a and b from integer factors p, q so that
  // x^2 + ax + b = (x + p)(x + q) with small non-zero integer p, q.
  if ((template.id || '') === 'Y9.A.QUADRATICS.T2') {
    let p = 0
    let q = 0
    // Avoid any root equal to 0 so we don't generate x(x + k) formats
    while (p === 0 || q === 0) {
      p = randInt(-5, 5)
      q = randInt(-5, 5)
    }
    params.a = p + q
    params.b = p * q
  }

  // Ensure triangle angle sum is valid for Y8.G.GEOMETRY.T1
  // Generate angles so that the missing angle is at least 20°.
  if ((template.id || '') === 'Y8.G.GEOMETRY.T1') {
    let a = 0
    let b = 0
    // require a, b in [20, 130] and a + b <= 160
    let tries = 0
    while (tries < 100) {
      a = randInt(20, 130)
      b = randInt(20, 130)
      if (a + b <= 160) break
      tries++
    }
    params.a = a
    params.b = b
  }

  // Ensure proper-fraction group questions for Y6.N.FRACTIONS.T2
  // Force num < den so the fraction of students is realistic.
  if ((template.id || '') === 'Y6.N.FRACTIONS.T2' &&
      typeof params.den === 'number' &&
      params.den > 1) {
    params.num = randInt(1, params.den - 1)
  }

  // Ensure right-triangle trig questions use consistent side lengths.
  // For TRIG_RIGHT templates, derive the hypotenuse from opp and adj
  // so that sin and cos are always in [0,1] and satisfy Pythagoras.
  if ((template.id || '').includes('TRIG_RIGHT') &&
      typeof params.opp === 'number' &&
      typeof params.adj === 'number') {
    const hyp = Math.sqrt(params.opp * params.opp + params.adj * params.adj)
    params.hyp = mathHelpers.round(hyp, 1)
  }

  const question = substituteStem(template.stem, params)
  const answer = evaluateAnswer(template.answer, params)

  // Attempt to create a formatted answer for common probability patterns
  // e.g., single draw: r/(r+b)  or two draws with replacement: (r/(r+b))*(r/(r+b))
  let formattedAnswer = null
  try {
    const ansExpr = String(template.answer || '')
    // match pattern like 'x/(x+y)'
    const fracMatch = ansExpr.match(/([a-zA-Z_]\w*)\s*\/\s*\(\s*\1\s*\+\s*([a-zA-Z_]\w*)\s*\)/)
    if (fracMatch) {
      const aVar = fracMatch[1]
      const bVar = fracMatch[2]
      const aVal = parseInt(params[aVar], 10)
      const bVal = parseInt(params[bVar], 10)
      if (!Number.isNaN(aVal) && !Number.isNaN(bVal)) {
        const singleNum = aVal
        const singleDen = aVal + bVal
        // check if expression repeats (two draws / squared)
        const repeats = (ansExpr.split(fracMatch[0]).length - 1)
        if (repeats >= 2 || /\*\s*\(?.*\)\s*\^?\s*2/.test(ansExpr)) {
          const num = singleNum * singleNum
          const den = singleDen * singleDen
          formattedAnswer = mathHelpers.simplify(num, den) + ' ≈ ' + (parseFloat((num / den).toFixed(6)))
        } else {
          formattedAnswer = mathHelpers.simplify(singleNum, singleDen) + ' ≈ ' + (parseFloat((singleNum / singleDen).toFixed(6)))
        }
      }
    }
  } catch (e) {
    // ignore formatting errors
  }

  // Prefer explicit visualData provided in the template (so authored visuals show correctly).
  // If present, deep-clone it and replace any string tokens that refer to parameter names
  // with the generated parameter values (e.g., point coordinates like "x" -> params.x).
  let visualData = null
  if (template.visualData) {
    visualData = JSON.parse(JSON.stringify(template.visualData))

    // Recursive replacer: if a string equals a param name, replace with the param value
    const replaceParams = (obj) => {
      if (obj === null || obj === undefined) return obj
      if (Array.isArray(obj)) {
        return obj.map(v => replaceParams(v))
      }
      if (typeof obj === 'object') {
        Object.keys(obj).forEach(k => {
          obj[k] = replaceParams(obj[k])
        })
        return obj
      }
      if (typeof obj === 'string') {
        // If string looks like a numeric range label (e.g. "130-140"), keep as-is
        const rangeLabel = /^\s*\d+\s*-\s*\d+\s*$/
        if (rangeLabel.test(obj)) return obj
        // Exact match to a param name
        if (params.hasOwnProperty(obj)) return params[obj]
        // Also allow simple numeric strings
        const num = Number(obj)
        if (!isNaN(num)) return num
        // Try to evaluate simple expressions using params as variables
        try {
          const keys = Object.keys(params)
          const values = Object.values(params)
          const fn = new Function(...keys, `return (${obj})`)
          const evaluated = fn(...values)
          if (evaluated !== undefined) return evaluated
        } catch (e) {
          // ignore and fall back to returning the raw string
        }
        return obj
      }
      return obj
    }

    visualData = replaceParams(visualData)
  } else {
    visualData = generateVisualData(template, params, skill)
  }

  return {
    question: question,
    answer: answer,
    formattedAnswer: formattedAnswer,
    templateId: template.id,
    skill: skill,
    params: params,
    visualData: visualData
  }
}

// Generate a question for a specific skill from curriculum
export function generateQuestionForSkill(curriculum, skillId) {
  // Find the skill in the curriculum
  for (const year of curriculum.years) {
    for (const skill of year.skills) {
      if (skill.id === skillId) {
        // Pick a random template for this skill
        if (skill.templates && skill.templates.length > 0) {
          const template = skill.templates[randInt(0, skill.templates.length - 1)]

          return {
            ...generateQuestionFromTemplate(template, skill.name, year.year),
            strand: skill.strand,
            topic: skill.name,
            skillId: skill.id,
            year: year.year
          }
        }
      }
    }
  }

  console.error('Skill not found:', skillId)
  return {
    question: 'Error: Skill not found',
    answer: '0',
    strand: 'Unknown',
    topic: 'Unknown',
    skillId: skillId
  }
}

// Get all skills for a year
export function getSkillsForYear(curriculum, year) {
  const yearData = curriculum.years.find(y => y.year === year)
  if (!yearData) return []

  return yearData.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    strand: skill.strand,
    description: skill.description,
    ixl_refs: skill.ixl_refs || [],
    // Preserve the isNew marker so outside callers can filter new skills
    isNew: !!skill.isNew
  }))
}

// Get all years available in curriculum
export function getAvailableYears(curriculum) {
  return curriculum.years.map(y => y.year)
}

// Organize skills by strand for a given year
export function getStrandsForYear(curriculum, year) {
  const yearData = curriculum.years.find(y => y.year === year)
  if (!yearData) return []

  const strandMap = {}

  yearData.skills.forEach(skill => {
    if (!strandMap[skill.strand]) {
      strandMap[skill.strand] = {
        strand: skill.strand,
        skills: []
      }
    }
    strandMap[skill.strand].skills.push({
      id: skill.id,
      name: skill.name,
      description: skill.description
    })
  })

  return Object.values(strandMap)
}
