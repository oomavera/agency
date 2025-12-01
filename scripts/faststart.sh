#!/usr/bin/env bash
set -euo pipefail

INPUT=${1:-public/CleanVid2.mp4}
OUTPUT=${2:-public/CleanVid2.faststart.mp4}

echo "Rewriting $INPUT with moov atom at front -> $OUTPUT"
ffmpeg -y -i "$INPUT" -c copy -movflags +faststart "$OUTPUT"
echo "Done. Replace your source with $OUTPUT for instant-start."


