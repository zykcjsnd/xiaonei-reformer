#! /bin/sh

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

yui-compressor --nomunge "$INPUT"  > min.js

head -n 29 "$INPUT" > "$OUTPUT"
cat min.js >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
./pack.sh
cd ..

#######################################

FIREFOXOUT=firefox-extension/content/overlay.js
cat firefox-extension/content/snippet-1.js min.js firefox-extension/content/snippet-2.js > "$FIREFOXOUT"
cd firefox-extension
./pack.sh
cd ..
