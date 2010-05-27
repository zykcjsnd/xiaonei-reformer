#! /bin/sh

INPUT=exp/exp.user.js
OUTPUT=exp/exp.min.user.js

sed -n '1,29p' "$INPUT" > "$OUTPUT"
yui-compressor --nomunge "$INPUT"  >> "$OUTPUT"

#######################################

cd exp
./pack.sh
cd ..

#######################################

FIREFOXOUT=firefox-extension/content/overlay.js
cp firefox-extension/content/snippet-1.js "$FIREFOXOUT"
cat "$OUTPUT" >> "$FIREFOXOUT"
cat firefox-extension/content/snippet-2.js >> "$FIREFOXOUT"
cd firefox-extension
./pack.sh
cd ..

