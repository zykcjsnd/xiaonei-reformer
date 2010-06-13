#! /bin/sh

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

TEMPOUT=min.js

yui-compressor --nomunge "$INPUT"  > "$TEMPOUT"

head -n 29 "$INPUT" > "$OUTPUT"
cat "$TEMPOUT" >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
./pack.sh
cd ..

#######################################

head -n 29 "$INPUT" > firefox-extension/content/overlay.js
cat firefox-extension/content/snippet-1.js "$TEMPOUT" firefox-extension/content/snippet-2.js >> firefox-extension/content/overlay.js
cd firefox-extension
./pack.sh
cd ..

#######################################

cp "$OUTPUT" safari-extension/"$INPUT"

#######################################

rm "$TEMPOUT"

