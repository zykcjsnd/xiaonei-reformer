#!/bin/sh -

rm -f ../xiaonei-reformer.sext
zip -r ../xiaonei-reformer.sext `find -type f | grep -Ev ".svn|pack.sh"`
