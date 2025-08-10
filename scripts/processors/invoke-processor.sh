#!/bin/bash
PROCESSOR=$1
INPUT=$2
OUTPUT=$3

~/AppData/Roaming/npm/claude -p "You are $PROCESSOR. Process this input: $INPUT. Output to: $OUTPUT" \ -p "You are $PROCESSOR. Process this input: $INPUT. Output to: $OUTPUT" \
  --allowedTools "Read" "Write" "Edit" \
  --output-format json
