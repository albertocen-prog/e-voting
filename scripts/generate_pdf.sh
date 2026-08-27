#!/usr/bin/env bash
set -euo pipefail

MD_FILE="docs/DEVELOPER_GUIDE.md"
OUT_PDF="docs/DEVELOPER_GUIDE.pdf"

if [ ! -f "$MD_FILE" ]; then
  echo "Error: $MD_FILE not found. Make sure you're in the repository root and the developer guide exists."
  exit 1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc not found. Please install pandoc: https://pandoc.org/installing.html"
  exit 1
fi

# Prefer xelatex for better font handling; warn if not available
if ! command -v xelatex >/dev/null 2>&1; then
  echo "Warning: xelatex not found. Pandoc will try to use default PDF engine; install TeX Live for best results."
fi

echo "Generating PDF from $MD_FILE → $OUT_PDF"

pandoc "$MD_FILE" \
  --from markdown+yaml_metadata_block \
  --output "$OUT_PDF" \
  --pdf-engine=xelatex \
  --table-of-contents \
  --toc-depth=2 \
  --highlight-style=tango \
  -V geometry:margin=1in \
  -V mainfont="DejaVu Serif" \
  -V monofont="DejaVu Sans Mono" \
  -V fontsize=11pt \
  -V title="Student Voting Platform — Developer Guide" \
  -V author="albertocen-prog" \
  -V date="$(date +%F)"

echo "PDF generated: $OUT_PDF"
