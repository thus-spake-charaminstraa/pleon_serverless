#!/bin/bash

deploy() {
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
  "plant-detection"
  "plant-doctor"
)
for i in "${array[@]}"
do
	deploy "$i"
done
