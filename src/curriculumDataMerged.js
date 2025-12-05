import base from './curriculumDataFull.json'
// Year 6-9: Still in combined file (smaller volume)
import newDataY6to9 from './curriculumDataNew.json'
// Year 10-13: Split into separate files (easier to work on)
import newDataY10 from './curriculumDataNew_Y10.json'
import newDataY11 from './curriculumDataNew_Y11.json'
import newDataY12 from './curriculumDataNew_Y12.json'
import newDataY13 from './curriculumDataNew_Y13.json'
import year11Data from './year11Curriculum.json'
import year12Data from './year12Curriculum.json'
import year13Data from './year13Curriculum.json'

// Deep clone base to avoid mutating imported object
const merged = JSON.parse(JSON.stringify(base))

function applyNewData(source) {
  if (!source || !Array.isArray(source.years)) return

  source.years.forEach(newYear => {
    const yearNum = newYear.year
    // Find matching year in base
    const existing = merged.years.find(y => y.year === yearNum)
    if (existing) {
      // For each new skill, add if not present
      newYear.skills.forEach(ns => {
        if (!ns || !ns.id) return
        const existsSkill = existing.skills.find(s => s.id === ns.id)
        const skillToAdd = JSON.parse(JSON.stringify(ns))
        skillToAdd.isNew = true
        if (!existsSkill) {
          // New skill entirely — add it
          existing.skills.push(skillToAdd)
        } else {
          // Skill exists in base. Mark it as new (if not already) and merge templates.
          if (!existsSkill.isNew) existsSkill.isNew = true

          // Ensure templates array exists
          existsSkill.templates = existsSkill.templates || []

          if (Array.isArray(ns.templates)) {
            ns.templates.forEach(nt => {
              // avoid adding duplicate template ids
              if (!nt || !nt.id) return
              const already = existsSkill.templates.find(t => t.id === nt.id)
              if (!already) {
                const tcopy = JSON.parse(JSON.stringify(nt))
                // mark the appended template as new so UI/audit can find it
                tcopy.isNew = true
                existsSkill.templates.push(tcopy)
              }
            })
          }
        }
      })
    } else {
      // Year doesn't exist in base, push entire year object
      const ycopy = JSON.parse(JSON.stringify(newYear))
      ycopy.skills = ycopy.skills.map(s => ({ ...s, isNew: true }))
      merged.years.push(ycopy)
    }
  })
}

function merge() {
  // Apply new curriculum data for Years 6-9 (combined file)
  applyNewData(newDataY6to9)

  // Apply new curriculum data split by year for Years 10-13
  applyNewData(newDataY10)
  applyNewData(newDataY11)
  applyNewData(newDataY12)
  applyNewData(newDataY13)

  // Apply legacy year-specific curriculum files
  applyNewData(year11Data)
  applyNewData(year12Data)
  applyNewData(year13Data)

  // Sort years in ascending order
  merged.years.sort((a, b) => a.year - b.year)

  return merged
}

const curriculumData = merge()
export default curriculumData
