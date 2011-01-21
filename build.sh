#! /bin/bash -

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

VER1L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@version/='`
VER1=`sed -n ${VER1L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VER2L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@miniver/='`
VER2=`sed -n ${VER2L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VERSION=`echo $VER1 | sed -E 's/[0-9]+$/'$VER2'/'`

sed -i "32,100s/^XNR.version=\".*\";$/XNR.version=\"$VER1\";/" $INPUT
sed -i "32,100s/^XNR.miniver=.*;$/XNR.miniver=$VER2;/" $INPUT

sed '/^\/\/\/$/q' "$INPUT" > "$OUTPUT"
yui-compressor --nomunge "$INPUT" >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
sed -i -E '3s/"version": "[^"]*"/"version": "'$VERSION'"/' manifest.json
./pack.sh
cd ..

#######################################

cp "$INPUT" firefox-extension/content/"$INPUT"
cd firefox-extension
sed -i -E '7s/version>[^<]*</version>'$VERSION'</' install.rdf
./pack.sh
cd ..

#######################################

cp "$OUTPUT" safari-extension/"$INPUT"
cd safari-extension
sed -i -E '14s/<string>[^<]*</<string>'$VERSION'</' Info.plist
sed -i -E '16s/<string>[^<]*</<string>'$VER2'</' Info.plist
cd ..

#######################################

cp "$OUTPUT" `echo "$OUTPUT" | sed 's/.user.js/.js/'`

#######################################

cp "$OUTPUT" opera-extension/includes/"$INPUT"
cd opera-extension
sed -i -E '2s/version="[^"]*"/version="'$VERSION'"/' config.xml
./pack.sh
cd ..

#######################################

sed -i -E '15s/<string>[^<]*</<string>'$VERSION'</' update.plist
sed -i -E '13s/<string>[^<]*</<string>'$VER2'</' update.plist

