#! /bin/sh -
rm -f ../xiaonei_reformer-opera.oex
zip -r ../xiaonei_reformer-opera.oex `find -type f | grep -Ev "pack.sh|/\."`
