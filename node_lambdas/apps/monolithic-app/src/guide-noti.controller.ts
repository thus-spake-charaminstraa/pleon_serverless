import { GuideService } from '@app/plant/services/guide.service';
import { Controller, Param, Post } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Guide-Noti')
@Controller('guide-noti')
export class GuideNotiController {
  constructor(private readonly guideService: GuideService) {}

  @ApiParam({
    name: 'user_id',
    description: '알림을 보낼 유저의 id',
    type: String,
    required: true,
  })
  @Post(':user_id')
  async sendGuideNoti(@Param('user_id') userId: string) {
    const ret = await this.guideService.sendNotiForPlants({ owner: userId });
    return ret;
  }
}
