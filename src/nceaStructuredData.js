import legacyRaw from '../pastpapers/ncea_legacy_papers_structured.json'
import newRaw from '../pastpapers/ncea_new_papers_structured.json'
import newFrom2024 from '../pastpapers/NewFrom2024.json'

// Normalise structured NCEA paper data into a consistent shape
function normalisePaper(entry, system) {
  const paper = entry.paper || {}
  const standard = paper.standard
  const year = paper.year

  // For the revised 2025 91947 paper, use the clean
  // structure from NewFrom2024.json instead of the
  // flattened/misaligned questions in the newRaw JSON.
  let questionSource = paper.questions || []
  if (
    system === 'new' &&
    String(standard) === '91947' &&
    newFrom2024 &&
    newFrom2024.paper &&
    Array.isArray(newFrom2024.paper.questions)
  ) {
    questionSource = newFrom2024.paper.questions
  }

  const questions = []

  ;(questionSource || []).forEach(q => {
    const topic = q.topic || ''
    const number = q.number
    const parts = q.parts || []

    parts.forEach(part => {
      let visualData = part.visual_data || null

      // For the 2025 91947 paper, override visual data to point to the
      // local WEBP resource files instead of broken base64 data.
      if (system === 'new' && String(standard) === '91947') {
        const partLabel = (part.part || '').toString()
        const rawKey = `${number}${partLabel}`.replace(/\s+/g, '')
        // Normalise subparts like '3a(i)' or '3a(ii)' -> '3a'
        const key = rawKey.replace(/\(.+?\)/g, '')
        const knownKeys = ['1c', '2b', '2d', '3a', '3b', '3c']
        if (knownKeys.includes(key)) {
          visualData = {
            type: 'image_resource',
            data: `local:pastpapers/resources/2025/91947/${key}.webp`
          }
        }
      }

      questions.push({
        id: `${entry.id}-Q${number}-${part.part}`,
        number,
        partLabel: part.part,
        marks: part.marks,
        topic,
        text: part.text,
        answer: part.answer,
        visualData
      })
    })
  })

  return {
    id: entry.id,
    system, // 'legacy' | 'new'
    year,
    level: paper.level || 'NCEA Level 1',
    standard,
    title: paper.title,
    credits: paper.credits,
    totalMarks: paper.total_marks,
    duration: paper.duration,
    examUrl: paper.exam_url,
    scheduleUrl: paper.schedule_url,
    resourceUrl: paper.resource_url || null,
    questions
  }
}

export const legacyLevel1Papers = (legacyRaw || []).map(e =>
  normalisePaper(e, 'legacy')
)

export const newSystemLevel1Papers = (newRaw || []).map(e =>
  normalisePaper(e, 'new')
)

// Flatten all Level 1 papers (both systems)
export const allLevel1Papers = [...legacyLevel1Papers, ...newSystemLevel1Papers]

// Build a flat list of trial questions for a given standard (e.g. '91027', '91946')
export function buildNceaTrialQuestionsForStandard(standardNumber) {
  if (!standardNumber) return null
  const std = String(standardNumber)

  const matchingPapers = allLevel1Papers.filter(
    p => String(p.standard) === std
  )

  if (!matchingPapers.length) return null

  // Prefer the most recent year if multiple papers exist for the same standard
  let paper = matchingPapers[0]
  for (const p of matchingPapers) {
    if (typeof p.year === 'number' && typeof paper.year === 'number') {
      if (p.year > paper.year) paper = p
    }
  }

  return {
    paper,
    questions: paper.questions
  }
}
