import { Species } from '@app/plant';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiProperty, ApiOkResponse } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PlantInferenceDto {
  @ApiProperty()
  @IsString()
  image_url: string;
}

export class PlantDetectionResponse {
  @ApiProperty()
  image_url: string;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  box: Array<number>;

  @ApiProperty()
  score: number;

  @ApiProperty()
  category: number;

  @ApiProperty()
  species: Species;
}

@ApiTags('Inference')
@Controller('inference')
export class InferenceController {
  @ApiOkResponse({
    description: '식물 종 식별 성공',
    type: PlantDetectionResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('plant-detection')
  async plantDetection(@Body() body: PlantInferenceDto) {
    return 'plant detection';
  }

  @ApiOkResponse({
    description: '식물 종 식별 성공',
    type: PlantDetectionResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('plant-doctor')
  async plantDoctor(@Body() body: PlantInferenceDto) {
    return 'plant doctor';
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'warm up',
        },
      },
    },
  })
  @ApiBody({
    description: 'warming plant doctor',
    type: String,
    examples: {
      'application/json': {
        value: 'warming',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('plant-detection/warming')
  async warmingPlantDetection() {
    return 'warming plant detection';
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'warm up',
        },
      },
    },
  })
  @ApiBody({
    description: 'warming plant doctor',
    type: String,
    examples: {
      'application/json': {
        value: 'warming',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('plant-doctor/warming')
  async warmingPlantDoctor(@Body() body: string) {
    return 'warming plant doctor';
  }
}
