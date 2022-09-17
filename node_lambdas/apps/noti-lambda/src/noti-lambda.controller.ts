import {
  NotiService,
  CreateNotiDto,
  GetNotiQuery,
  NotiManageDto,
} from '@app/noti';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { queryParser } from '@app/common/utils';
import { NotiKind } from '@app/noti/types';

@Controller()
export class NotiLambdaController {
  constructor(private readonly notiService: NotiService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('noti')
  async create(@Body() createNotiDto: CreateNotiDto, @Req() req) {
    createNotiDto.owner = req.user.id.toString();
    return await this.notiService.create(createNotiDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('noti')
  async findAll(
    @Query('owner') owner: string,
    @Query('plant_id') plant_id: string,
    @Query('kind') kind: NotiKind,
    @Req() req,
  ) {
    const query: GetNotiQuery = queryParser(
      {
        owner: owner || req.user.id.toString(),
        plant_id,
        kind,
      },
      GetNotiQuery,
    );
    return await this.notiService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post(':id')
  async notiManage(
    @Body() notiManageDto: NotiManageDto,
    @Param('id') id: string,
  ) {
    return await this.notiService.notiManage(id, notiManageDto);
  }
}
