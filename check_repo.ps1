<#
Simple sanity-check script to show git status and remotes.
Usage: .\check_repo.ps1
#>

Write-Host "Git status:"
git status --porcelain=v1

Write-Host "\nGit remotes:"
git remote -v
