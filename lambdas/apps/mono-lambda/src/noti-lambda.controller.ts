import { NotiService } from '@app/noti';
import {
  GetNotiQuery,
  GetNotisResponse,
  ManageNotiResponse,
  NotiManageDto,
} from '@app/noti/dto';
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestResponse, UnauthorizedResponse } from '@app/common/dto';
import { NotiKind } from '@app/noti/types';

@ApiTags('Noti')
@Controller('noti')
export class NotiLambdaController {
  constructor(private readonly notiService: NotiService) {}

  /**
   * 알림을 가져옵니다.
   * query 파라미터는 3가지인데, 알림 소유자, 알림 대상 식물, 알림 종류를 설정합니다.
   * 모두 옵셔널이고, 알림 소유자는 요청자의 id가 기본값으로 설정됩니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '알림들을 성공적으로 가져옴',
    type: GetNotisResponse,
  })
  @ApiQuery({
    name: 'owner',
    description: '알림을 소유한 유저의 id',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'plant_id',
    description: '알림을 소유한 식물의 id',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'kind',
    description: '알림의 종류',
    enum: NotiKind,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('owner') owner: string,
    @Query('plant_id') plant_id: string,
    @Query('kind') kind: NotiKind,
    @Req() req,
  ) {
    let query: GetNotiQuery = queryParser(
      {
        owner: owner || req.user.id.toString(),
        plant_id,
        kind,
      },
      GetNotiQuery,
    );
    return await this.notiService.findAll(query);
  }

  /**
   * 알림을 처리합니다.
   * 알림 처리 타입을 req body로 전달하면, 알림을 처리합니다.
   * 피드를 생성하는 schedule 관련 알림은 피드 생성 dto를 생성하여 res로 전달해줍니다.
   */
  @ApiBadRequestResponse({
    description: '입력 데이터가 올바르지 않음',
    type: BadRequestResponse,
  })
  @ApiOkResponse({
    description: '알림을 성공적으로 처리함',
    type: ManageNotiResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiBearerAuth()
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
