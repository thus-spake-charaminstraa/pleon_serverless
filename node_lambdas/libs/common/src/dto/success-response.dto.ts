import { ImageUploadResDto } from '@app/image';

export class SuccessResponse {
  success = true;
  statusCode = 200;
}

export class UploadImageResponse extends SuccessResponse {
  data: ImageUploadResDto;
  statusCode = 201;
}

