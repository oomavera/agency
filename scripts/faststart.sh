#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $(basename "$0") <input-video> [output-video]" >&2
  exit 1
fi

INPUT=$1
# Default output keeps the same extension but appends .faststart before it
EXT="${INPUT##*.}"
BASENAME="${INPUT%.*}"
OUTPUT=${2:-"${BASENAME}.faststart.${EXT}"}

echo "Rewriting $INPUT with moov atom at front -> $OUTPUT"
ffmpeg -y -i "$INPUT" -c copy -movflags +faststart "$OUTPUT"
echo "Done. Replace your source with $OUTPUT for instant-start."

