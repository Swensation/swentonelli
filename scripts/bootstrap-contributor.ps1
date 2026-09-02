# ==============================================================================
# Swentonelli Family Dashboard - 1-Click Contributor PC Bootstrapper (Verbose)
# ==============================================================================
# Run from PowerShell or Terminal:
# irm https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.ps1 | iex
# ==============================================================================

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue
$ErrorActionPreference = "Continue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "🚀 Swentonelli Dashboard Contributor Setup (Verbose Mode)" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "User Profile : $HOME" -ForegroundColor Gray
Write-Host "PowerShell   : $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "Date/Time    : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

# ------------------------------------------------------------------------------
# 0. Helper: Refresh PATH from Registry & Inject Known Locations
# ------------------------------------------------------------------------------
function Update-SessionPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = "$machinePath;$userPath"

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
}

Update-SessionPath

# ------------------------------------------------------------------------------
# 1. Verify winget availability
# ------------------------------------------------------------------------------
Write-Host "🔍 Verifying Windows Package Manager (winget)..." -ForegroundColor Cyan
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: 'winget' command is not available on this system." -ForegroundColor Red
    Write-Host "👉 Please install/update 'App Installer' from the Microsoft Store, or download it from:" -ForegroundColor Yellow
    Write-Host "   https://github.com/microsoft/winget-cli/releases/latest" -ForegroundColor White
    exit 1
} else {
    Write-Host "  ✅ winget is available." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 2. Package Manifest Definition
# ------------------------------------------------------------------------------
$packages = @(
    @{ Name = "Git for Windows";      Id = "Git.Git";                    Cmd = "git";    VerArgs = "--version" },
    @{ Name = "Node.js (LTS)";         Id = "OpenJS.NodeJS.LTS";          Cmd = "node";   VerArgs = "--version" },
    @{ Name = "GitHub CLI";            Id = "GitHub.cli";                 Cmd = "gh";     VerArgs = "--version" },
    @{ Name = "Visual Studio Code";   Id = "Microsoft.VisualStudioCode"; Cmd = "code";   VerArgs = "--version" },
    @{ Name = "Python 3.12";           Id = "Python.Python.3.12";         Cmd = "python"; VerArgs = "--version" }
)

# ------------------------------------------------------------------------------
# 3. Step 1 / 4: Toolchain Inspection & Installation
# ------------------------------------------------------------------------------
Write-Host "`n📦 Step 1 / 4: Checking & Installing Developer Toolchain..." -ForegroundColor Cyan
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray

foreach ($pkg in $packages) {
    Update-SessionPath
    Write-Host "`n• Checking $($pkg.Name)..." -ForegroundColor Yellow

    $cmdFound = Get-Command $pkg.Cmd -ErrorAction SilentlyContinue
    if ($cmdFound) {
        try {
            $verOutput = & $pkg.Cmd $pkg.VerArgs 2>$null
            $firstLine = ($verOutput | Select-Object -First 1)
            Write-Host "  ✅ Already installed ($firstLine) at $($cmdFound.Source)" -ForegroundColor Green
        } catch {
            Write-Host "  ✅ Already installed at $($cmdFound.Source)" -ForegroundColor Green
        }
        continue
    }

    Write-Host "  ⏳ Not found in PATH. Initiating winget install for $($pkg.Id)..." -ForegroundColor Cyan
    Write-Host "  [Running: winget install --id $($pkg.Id) --exact --accept-source-agreements --accept-package-agreements --disable-interactivity]" -ForegroundColor DarkGray

    # Run winget with real-time output
    & winget install --id $pkg.Id --exact --accept-source-agreements --accept-package-agreements --disable-interactivity

    $exitCode = $LASTEXITCODE
    Update-SessionPath

    if ($exitCode -eq 0) {
        Write-Host "  ✅ $($pkg.Name) installed successfully!" -ForegroundColor Green
    } elseif ($exitCode -eq -1978335189) { # 0x8A15002B: Already installed
        Write-Host "  ✅ $($pkg.Name) is already installed (verified via winget)." -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Winget completed with exit code $exitCode for $($pkg.Name)." -ForegroundColor DarkYellow
        Write-Host "     If this is a reboot pending notification, setup will continue." -ForegroundColor DarkGray
    }
}

Update-SessionPath

# ------------------------------------------------------------------------------
# 4. Step 2 / 4: Local Repository Setup
# ------------------------------------------------------------------------------
$targetDir = "$HOME\personal\swentonelli"
Write-Host "`n📁 Step 2 / 4: Setting up local repository at $targetDir..." -ForegroundColor Cyan
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray

if (-not (Test-Path "$HOME\personal")) {
    Write-Host "  Creating directory $HOME\personal..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path "$HOME\personal" -Force | Out-Null
}

if (-not (Test-Path "$targetDir\.git")) {
    Write-Host "  Cloning Swensation/swentonelli from GitHub..." -ForegroundColor Yellow
    & git clone https://github.com/Swensation/swentonelli.git $targetDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Failed to clone repository. Please check your internet connection." -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Repository cloned successfully!" -ForegroundColor Green
} else {
    Write-Host "  Repository folder exists. Syncing latest code from main..." -ForegroundColor Green
    Push-Location $targetDir
    & git checkout main
    & git pull origin main
    Pop-Location
}

# Ensure .env.local exists
if (-not (Test-Path "$targetDir\.env.local")) {
    if (Test-Path "$targetDir\.env.example") {
        Copy-Item "$targetDir\.env.example" "$targetDir\.env.local"
        Write-Host "  ✅ Created local configuration: .env.local (from template)" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️ No .env.example found; skipping initial .env.local" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✅ .env.local already exists." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 5. Step 3 / 4: Node Dependencies Installation (npm install)
# ------------------------------------------------------------------------------
Write-Host "`n📚 Step 3 / 4: Installing Project Dependencies (npm install)..." -ForegroundColor Cyan
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray
Push-Location $targetDir
Write-Host "  Working Directory: $targetDir" -ForegroundColor Gray
Write-Host "  Running 'npm install'..." -ForegroundColor Yellow

& npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ 'npm install' returned exit code $LASTEXITCODE. You can re-run npm install inside VS Code." -ForegroundColor DarkYellow
}
Pop-Location

# ------------------------------------------------------------------------------
# 6. Step 4 / 4: Visual Studio Code Launch & Final Handoff
# ------------------------------------------------------------------------------
Write-Host "`n🎉 Step 4 / 4: Launching Visual Studio Code..." -ForegroundColor Green
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray

Update-SessionPath
$codeCmd = Get-Command code -ErrorAction SilentlyContinue
if ($codeCmd) {
    Write-Host "  Opening project in VS Code: $targetDir" -ForegroundColor Cyan
    & code $targetDir
} else {
    Write-Host "  ℹ️ VS Code binary not yet in current session PATH." -ForegroundColor Yellow
    Write-Host "  Please open Visual Studio Code manually and choose: File -> Open Folder -> $targetDir" -ForegroundColor White
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "🏆 BOOTSTRAP COMPLETE!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "`n👉 NEXT STEP: Inside VS Code, open Antigravity chat and paste this prompt:`n" -ForegroundColor Yellow

Write-Host '   "Please help Bennett (my son) sign up for GitHub and get able to contribute at the same level that Dad is. Configure my git identity, authenticate GitHub via gh auth login, verify my .env.local Gemini credentials, run npm test, and launch the local server."' -ForegroundColor White

Write-Host "`n==================================================================" -ForegroundColor Cyan
