import { NotiService } from '@app/noti';
import { GetNotiQuery } from '@app/noti/dto';
import { Noti } from '@app/noti/entities';
import { Controller } from '@nestjs/common';

@Controller('noti')
export class NotiLambdaController {
  constructor(
    private readonly notiService: NotiService,
  ) { }
  
  async findAll(query: GetNotiQuery): Promise<Noti[]> {
    
    return await this.notiService.findAll(query);
  }
  
}
