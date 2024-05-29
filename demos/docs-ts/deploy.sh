#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

ossutil rm oss://aieditor-demo-docs/ -rf
ossutil cp -rf ./dist  oss://aieditor-demo-docs/
