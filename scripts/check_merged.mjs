import fs from 'fs'
import path from 'path'

const basePath = path.resolve('src', 'curriculumDataFull.json')
const newPath = path.resolve('src', 'curriculumDataNew.json')

const rawBase = fs.readFileSync(basePath, 'utf8')
const rawNew = fs.readFileSync(newPath, 'utf8')
const base = JSON.parse(rawBase.replace(/^\uFEFF/, ''))
const newData = JSON.parse(rawNew.replace(/^\uFEFF/, ''))

// perform the same merge logic as curriculumDataMerged.js
const merged = JSON.parse(JSON.stringify(base))
const merge = () => {
  if (!newData || !Array.isArray(newData.years)) return merged
  newData.years.forEach(newYear => {
    const yearNum = newYear.year
    const existing = merged.years.find(y => y.year === yearNum)
    if (existing) {
      newYear.skills.forEach(ns => {
        if (!ns || !ns.id) return
        const existsSkill = existing.skills.find(s => s.id === ns.id)
        const skillToAdd = JSON.parse(JSON.stringify(ns))
        skillToAdd.isNew = true
        if (!existsSkill) {
          existing.skills.push(skillToAdd)
        } else {
          if (!existsSkill.isNew) existsSkill.isNew = true
          existsSkill.templates = existsSkill.templates || []
          if (Array.isArray(ns.templates)) {
            ns.templates.forEach(nt => {
              if (!nt || !nt.id) return
              const already = existsSkill.templates.find(t => t.id === nt.id)
              if (!already) {
                const tcopy = JSON.parse(JSON.stringify(nt))
                tcopy.isNew = true
                existsSkill.templates.push(tcopy)
              }
            })
          }
        }
      })
    } else {
      const ycopy = JSON.parse(JSON.stringify(newYear))
      ycopy.skills = ycopy.skills.map(s => ({ ...s, isNew: true }))
      merged.years.push(ycopy)
    }
  })
  return merged
}

merge()

const year7 = merged.years.find(y => y.year === 7)
if (!year7) {
  console.error('No year 7 found in merged curriculum')
  process.exit(1)
}

const skill = year7.skills.find(s => s.id === 'Y7.M.MEASUREMENT_TIME_MONEY')
if (!skill) {
  console.error('Skill Y7.M.MEASUREMENT_TIME_MONEY not found in merged curriculum')
  process.exit(1)
}

console.log('Skill:', skill.id, '-', skill.name)
console.log('Number of templates:', (skill.templates || []).length)
console.log('Template IDs:')
;(skill.templates || []).forEach(t => console.log(' -', t.id, t.isNew ? '(new)' : ''))
