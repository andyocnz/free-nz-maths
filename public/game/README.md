# Games & Puzzles Hub

This folder contains interactive HTML games and puzzles for students.

## Current Games

- **burningrope.html** - Burning Rope Logic Puzzle (measure 45 minutes with two ropes)
- **bridgecrossing.html** - The Night Bridge (get 4 people across a bridge in 17 minutes)

## How to Add More Games

Adding new games is **very easy**:

1. **Create your HTML game file** - Build a self-contained HTML file with everything (CSS, JavaScript, images) included or referenced locally
2. **Place it in this `/game` folder** - Just save your `.html` file in this directory
3. **Done!** - The game will automatically appear in the Games & Puzzles menu in the sidebar when students are practicing

The system **automatically discovers** all `.html` files in this folder and displays them in the left sidebar menu during practice/test sessions.

### Requirements for HTML Games:

- File should be a self-contained `.html` file
- Use relative paths for any assets (`./assets/image.png`)
- Responsive design is recommended (works well on mobile)
- Title should be descriptive (used to generate menu name)

### Naming Convention:

Use descriptive filenames in camelCase or with hyphens:
- ✅ `burningrope.html` → displays as "Burning Rope"
- ✅ `bridge-crossing.html` → displays as "Bridge Crossing"
- ✅ `towerOfHanoi.html` → displays as "Tower Of Hanoi"

The system automatically converts filenames to readable titles.

### Example:

To add a Tower of Hanoi game:
1. Create `towerOfHanoi.html` with your game code
2. Place it in this `/game` folder
3. Students will see "Tower Of Hanoi" in their games menu within seconds

## Location in App

Games appear in the **left sidebar** during:
- Regular practice mode
- Tests and assessments
- All learning sessions

Games are **NOT visible** on the main home page to keep it clean and focused.
