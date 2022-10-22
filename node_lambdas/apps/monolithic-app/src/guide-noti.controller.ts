import { GuideService } from '@app/plant/services/guide.service';
import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Noti')
@Controller('guide-noti')
export class GuideNotiController {
  constructor(private readonly guideService: GuideService) {}

  @Post()
  async sendGuideNoti() {
    const ret = await this.guideService.sendNotiForPlants();
    return ret;
  }
}
