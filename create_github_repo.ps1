<#
PowerShell helper to create a GitHub repo using `gh` CLI and push the current folder.
Usage: .\create_github_repo.ps1 -RepoName free-nz-maths -Visibility public
Requires: Git, GitHub CLI `gh` (https://cli.github.com/) and that you're authenticated (`gh auth login`).
#>

param(
    [string]$RepoName = (Split-Path -Leaf -Path (Get-Location)),
    [ValidateSet('public','private')]
    [string]$Visibility = 'public',
    [switch]$UseMainBranch
)

Write-Host "Repository: $RepoName, visibility: $Visibility"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "The 'gh' CLI is required. Install from https://cli.github.com/ and run 'gh auth login'."
    exit 1
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "You are not authenticated with GitHub CLI. Run 'gh auth login' first."
    exit 1
}

$owner = gh api user --jq .login
Write-Host "Creating repo under account: $owner"

# Create repository
$createCmd = "gh repo create $owner/$RepoName --$Visibility --confirm"
Write-Host "Running: $createCmd"
gh repo create "$owner/$RepoName" --$Visibility --confirm
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create repo"; exit 1 }

if (-not (Test-Path .git)) {
    git init
    Write-Host "Initialized local git repository."
}

git add -A
git commit -m "Initial commit" 2>$null

if ($UseMainBranch) { git branch -M main } else { git branch -M main }

git remote add origin "https://github.com/$owner/$RepoName.git" 2>$null
git push -u origin main

Write-Host "Repository created and pushed: https://github.com/$owner/$RepoName"
