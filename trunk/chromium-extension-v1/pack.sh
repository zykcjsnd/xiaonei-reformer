#!/bin/sh -

rm -f ../pack-v1.zip
zip -r ../pack-v1.zip `find -type f | grep -Ev ".svn|pack.sh"`
