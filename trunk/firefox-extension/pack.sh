#! /bin/sh -
rm -f ../xiaonei_reformer-fx.xpi
zip -r ../xiaonei_reformer-fx.xpi `find -type f | grep -Ev ".svn|pack.sh|snippet-[12].js"`
