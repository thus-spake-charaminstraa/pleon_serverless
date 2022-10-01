# Pull the base image with python 3.8 as a runtime for your Lambda
FROM public.ecr.aws/lambda/python:3.8-x86_64

WORKDIR "${LAMBDA_TASK_ROOT}"

# Copy the earlier created requirements.txt file to the container
COPY requirements.txt ./

# Install the python requirements from requirements.txt
RUN yum groupinstall "Development Tools" -y
RUN yum install -y mesa-libGL
RUN python3.8 -m pip install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy index.py file to the container
COPY ./app.py "${LAMBDA_TASK_ROOT}"

# Load the model and store it 
COPY ./plant_detection_weights.pt "${LAMBDA_TASK_ROOT}"

# Set the CMD to your handler
CMD ["app.handler"]
