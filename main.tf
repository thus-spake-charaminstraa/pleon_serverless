terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.0"
}

provider "aws" {
  region = var.aws_region
}

module "api-gateway" {
  source = "./api-gateway"
}

module "lambda" {
  source = "./lambdas"
}

locals {
    aws_region = "ap-northeast-2"
    s3_lambda_bucket = "lambda-bucket"
}
