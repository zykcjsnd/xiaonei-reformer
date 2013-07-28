#! /bin/bash -

INPUT=xiaonei_reformer.user.js
OUTPUT=xiaonei_reformer.min.user.js

VER1L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@version/='`
VER1=`sed -n ${VER1L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VER2L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@miniver/='`
VER2=`sed -n ${VER2L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`

sed -i "32,100s/^XNR.version=\".*\";$/XNR.version=\"$VER1\";/" $INPUT
sed -i "32,100s/^XNR.miniver=.*;$/XNR.miniver=$VER2;/" $INPUT

sed '/^\/\/\/$/q' "$INPUT" > "$OUTPUT"
uglifyjs "$INPUT" >> "$OUTPUT"

#######################################

cp "$OUTPUT" chromium-extension/"$INPUT"
cd chromium-extension
sed -i '3s/"version": "[^"]*"/"version": "'$VER1'"/' manifest.json
./pack.sh
cd ..

#######################################

cp "$INPUT" firefox-extension/"$INPUT"
cd firefox-extension
sed -i '7s/version>[^<]*</version>'$VER1'</' install.rdf
./pack.sh
cd ..

#######################################

cp "$OUTPUT" sogou-extension/"$INPUT"
cd sogou-extension
sed -i '6s/version>[^<]*</version>'$VER1'</' manifest.xml
./pack.sh
cd ..

#######################################

cp "$OUTPUT" safari-extension/"$INPUT"
cd safari-extension
sed -i '16s/<string>[^<]*</<string>'$VER1'</' Info.plist
sed -i '18s/<string>[^<]*</<string>'$VER2'</' Info.plist
cd ..
sed -i '15s/<string>[^<]*</<string>'$VER1'</' update.plist
sed -i '13s/<string>[^<]*</<string>'$VER2'</' update.plist

#######################################

cp "$OUTPUT" `echo "$OUTPUT" | sed 's/.user.js/.js/'`

#######################################

cp "$OUTPUT" opera-extension/includes/"$INPUT"
cd opera-extension
sed -i '2s/version="[^"]*"/version="'$VER1'"/' config.xml
./pack.sh
cd ..

#######################################

cp "$OUTPUT" mx3-extension/"$INPUT"
cd mx3-extension
sed -i '5s/version": "[^"]*"/version": "'$VER1'"/' def.json
./pack.sh
cd ..

#######################################


