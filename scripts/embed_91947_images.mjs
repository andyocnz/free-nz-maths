import fs from 'fs'
import path from 'path'

const root = process.cwd()
const jsonPath = path.join(root, 'pastpapers', 'ncea_new_papers_structured.json')
const imagesDir = path.join(root, 'pastpapers', 'resources', '2025', '91947')

const raw = fs.readFileSync(jsonPath, 'utf8')
const data = JSON.parse(raw)

// Map keys like "1c", "2b" to WEBP filenames
const fileMap = {}
for (const file of fs.readdirSync(imagesDir)) {
  if (!file.toLowerCase().endsWith('.webp')) continue
  const key = path.basename(file, '.webp') // e.g. "1c"
  fileMap[key] = `local:pastpapers/resources/2025/91947/${file}`
}

for (const entry of data) {
  const paper = entry.paper
  if (!paper) continue
  if (String(paper.standard) !== '91947') continue

  for (const q of paper.questions || []) {
    const number = q.number
    for (const part of q.parts || []) {
      const partLabel = (part.part || '').toString()
      const key = `${number}${partLabel}`.replace(/\s+/g, '')
      const mapped = fileMap[key]
      if (mapped) {
        part.visual_data = {
          type: 'image_resource',
          data: mapped
        }
      }
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')

console.log('Updated 91947 visual_data to use local WEBP image_resource paths.')

