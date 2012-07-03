#! /bin/sh -
rm -f ../xiaonei_reformer-mx3.mxaddon
mkdir -p /tmp/xiaonei_reformer-mx3
cp -R `ls | grep -Ev "MxPacker.exe|pack.sh|def.json"` /tmp/xiaonei_reformer-mx3
iconv -t utf16 def.json > /tmp/xiaonei_reformer-mx3/def.json
wine MxPacker.exe 'Z:\\tmp\\xiaonei_reformer-mx3'
mv /tmp/xiaonei_reformer-mx3.mxaddon ../
rm -rf /tmp/xiaonei_reformer-mx3
