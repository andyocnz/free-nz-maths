# Guide: Updating HintModal & KnowledgeModal

## Quick Answer
**Can a developer just change those 2 files and it works?**

⚠️ **NOT QUITE.** There are 3 files involved, not 2. But the good news: **it's simple** if you follow this guide.

---

## The 3-File System

### 1. **HintModal.jsx** (Component)
**Location**: `src/HintModal.jsx`
**Purpose**: Displays hints when students click "Hint" button
**Props it accepts**:
- `isOpen` (bool) - Whether modal is visible
- `onClose` (function) - Callback to close modal
- `title` (string) - Hint title (e.g., "Hint: Pythagorean Theorem")
- `message` (string) - Plain text hint content
- `htmlContent` (string) - HTML/SVG rich content (if richer formatting needed)

**Key Detail**: Has two display paths:
- If `htmlContent` is provided → displays as raw HTML (for SVG diagrams, formatted text)
- Otherwise → displays `message` as plain text with `whitespace-pre-wrap` preserved

### 2. **KnowledgeModal.jsx** (Component)
**Location**: `src/KnowledgeModal.jsx`
**Purpose**: Displays concept summaries when students click "Remind me the knowledge"
**Props it accepts**:
- `isOpen` (bool) - Whether modal is visible
- `onClose` (function) - Callback to close modal
- `snippet` (object) - Knowledge data with structure (see below)

**Expected snippet structure**:
```javascript
{
  title: "Pythagorean Theorem",
  summary: "In a right triangle, a² + b² = c²",
  key_formulas: ["a² + b² = c²", "c = √(a² + b²)"],
  example: "If a=3 and b=4, then c=5",
  common_misconceptions: [
    "Only works for right triangles",
    "Must label correctly: c is always the hypotenuse"
  ]
}
```

### 3. **knowledgeSnippets.json** (Data)
**Location**: `src/knowledgeSnippets.json`
**Purpose**: Database of all knowledge content by skill ID
**Structure**: JavaScript object where keys = skill IDs (e.g., "Y9.G.PYTHAGORAS")

**Example entry**:
```json
{
  "Y9.G.PYTHAGORAS": {
    "title": "Pythagorean Theorem",
    "summary": "In a right triangle...",
    "key_formulas": [...],
    "example": "...",
    "common_misconceptions": [...]
  }
}
```

---

## What a Developer Needs to Know

### ✅ Safe Changes
A developer can freely update:
1. **HintModal.jsx** - Just UI styling/layout changes (colors, spacing, animations)
2. **KnowledgeModal.jsx** - Just UI styling/layout changes
3. **knowledgeSnippets.json** - Content updates (text, formulas, examples)

### ⚠️ Things to Check Before Deploying

#### If Updating HintModal.jsx:
1. **Don't change prop names** - The component receives `isOpen`, `onClose`, `title`, `message`, `htmlContent`. Don't rename these.
2. **Don't change the `dangerouslySetInnerHTML` logic** - It's needed for SVG diagrams
3. **Safe to change**: Button colors, padding, max-height, fonts, animations
4. **Test**:
   - Click hint button and verify modal opens/closes
   - Test with plain text hint (uses `message` path)
   - Test with diagram hint if any (uses `htmlContent` path)

#### If Updating KnowledgeModal.jsx:
1. **Don't change the `snippet` prop structure** - Must always expect the 5 fields:
   - `title`
   - `summary`
   - `key_formulas` (array)
   - `example`
   - `common_misconceptions` (array)
2. **Render logic is defensive** - Uses `&&` checks like `{key_formulas && key_formulas.length > 0 && (...)}`
   - This means it's OK if a snippet doesn't have all fields - the modal won't crash
3. **Safe to change**: Button colors, padding, fonts, layout, animations
4. **Test**:
   - Click "Remind me the knowledge" button
   - Verify all 5 sections display correctly
   - Test with a snippet missing one field (should still render without crash)

#### If Updating knowledgeSnippets.json:
1. **Don't rename skill IDs** - Keys must match exactly what's in the curriculum (e.g., "Y9.G.PYTHAGORAS")
2. **Don't change the object structure** - Must always have these 5 keys:
   ```json
   {
     "SKILL_ID": {
       "title": "...",
       "summary": "...",
       "key_formulas": [],
       "example": "...",
       "common_misconceptions": []
     }
   }
   ```
3. **Safe to change**: Text content, formulas, examples, misconceptions
4. **Valid to omit**: Can omit fields entirely - modal handles missing fields gracefully
5. **Test**:
   ```bash
   # Validate JSON syntax
   Get-Content src/knowledgeSnippets.json | ConvertFrom-Json | Out-Null
   # If this runs without error, JSON is valid
   ```

---

## Common Integration Points

### How Are These Used?
The modals are called from **question display components**. Look for this pattern:

