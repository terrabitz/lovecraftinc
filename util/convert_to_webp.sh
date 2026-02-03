#!/bin/bash

set -e

INPUT_DIR="media/public"
OUTPUT_DIR="public"
QUALITY=80

mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.png "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg; do
    [ -e "$f" ] || continue
    filename=$(basename "${f%.*}")
    cwebp -q "$QUALITY" "$f" -o "$OUTPUT_DIR/$filename.webp"
    echo "Converted: $f -> $OUTPUT_DIR/$filename.webp"
done