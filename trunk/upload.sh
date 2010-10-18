#!/bin/sh -

if [ -n "$1" ];then
	passwd="$1"
elif [ -f PWD ];then
	read passwd < PWD
else
	echo -n "PWD:"
	read passwd
	test -z "$passwd" && exit 1
fi

VER1L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@version/='`
VER1=`sed -n ${VER1L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`
VER2L=`head -n 20 xiaonei_reformer.user.js | sed -n '/@miniver/='`
VER2=`sed -n ${VER2L}p xiaonei_reformer.user.js | sed -E 's/ +/ /g' | cut -d' ' -f 3`

VERSION=`echo $VER1 | sed -E 's/[0-9]+$/'$VER2'/'`

project="-p xiaonei-reformer -u xnreformer -w $passwd"
type0="-l Featured,OpSys-All,$VER1,$VER2"
type1="-l Featured,OpSys-All,$VERSION"
type2="-l OpSys-All,$VERSION"
type3="-l Deprecated"

./googlecode_upload.py -s "Greasemonkey/Scriptish脚本" $project $type0 xiaonei_reformer.min.user.js
./googlecode_upload.py -s "Firefox扩展" $project $type1 xiaonei_reformer-fx.xpi
./googlecode_upload.py -s "脚本升级" $project $type3 45836.meta.js
./googlecode_upload.py -s "Chrome扩展" $project $type1 xiaonei_reformer.crx
./googlecode_upload.py -s "Safari扩展" $project $type1 xiaonei_reformer.safariextz
./googlecode_upload.py -s "Safari升级" $project $type3 update.plist
./googlecode_upload.py -s "Opera用户脚本" $project $type2 xiaonei_reformer.min.js
./googlecode_upload.py -s "发布日志" $project Release.txt

