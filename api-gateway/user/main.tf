resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.pleon_api_gw.id
  parent_id   = aws_api_gateway_rest_api.pleon_api_gw.root_resource_id
  path_part   = "user"
}

resource "aws_api_gateway_method" "user_create" {
  rest_api_id   = aws_api_gateway_rest_api.pleon_api_gw.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "POST"
  # authorization = "CUSTOM"
  # authorizer_id = 
}

resource "aws_api_gateway_authorizer" "demo" {
  name                   = "demo"
  rest_api_id            = aws_api_gateway_rest_api.demo.id
  authorizer_uri         = aws_lambda_function.jwt_authorizer.invoke_arn
  authorizer_credentials = aws_iam_role.invocation_role.arn
}