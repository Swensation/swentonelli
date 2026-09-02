#!/usr/bin/env bash
# ==============================================================================
# Swentonelli Family Dashboard - 1-Click Contributor Setup (macOS / Linux)
# ==============================================================================
# Run from macOS Terminal or Linux shell:
# curl -fsSL https://raw.githubusercontent.com/Swensation/swentonelli/main/scripts/bootstrap-contributor.sh | bash
# ==============================================================================

set -e

echo "=================================================================="
echo "🚀 Welcome to the Swentonelli Dashboard Contributor Setup!"
echo "=================================================================="
echo "Preparing this computer for autonomous development with Antigravity..."
echo ""

# 1. Check or install Homebrew on macOS if available
if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew not found. Please install Homebrew from https://brew.sh or ensure git and node are installed."
  fi
fi

# 2. Check Git
if ! command -v git &> /dev/null; then
  echo "⚠️ Git is not installed. Installing via package manager..."
  if command -v brew &> /dev/null; then
    brew install git
  elif command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y git
  else
    echo "❌ Please install Git manually from https://git-scm.com"
    exit 1
  fi
fi

# 3. Check Node.js
if ! command -v node &> /dev/null; then
  echo "⚠️ Node.js is not installed. Installing..."
  if command -v brew &> /dev/null; then
    brew install node
  elif command -v apt-get &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "❌ Please install Node.js (LTS) manually from https://nodejs.org"
    exit 1
  fi
fi

# 4. Check GitHub CLI (gh)
if ! command -v gh &> /dev/null; then
  echo "⚠️ GitHub CLI (gh) not found. Installing..."
  if command -v brew &> /dev/null; then
    brew install gh
  elif command -v apt-get &> /dev/null; then
    sudo apt-get install -y gh || true
  fi
fi

# 5. Clone repository into ~/personal/swentonelli
TARGET_DIR="$HOME/personal/swentonelli"
echo ""
echo "📁 Setting up local repository at $TARGET_DIR..."
mkdir -p "$HOME/personal"

if [ ! -d "$TARGET_DIR/.git" ]; then
  echo "  Cloning Swensation/swentonelli..."
  git clone https://github.com/Swensation/swentonelli.git "$TARGET_DIR"
else
  echo "  Repository already cloned. Pulling latest main..."
  cd "$TARGET_DIR"
  git checkout main
  git pull origin main
fi

cd "$TARGET_DIR"

# 6. Create .env.local if not present
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
  cp .env.example .env.local
  echo "  Created initial .env.local from template ✅"
fi

# 7. Install dependencies
echo ""
echo "📚 Installing project dependencies (npm install)..."
npm install

# 8. Launch VS Code
echo ""
echo "🎉 Launching Visual Studio Code..."
if command -v code &> /dev/null; then
  code "$TARGET_DIR"
else
  echo "  VS Code command 'code' not found on PATH. Open VS Code and select folder $TARGET_DIR."
fi

echo ""
echo "=================================================================="
echo "✅ Setup Complete!"
echo "👉 In VS Code Antigravity chat, paste this prompt:"
echo '   "Please get Bennett (my son) able to contribute at the same level that Dad is. Configure my git identity, verify my GitHub and Gemini credentials, test my local server, and guide me through any remaining human input."'
echo "=================================================================="
