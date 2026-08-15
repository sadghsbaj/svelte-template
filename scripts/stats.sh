#!/usr/bin/env bash

# ==============================================================================
# Svelte 5 Opinionated Template - Codebase Statistics Generator
# ==============================================================================
# This script analyzes the project codebase and generates detailed statistics in
# dist/analysis/codebase_stats.txt.
#
# Excludes: node_modules, dist, .git, .vitest-attachments, previews/
# Includes: src/ (excl. previews), root configs, plugins/, scripts/, eslint/, etc.
# Differentiates production code lines from unit/integration test code lines.
# ==============================================================================

set -euo pipefail

# --- Configuration & Paths ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist/analysis"

# UI Colors for terminal output
RED='\033[1;31m'
GREEN='\033[1;32m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# --- Pre-flight Checks ---
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 is required to run this statistics script."
    exit 1
fi

mkdir -p "$DIST_DIR"

log_info "Analyzing project codebase at: $PROJECT_ROOT"

# --- Execute Statistics Analysis ---
python3 - "$PROJECT_ROOT" "$DIST_DIR" << 'EOF'
import os
import sys

project_root = sys.argv[1]
dist_dir = sys.argv[2]

exclude_dirs = {
    'node_modules', 'dist', '.git', '.vitest-attachments', 
    '.svelte-kit', '.output', 'coverage', '.cache'
}

stats_by_ext = {}
stats_by_dir = {}

total_files = 0
total_lines_all = 0
total_prod_code_all = 0
total_test_code_all = 0
total_comment_all = 0
total_blank_all = 0

def get_directory_group(rel_path):
    parts = rel_path.split(os.sep)
    if len(parts) == 1:
        return 'Root Files'
    top = parts[0]
    if top == 'src':
        if len(parts) > 1 and parts[1] == 'lib':
            if len(parts) > 2:
                return f"src/lib/{parts[2]}"
            return 'src/lib'
        return 'src'
    return top

def analyze_file(filepath):
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filepath)[1].lower()
    is_test_file = False

    # Differentiate test files from regular files (.test.ts, .spec.ts, .test.js, .spec.js)
    if filename.endswith('.test.ts') or filename.endswith('.spec.ts'):
        ext = '.test.ts'
        is_test_file = True
    elif filename.endswith('.test.js') or filename.endswith('.spec.js'):
        ext = '.test.js'
        is_test_file = True
    # Dotfiles without extension (e.g. .gitignore, .prettierrc)
    elif filename.startswith('.') and not ext:
        ext = filename

    # Binary and asset extensions
    if ext in ['.png', '.woff2', '.woff', '.ttf', '.eot', '.ico', '.jpg', '.jpeg', '.gif', '.svg']:
        return ext, is_test_file, True, 1, 0, 0, 0, 0, 0, 0

    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
    except Exception:
        return ext, is_test_file, True, 1, 0, 0, 0, 0, 0, 0

    total_lines = len(lines)
    blank_lines = 0
    comment_lines = 0
    code_lines = 0

    in_block_comment = False
    block_type = None # 'js' or 'html'

    for line in lines:
        stripped = line.strip()
        if not stripped:
            blank_lines += 1
            continue

        # Handle active multi-line block comments
        if in_block_comment:
            comment_lines += 1
            if block_type == 'js' and '*/' in stripped:
                in_block_comment = False
            elif block_type == 'html' and '-->' in stripped:
                in_block_comment = False
            continue

        # JS / CSS block comments start
        if ext in ['.ts', '.test.ts', '.js', '.test.js', '.css', '.svelte'] and stripped.startswith('/*'):
            comment_lines += 1
            if '*/' not in stripped[2:]:
                in_block_comment = True
                block_type = 'js'
            continue

        # HTML / Svelte block comments start
        if ext in ['.html', '.svelte', '.md'] and stripped.startswith('<!--'):
            comment_lines += 1
            if '-->' not in stripped[4:]:
                in_block_comment = True
                block_type = 'html'
            continue

        # Single line comments
        if ext in ['.ts', '.test.ts', '.js', '.test.js', '.svelte'] and stripped.startswith('//'):
            comment_lines += 1
            continue

        if ext in ['.sh', '.gitignore', '.prettierignore', '.dockerignore'] and stripped.startswith('#') and not stripped.startswith('#!'):
            comment_lines += 1
            continue

        code_lines += 1

    prod_code = 0 if is_test_file else code_lines
    test_code = code_lines if is_test_file else 0

    return ext, is_test_file, False, 1, total_lines, code_lines, prod_code, test_code, comment_lines, blank_lines

