#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STAMP="$(date +%F)"
OUT_DIR="${1:-output/ga-weekly/${STAMP}}"

mkdir -p "$OUT_DIR"

GA4_START_DATE="${GA4_START_DATE:-7daysAgo}" \
GA4_END_DATE="${GA4_END_DATE:-yesterday}" \
./scripts/ga-seo-report.sh "$OUT_DIR/summary.md" "$OUT_DIR/raw.json"

echo "Weekly dashboard snapshot written:"
echo "  $OUT_DIR/summary.md"
echo "  $OUT_DIR/raw.json"
