import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class ImageService {
  s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.get('AWS_REGION'),
    });
  }

  async uploadImage(image: Express.Multer.File) {
    const imageKey = uuid4() + '.jpg';
    const uploadParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: imageKey,
      ACL: 'public-read',
      Body: image.buffer,
    };
    const ret = await this.s3.send(new PutObjectCommand(uploadParams));
    console.log(ret);
    return {
      url:
        'https://' +
        this.configService.get('AWS_S3_BUCKET_NAME') +
        '.s3.amazonaws.com/' +
        imageKey,
    };
  }
}
