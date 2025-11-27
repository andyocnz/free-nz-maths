# free-nz-maths

Small Vite + React project (math practice and puzzles) prepared for GitHub and Vercel deployment.

Getting started

- Install dependencies:

```powershell
npm install
```

- Run development server:

```powershell
npm run dev
```

Preparing and pushing to GitHub

1. If you have the GitHub CLI (`gh`) installed and authenticated, run the provided PowerShell helper to create a repo and push:

```powershell
.
\create_github_repo.ps1 -RepoName free-nz-maths -Visibility public
```

2. Or manually:

```powershell
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/free-nz-maths.git
git branch -M main
git push -u origin main
```

Deploying to Vercel

- Go to https://vercel.com/import and import from GitHub. Vercel will automatically detect a Vite project.
- Build command: `npm run build`
- Output directory: `dist`

Files added to help:

- `.gitignore` — common ignores for Node/Vite projects
- `create_github_repo.ps1` — PowerShell helper using `gh` (if installed)
- `check_repo.ps1` — sanity checks for git status and remotes
- `vercel.json` — optional Vercel configuration

Edit the `repository.url` field in `package.json` to reflect your GitHub repo after creation.
