import { nceaStandards } from './nceaStandardsIndex.js'

// Import all local exam PDFs under "past ncea papers/<standard>/exams/<standard>-<year>.pdf"
const examModules = import.meta.glob('../past ncea papers/*/exams/*.pdf', { eager: true })

export const nceaExamPdfs = Object.entries(examModules)
  .map(([path, mod]) => {
    const url = mod.default || mod

    // Example path: "../past ncea papers/91028/exams/91028-2014.pdf"
    const match = /past ncea papers\/(\d+)\/exams\/(\d+)-(\d+)\.pdf$/i.exec(path)
    if (!match) return null

    const [, dirStandard, fileStandard, yearStr] = match
    const standard = fileStandard || dirStandard
    const meta = nceaStandards[standard]
    if (!meta) return null

    const year = parseInt(yearStr, 10)
    if (!Number.isFinite(year)) return null

    return {
      standard,
      year,
      url,
      level: meta.level,
      title: meta.title
    }
  })
  .filter(Boolean)

