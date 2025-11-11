# MyCanteen - Quick Deploy to Vercel

Write-Host "🚀 MyCanteen Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
}

# Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "📝 Uncommitted changes found. Committing..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update for deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $commitMsg
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
$remoteName = git remote
if (-not $remoteName) {
    Write-Host "⚠️  No remote repository configured." -ForegroundColor Yellow
    Write-Host "Please add your GitHub repository as remote:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/anandaa-arch/MyCanteen.git" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    exit 1
}

git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Code is ready for Vercel deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign in with GitHub" -ForegroundColor White
Write-Host "3. Import your repository: anandaa-arch/MyCanteen" -ForegroundColor White
Write-Host "4. Add environment variables from .env.local" -ForegroundColor White
Write-Host "5. Click Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
