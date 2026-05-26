#!/usr/bin/env sh
set -e

npm run build

cd _build

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:eventide-project/docs.git master:gh-pages

cd -
