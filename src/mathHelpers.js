// Math helper functions for answer evaluation

export function hcf(a, b) {
  a = Math.abs(Math.floor(a))
  b = Math.abs(Math.floor(b))
  while (b) {
    let t = b
    b = a % b
    a = t
  }
  return a
}

export function lcm(a, b) {
  return Math.abs(Math.floor(a) * Math.floor(b)) / hcf(a, b)
}

export function simplify(num, den) {
  const g = hcf(num, den)
  const simplifiedNum = num / g
  const simplifiedDen = den / g

  if (simplifiedDen === 1) {
    return simplifiedNum.toString()
  }
  return `${simplifiedNum}/${simplifiedDen}`
}

// Convert decimal to fraction in simplest form
export function decimal_to_fraction_simplified(x) {
  const value = Number(x)
  if (!Number.isFinite(value)) return '0'

  // Count decimal places (up to 6 to be safe)
  const str = value.toString()
  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return simplify(value, 1)
  }

  const decimalPlaces = str.length - dotIndex - 1
  const denominator = 10 ** decimalPlaces
  const numerator = Math.round(value * denominator)
  return simplify(numerator, denominator)
}

export function number_to_words(n) {
  if (n === 0) return 'zero'

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  function convertBelowThousand(num) {
    if (num === 0) return ''
    if (num < 10) return ones[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) {
      const tensPart = tens[Math.floor(num / 10)]
      const onesPart = ones[num % 10]
      return onesPart ? `${tensPart}-${onesPart}` : tensPart
    }

    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    const hundredsPart = `${ones[hundreds]} hundred`

    if (remainder === 0) return hundredsPart
    return `${hundredsPart} and ${convertBelowThousand(remainder)}`
  }

  if (n < 1000) return convertBelowThousand(n)

  const thousands = Math.floor(n / 1000)
  const remainder = n % 1000

  let result = ''

  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000)
    result += convertBelowThousand(millions) + ' million'
    n = n % 1000000

    if (n > 0) result += ' '
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000)
    result += convertBelowThousand(thousands) + ' thousand'
    n = n % 1000

    if (n > 0) result += ' '
  }

  if (n > 0) {
    result += convertBelowThousand(n)
  }

  return result.trim()
}

export function round(num, decimals) {
  if (decimals >= 0) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  } else {
    // Negative decimals mean rounding to nearest 10, 100, 1000, etc.
    const factor = Math.pow(10, -decimals)
    return Math.round(num / factor) * factor
  }
}

export function formatQuadraticExpression(aCoeff, bCoeff, cCoeff) {
  const formatTerm = (coef, suffix) => {
    if (coef === 0) return ''
    const abs = Math.abs(coef)
    let termValue = ''
    if (suffix) {
      if (abs === 1) {
        termValue = suffix
      } else {
        termValue = `${abs}${suffix}`
      }
    } else {
      termValue = `${abs}`
    }
    return coef < 0 ? `- ${termValue}` : termValue
  }

  const parts = []
  const pushTerm = (coef, suffix) => {
    const formatted = formatTerm(coef, suffix)
    if (!formatted) return
    if (parts.length === 0) {
      parts.push(coef < 0 && formatted.startsWith('- ') ? `-${formatted.slice(2)}` : formatted)
    } else {
      parts.push(coef < 0 ? ` - ${formatted.slice(2)}` : ` + ${formatted}`)
    }
  }

  pushTerm(aCoeff, 'x^2')
  pushTerm(bCoeff, 'x')
  pushTerm(cCoeff, '')

  if (!parts.length) return '0'
  return parts.join('')
}

export function formatRoots(r1, r2) {
  const a = Number(r1)
  const b = Number(r2)
  if (a === b) {
    return `x = ${a}`
  }
  const [low, high] = a < b ? [a, b] : [b, a]
  return `x = ${low} or x = ${high}`
}

export function formatOrderedPair(xVal, yVal) {
  return `x = ${xVal}, y = ${yVal}`
}

