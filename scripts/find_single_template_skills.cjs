const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'src', 'curriculumDataFull.json');
const data = require(dataPath);
let out = 'Year\tSkill ID\tSkill Name\tTemplateCount\n';

data.years.forEach(y => {
  y.skills.forEach(s => {
    const t = (s.templates || []).length;
    if (t === 1) {
      out += `${y.year}\t${s.id}\t${(s.name || '').replace(/\t/g, ' ')}\t${t}\n`;
    }
  });
});

const outPath = path.join(process.cwd(), 'one_template_topics.txt');
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath);
