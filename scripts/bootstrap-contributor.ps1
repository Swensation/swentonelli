# ==============================================================================
# Swentonelli Family Dashboard - 1-Click Contributor PC Bootstrapper
# ==============================================================================
# Run from an elevated or standard PowerShell terminal:
# irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
# ==============================================================================

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue
$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "🚀 Welcome to the Swentonelli Dashboard Contributor Setup!" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Preparing this PC for autonomous development with Antigravity...`n"

# 1. Ensure winget is available
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error "winget was not found. Please update App Installer from the Microsoft Store first."
    exit 1
}

# 2. Package manifest to install via winget
$packages = @(
    @{ Name = "Git for Windows"; Id = "Git.Git" },
    @{ Name = "Node.js (LTS)"; Id = "OpenJS.NodeJS.LTS" },
    @{ Name = "GitHub CLI"; Id = "GitHub.cli" },
    @{ Name = "Visual Studio Code"; Id = "Microsoft.VisualStudioCode" },
    @{ Name = "Python 3.12"; Id = "Python.Python.3.12" }
)

Write-Host "📦 Step 1 / 4: Checking and installing core developer toolchain..." -ForegroundColor Cyan
foreach ($pkg in $packages) {
    Write-Host "  • Checking $($pkg.Name) ($($pkg.Id))..." -NoNewline
    $check = winget list --id $pkg.Id --exact 2>$null
    if ($LASTEXITCODE -eq 0 -and $check -match $pkg.Id) {
        Write-Host " [Already Installed] ✅" -ForegroundColor Green
    } else {
        Write-Host " [Installing via winget] ⏳" -ForegroundColor Yellow
        winget install --id $pkg.Id --exact --silent --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  • $($pkg.Name) installed successfully! ✅" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Warning: Winget returned code $LASTEXITCODE for $($pkg.Name). Continuing..." -ForegroundColor DarkYellow
        }
    }
}

# 3. Refresh environment PATH in current PowerShell session & inject known install paths
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$knownPaths = @(
    "C:\Program Files\Git\cmd",
    "C:\Program Files\Git\bin",
    "C:\Program Files\nodejs",
    "C:\Program Files\GitHub CLI",
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin",
    "C:\Program Files\Microsoft VS Code\bin",
    "$env:LOCALAPPDATA\Programs\Python\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python312\Scripts",
    "C:\Program Files\Python312",
    "C:\Program Files\Python312\Scripts",
    "$env:APPDATA\npm"
)
foreach ($p in $knownPaths) {
    if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
        $env:Path = "$p;$env:Path"
    }
}

# 4. Clone or update repository in personal folder
$targetDir = "$HOME\personal\swentonelli"
Write-Host "`n📁 Step 2 / 4: Setting up local repository at $targetDir..." -ForegroundColor Cyan

if (-not (Test-Path "$HOME\personal")) {
    New-Item -ItemType Directory -Path "$HOME\personal" -Force | Out-Null
}

if (-not (Test-Path "$targetDir\.git")) {
    Write-Host "  Cloning Swensation/swentonelli..." -ForegroundColor Yellow
    git clone https://github.com/Swensation/swentonelli.git $targetDir
} else {
    Write-Host "  Repository already cloned. Pulling latest main..." -ForegroundColor Green
    Push-Location $targetDir
    git checkout main
    git pull origin main
    Pop-Location
}

# Create .env.local if not present
if (-not (Test-Path "$targetDir\.env.local") -and (Test-Path "$targetDir\.env.example")) {
    Copy-Item "$targetDir\.env.example" "$targetDir\.env.local"
    Write-Host "  Created initial .env.local from template ✅" -ForegroundColor Green
}

# 5. Install Node dependencies
Write-Host "`n📚 Step 3 / 4: Installing project dependencies (npm install)..." -ForegroundColor Cyan
Push-Location $targetDir
npm install
Pop-Location

# 6. Launch VS Code directly into the project
Write-Host "`n🎉 Step 4 / 4: Launching Visual Studio Code..." -ForegroundColor Green
if (Get-Command code -ErrorAction SilentlyContinue) {
    code $targetDir
} else {
    Write-Host "  VS Code installed. Open VS Code and open folder $targetDir." -ForegroundColor Yellow
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "👉 In VS Code Antigravity chat, paste this single prompt:" -ForegroundColor Yellow
Write-Host '   "Please get Bennett (my son) able to contribute at the same level that Dad is. Configure my git identity, verify my GitHub and Gemini credentials, test my local server, and guide me through any remaining human input."' -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
