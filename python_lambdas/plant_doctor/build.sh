aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com
docker build -t plant_doctor_x86 . --platform=linux/amd64
docker tag plant_doctor_x86 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-doctor:latest
docker push 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-doctor:latest
docker rmi -f 305106164225.dkr.ecr.ap-northeast-2.amazonaws.com/lambda-plant-doctor:latest
