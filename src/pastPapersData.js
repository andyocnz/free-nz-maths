// Normalised NCEA past paper metadata for the NCEA section.
// For now this maps the two sample JSON files in /pastpapers into a simpler shape.

import exam2014Raw from '../pastpapers/ncea_2014_level1_91027_full.json'
import exam2023Raw from '../pastpapers/ncea_2023_level1_91027_full.json'

function mapPaper(raw) {
  const p = raw.paper || raw
  return {
    id: `NCEA-L1-${p.standard}-${p.year}`,
    year: p.year,
    level: p.level,
    standard: p.standard,
    title: p.title,
    credits: p.credits,
    total_marks: p.total_marks,
    duration: p.duration,
    exam_url: p.exam_url,
    schedule_url: p.schedule_url,
    questions: p.questions || []
  }
}

const nceaExams = [
  mapPaper(exam2014Raw),
  mapPaper(exam2023Raw)
]

export default nceaExams

