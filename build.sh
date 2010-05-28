#! /bin/sh

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

sed -n '1,29p' "$INPUT" > "$OUTPUT"
yui-compressor --nomunge "$INPUT"  >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
./pack.sh
cd ..

#######################################

FIREFOXOUT=firefox-extension/content/overlay.js
cp firefox-extension/content/snippet-1.js "$FIREFOXOUT"
cat "OUTPUT" >> "$FIREFOXOUT"
cat firefox-extension/content/snippet-2.js >> "$FIREFOXOUT"
cd firefox-extension
./pack.sh
cd ..