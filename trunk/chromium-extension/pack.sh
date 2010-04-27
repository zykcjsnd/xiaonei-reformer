#!/bin/sh -

rm -rf ../pack ../pack.zip
mkdir -p ../pack/image
cp * ../pack
cp image/* ../pack/image
rm ../pack/pack.sh
cd ../pack
zip -r ../pack.zip *
cd ..
rm -rf pack
