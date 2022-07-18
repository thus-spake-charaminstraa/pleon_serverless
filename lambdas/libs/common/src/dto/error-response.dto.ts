
class ErrorResponse {
  success = false;
}


export class UnauthorizedResponse extends ErrorResponse {
  error = 'Unauthorized';
  statusCode = 401;
}

export class BadRequestResponse extends ErrorResponse {
  error = 'Bad Request';
  statusCode = 400;
}

export class NotFoundResponse extends ErrorResponse {
  error = 'Not Found';
  statusCode = 404;
}

export class ForbiddenResponse extends ErrorResponse {
  error = 'Forbidden';
  statusCode = 403;
}