#! /bin/sh -
rm -f ../xnr.xpi
zip -r ../xnr.xpi `find -type f | grep -Ev ".svn|pack.sh|snippet-[12].js"`
