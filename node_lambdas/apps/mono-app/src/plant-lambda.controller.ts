import { JwtAuthGuard } from '@app/auth';
import {
  ForbiddenResponse,
  NotFoundResponse,
  ParseDateInBodyPipe,
  queryParser,
  SuccessResponse,
  UnauthorizedResponse,
} from '@app/common';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  CreatePlantApiDto,
  CreatePlantResponse,
  CreateSpeciesDto,
  GetPlantQuery,
  GetPlantResponse,
  GetPlantsResponse,
  GetSpeciesResponse,
  PlantByParamsIdInterceptor,
  UpdatePlantDto,
  UpdatePlantResponse,
} from '@app/plant';
import { PlantService } from '@app/plant/services/plant.service';
import { SpeciesService } from '@app/plant/services/species.service';
import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Plant')
@Controller('plant')
export class PlantLambdaController {
  constructor(
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    private readonly speciesService: SpeciesService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiOkResponse({
    description: '식물 종 정보 조회 성공',
    type: GetSpeciesResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('species')
  async findAllSpecies() {
    return await this.speciesService.findAllSpecies();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('species')
  async createSpecies(@Body() createSpeciesDto: CreateSpeciesDto) {
    return await this.speciesService.create(createSpeciesDto);
  }

  /**
   * 식물의 기분 정보를 가져옵니다. 배열 형태입니다!
   */
  @ApiOkResponse({
    schema: {
      example: {
        data: [
          {
            mood: 'happy',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_happy.png',
          },
          {
            mood: 'sad',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_sad.png',
          },
          {
            mood: 'sick',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_sick.png',
          },
          {
            mood: 'boring',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_boring.png',
          },
          {
            mood: 'hot',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_hot.png',
          },
        ],
        success: true,
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('mood')
  async getMoodInfos() {
    return await this.plantService.getPlantMoodInfos();
  }

  /**
   * 식물을 생성합니다. 유저가 있는지 인증정보를 확인하고, 식물을 생성합니다.
   * 유저의 id로 식물의 소유자를 설정합니다.
   */
  @ApiCreatedResponse({
    description: '식물을 성공적으로 생성함',
    type: CreatePlantResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(ParseDateInBodyPipe) createPlantDto: CreatePlantApiDto,
    @Req() req,
  ) {
    createPlantDto.owner = req.user.id;
    const plant = await this.plantService.create(createPlantDto);
    return plant;
  }

  /**
   * 식물 목록을 조회합니다. 쿼리가 없을경우 요청자 본인의 식물 목록을 조회합니다.
   */
  @ApiOkResponse({
    description: '식물 목록 조회 성공',
    type: GetPlantsResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiQuery({
    name: 'owner',
    description: '식물의 소유자',
    type: String,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query('owner') owner: string, @Req() req) {
    if (!owner) {
      owner = req.user.id.toString();
    }
    const query: GetPlantQuery = queryParser({ owner }, GetPlantQuery);
    return await this.plantService.findAll(query);
  }

  /**
   * 식물 하나를 조회합니다.
   */
  @ApiOkResponse({
    description: '식물 조회 성공',
    type: GetPlantResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: '식물을 찾을 수 없음',
    type: NotFoundResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.plantService.findOne(id);
  }

  /**
   * 식물 정보를 수정합니다. 인증 정보의 유저가 소유자인지 확인하고, 식물을 수정합니다.
   */
  @ApiOkResponse({
    description: '식물 수정 성공',
    type: UpdatePlantResponse,
  })
  @ApiNotFoundResponse({
    description: '식물을 찾을 수 없음',
    type: NotFoundResponse,
  })
  @ApiForbiddenResponse({
    description: '엔티티 소유자가 아닙니다.',
    type: ForbiddenResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(PlantByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ParseDateInBodyPipe) updatePlantDto: UpdatePlantDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.plantService.update(id, updatePlantDto);
  }

  /**
   * 식물을 삭제합니다. 인증 정보의 유저가 소유자인지 확인하고, 식물을 삭제합니다.
   */
  @ApiOkResponse({
    description: '식물 삭제 성공',
    type: SuccessResponse,
  })
  @ApiNotFoundResponse({
    description: '식물을 찾을 수 없음',
    type: NotFoundResponse,
  })
  @ApiForbiddenResponse({
    description: '엔티티 소유자가 아닙니다.',
    type: ForbiddenResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(PlantByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.plantService.deleteOne(id);
  }
}
