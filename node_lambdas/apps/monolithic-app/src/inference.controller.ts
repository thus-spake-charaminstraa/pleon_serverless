import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiBody, ApiProperty, ApiOkResponse } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PlantInferenceDto {
  @ApiProperty()
  @IsString()
  image_url: string;
}

export class PlantDetectionResponse {
  @ApiProperty()
  image_url: string;

  @ApiProperty()
  box: Array<number>;

  @ApiProperty()
  score: Array<number>;

  @ApiProperty()
  category: Array<number>;
}

@ApiTags('Inference')
@Controller('inference')
export class InferenceController {
  @ApiOkResponse({
    description: '식물 종 식별 성공',
    type: PlantDetectionResponse,
  })
  @Post('plant-detection')
  async plantDetection(@Body() body: PlantInferenceDto) {
    return 'plant detection';
  }

  @ApiOkResponse({
    description: '식물 종 식별 성공',
    type: PlantDetectionResponse,
  })
  @Post('plant-doctor')
  async plantDoctor(@Body() body: PlantInferenceDto) {
    return 'plant doctor';
  }

  @ApiBody({
    description: 'warming plant doctor',
    type: String,
    examples: {
      'application/json': {
        value: 'warming',
      },
    },
  })
  @Post('plant-detection/warming')
  async warmingPlantDetection() {
    return 'warming plant detection';
  }

  @ApiBody({
    description: 'warming plant doctor',
    type: String,
    examples: {
      'application/json': {
        value: 'warming',
      },
    },
  })
  @Post('plant-doctor/warming')
  async warmingPlantDoctor(@Body() body: string) {
    return 'warming plant doctor';
  }
}