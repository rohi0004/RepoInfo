#!/usr/bin/env bash
set -euo pipefail

# Interactive helper to add GITHUB_TOKEN to .env.local
# This avoids storing the token in shell history and commits.

ENV_FILE="$(pwd)/.env.local"

echo "This script will securely prompt for your GitHub Personal Access Token and write it to: $ENV_FILE"
echo "If the file already exists, the GITHUB_TOKEN entry will be replaced or appended."

read -r -p "Proceed? [y/N]: " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 1
fi

# Prompt silently
read -r -s -p "Paste your GitHub Personal Access Token and press Enter: " TOKEN
echo

if [[ -z "$TOKEN" ]]; then
  echo "No token provided. Aborting." >&2
  exit 1
fi

# Ensure .env.local exists
touch "$ENV_FILE"

# Remove any existing GITHUB_TOKEN lines
grep -v '^GITHUB_TOKEN=' "$ENV_FILE" > "$ENV_FILE.tmp" || true

# Append new token (wrapped in quotes)
printf 'GITHUB_TOKEN="%s"\n' "$TOKEN" >> "$ENV_FILE.tmp"

# Move into place
mv "$ENV_FILE.tmp" "$ENV_FILE"

chmod 600 "$ENV_FILE"

echo ".env.local updated. Restart your dev server (npm run dev) to pick up the token."
