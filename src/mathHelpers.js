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

export function surface_area_cylinder(r, h) {
  return 2 * Math.PI * r * h + 2 * Math.PI * r * r;
}

export function surface_area_rectangular_prism(l, w, h) {
  return 2 * (l * w + l * h + w * h);
}

export function geometric_sequence_nth_term(a, r, n) {
  return a * (r ** (n - 1));
}

export function volume_cone(r, h) {
  return (1/3) * Math.PI * r * r * h;
}

export function surface_area_cone(r, h) {
  const slantHeight = Math.sqrt(h*h + r*r);
  return Math.PI * r * (r + slantHeight);
}

export function volume_sphere(r) {
  return (4/3) * Math.PI * r**3;
}

export function surface_area_sphere(r) {
  return 4 * Math.PI * r**2;
}
