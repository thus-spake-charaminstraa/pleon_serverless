import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid4 } from 'uuid';
// import sharp from 'sharp';

@Injectable()
export class ImageService {
  s3: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.s3 = new S3Client({
      region: configService.get('AWS_REGION'),
    });
  }

  async downloadImageByUrl(url: string): Promise<Buffer> {
    const response = await this.httpService.axiosRef.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data, 'binary');
  }

  // async cropImageByProportionBox(image: Buffer, proportionBox: number[]) {
  //   const imageKey = 'plant-doctor-' + uuid4() + '.jpg';
  //   const imageSharp = sharp(Buffer.from(image.buffer));
  //   const uploadParams = {
  //     Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
  //     Key: imageKey,
  //     ACL: 'public-read',
  //     Body: await imageSharp
  //       .extract({
  //         left: Math.round(proportionBox[0]),
  //         top: Math.round(proportionBox[1]),
  //         width: Math.round(proportionBox[2] - proportionBox[0]),
  //         height: Math.round(proportionBox[3] - proportionBox[1]),
  //       })
  //       .toBuffer(),
  //   };
  //   const ret = await this.s3.send(new PutObjectCommand(uploadParams));
  //   console.log(ret);
  //   return {
  //     url:
  //       'https://' +
  //       this.configService.get('AWS_S3_BUCKET_NAME') +
  //       '.s3.amazonaws.com/' +
  //       imageKey,
  //   };
  // }

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
