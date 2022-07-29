import { JwtAuthGuard } from '@app/auth';
import { CreateScheduleDto, Schedule, ScheduleService } from '@app/schedule';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateScheduleResponse, GetSchedulesResponse } from '@app/common/dto';
import { PlantByBodyIdInterceptor } from '@app/common/interceptors';
import { CaslAbilityFactory, ParseDatePipe } from '@app/common';
import { queryParser } from '@app/common/utils';
import { GetScheduleQuery } from '../../../libs/schedule/src/dto/schedule.dto';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleLambdaController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * 스케줄을 생성합니다. 스케줄은 종류가 있으며, 어떤 식물의 것인지 나타내는 값이 있어야 합니다.
   */
  @ApiCreatedResponse({
    type: CreateScheduleResponse,
    description: '스케줄 생성 성공',
  })
  @ApiBearerAuth()
  @UseInterceptors(PlantByBodyIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(ParseDatePipe) createScheduleDto: CreateScheduleDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.scheduleService.create(createScheduleDto);
  }

  /**
   * 스케줄 목록을 조회합니다.
   */
  @ApiOkResponse({
    description: '스케줄 조회 성공',
    type: GetSchedulesResponse,
  })
  @ApiQuery({
    name: 'plant_id',
    description: '스케줄을 조회할 식물의 id',
    type: String,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query('plant_id') plant_id: string) {
    const query: GetScheduleQuery = queryParser({ plant_id }, GetScheduleQuery);
    return await this.scheduleService.findAll(query);
  }
}