export function formatLinearFactor(coeff, constant) {
  const c = Number(coeff)
  const k = Number(constant)
  const coeffPart =
    c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`

  if (k === 0) {
    return `(${coeffPart})`
  }

  const sign = k > 0 ? ' + ' : ' - '
  return `(${coeffPart}${sign}${Math.abs(k)})`
}

export function describeDiscriminant(value) {
  if (value > 0) return 'two distinct real roots'
  if (value === 0) return 'one repeated real root'
  return 'no real roots'
}

export function formatDiscriminantNature(value) {
  return `D = ${value}, ${describeDiscriminant(value)}`
}

export function simplifySurd(n) {
  const value = Math.max(0, Math.round(Number(n)))
  if (value === 0) return '0'
  let factor = value
  let outside = 1
  for (let i = Math.floor(Math.sqrt(value)); i >= 2; i--) {
    const square = i * i
    if (value % square === 0) {
      outside = i
      factor = value / square
      break
    }
  }
  if (outside === 1) {
    return `√${factor}`
  }
  if (factor === 1) {
    return `${outside}`
  }
  return `${outside}√${factor}`
}

export function rationaliseSurd(a, b) {
  const factor = (Number(a) - Number(b))
  const numerator = `(√${a} + √${b})`
  if (factor === 1) return numerator
  return `${factor}${numerator}`
}

export function bestValue(a, priceA, b, priceB) {
  const unitA = priceA / a
  const unitB = priceB / b
  if (Math.abs(unitA - unitB) < 1e-6) return 'Tie'
  return unitA < unitB ? 'Brand A' : 'Brand B'
}

export function solveParabolaLine(m, c, k) {
  const A = 1
  const B = -m
  const C = -(k + c)
  const disc = B * B - 4 * A * C
  if (disc < 0) return 'No real solution'
  const root = (-B + Math.sqrt(disc)) / (2 * A)
  return root.toFixed(2)
}

export function binomial_coeff(n, k) {
  const N = Math.floor(Number(n))
  const K = Math.floor(Number(k))
  if (isNaN(N) || isNaN(K) || K < 0 || N < 0 || K > N) return 0
  if (K === 0 || K === N) return 1
  const effectiveK = Math.min(K, N - K)
  let numerator = 1
  let denominator = 1
  for (let i = 1; i <= effectiveK; i++) {
    numerator *= N - (effectiveK - i)
    denominator *= i
  }
  return Math.round(numerator / denominator)
}

// Approximate the cumulative distribution function for N(0,1).
export function normalCdfApprox(z) {
  const value = Number(z)
  if (!Number.isFinite(value)) return 0.5
  const absZ = Math.abs(value)
  const t = 1 / (1 + 0.2316419 * absZ)
  const d = 0.3989422804014327 * Math.exp(-absZ * absZ / 2)
  const poly =
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  let cdf = 1 - d * poly
  if (value < 0) {
    cdf = 1 - cdf
  }
  if (cdf < 0) return 0
  if (cdf > 1) return 1
  return cdf
}

const exactTrigTable = {
  sin: {
    0: '0',
    30: '1/2',
    45: 'sqrt(2)/2',
    60: 'sqrt(3)/2',
    90: '1'
  },
  cos: {
    0: '1',
    30: 'sqrt(3)/2',
    45: 'sqrt(2)/2',
    60: '1/2',
    90: '0'
  },
  tan: {
    0: '0',
    30: 'sqrt(3)/3',
    45: '1',
    60: 'sqrt(3)',
    90: 'undefined'
  }
}

function normalizeAngle(angle) {
  const value = Number(angle)
  return Number.isFinite(value) ? value : 0
}

export function exactTrigValue(fn, angle) {
  const key = (fn || '').toString().toLowerCase()
  const lookup = exactTrigTable[key]
  if (!lookup) return '0'
  const normalized = normalizeAngle(angle)
  return lookup.hasOwnProperty(normalized) ? lookup[normalized] : '0'
}

export const exactSin = angle => exactTrigValue('sin', angle)
export const exactCos = angle => exactTrigValue('cos', angle)
export const exactTan = angle => exactTrigValue('tan', angle)

export function formatInverse2x2(a, b, c, d) {
  const det = Number(a) * Number(d) - Number(b) * Number(c)
  if (det === 0) return 'Not invertible'
  const formatEntry = value => {
    const num = Number(value)
    if (Object.is(num, -0)) return '0'
    return num.toString()
  }
  const matrixStr = `[[${formatEntry(d)}, ${formatEntry(-b)}], [${formatEntry(-c)}, ${formatEntry(a)}]]`
  if (det === 1) {
    return matrixStr
  }
  return `(1/${det})${matrixStr}`
}

export function powMod(base, exp, mod) {
  const MOD = Math.abs(Number(mod)) || 1
  let b = Number(base) % MOD
  let e = Math.max(0, Math.floor(Number(exp)))
  let result = 1
  while (e > 0) {
    if (e % 2 === 1) {
      result = (result * b) % MOD
    }
    b = (b * b) % MOD
    e = Math.floor(e / 2)
  }
  return result
}

export function sumOfDivisors(n) {
  let value = Math.abs(Math.floor(Number(n)))
  if (value === 0) return 0
  let total = 1
  for (let p = 2; p * p <= value; p++) {
    if (value % p === 0) {
      let term = 1
      let sum = 1
      while (value % p === 0) {
        value /= p
        term *= p
        sum += term
      }
      total *= sum
    }
  }
  if (value > 1) {
    total *= (1 + value)
  }
  return total
}

export function countPositiveDiophantine(a, b, target) {
  const A = Math.abs(Math.floor(Number(a)))
  const B = Math.abs(Math.floor(Number(b)))
  const T = Math.floor(Number(target))
  if (A === 0 || B === 0 || T <= 0) return 0
  let count = 0
  for (let x = 1; x * A < T; x++) {
    const remaining = T - x * A
    if (remaining <= 0) break
    if (remaining % B === 0) {
      const y = remaining / B
      if (y > 0) count++
    }
  }
  return count
}

export function tanRecurrenceValue(den, num, term) {
  const Den = Number(den)
  const Num = Number(num)
  let value = Num / Den
  const steps = Math.max(0, Math.floor(Number(term)))
  for (let i = 0; i < steps; i++) {
    const numerator = Den * value + Num
    const denominator = Den - Num * value
    if (Math.abs(denominator) < 1e-9) {
      return Number.POSITIVE_INFINITY
    }
    value = numerator / denominator
  }
  return Math.round(value * 10000) / 10000
}

export function scalingFunctionValue(k, target) {
  const K = Math.max(1, Math.floor(Number(k)))
  let x = Number(target)
  if (!Number.isFinite(x) || x <= 0) return 0
  let scale = 1
  while (x > 3) {
    x /= K
    scale *= K
  }
  while (x < 1) {
    x *= K
    scale /= K
  }
  const baseValue = 1 - Math.abs(x - 2)
  return Math.max(0, scale * baseValue)
}

export function solveInverseFunctional(c, d, val) {
  const C = Number(c)
  const D = Number(d)
  const x = Number(val)
  const denom = 1 - C * C
  if (denom === 0 || x === 0) return 0
  const fInv = (D / x - C * D * x) / denom
  const fx = D * x - C * fInv
  return Math.round(fx * 10000) / 10000
}

export function polyLinearRemainderSum(a, b, ra, rb) {
  const A = Number(a)
  const B = Number(b)
  const RA = Number(ra)
  const RB = Number(rb)
  const coeff = (RA - RB) / (A - B)
  const constant = RA - coeff * A
  return Math.round((coeff + constant) * 10000) / 10000
}

export function derangement(n) {
  const N = Math.max(0, Math.floor(Number(n)))
  if (N === 0) return 1
  if (N === 1) return 0
  let prev2 = 1
  let prev1 = 0
  let current = 0
  for (let i = 2; i <= N; i++) {
    current = (i - 1) * (prev1 + prev2)
    prev2 = prev1
    prev1 = current
  }
  return current
}

export function triangleRandomWalkProbability(steps) {
  const n = Math.max(0, Math.floor(Number(steps)))
  let startProb = 1
  let neighborProb = 0
  for (let i = 0; i < n; i++) {
    const nextStart = neighborProb
    const nextNeighbor = startProb / 2 + neighborProb / 2
    startProb = nextStart
    neighborProb = nextNeighbor
  }
  return Math.round(startProb * 10000) / 10000
}

export function lcmRange(n) {
  const limit = Math.max(1, Math.floor(Number(n)))
  let result = 1
  for (let i = 2; i <= limit; i++) {
    result = lcm(result, i)
  }
  return result
}

export function factorial(n) {
  const N = Math.max(0, Math.floor(Number(n)))
  let result = 1
  for (let i = 2; i <= N; i++) {
    result *= i
  }
  return result
}

export function unitsDigit(base, exp) {
  const b = Math.abs(Math.floor(Number(base))) % 10
  const e = Math.max(0, Math.floor(Number(exp)))
  if (e === 0) return 1
  const cycles = {
    0: [0],
    1: [1],
    2: [2, 4, 8, 6],
    3: [3, 9, 7, 1],
    4: [4, 6],
    5: [5],
    6: [6],
    7: [7, 9, 3, 1],
    8: [8, 4, 2, 6],
    9: [9, 1]
  }
  const cycle = cycles[b] || [b]
  const index = (e - 1) % cycle.length
  return cycle[index]
}

export function countPrimesLessThan(n) {
  const limit = Math.max(2, Math.floor(Number(n)))
  const sieve = new Array(limit).fill(true)
  sieve[0] = sieve[1] = false
  for (let i = 2; i * i < limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j < limit; j += i) {
        sieve[j] = false
      }
    }
  }
  return sieve.reduce((count, isPrime) => count + (isPrime ? 1 : 0), 0)
}

export function formatLinearExpression(aCoeff, bCoeff) {
  const formatTerm = (coef, suffix) => {
    if (coef === 0) return ''
    const abs = Math.abs(coef)
    if (suffix) {
      if (abs === 1) return suffix
      return `${abs}${suffix}`
    }
    return `${abs}`
  }

  const parts = []
  const pushTerm = (coef, suffix) => {
    const formatted = formatTerm(coef, suffix)
    if (!formatted) return
    if (parts.length === 0) {
      parts.push(coef < 0 && formatted.startsWith('- ') ? `-${formatted.slice(2)}` : (coef < 0 ? `-${formatted}` : formatted))
    } else {
      parts.push(coef < 0 ? ` - ${formatted.replace(/^- /, '')}` : ` + ${formatted}`)
    }
  }

  pushTerm(aCoeff, 'x')
  pushTerm(bCoeff, '')

  if (!parts.length) return '0'
  return parts.join('')
}

export function isPrime(n) {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false

  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function primeFactors(n) {
  const factors = []
  let divisor = 2

  while (n > 1) {
    if (n % divisor === 0) {
      factors.push(divisor)
      n = n / divisor
    } else {
      divisor++
    }
  }

  return factors
}

// Prime factorisation formatted as a product of primes (e.g., "2 × 5 × 7")
export function prime_factorisation(n) {
  const cleanN = Math.abs(Math.floor(n))
  if (cleanN < 2) return cleanN.toString()
  const factors = primeFactors(cleanN)
  return factors.join(' × ')
}

// Basic square root helper for templates that use sqrt(...)
export function sqrt(x) {
  return Math.sqrt(x)
}

export function sqrtExact(n) {
  const value = Number(n)
  if (!Number.isFinite(value) || value < 0) return `√${value}`
  const root = Math.sqrt(value)
  if (Number.isInteger(root)) return root
  return `√${value}`
}

// Estimate the square root of n (to nearest whole number)
export function estimate_sqrt(n) {
  const value = Number(n)
  if (!Number.isFinite(value) || value < 0) return NaN
  return Math.round(Math.sqrt(value))
}

// Arithmetic sequence nth-term formula as a string, e.g. "a_n = -5 - (n - 1) * 5"
export function arithmetic_sequence_nth_term_formula(a1, d) {
  const first = Number(a1)
  const diff = Number(d)
  if (!Number.isFinite(first) || !Number.isFinite(diff)) {
    return 'a_n = a_1 + (n - 1)d'
  }
  if (diff === 0) {
    return `a_n = ${first}`
  }
  const absDiff = Math.abs(diff)
  if (diff > 0) {
    return `a_n = ${first} + (n - 1) * ${absDiff}`
  }
  return `a_n = ${first} - (n - 1) * ${absDiff}`
}

export function mean(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length
}

export function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function mode(arr) {
  const counts = {}
  let maxCount = 0
  let modeValue = arr[0]

  arr.forEach(val => {
    counts[val] = (counts[val] || 0) + 1
    if (counts[val] > maxCount) {
      maxCount = counts[val]
      modeValue = val
    }
  })

  return modeValue
}

export function range(arr) {
  return Math.max(...arr) - Math.min(...arr)
}

// Sort a numeric array ascending
export function sort(arr) {
  if (!Array.isArray(arr)) return arr
  return [...arr].sort((a, b) => a - b)
}

// Mixed-number subtraction: (w1 a/b) - (w2 c/b)
export function mixed_subtract(w1, a, b, w2, c, d) {
  const den1 = b
  const den2 = d
  if (den1 !== den2 || den1 === 0) return '0'
  const improp1 = w1 * den1 + a
  const improp2 = w2 * den2 + c
  const num = improp1 - improp2
  return simplify(num, den1)
}

// Convert improper fraction to mixed number string
export function improper_to_mixed(num, den) {
  if (den === 0) return 'undefined'
  const whole = Math.trunc(num / den)
  const remainder = Math.abs(num % den)
  if (remainder === 0) return whole.toString()
  return `${whole} ${remainder}/${Math.abs(den)}`
}

// Simplify ratio a:b
export function simplify_ratio(a, b) {
  const g = hcf(a, b)
  const ra = a / g
  const rb = b / g
  return `${ra}:${rb}`
}

// Round a positive decimal to given significant figures
export function round_to_sigfig(x, sig) {
  const value = Number(x)
  if (!Number.isFinite(value) || value === 0) return 0
  const power = Math.floor(Math.log10(Math.abs(value))) - (sig - 1)
  const factor = 10 ** power
  return Math.round(value / factor) * factor
}

// Normalize numeric or fraction string to a Number for comparison
export function normalizeFraction(answer) {
  if (!answer) return NaN
  const str = String(answer).trim()

  // Mixed number: "a b/c"
  const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1])
    const num = parseFloat(mixedMatch[2])
    const den = parseFloat(mixedMatch[3]) || 1
    return whole + num / den
  }

  // Simple fraction: "a/b"
  const fracMatch = str.match(/^(-?\d+)\/(\d+)$/)
  if (fracMatch) {
    const num = parseFloat(fracMatch[1])
    const den = parseFloat(fracMatch[2]) || 1
    return num / den
  }

  // Fallback: plain number
  const numVal = parseFloat(str.replace(',', ''))
  return Number.isFinite(numVal) ? numVal : NaN
}

// Phase 2: Missing Topics - Helper Functions
export function area_composite(shapes) {
  // shapes is array of [type, ...params]
  return shapes.reduce((sum, s) => sum + (s[0]==='rect' ? s[1]*s[2] : s[1]*s[2]*s[3]/2), 0)
}

export function perimeter_composite(shapes) {
  return shapes.reduce((sum, s) => sum + (s[0]==='rect' ? 2*(s[1]+s[2]) : 0), 0)
}

export function angle_vert_opp(a) { return a }
export function angle_complementary(a) { return 90 - a }
export function angle_supplementary(a) { return 180 - a }

export function linear_eval(m, c, x) { return m * x + c }

export function trig_ratio(sideOpp, sideAdj, sideHyp, ratio) {
  // ratio = 'sin','cos','tan'
  const val = ratio==='sin' ? sideOpp/sideHyp : ratio==='cos' ? sideAdj/sideHyp : sideOpp/sideAdj
  return round(val, 3)
}

// Phase 5: Helper for time calculations (needed for visualizer)
export function elapsed_minutes(start, end) {
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  let mins1 = h1 * 60 + m1
  let mins2 = h2 * 60 + m2
  if (mins2 < mins1) mins2 += 1440 // Handle crossing midnight
  return mins2 - mins1
}

// --- Phase 7: New helper functions ---

const PI_APPROX = 3.14

export function surface_area_cylinder(r, h) {
  return 2 * PI_APPROX * r * h + 2 * PI_APPROX * r * r;
}

export function surface_area_rectangular_prism(l, w, h) {
  return 2 * (l * w + l * h + w * h);
}

export function geometric_sequence_nth_term(a, r, n) {
  return a * (r ** (n - 1));
}

export function volume_cone(r, h) {
  return (1/3) * PI_APPROX * r * r * h;
}

export function surface_area_cone(r, h) {
  const slantHeight = Math.sqrt(h*h + r*r);
  return PI_APPROX * r * (r + slantHeight);
}

export function volume_sphere(r) {
  return (4/3) * PI_APPROX * r**3;
}

export function surface_area_sphere(r) {
  return 4 * PI_APPROX * r**2;
}

// Check if n is a perfect square (for rational/irrational classification)
export function is_perfect_square(n) {
  const value = Number(n)
  if (!Number.isFinite(value) || value < 0) return false
  const root = Math.round(Math.sqrt(value))
  return root * root === value
}

// Helpers matching template expressions max([..]) / min([..])
export function max(arr) {
  if (!Array.isArray(arr)) return NaN
  return Math.max(...arr)
}

export function min(arr) {
  if (!Array.isArray(arr)) return NaN
  return Math.min(...arr)
}

// Absolute value helper for templates that use abs(...)
export function abs(x) {
  return Math.abs(x)
}

// Factorise monic quadratics x^2 + ax + b with integer roots.
// Returns a string like "(x + 2)(x - 3)" when possible,
// otherwise falls back to the unfactored form "x^2 + ax + b".
export function factor_quadratic_monic(a, b) {
  const A = Number(a)
  const B = Number(b)
  if (!Number.isFinite(A) || !Number.isFinite(B)) {
    return `x^2 + ${a}x + ${b}`
  }

  for (let p = -30; p <= 30; p++) {
    for (let q = -30; q <= 30; q++) {
      if (p + q === A && p * q === B) {
        const left = p >= 0 ? `(x + ${p})` : `(x - ${Math.abs(p)})`
        const right = q >= 0 ? `(x + ${q})` : `(x - ${Math.abs(q)})`
        return left + right
      }
    }
  }

  // If no integer factors found, return standard form
  return `x^2 + ${A}x + ${B}`
}

// --- Phase 8: New helper functions ---

// Solve a system of two linear equations:
//   y = m1*x + c1
//   y = m2*x + c2
// Returns a string "x,y" with numeric values rounded to 2 dp.
export function solve_linear_system(m1, c1, m2, c2) {
  const denom = (m1 - m2)
  if (denom === 0) {
    return 'no_solution'
  }
  const x = (c2 - c1) / denom
  const y = m1 * x + c1
  const rx = Math.round(x * 100) / 100
  const ry = Math.round(y * 100) / 100
  return `${rx},${ry}`
}

// Simplify sqrt(n) into the form a√b as a string.
// E.g., n=50 -> "5√2", n=12 -> "2√3", n=16 -> "4"
export function simplify_radical(n) {
  const value = Number(n)
  if (!Number.isFinite(value) || value < 0) return '0'

  let a = 1
  let b = value
  for (let i = Math.floor(Math.sqrt(value)); i >= 2; i--) {
    const square = i * i
    if (value % square === 0) {
      a = i
      b = value / square
      break
    }
  }

  if (b === 1) {
    return `${a}`
  }
  if (a === 1) {
    return `√${b}`
  }
  return `${a}√${b}`
}

// Quadratic formula for ax^2 + bx + c = 0.
// Returns a string like "x1,x2" with roots rounded to 2 dp.
export function solve_quadratic_formula(a, b, c) {
  const A = Number(a)
  const B = Number(b)
  const C = Number(c)
  if (!Number.isFinite(A) || A === 0) return 'no_solution'
  const disc = B * B - 4 * A * C
  if (disc < 0) return 'no_real_solutions'
  const sqrtDisc = Math.sqrt(disc)
  const x1 = (-B + sqrtDisc) / (2 * A)
  const x2 = (-B - sqrtDisc) / (2 * A)
  // Round to 2 decimal places to match stems
  const r1 = Math.round(x1 * 100) / 100
  const r2 = Math.round(x2 * 100) / 100
  return `${r1},${r2}`
}

// Cosine rule: given sides a, b and included angle C (in degrees),
// find the opposite side c.
export function cosine_rule_side(a, b, Cdeg) {
  const A = Number(a)
  const B = Number(b)
  const C = Number(Cdeg)
  const rad = (Math.PI / 180) * C
  const c2 = A * A + B * B - 2 * A * B * Math.cos(rad)
  if (c2 < 0) return 0
  return Math.sqrt(c2)
}

// Optional helper for advanced systems (line vs parabola): y = c and y = x^2 - a
// Returns positive x-coordinate sqrt(c + a)
export function solve_linear_parabola_system(a, c) {
  const A = Number(a)
  const C = Number(c)
  const val = C + A
  if (val < 0) return 'no_real_solution'
  const x = Math.sqrt(val)
  const rx = Math.round(x * 100) / 100
  return rx
}

// Volume of a cylinder (uses same PI approximation as cones/spheres)
export function volume_cylinder(r, h) {
  return PI_APPROX * r * r * h
}
