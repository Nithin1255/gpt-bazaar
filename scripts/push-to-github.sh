#!/usr/bin/env bash
set -euo pipefail

# Pushes the three standalone GPT Bazaar folders (web, backend, mobile) to GitHub.
# Usage:
#   ./scripts/push-to-github.sh <github-username-or-org> [public|private]
# Example:
#   ./scripts/push-to-github.sh myusername private

OWNER="${1:-}"
VISIBILITY="${2:-private}"

if [ -z "$OWNER" ]; then
  echo "Usage: $0 <github-username-or-org> [public|private]"
  exit 1
fi

if [ "$VISIBILITY" != "public" ] && [ "$VISIBILITY" != "private" ]; then
  echo "Visibility must be 'public' or 'private'."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REPOS=(
  "gpt-bazaar/web:gpt-bazaar-web:GPT Bazaar Admin Operations Console (Next.js)"
  "gpt-bazaar/backend:gpt-bazaar-backend:GPT Bazaar Instant Grocery Backend API (Python FastAPI)"
  "gpt-bazaar/mobile:gpt-bazaar-mobile:GPT Bazaar Customer Mobile App (React Native / Expo)"
)

HAS_GH=false
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  HAS_GH=true
fi

for ENTRY in "${REPOS[@]}"; do
  IFS=":" read -r DIR REPO_NAME DESCRIPTION <<< "$ENTRY"
  TARGET="$ROOT_DIR/$DIR"

  echo ""
  echo "==> Preparing $DIR -> https://github.com/$OWNER/$REPO_NAME"
  cd "$TARGET"

  if [ ! -d ".git" ]; then
    git init -b main
  else
    git branch -M main
  fi

  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "chore: update standalone repository for $REPO_NAME"
  fi

  REMOTE_URL="https://github.com/$OWNER/$REPO_NAME.git"

  if [ "$HAS_GH" = true ]; then
    if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
      git remote set-url origin "$REMOTE_URL" 2>/dev/null || git remote add origin "$REMOTE_URL"
      git push -u origin main
    else
      gh repo create "$OWNER/$REPO_NAME" "--$VISIBILITY" --description "$DESCRIPTION" --source=. --remote=origin --push
    fi
  else
    git remote set-url origin "$REMOTE_URL" 2>/dev/null || git remote add origin "$REMOTE_URL"
    echo "GitHub CLI (gh) not authenticated. Make sure '$OWNER/$REPO_NAME' exists on GitHub, then pushing..."
    git push -u origin main
  fi
done

echo ""
echo "All 3 GPT Bazaar repositories (web, backend, mobile) pushed to https://github.com/$OWNER"
