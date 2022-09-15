docker build -t plant_detection_x86 . --platform=linux/amd64
docker tag plant_detection_x86 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-detection
docker push 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-detection
docker rmi 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-detection

# aws lambda update-function-code \
#   --function-name "plant-detection" \
#   --image-uri \
#   --region ap-northeast-2 \
#   > /dev/null

