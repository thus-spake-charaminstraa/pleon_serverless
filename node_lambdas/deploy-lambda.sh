#!/bin/bash

deploy() {
  cd ./dist/apps/$1
  pwd=$(pwd)
  aws lambda publish-version \
    --function-name $1 \
    > /dev/null
  cd ../../..
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
for i in "${array[@]}"
do
	deploy "$i"
done