```jsx
// In App.jsx or a child component
const [hintModalOpen, setHintModalOpen] = useState(false)
const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false)

// When user clicks "Hint" button:
setHintModalOpen(true)

// When user clicks "Remind me" button:
const snippet = knowledgeSnippets["Y9.G.PYTHAGORAS"]
setKnowledgeModalOpen(true)
```

### Where Are the Hints Defined?
**Hints are stored in the template's `hint` field** in curriculum JSON:

```json
{
  "id": "Y9.G.PYTHAGORAS.T1",
  "stem": "A right triangle has legs 3 and 4. Find the hypotenuse.",
  "hint": "Use the formula a² + b² = c²",
  "htmlHint": "<svg>...</svg>",  // Optional: SVG diagram
  ...
}
```

---

## Testing Checklist Before Deploying

### For HintModal Changes:
- [ ] Hint displays correctly with plain text
- [ ] Hint displays correctly with HTML/SVG content
- [ ] Close button works (both the "Got it" button)
- [ ] Modal dismisses when clicking outside
- [ ] No console errors in browser DevTools

### For KnowledgeModal Changes:
- [ ] Knowledge modal displays all 5 sections
- [ ] Scrolling works for long content
- [ ] Missing fields don't cause crashes
- [ ] Close button works (top-right × and "Close" button)
- [ ] No console errors in browser DevTools

### For knowledgeSnippets.json Changes:
- [ ] JSON is valid: `Get-Content src/knowledgeSnippets.json | ConvertFrom-Json | Out-Null`
- [ ] All skill IDs match curriculum skills
- [ ] Knowledge displays when clicking "Remind me" button for that skill
- [ ] Text content renders without markdown issues

---

## Example: Adding a New Knowledge Snippet

**Scenario**: You want to add knowledge for a new skill "Y10.A.QUADRATICS"

### Step 1: Add to knowledgeSnippets.json
```json
{
  "Y10.A.QUADRATICS": {
    "title": "Quadratic Equations",
    "summary": "Equations of the form ax² + bx + c = 0 where a ≠ 0.",
    "key_formulas": [
      "Standard form: ax² + bx + c = 0",
      "Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a",
      "Discriminant: Δ = b² - 4ac"
    ],
    "example": "For x² - 5x + 6 = 0: (x-2)(x-3) = 0, so x = 2 or x = 3",
    "common_misconceptions": [
      "Thinking all quadratics can be easily factored",
      "Forgetting the ± in the quadratic formula",
      "Not checking if discriminant is negative (no real solutions)"
    ]
  }
}
```

### Step 2: Test
```bash
# Validate JSON
Get-Content src/knowledgeSnippets.json | ConvertFrom-Json | Out-Null

# Run dev server
npm run dev

# Go to Y10 Quadratics and click "Remind me the knowledge"
```

### Step 3: Done!
No changes needed to HintModal or KnowledgeModal components.

---

## Red Flags 🚨

**Don't do these:**

1. **Rename prop names in the components**
   ```javascript
   // ❌ WRONG
   export default function HintModal({ hint, close, ... })

   // ✅ RIGHT - Keep original prop names
   export default function HintModal({ isOpen, onClose, title, ... })
   ```

2. **Change snippet structure in JSON**
   ```json
   // ❌ WRONG
   {
     "Y9.G.PYTHAGORAS": {
       "name": "...",  // Should be "title"
       "content": "..."  // Should be "summary"
     }
   }

   // ✅ RIGHT
   {
     "Y9.G.PYTHAGORAS": {
       "title": "...",
       "summary": "...",
       "key_formulas": [],
       "example": "...",
       "common_misconceptions": []
     }
   }
   ```

3. **Remove the defensive checks in KnowledgeModal**
   ```javascript
   // ❌ WRONG - Will crash if snippet missing key_formulas
   {key_formulas.map(...)}

   // ✅ RIGHT - Safe because of && check
   {key_formulas && key_formulas.length > 0 && key_formulas.map(...)}
   ```

---

## Summary for Developer

**TL;DR:**

| Action | Safe? | Files Affected | Testing |
|--------|-------|----------------|---------|
| Change hint text | ✅ Yes | `knowledgeSnippets.json` only | Run dev server, click "Remind me" |
| Change hint modal colors/layout | ✅ Yes | `HintModal.jsx` only | Click "Hint" button |
| Change knowledge modal colors/layout | ✅ Yes | `KnowledgeModal.jsx` only | Click "Remind me" button |
| Add new knowledge for a skill | ✅ Yes | `knowledgeSnippets.json` only | Validate JSON, test in UI |
| Rename props | ❌ No | Breaks everything | Will crash the app |
| Change snippet object structure | ❌ No | Breaks integration | Knowledge modal will fail |

**Most common task**: Updating `knowledgeSnippets.json` with better explanations and examples. This is 100% safe and doesn't touch the components.

