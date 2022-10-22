import { ImageUploadResDto } from '@app/image/dto/image.dto';

export class SuccessResponse {
  success = true;
  statusCode = 200;
}

export class UploadImageResponse extends SuccessResponse {
  data: ImageUploadResDto;
  statusCode = 201;
}
