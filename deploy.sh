#!/bin/bash

# ============================================================
# Riftbound Overlay — Deploy Helper
# Usage:
#   ./deploy.sh "your commit message"
#   ./deploy.sh  (uses a default message)
# ============================================================

MESSAGE=${1:-"Update overlays"}

echo ""
echo "🟡 Riftbound Deploy"
echo "─────────────────────────────"

# Check we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ No git repo found. Run this first:"
    echo ""
    echo "   git init"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git branch -M main"
    echo ""
    exit 1
fi

# Stage everything
git add .

# Check if there's anything to commit
if git diff --cached --quiet; then
    echo "✅ Nothing to commit — already up to date."
    exit 0
fi

# Commit and push
git commit -m "$MESSAGE"
git push origin main

echo ""
echo "✅ Pushed to GitHub — Railway is deploying now."
echo "   Check your Railway dashboard for live status."
echo ""
