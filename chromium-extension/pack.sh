#!/bin/sh -

rm -rf ../pack.zip
zip -r ../pack.zip `find -type f | grep -Ev ".svn|pack.sh"`
