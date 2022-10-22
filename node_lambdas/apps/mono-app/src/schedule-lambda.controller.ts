import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
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
import { PlantByBodyIdInterceptor } from '@app/plant/interceptors/plantById.interceptor';
import { ScheduleService } from '@app/schedule/schedule.service';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  CreateScheduleResponse,
  GetSchedulesResponse,
} from '@app/schedule/dto/schedule-success-response.dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import {
  ParseDateInBodyPipe,
  ParseMonthPipe,
  ParseYearPipe,
} from '@app/common/pipes/parse-date.pipe';
import {
  CreateScheduleDto,
  GetScheduleQuery,
} from '@app/schedule/dto/schedule.dto';
import { queryParser } from '@app/common/utils/query-parser';

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
    @Body(ParseDateInBodyPipe) createScheduleDto: CreateScheduleDto,
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
  @ApiQuery({
    name: 'year',
    description: '스케줄을 조회할 년도, (예: 2020)',
    type: Date,
    required: false,
  })
  @ApiQuery({
    name: 'month',
    description: '스케줄을 조회할 달, (1~12)로 주세요',
    type: Date,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('plant_id') plant_id: string,
    @Query('year', ParseIntPipe, ParseYearPipe) year: number,
    @Query('month', ParseIntPipe, ParseMonthPipe) month: number,
  ) {
    const start = new Date(year, 0, 1);
    start.setMonth(month - 2);
    const end = new Date(year, 0, 31);
    end.setMonth(month);
    const query: GetScheduleQuery = queryParser(
      { plant_id, year, month, start, end },
      GetScheduleQuery,
    );
    return await this.scheduleService.findAllAndGroupBy(query);
  }
}
