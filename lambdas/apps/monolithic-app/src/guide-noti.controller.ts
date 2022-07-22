import { ScheduleService } from "@app/schedule";
import { Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('guide-noti')
@Controller('guide')
export class GuideNotiController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async sendGuideNoti(): Promise<void> {
    await this.scheduleService.sendNotiForPlants();
  }
}