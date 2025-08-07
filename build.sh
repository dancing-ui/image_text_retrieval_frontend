#!/bin/zsh

rm -rf frontend.zip

nvm use v22.12.0
npm run build

zip -r frontend.zip dist deploy.sh deploy.md