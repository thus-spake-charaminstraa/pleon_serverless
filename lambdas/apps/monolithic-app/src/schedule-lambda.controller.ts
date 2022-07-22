import { CreateScheduleDto, Schedule, ScheduleService } from "@app/schedule";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleLambdaController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return await this.scheduleService.create(createScheduleDto);
  }

  @Get()
  async findAll() {
    return await this.scheduleService.findAll();
  }
}