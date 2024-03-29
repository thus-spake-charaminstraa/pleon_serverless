import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { UnauthorizedResponse } from '@app/common/dto/error-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
import { queryParser } from '@app/common/utils/query-parser';
import {
  GetFeedModalNotiResponse,
  GetIfNotConfirmedCommentNotiExist,
  GetNotiInFeedResponse,
  GetNotiInListResponse,
  GetNotisResponse,
  NotiViewKind,
} from '@app/noti/dto/noti-success-response.dto';
import {
  CreateNotiDto,
  GetGuideNotiQuery,
  GetNotiQuery,
  NotiListKind,
  NotiRes,
} from '@app/noti/dto/noti.dto';
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
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

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
   * 댓글 알림 리스트 화면에서 받을 댓글 알림을 가져옵니다.
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
    const result = [];
    commentNotis.forEach((notisByDate) => {
      result.push({
        viewType: NotiListKind.DATE,
        viewObject: {
          text: notisByDate.date,
        },
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

  /**
   * 댓글 알림 리스트에 아직 확인 안한 댓글이 있는지 확인합니다.
   * 결과값은 boolean 값입니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '알림이 있는지 여부를 가져옴',
    type: GetIfNotConfirmedCommentNotiExist,
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
  @Get('list/new')
  async checkNotConfirmedCommentNotiExist(
    @Query('owner') owner: string,
    @Req() req,
  ) {
    const query: GetNotiQuery = queryParser({
      owner: owner || req.user.id.toString(),
    });
    return await this.notiService.checkNotConfirmedCommentNotiExist(query);
  }

  /**
   * 피드 화면에서 보여줄 가이드 알림 리스트를 가져옵니다.
   */
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
    console.log(ret);
    let viewTypeRet: any[] = [
      // {
      //   viewType: NotiViewKind.DEFAULT,
      //   viewObject: {
      //     content:
      //       '"#이벤트" 를 태그하고 식물과 찍은 셀카를 올려주시면 추첨을 통해 3명에게 "스타벅스 아메리카노"를 드립니다.\n~11월 22일까지',
      //   },
      // },
    ];
    viewTypeRet = viewTypeRet.concat(
      ret.map((noti) => ({
        viewType: NotiViewKind.TWO_BTN,
        viewObject: noti,
      })),
    );
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
   * 피드 화면에서 보여줄 공지 모달 목록을 가져옵니다.
   * 응답 값 중에 isExist 가 false이면 그냥 모달을 안보여주면 됩니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '알림 모달 정보입니다.',
    type: GetFeedModalNotiResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('feed-modal')
  async findAllModalNoti(@Req() req: Request) {
    const expireDateStr = req.cookies?.feed_modal_expired_date;
    console.log('cookie is : ', expireDateStr);
    let expireDate;
    if (expireDateStr) {
      expireDate = new Date(expireDateStr);
    }
    console.log(expireDate);
    return await this.notiService.findAllModalNoti(expireDate);
  }

  /**
   * 피드 화면에서 보여줄 공지 모달을 하루동안 0개로 만듭니다.
   * 공지 모달을 가져오는 GET /noti/feed-modal api 의 응답값 중 isExist를
   * 그날 자정까지 항상 false로 만듭니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 인증정보가 없습니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '알림이 성공적으로 하루동안 보이지 않게 됨',
    type: SuccessResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('feed-modal/one-day')
  async createOneDayNotiNotDisplay(@Res({ passthrough: true }) res: Response) {
    const tommorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const expireDate = new Date(
      tommorrow.getFullYear(),
      tommorrow.getMonth(),
      tommorrow.getDate(),
      0,
      0,
      0,
    );
    // const expireDate = new Date(
    //   Date.now() + 1000 * 60,
    // ); // for test
    console.log(expireDate);
    res.cookie('feed_modal_expired_date', expireDate.toISOString(), {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
  }
}
