import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  BadRequestResponse,
  ConflictResponse,
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '@app/common/dto/error-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { ParseDateInBodyPipe } from '@app/common/pipes/parse-date.pipe';
import { queryParser } from '@app/common/utils/query-parser';
import { GetDiagnosisQuery } from '@app/plant/dto/diagnosis.dto';
import {
  CreatePlantResponse,
  GetDiagnosesResponse,
  GetDiagnosisResponse,
  GetPlantResponse,
  GetPlantsResponse,
  GetSpeciesResponse,
  UpdatePlantResponse,
} from '@app/plant/dto/plant-success-response.dto';
import {
  CreatePlantApiDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '@app/plant/dto/plant.dto';
import { CreateSpeciesDto } from '@app/plant/dto/species.dto';
import { PlantByParamsIdInterceptor } from '@app/plant/interceptors/plantById.interceptor';
import { PlantMoodInfos } from '@app/plant/resources/plant-mood';
import { DiagnosisService } from '@app/plant/services/diagnosis.service';
import { PlantService } from '@app/plant/services/plant.service';
import { SpeciesService } from '@app/plant/services/species.service';
import { GuideService } from '@app/plant/services/guide.service';
import { GuideManageDto } from '../../../libs/plant/src/dto/guide.dto';
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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
    private readonly diagnosisService: DiagnosisService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly guideService: GuideService,
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
   * 식물 진단 결과를 아이디로 한 개 조회합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '식물 진단 정보 조회 성공',
    type: GetDiagnosisResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('diagnosis/:id')
  async findOneDiagnosis(@Param('id') id: string) {
    return await this.diagnosisService.findOne(id);
  }

  /**
   * 식물 진단 결과들을 조회합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '식물 진단 정보 조회 성공',
    type: GetDiagnosesResponse,
  })
  @ApiQuery({
    name: 'owner',
    required: false,
  })
  @ApiQuery({
    name: 'plant_id',
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('diagnosis')
  async findAllDiagnosis(
    @Query('owner') owner: string,
    @Query('plant_id') plant_id: string,
  ) {
    const query: GetDiagnosisQuery = queryParser(
      { owner, plant_id },
      GetDiagnosisQuery,
    );
    return await this.diagnosisService.findAll(query);
  }

  /**
   * 식물 관리 가이드를 처리합니다. 요청 바디에 noti_id, type을 지정합니다.
   * type은 COMPLETE, LATER를 지정합니다.
   */
  @ApiBadRequestResponse({
    description: '응답 바디의 type값이 잘못되었음',
    type: BadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: '가이드 알림 정보 조회 실패',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '가이드 관리 성공',
    type: SuccessResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('guide/manage')
  async guideManage(@Body() guideManageDto: GuideManageDto) {
    return await this.guideService.guideManage(guideManageDto);
  }

  /**
   * 식물의 기분 정보를 가져옵니다. 배열 형태입니다!
   */
  @ApiOkResponse({
    schema: {
      example: {
        data: PlantMoodInfos,
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
  @ApiConflictResponse({
    description: '식물이 6개 이상일 때 생성할 수 없음',
    type: ConflictResponse,
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
