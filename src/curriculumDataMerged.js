import base from './curriculumDataFull.json'
import newData from './curriculumDataNew.json'

// Deep clone base to avoid mutating imported object
const merged = JSON.parse(JSON.stringify(base))

function merge() {
  if (!newData || !Array.isArray(newData.years)) return merged

  newData.years.forEach(newYear => {
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

  return merged
}

const curriculumData = merge()
export default curriculumData
