function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

export function generateQuestion() {
  const types = [
    () => {
      const a = rand(1,12), b = rand(2,12), c = rand(1,12), d = rand(2,12)
      return { question: `\\frac{${a}}{${b}} + \\frac{${c}}{${d}} =`, answer: `${a*d + b*c}/${b*d}` }
    },
    () => {
      const p = rand(5,95), n = rand(10,200)
      return { question: `${p}\\% \\text{ of } ${n} =`, answer: Math.round(p/100 * n).toString() }
    },
    () => {
      const l = rand(3,20), w = rand(3,20)
      return { question: `\\text{Area of rectangle } ${l}\\text{ cm} \\times ${w}\\text{ cm} =`, answer: (l*w).toString() }
    },
    () => {
      const x = rand(2,30)
      return { question: `\\text{Solve: } 3x = ${3*x}`, answer: x.toString() }
    }
  ]
  return types[rand(0, types.length-1)]()
}
