#!/bin/bash

deploy() {
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

packageAndDeploy() {
  cd ./dist/apps/$1
  zip main.js.zip main.js
  deploy $1
  cd ../../..
}


declare -a array=(
  "mono-app"
  "auth-lambda"
  "comment-lambda"
  "feed-lambda"
  "image-lambda"
  "noti-lambda"
  "plant-lambda"
  "schedule-lambda"
  "user-lambda"
  "guide-noti-lambda"
  "chat-lambda"
  "chat-connect"
  "chat-disconnect"
  "token-check"
)
for i in "${array[@]}"
do
	build "$i"
  packageAndDeploy "$i"
done