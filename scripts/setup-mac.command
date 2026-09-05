#!/usr/bin/env bash
# ==============================================================================
# Swentonelli Family Dashboard - 1-Click Mac App Setup (.command)
# Double-click this file on Mac Finder to automatically set up everything!
# ==============================================================================

clear
echo "========================================================"
echo "🌟 Welcome to Swentonelli Family Dashboard Setup (Mac)!"
echo "========================================================"
echo "Sit back and relax — setting up everything automatically..."
echo ""

# 1. Install Apple Command Line Tools (Git) if missing
if ! command -v git &> /dev/null; then
  echo "📦 Installing Apple Developer Tools (Git)..."
  xcode-select --install 2>/dev/null || true
  echo "👉 If a popup appeared asking to install tools, click 'Install' and re-run this file when done."
fi

# 2. Setup Node.js if missing
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js LTS..."
  if command -v brew &> /dev/null; then
    brew install node
  else
    # Quick installer via official pkg
    echo "Downloading official Node.js installer..."
    curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg -o /tmp/node-installer.pkg
    sudo installer -pkg /tmp/node-installer.pkg -target / || true
  fi
fi

# 3. Setup workspace directory
TARGET_DIR="$HOME/personal/swentonelli"
mkdir -p "$HOME/personal"

if [ ! -d "$TARGET_DIR/.git" ]; then
  echo "📁 Downloading project files..."
  git clone https://github.com/Swensation/swentonelli.git "$TARGET_DIR"
else
  echo "📁 Updating project files to latest..."
  cd "$TARGET_DIR"
  git pull origin main
fi

cd "$TARGET_DIR"

if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
  cp .env.example .env.local
fi

echo "📚 Installing project dependencies..."
npm install

echo ""
echo "🎉 Setup Complete!"
if command -v code &> /dev/null; then
  code "$TARGET_DIR"
else
  open -a "Visual Studio Code" "$TARGET_DIR" 2>/dev/null || open "$TARGET_DIR"
fi

echo ""
echo "✅ You're all set! You can close this window."

