import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = 'https://mathx.nz'

// Load and merge curriculum JSON without relying on bundler JSON imports
function loadCurriculum() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const fullPath = path.resolve(__dirname, '../src/curriculumDataFull.json')
  const newPath = path.resolve(__dirname, '../src/curriculumDataNew.json')

  const baseText = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '')
  const base = JSON.parse(baseText)
  let extra = { years: [] }
  try {
    const extraText = fs.readFileSync(newPath, 'utf8').replace(/^\uFEFF/, '')
    extra = JSON.parse(extraText)
  } catch {
    // ignore if not present
  }

  const merged = JSON.parse(JSON.stringify(base))

  if (!extra || !Array.isArray(extra.years)) return merged

  extra.years.forEach(newYear => {
    const yearNum = newYear.year
    const existing = merged.years.find(y => y.year === yearNum)
    if (existing) {
      newYear.skills.forEach(ns => {
        if (!ns || !ns.id) return
        const existsSkill = existing.skills.find(s => s.id === ns.id)
        const skillToAdd = JSON.parse(JSON.stringify(ns))
        if (!existsSkill) {
          existing.skills.push(skillToAdd)
        } else {
          existsSkill.templates = existsSkill.templates || []
          if (Array.isArray(ns.templates)) {
            ns.templates.forEach(nt => {
              if (!nt || !nt.id) return
              const already = existsSkill.templates.find(t => t.id === nt.id)
              if (!already) {
                existsSkill.templates.push(JSON.parse(JSON.stringify(nt)))
              }
            })
          }
        }
      })
    } else {
      merged.years.push(JSON.parse(JSON.stringify(newYear)))
    }
  })

  return merged
}

function buildUrls() {
  const urls = []

  // Home
  urls.push({ loc: `${BASE_URL}/`, priority: 1.0 })

   // IXL alternative landing
  urls.push({
    loc: `${BASE_URL}/ixl-alternative`,
    priority: 0.7
  })

  const curriculumData = loadCurriculum()

  // One URL per skill/topic
  curriculumData.years.forEach(year => {
    year.skills.forEach(skill => {
      urls.push({
        loc: `${BASE_URL}/topics/${encodeURIComponent(skill.id)}`,
        priority: 0.8
      })
    })
  })

  return urls
}

function buildSitemapXml(urls) {
  const lines = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  )

  const now = new Date().toISOString().split('T')[0]

  urls.forEach(u => {
    lines.push('  <url>')
    lines.push(`    <loc>${u.loc}</loc>`)
    lines.push(`    <lastmod>${now}</lastmod>`)
    if (u.priority) {
      lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
    }
    lines.push('  </url>')
  })

  lines.push('</urlset>')
  return lines.join('\n')
}

const urls = buildUrls()
const xml = buildSitemapXml(urls)

const outPath = path.resolve(process.cwd(), 'sitemap.xml')
fs.writeFileSync(outPath, xml, 'utf8')
console.log(`Generated sitemap.xml with ${urls.length} URLs at ${outPath}`)
