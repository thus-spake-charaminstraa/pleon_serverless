#!/bin/bash

uploadCode() {
  pwd=$(pwd)
  aws lambda update-function-code \
    --function-name $1 \
    --zip-file fileb://$pwd/main.js.zip \
    --region ap-northeast-2 \
    > /dev/null
}

build() {
  rm -rf ./dist/apps/$1
  npx nest build --webpack $1
}

packageAndUploadCode() {
  cd ./dist/apps/$1
  zip main.js.zip main.js
  uploadCode $1
  cd ../../..
}

publishVersion() {
  aws lambda publish-version \
    --function-name $1 \
    > /dev/null
}

declare -a array=(
  "mono-app"
  # "auth-lambda"
  # "comment-lambda"
  # "feed-lambda"
  # "image-lambda"
  # "noti-lambda"
  # "plant-lambda"
  # "schedule-lambda"
  # "user-lambda"
  "guide-noti-lambda"
  "chat-lambda"
  "chat-connect"
  "chat-disconnect"
  "token-check"
  "plant-doctor-analysis"
)

if [ $# -eq 0 ]
then
  for i in "${array[@]}"
  do
    build "$i"
    packageAndUploadCode "$i"
  done
else
  for i in "${array[@]}"
  do
    build "$i"
    packageAndUploadCode "$i"
    publishVersion "$i"
  done
fi