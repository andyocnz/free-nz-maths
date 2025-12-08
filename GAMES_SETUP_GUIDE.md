# Games & Puzzles Hub - Setup Guide

## ✅ What Has Been Implemented

A fully functional **Games & Puzzles menu** that appears in the **left sidebar** during practice and test sessions. Students can easily access interactive games without leaving the learning app.

### Features:

1. **Automatic Game Discovery** 🤖
   - The system automatically detects all `.html` files in the `/game` folder
   - No configuration needed - just add a file and it appears in the menu
   - Games are displayed with user-friendly names

2. **Sidebar Integration** 📍
   - Games menu appears in the left panel during:
     - Regular practice mode
     - Tests and assessments
     - All learning sessions
   - NOT visible on the main home page (keeps it clean)

3. **Easy Game Addition** ➕
   - Add new games by simply dropping `.html` files in `/game` folder
   - The menu updates automatically
   - Fallback system lists known games if folder browsing fails

## 📁 Current Games

Located in `C:\Users\Andy\free-nz-maths\game\`:

1. **burningrope.html** (🔥 Burning Rope)
   - Logic puzzle: Measure exactly 45 minutes using two 60-minute ropes
   - Interactive with animations and fireworks on success

2. **bridgecrossing.html** (🏮 The Night Bridge)
   - Optimization puzzle: Get 4 people across a bridge in 17 minutes with a lantern
   - Interactive with visual feedback and hints

## 🚀 How to Add More Games

### Step 1: Create Your HTML Game
Create a self-contained HTML file with all CSS and JavaScript included or referenced locally.

**Naming Convention:**
- Use camelCase or hyphens for filenames
- Examples:
  - `towerOfHanoi.html` → displays as "Tower Of Hanoi"
  - `maze-game.html` → displays as "Maze Game"
  - `sudoku.html` → displays as "Sudoku"

### Step 2: Place File in Game Folder
Save your HTML file to: `C:\Users\Andy\free-nz-maths\game\`

Example:
```
C:\Users\Andy\free-nz-maths\game\
├── burningrope.html
├── bridgecrossing.html
├── towerOfHanoi.html        ← NEW GAME
├── README.md
```

### Step 3: Done!
The game automatically appears in the sidebar menu within seconds when students are in practice/test mode.

## 🛠️ Technical Details

### Files Modified:
1. **`src/App.jsx`**
   - Added import for `GamesMenu` component
   - Integrated GamesMenu in two places:
     - NCEA test sidebar (line 4688)
     - Regular practice sidebar (line 4706)

2. **`src/GamesMenu.jsx`** (NEW)
   - React component that discovers and lists games
   - Handles dynamic game loading from `/game` folder
   - Opens games in new tabs when clicked
   - Includes fallback list for known games

### How It Works:
1. When a student enters practice/test mode, the sidebar loads
2. GamesMenu component fetches `/game/` directory
3. Extracts all `.html` files and converts names to readable format
4. Displays buttons for each game
5. Clicking a game opens it in a new tab (keeps app context)

### Key Advantages:
- ✅ Zero-configuration deployment
- ✅ Fallback system if directory browsing fails
- ✅ Games open in new tabs (students can switch back)
- ✅ Responsive design
- ✅ No backend changes needed
- ✅ Scales to unlimited games

## 📋 Game Requirements

Your HTML game should be:
- **Self-contained**: All resources (CSS, JS, images) bundled or referenced with relative paths
- **Responsive**: Should work on mobile and desktop
- **Standalone**: Able to run independently in a new tab
- **No dependencies**: Don't require external CDNs or APIs (unless stable)

### Example Relative Paths:
```html
<!-- ✅ GOOD -->
<img src="./assets/image.png" alt="">
<script src="./lib/helpers.js"></script>

<!-- ❌ BAD - Will break in new tabs -->
<img src="../images/image.png" alt="">
<script src="/absolute/path/script.js"></script>
```

## 🎮 Game Testing

To test your new game:
1. Save HTML file to `/game/` folder
2. Go to your website and start a practice session
3. Look for your game in the left sidebar under "🎮 Games & Puzzles"
4. Click the button - game should open in new tab
5. Test functionality and responsiveness

## 📝 Example: Adding Tower of Hanoi

**File:** `C:\Users\Andy\free-nz-maths\game\towerOfHanoi.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tower of Hanoi</title>
  <style>
    /* Self-contained CSS */
    body { font-family: Arial; }
    /* ... */
  </style>
</head>
<body>
  <!-- Your game HTML -->
  <script>
    // Self-contained JavaScript
    // ... game logic ...
  </script>
</body>
</html>
```

Result: Game appears as **"Tower Of Hanoi"** in the sidebar menu.

## 🔍 Troubleshooting

### Game doesn't appear in menu:
1. Check file is in correct location: `/game/` folder
2. Verify filename ends with `.html`
3. Filename should not be `index.html`
4. Check browser console for errors
5. Try refreshing the page

### Game opens blank:
1. Check all relative paths in HTML are correct
2. Ensure CSS/JS files are in same folder or referenced correctly
3. Check browser console for 404 errors
4. Test HTML file directly in browser first

### Menu loads slowly:
- This is normal if you have many games
- Directory listing may be cached by browser
- Hard refresh (Ctrl+Shift+R) to clear cache

## 📊 Game Menu Visibility

The Games menu appears **ONLY** in these scenarios:
- ✅ During practice mode (after selecting a skill)
- ✅ During test/assessment sessions
- ✅ When sidebar is not collapsed

NOT visible:
- ❌ On main home page
- ❌ When sidebar is collapsed

This keeps the home page clean while making games easily accessible during learning.

## 🚀 Future Enhancements

Potential improvements (if needed):
- Add game descriptions/difficulty labels
- Game filtering by category
- Save game progress to local storage
- Track time spent in games
- Add game ratings/reviews
- Embed games in iframe instead of new tab

## 📞 Support

For issues or questions:
1. Check the `/game/README.md` file
2. Review this setup guide
3. Check browser console for errors
4. Verify file structure and naming

---

**Version:** 1.0
**Date:** December 2025
**Status:** ✅ Production Ready