# Scan project tree
for root, dirs, files in os.walk(project_root):
    # Exclude directories
    dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.endswith('previews') and d != 'previews']
    
    rel_root = os.path.relpath(root, project_root)
    if rel_root == '.':
        rel_root = ''
        
    # Extra check for any previews subfolder
    if any(part == 'previews' or part.endswith('previews') for part in rel_root.split(os.sep) if part):
        continue
    
    for f in files:
        if rel_root:
            rel_path = os.path.normpath(os.path.join(rel_root, f))
        else:
            rel_path = f
            
        # Ignore root hidden system directories/files that are not explicitly root config
        if rel_path.startswith('.'):
            if rel_path.count(os.sep) > 0 and not rel_path.startswith('.gitignore'):
                continue
                
        ext, is_test_file, is_binary, f_count, t_lines, c_lines, prod_c, test_c, cm_lines, b_lines = analyze_file(os.path.join(project_root, rel_path))
        
        # Group stats by file type
        if ext not in stats_by_ext:
            stats_by_ext[ext] = {'files': 0, 'lines': 0, 'code': 0, 'comment': 0, 'blank': 0, 'is_binary': is_binary}
        stats_by_ext[ext]['files'] += f_count
        stats_by_ext[ext]['lines'] += t_lines
        stats_by_ext[ext]['code'] += c_lines
        stats_by_ext[ext]['comment'] += cm_lines
        stats_by_ext[ext]['blank'] += b_lines

        # Group stats by directory
        dir_group = get_directory_group(rel_path)
        if dir_group not in stats_by_dir:
            stats_by_dir[dir_group] = {'files': 0, 'lines': 0, 'prod_code': 0, 'test_code': 0}
        stats_by_dir[dir_group]['files'] += f_count
        stats_by_dir[dir_group]['lines'] += t_lines
        stats_by_dir[dir_group]['prod_code'] += prod_c
        stats_by_dir[dir_group]['test_code'] += test_c

        total_files += f_count
        total_lines_all += t_lines
        total_prod_code_all += prod_c
        total_test_code_all += test_c
        total_comment_all += cm_lines
        total_blank_all += b_lines

total_code_all = total_prod_code_all + total_test_code_all

# --- Generate Plain Text Output ---
txt_lines = []
txt_lines.append("==========================================================================")
txt_lines.append("                     PROJECT CODEBASE STATISTICS                          ")
txt_lines.append("==========================================================================")
txt_lines.append(f"Total Files Analyzed : {total_files}")
txt_lines.append(f"Total Lines Overall  : {total_lines_all}")
txt_lines.append(f"Prod Code Lines      : {total_prod_code_all}")
txt_lines.append(f"Test Code Lines      : {total_test_code_all}")
txt_lines.append(f"Total Pure Code      : {total_code_all}  (Prod + Test, excl. comments & blanks)")
txt_lines.append(f"Comment Lines        : {total_comment_all}")
txt_lines.append(f"Blank / Empty Lines  : {total_blank_all}")
txt_lines.append("--------------------------------------------------------------------------")
txt_lines.append("NOTE: Test files (*.test.ts / *.test.js) are explicitly tracked separately")
txt_lines.append("      both in the file type breakdown and in the directory breakdown.")
txt_lines.append("--------------------------------------------------------------------------")
txt_lines.append("")
txt_lines.append("FILE TYPE BREAKDOWN:")
txt_lines.append(f"{'Extension':<16} | {'Files':<6} | {'Total Lines':<11} | {'Code Lines':<10} | {'Comments':<9} | {'Blanks':<7}")
txt_lines.append("-" * 72)

sorted_exts = sorted(stats_by_ext.items(), key=lambda x: x[1]['lines'], reverse=True)
for ext, s in sorted_exts:
    txt_lines.append(f"{ext:<16} | {s['files']:<6} | {s['lines']:<11} | {s['code']:<10} | {s['comment']:<9} | {s['blank']:<7}")

txt_lines.append("")
txt_lines.append("DIRECTORY BREAKDOWN:")
txt_lines.append(f"{'Directory Group':<30} | {'Files':<6} | {'Total Lines':<11} | {'Prod Code':<10} | {'Test Code':<9}")
txt_lines.append("-" * 74)
sorted_dirs = sorted(stats_by_dir.items(), key=lambda x: x[1]['lines'], reverse=True)
for dgroup, s in sorted_dirs:
    txt_lines.append(f"{dgroup:<30} | {s['files']:<6} | {s['lines']:<11} | {s['prod_code']:<10} | {s['test_code']:<9}")

txt_lines.append("==========================================================================")
txt_output = "\n".join(txt_lines)

# Write codebase_stats.txt
txt_filepath = os.path.join(dist_dir, "codebase_stats.txt")
with open(txt_filepath, "w", encoding="utf-8") as f:
    f.write(txt_output + "\n")

print(txt_output)
EOF

log_success "Project codebase statistics successfully generated in:"
log_info " - $DIST_DIR/codebase_stats.txt"
