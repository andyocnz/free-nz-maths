# Template Finder Guide - How to Check What Junior Dev Added

## 🎯 Quick Commands

### **1. Find Templates Missing Phase Tags**
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/curriculumDataNew.json'));
let missing = [];
data.years.forEach(y => y.skills.forEach(s =>
  s.templates.forEach(t => !t.phase && missing.push(t.id))
));
console.log('Missing phase tags: ' + missing.length);
missing.forEach(t => console.log('  ❌ ' + t));
"
```

### **2. Find All Templates with Specific Phase**
```bash
# Show all templates in phase 10.14
node -e "
const fs = require('fs');
const phase = '10.14';
const data = JSON.parse(fs.readFileSync('src/curriculumDataNew.json'));
let found = [];
data.years.forEach(y => y.skills.forEach(s =>
  s.templates.forEach(t => t.phase == phase && found.push(t.id))
));
console.log('Templates in phase ' + phase + ': ' + found.length);
found.forEach(t => console.log('  ✓ ' + t));
"
```

### **3. Find Templates by Year Recently Added**
```bash
# Show all Y7 templates with their phase
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/curriculumDataNew.json'));
const year = 'Y7';
let found = [];
data.years.forEach(y => y.skills.forEach(s =>
  s.templates.forEach(t => t.id.startsWith(year) && found.push(t.id + ' (phase: ' + t.phase + ')'))
));
console.log(year + ' templates: ' + found.length);
found.forEach(t => console.log('  ' + t));
"
```

---

## 🔍 Using Git to Find What Was Added

### **See What Commit Added What Templates**
```bash
# Show last 10 commits affecting curriculum
git log --oneline -10 -- src/curriculumDataNew.json
```

### **See Exactly What Templates Changed in a Commit**
```bash
# Replace HASH with commit hash (e.g., 1ea1230)
git show HASH:src/curriculumDataNew.json | grep '"id": "Y'
```

### **Compare Current vs Previous Version**
```bash
# Show what templates were added/removed in last commit
git diff HEAD~1 HEAD src/curriculumDataNew.json | grep '"id":'
```

---

## 📊 Run the Template Checker Script

I created a script that automatically analyzes recent commits:

```bash
# Check last 5 commits for recently added templates
node check_recent_templates.cjs 5

# Check last 20 commits
node check_recent_templates.cjs 20

# Check last 50 commits (comprehensive)
node check_recent_templates.cjs 50
```

**Output shows**:
- ✅ Templates WITH phase tags (grouped by phase)
- ❌ Templates MISSING phase tags
- 📊 Count of templates per phase

---

## 💡 Pro Tips

### **Quick Check: Do All Templates Have Phase Tags?**
```bash
node check_recent_templates.cjs 1
```
If you see `🎉 All templates have phase tags!` → Everything is good!

### **Why Templates Don't Appear on Frontend**

If a template is in `src/curriculumDataNew.json` but you can't see it:

1. ❌ **Missing phase tag** → Use the script above to find it
2. ❌ **Wrong phase format** → Should be number, not string (e.g., `10.1` not `"10.1"`)
3. ❌ **Problematic decimal** → Avoid `10.10` (equals 10.1 in JavaScript)

### **Filter by Status**

Show only templates from specific phase:
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/curriculumDataNew.json'));
const phases = {};
data.years.forEach(y => y.skills.forEach(s =>
  s.templates.forEach(t => {
    const p = t.phase || 'NONE';
    phases[p] = (phases[p] || 0) + 1;
  })
));
console.log('Templates by phase:');
Object.keys(phases).sort().forEach(p => console.log(p + ': ' + phases[p]));
"
```

---

## 📝 Checklist Before Asking Junior Dev to Add More

- [ ] Run `node check_recent_templates.cjs 5`
- [ ] Check if missing phase tags = 0
- [ ] If not, send list to junior dev with `PHASE_TAG_GUIDE.md`
- [ ] Verify phase numbers are valid (10.1, 10.6, 10.7, 10.8, 10.9, 10.11, 10.12)
- [ ] Test on frontend to confirm templates appear

---

## 🚨 Example: Troubleshooting Missing Phase 10.14

You said you can't see "phase 10.14". Here's why:

**There are NO templates with phase 10.14 in the curriculum!**

Valid phases: 8, 10.1, 10.6, 10.7, 10.8, 10.9, 10.11, 10.12

**Solution**:
1. Use one of the valid phases above, OR
2. Ask junior dev to add templates with `"phase": 10.14`
3. Run the script to verify they have the phase tag
4. They'll appear on the frontend once committed!

