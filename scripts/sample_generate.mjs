import { generateQuestionForSkill } from '../src/templateEngine.js'
import fs from 'fs'

const curriculumPath = new URL('../src/curriculumDataNew.json', import.meta.url)
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'))

const q1 = generateQuestionForSkill(curriculum, 'Y7.N.RATES')
console.log('--- Y7.N.RATES sample ---')
console.log(JSON.stringify(q1, null, 2))

const q2 = generateQuestionForSkill(curriculum, 'Y8.G.TRANSVERSALS')
console.log('\n--- Y8.G.TRANSVERSALS sample ---')
console.log(JSON.stringify(q2, null, 2))

const q3 = generateQuestionForSkill(curriculum, 'Y6.S.HISTOGRAMS')
console.log('\n--- Y6.S.HISTOGRAMS sample ---')
console.log(JSON.stringify(q3, null, 2))

const q4 = generateQuestionForSkill(curriculum, 'Y6.G.NETS')
console.log('\n--- Y6.G.NETS sample ---')
console.log(JSON.stringify(q4, null, 2))
