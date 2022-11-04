#!/bin/bash

deploy() {
  VERSION=$(aws lambda publish-version --function-name $1 | jq -r .Version)
  aws lambda update-alias \
    --function-name $1 \
    --name "production" \
    --function-version $VERSION \
    > /dev/null
}

declare -a array=(
  # "mono-app"
  # "auth-lambda"
  # "comment-lambda"
  # "feed-lambda"
  # "image-lambda"
  # "noti-lambda"
  # "plant-lambda"
  # "schedule-lambda"
  # "user-lambda"
  # "guide-noti-lambda"
  # "chat-lambda"
  # "chat-connect"
  # "chat-disconnect"
  # "token-check"
  # "plant-doctor-analysis"
  # "plant-detection"
  # "plant-doctor"
)


if [ $# -eq 0 ]
then
  for i in "${array[@]}"
  do
	  deploy "$i"
  done
else
  deploy "$1"
fi