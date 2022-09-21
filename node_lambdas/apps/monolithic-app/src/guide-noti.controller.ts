import { Controller, Post } from '@nestjs/common';
import { NotiService } from '@app/noti';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Noti')
@Controller('guide-noti')
export class GuideNotiController {
  constructor(private readonly notiService: NotiService) {}

  @Post()
  async sendGuideNoti() {
    const ret = await this.notiService.sendNotiForPlants();
    return ret;
  }
}
