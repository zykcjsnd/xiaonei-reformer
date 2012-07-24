#!/bin/sh -

rm -f ../xiaonei_reformer-sogou.sext
zip -r ../xiaonei_reformer-sogou.sext `find -type f | grep -Ev ".svn|pack.sh"`
