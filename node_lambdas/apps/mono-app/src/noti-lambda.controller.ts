import { JwtAuthGuard } from '@app/auth';
import {
  BadRequestResponse,
  queryParser,
  UnauthorizedResponse,
} from '@app/common';
import {
  CreateNotiDto,
  GetNotiQuery,
  GetNotiResponse,
  GetNotisResponse,
  ManageNotiResponse,
  NotiKind,
  NotiManageDto,
  NotiViewKind,
} from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Noti')
@Controller('noti')
export class NotiLambdaController {
  constructor(private readonly notiService: NotiService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createNotiDto: CreateNotiDto, @Req() req) {
    createNotiDto.owner = req.user.id.toString();
    return await this.notiService.create(createNotiDto);
  }

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

  @ApiOkResponse({
    description: '피드에서 보여줄 알림 목록을 받습니다.',
    type: GetNotiResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('feed')
  async findNotiList(@Req() req) {
    const query: GetNotiQuery = queryParser(
      {
        owner: req.user.id.toString(),
      },
      GetNotiQuery,
    );
    const ret = await this.notiService.findAll(query);
    const viewTypeRet: any[] = ret.map((noti) => ({
      viewType: NotiViewKind.twoBtn,
      viewObject: noti,
    }));
    viewTypeRet.push(
      {
        viewType: NotiViewKind.oneBtn,
        viewObject: {
          content: '식물과 놀아보세요!',
        },
      },
      {
        viewType: NotiViewKind.default,
        viewObject: {
          content: '식물과의 일기를 써보세요!',
        },
      },
    );
    return viewTypeRet;
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
