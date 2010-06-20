#! /bin/sh

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

VER1=`sed -n '9p' xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VER2=`sed -n '10p' xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VERSION=`echo $VER1 | sed -E 's/[0-9]+$/'$VER2'/'`

TEMPOUT=min.js	

yui-compressor --nomunge "$INPUT"  > "$TEMPOUT"

head -n 29 "$INPUT" > "$OUTPUT"
cat "$TEMPOUT" >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
sed -i -E '3s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/'$VERSION'/' manifest.json
./pack.sh
cd ..

#######################################

head -n 29 "$INPUT" > firefox-extension/content/overlay.js
cat firefox-extension/content/snippet-1.js "$TEMPOUT" firefox-extension/content/snippet-2.js >> firefox-extension/content/overlay.js
cd firefox-extension
sed -i -E '7s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/'$VERSION'/' install.rdf
./pack.sh
cd ..

#######################################

cp "$OUTPUT" safari-extension/"$INPUT"
cd safari-extension
sed -i -E '14s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/'$VERSION'/' Info.plist
sed -i -E '16s/[0-9]+/'$VER2'/' Info.plist
cd ..


#######################################

sed -i -E '15s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/'$VERSION'/' update.plist
sed -i -E '13s/[0-9]+/'$VER2'/' update.plist

rm "$TEMPOUT"
