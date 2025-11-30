import level1_2024_full from '../pastpapers/ncea_2024_level1_full.json'
import level1_2023_full from '../pastpapers/ncea_2023_level1_full.json'
import level1_2021_2022_full from '../pastpapers/ncea_2021-2022_full.json'

// Build year-based overviews for Level 1 (2021–22 old, 2023 pilot, 2024 current)
export const nceaLevel1YearOverviews = []

// 2024 – current standards (91944–91947)
;(function build2024Overview() {
  const root = level1_2024_full?.ncea_level_1_mathematics_2024
  if (!root) return

  const overview = root.overview || {}
  const standards = Array.isArray(root.standards) ? root.standards : []

  nceaLevel1YearOverviews.push({
    yearId: '2024',
    label: '2024 (current standards)',
    note: overview.note,
    type: 'current',
    standards: standards.map(s => ({
      standardNumber: s.standard_number,
      title: s.title,
      credits: s.credits,
      assessmentType: s.assessment_type,
      examAvailable: !!s.exam_available,
      examUrl: s.exam_url,
      scheduleUrl: s.schedule_url
    }))
  })
})()

// 2023 – pilot year for new standards
;(function build2023Overview() {
  const root = level1_2023_full?.ncea_level_1_mathematics_2023_all_papers
  if (!root) return

  const overview = root.overview || {}
  const papers = Array.isArray(root.papers) ? root.papers : []

  nceaLevel1YearOverviews.push({
    yearId: '2023',
    label: '2023 (pilot year)',
    note: overview.note,
    type: 'pilot',
    standards: papers.map(p => ({
      standardNumber: p.standard,
      title: p.title || p.standard,
      credits: p.credits,
      assessmentType: p.assessment_type,
      examAvailable: !!p.exam_url,
      examUrl: p.exam_url,
      scheduleUrl: p.schedule_url
    }))
  })
})()

// 2021–22 – currently repurposed as a legacy 91027 sample paper
;(function buildOldOverview() {
  const paper = level1_2021_2022_full?.paper
  if (!paper) return

  nceaLevel1YearOverviews.push({
    yearId: '2021-22',
    label: '2021–22 (legacy 91027 sample)',
    note:
      'Legacy Level 1 algebra paper (91027). Useful for practice, but based on the old standards that were replaced in 2023–24.',
    type: 'legacy',
    standards: [
      {
        standardNumber: paper.standard,
        title: paper.title,
        credits: paper.credits,
        assessmentType: 'External (legacy)',
        examAvailable: true,
        examUrl: paper.exam_url,
        scheduleUrl: paper.schedule_url
      }
    ]
  })
})()

// Build a flat list of question objects for the legacy 91027 sample paper
export function buildLegacy91027Questions() {
  const paper = level1_2021_2022_full?.paper
  if (!paper || !Array.isArray(paper.questions)) return []

  const questions = []

  paper.questions.forEach(q => {
    const baseTopic = q.topic || paper.title || 'NCEA question'
    const parts = Array.isArray(q.parts) ? q.parts : []
    parts.forEach(part => {
      const partLabel = part.part || ''
      const text = part.text || ''
      const fullLabel =
        partLabel && typeof q.number !== 'undefined'
          ? `Question ${q.number}${partLabel})`
          : typeof q.number !== 'undefined'
          ? `Question ${q.number}`
          : ''

      const questionText = fullLabel ? `${fullLabel}: ${text}` : text

      questions.push({
        id: `NCEA-L1-91027-LEGACY-Q${q.number || ''}${partLabel}`,
        question: questionText,
        answer: part.answer || '',
        topic: baseTopic,
        marks: part.marks,
        paperId: 'NCEA-L1-91027-LEGACY',
        source: 'NCEA'
      })
    })
  })

  return questions
}
