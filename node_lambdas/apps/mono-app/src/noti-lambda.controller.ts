import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import {
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/common/dto/error-response.dto';
import { queryParser } from '@app/common/utils/query-parser';
import {
  GetNotiInFeedResponse,
  GetNotiInListResponse,
  GetNotisResponse,
  ManageNotiResponse,
  NotiViewKind,
} from '@app/noti/dto/noti-success-response.dto';
import {
  CreateNotiDto,
  GetGuideNotiQuery,
  GetNotiQuery,
  NotiListKind,
  NotiManageDto,
  NotiRes,
} from '@app/noti/dto/noti.dto';
import { Noti } from '@app/noti/entities/noti.entity';
import { NotiService } from '@app/noti/noti.service';
import { NotiKind } from '@app/noti/types/noti-kind.type';
import { GetPlantQuery } from '@app/plant/dto/plant.dto';
import { PlantService } from '@app/plant/services/plant.service';
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
  constructor(
    private readonly notiService: NotiService,
    private readonly plantService: PlantService,
  ) {}

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

  /**
   * 알림 리스트 화면에서 받을 알림을 가져옵니다.
   * query 파라미터는 1가지인데, 알림 소유자를 설정합니다.
   * 모두 옵셔널이고, 알림 소유자는 요청자의 id가 기본값으로 설정됩니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '알림들을 성공적으로 가져옴',
    type: GetNotiInListResponse,
  })
  @ApiQuery({
    name: 'owner',
    description: '알림을 소유한 유저의 id',
    type: String,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('list')
  async findAllInNotiListView(@Query('owner') owner: string, @Req() req) {
    const query: GetNotiQuery = queryParser({
      owner: owner || req.user.id.toString(),
    });
    const commentNotis = await this.notiService.findAllCommentNotiGroupByDate(
      query,
    );
    let result = [];
    commentNotis.forEach((notisByDate) => {
      result.push({
        viewType: NotiListKind.DATE,
        viewObject: notisByDate.date,
      });
      notisByDate.notis.forEach((noti: NotiRes) => {
        result.push({
          viewType: !!noti.feed.image_url
            ? NotiListKind.IMAGE
            : NotiListKind.TEXT,
          viewObject: {
            ...noti,
            feedContent: noti.feed.content.substring(0, 2),
            feedImageUrl: noti.feed.image_url,
          },
        });
      });
    });
    return result;
  }

  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '피드에서 보여줄 알림 목록을 받습니다.',
    type: GetNotiInFeedResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('feed')
  async findNotiList(@Req() req) {
    const query: GetGuideNotiQuery = queryParser(
      {
        owner: req.user.id.toString(),
      },
      GetGuideNotiQuery,
    );
    const ret = await this.notiService.findAllGuideNoti(query);
    const viewTypeRet: any[] = ret.map((noti) => ({
      viewType: NotiViewKind.TWO_BTN,
      viewObject: noti,
    }));
    if (
      (
        await this.plantService.findAll({
          owner: req.user.id.toString(),
        } as GetPlantQuery)
      ).length === 0
    ) {
      viewTypeRet.push({
        viewType: NotiViewKind.ONE_BTN,
        viewObject: {
          content: '식물을 등록해주세요!',
        },
      });
    }
    viewTypeRet.push({
      viewType: NotiViewKind.DEFAULT,
      viewObject: {
        content: '식물의 하루를 기록해보세요!',
      },
    });
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
