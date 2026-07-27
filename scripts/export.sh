#!/usr/bin/env bash

# ==============================================================================
# Svelte 5 Opinionated Template Exporter
# ==============================================================================
# This script securely and atomically exports the current development environment
# to the dotfiles template directory, stripping out development/preview logic.
# ==============================================================================

# Strict mode: Exit on error, undefined variables, and pipe failures
set -euo pipefail

# --- Configuration ---
# Automatically resolve the project root (one level up from the scripts folder)
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
TARGET_DIR="$HOME/dotfiles/templates/svelte5-opinionated"

# --- UI / Logging Helpers ---
RED='\033[1;31m'
GREEN='\033[1;32m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# --- Error Handling & Cleanup ---
# Create a secure temporary directory for atomic operations
TMP_DIR=$(mktemp -d)

# Ensure the temporary directory is deleted when the script exits (success or fail)
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# --- Pre-flight Checks ---
log_info "Starting template export process..."

if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    log_error "Could not find package.json in $PROJECT_ROOT. Run this script from the project."
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    log_error "rsync is required but not installed. Aborting."
    exit 1
fi

# --- Step 1: Sync to Temporary Directory ---
log_info "Copying files to isolated temporary build environment..."

# The --delete flag isn't needed here since TMP_DIR is empty,
# but we exclude all dev-specific or generated files.
rsync -a \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'scripts/export.sh' \
    --exclude 'bun.lock' \
    --exclude 'package-lock.json' \
    --exclude 'pnpm-lock.yaml' \
    --exclude 'yarn.lock' \
    --exclude 'src/lib/previews' \
    "$PROJECT_ROOT/" "$TMP_DIR/" || {
        log_error "Failed to sync files to temporary directory."
        exit 1
    }

# --- Step 2: Strip Template Logic & Clean Files ---
log_info "Cleaning up template files and package.json..."

# 1. package.json bereinigen (Löscht den "export" Befehl aus den "scripts")
if command -v jq &> /dev/null; then
    jq 'del(.scripts.export)' "$TMP_DIR/package.json" > "$TMP_DIR/package.json.tmp" && mv "$TMP_DIR/package.json.tmp" "$TMP_DIR/package.json"
else
    log_info "jq not installed, skipping package.json cleanup. (Install with: sudo dnf install jq)"
fi

# 2. Alle Code-Dateien durchsuchen und Marker entfernen
# Sucht nach den Markern @template-remove-start und @template-remove-end
find "$TMP_DIR" -type f \( -name "*.svelte" -o -name "*.ts" -o -name "*.js" -o -name "*.html" -o -name "*.css" \) | while read -r file; do
    sed -i '/@template-remove-start/,/@template-remove-end/d' "$file"
done


# --- Step 3: Atomic Deploy to Dotfiles ---
log_info "Deploying template to $TARGET_DIR..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Rsync from TMP_DIR to TARGET_DIR with --delete
# (This ensures old files removed in source are also removed in target)
rsync -a --delete "$TMP_DIR/" "$TARGET_DIR/" || {
    log_error "Failed to deploy files to target directory."
    exit 1
}

log_success "Template successfully exported to $TARGET_DIR!"
