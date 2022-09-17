import { JwtAuthGuard } from '@app/auth';
import { CreateScheduleDto, ScheduleService } from '@app/schedule';
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
  CaslAbilityFactory,
  ParseDateInBodyPipe,
  ParseMonthPipe,
  ParseYearPipe,
} from '@app/common';
import { queryParser } from '@app/common/utils';
import { GetScheduleQuery } from '@app/schedule/dto';
import { PlantByBodyIdInterceptor } from '@app/plant';

@Controller()
export class ScheduleLambdaController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseInterceptors(PlantByBodyIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('schedule')
  async create(
    @Body(ParseDateInBodyPipe) createScheduleDto: CreateScheduleDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.scheduleService.create(createScheduleDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('schedule')
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
