import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { PlantService } from '@app/plant';
import {
  CreatePlantApiDto,
  CreatePlantDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '@app/plant/dto';
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
import { JwtAuthGuard } from '@app/auth';
import { CaslAbilityFactory, ParseDatePipe, ScheduleKind } from '@app/common';
import { PlantByParamsIdInterceptor } from '@app/common/interceptors';
import {
  CreatePlantResponse,
  GetPlantResponse,
  GetPlantsResponse,
  UpdatePlantResponse,
  ForbiddenResponse,
  UnauthorizedResponse,
  NotFoundResponse,
  SuccessResponse,
} from '@app/common/dto';
import { ScheduleService } from '@app/schedule';
import { DateStrFormat, queryParser } from '@app/common/utils';

@ApiTags('Plant')
@Controller('plant')
export class PlantLambdaController {
  constructor(
    private readonly plantService: PlantService,
    private readonly scheduleService: ScheduleService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

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
    @Body(ParseDatePipe) createPlantDto: CreatePlantApiDto,
    @Req() req,
  ) {
    createPlantDto.owner = req.user.id;
    const plant = await this.plantService.create(createPlantDto);
    await this.scheduleService.create({
      plant_id: plant.id.toString(),
      timestamp: new Date(DateStrFormat(new Date(createPlantDto.water_date))),
      kind: ScheduleKind.water,
    });
    return plant;
  }

  /**
   * 식물 목록을 조회합니다.
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
  async findAll(@Query('owner') owner: string) {
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
    @Body() updatePlantDto: UpdatePlantDto,
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
