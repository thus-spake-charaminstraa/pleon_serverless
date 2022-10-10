import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ImageService } from './image.service';

@Module({
  imports: [HttpModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
