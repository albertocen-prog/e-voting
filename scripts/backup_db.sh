#!/usr/bin/env bash
# scripts/backup_db.sh
# Usage: PGHOST=host PGUSER=user PGDATABASE=dbname ./scripts/backup_db.sh /path/to/outdir

set -euo pipefail

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"

TIMESTAMP="$(date +%F_%H%M%S)"
OUTFILE="${OUT_DIR}/e-voting-${TIMESTAMP}.dump"

echo "Creating backup to $OUTFILE"
pg_dump -Fc --no-acl --no-owner -h "${PGHOST:-localhost}" -U "${PGUSER:-postgres}" "${PGDATABASE:-e_voting}" > "$OUTFILE"

echo "Backup complete: $OUTFILE"
