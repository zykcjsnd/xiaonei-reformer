#! /bin/sh

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

sed -n '1,29p' "$INPUT" > "$OUTPUT"
yui-compressor --nomunge --preserve-semi "$INPUT"  >> "$OUTPUT"

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
./pack.sh
