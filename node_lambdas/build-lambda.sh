#!/bin/bash

build() {
  rm -rf ./dist/apps/$1
  npx nest build --webpack $1
}

uploadCode() {
  pwd=$(pwd)
  aws lambda update-function-code \
    --function-name $1 \
    --zip-file fileb://$pwd/main.js.zip \
    --region ap-northeast-2 \
    > /dev/null
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

deploy() {
  VERSION=$(aws lambda publish-version --function-name $1 | jq -r .Version)
  aws lambda update-alias \
    --function-name $1 \
    --name "production" \
    --function-version $VERSION \
    > /dev/null
}

declare -a array=(
  "mono-app"
  "guide-noti-lambda"
  # "chat-lambda"
  # "chat-connect"
  # "chat-disconnect"
  "token-check"
  "plant-doctor-analysis"
  "plant-comment-get-feed"
  "plant-comment-create-comment"
  "event-notice-lambda"
  "comment-notice-lambda"
  "plant-register-notice-lambda"
  # "plant-detection"
  # "plant-doctor"
)

build=0
upload=0
publish=0
deploy=0

while [[ $# -gt 0 ]]
do
  case $1 in
    -b|--build)
      build=1
      shift
      ;;
    -u|--upload)
      upload=1
      shift
      ;;
    -p|--publish)
      publish=1
      shift
      ;;
    -d|--deploy)
      deploy=1
      shift 
      ;;
    *)
      ;;
  esac
done



for i in "${array[@]}"
do
  if [ $build -eq 1 ]
  then
    build "$i"
  fi
  if [ $upload -eq 1 ]
  then
    packageAndUploadCode "$i"
  fi
  if [ $publish -eq 1 ]
  then
    publishVersion "$i"
  fi
  if [ $deploy -eq 1 ]
  then
    deploy "$i"
  fi
done
