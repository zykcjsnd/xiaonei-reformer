#!/bin/sh -

rm -rf ../pack
mkdir -p ../pack/image
cp * ../pack
cp image/* ../pack/image
rm ../pack/pack.sh
