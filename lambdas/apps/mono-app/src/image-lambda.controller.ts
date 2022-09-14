import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from '@app/image';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ImageUploadDto } from '@app/image';
import { UploadImageResponse } from '@app/common/dto';

@ApiTags('Image')
@Controller('image')
export class ImageLambdaController {
  constructor(private readonly imageService: ImageService) {}

  /*
   * Image Upload - 이미지 한개를 업로드하면 s3에 업로드해주고, 업로드한 이미지의 url을 리턴한다.
   *
   */
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 한개 업로드',
    type: ImageUploadDto,
  })
  @ApiCreatedResponse({
    description: '이미지 s3에 업로드 성공',
    type: UploadImageResponse,
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    return await this.imageService.uploadImage(image);
  }
}
