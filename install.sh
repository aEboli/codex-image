#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${CODEX_IMAGE_REPO_URL:-https://github.com/aEboli/codex-image.git}"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
SKILL_ROOT="$CODEX_HOME_DIR/skills"
TARGET_DIR="$SKILL_ROOT/codex-image"
TEMP_DIR="$(mktemp -d)"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to install codex-image." >&2
  exit 1
fi

cleanup() {
  rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

echo "Installing codex-image into $TARGET_DIR"
echo "Repository: $REPO_URL"

mkdir -p "$SKILL_ROOT"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR" >/dev/null 2>&1

if [ ! -d "$TEMP_DIR/codex-image" ]; then
  echo "The repository does not contain a codex-image skill folder." >&2
  exit 1
fi

rm -rf "$TARGET_DIR"
cp -R "$TEMP_DIR/codex-image" "$TARGET_DIR"

echo "Installed codex-image."
echo 'Best practice: use $codex-image explicitly in Codex chat.'
