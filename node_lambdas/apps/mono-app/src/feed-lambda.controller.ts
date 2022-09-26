import { JwtAuthGuard } from '@app/auth';
import {
  BadRequestResponse,
  DateStrFormat,
  ForbiddenResponse,
  NotFoundResponse,
  ParseDateInBodyPipe,
  queryParser,
  SuccessResponse,
  UnauthorizedResponse,
} from '@app/common';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  CreateFeedDto,
  CreateFeedResponse,
  FeedByParamsIdInterceptor,
  FeedKind,
  FeedViewKind,
  GetFeedOrderBy,
  GetFeedQuery,
  GetFeedResponse,
  GetFeedsResponse,
  GetFeedsWithNotiResponse,
  UpdateFeedDto,
  UpdateFeedResponse,
} from '@app/feed';
import { FeedService } from '@app/feed/feed.service';
import { NotiService } from '@app/noti/noti.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Feed')
@Controller('feed')
export class FeedLambdaController {
  constructor(
    private readonly feedService: FeedService,
    private readonly notiService: NotiService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) { }
  
  /**
   * 피드 작성 시 피드 종류 정보입니다. 한글이름, 영어이름, 아이콘 url, 피드 자동완성 텍스트입니다.
   */
  @ApiOkResponse({
    description:
      '피드 작성 시 피드 종류 정보입니다. 한글이름, 영어이름, 아이콘 url, 피드 자동완성 텍스트입니다.',
    schema: {
      example: {
        data: [
          {
            name_kr: '물',
            name_en: 'water',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_water.svg',
            auto_content: '시원한 물을 뿌려주었다!',
          },
          {
            name_kr: '통풍',
            name_en: 'air',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_air.svg',
            auto_content: '신선한 공기로 숨 돌리게 해주었다!',
          },
          {
            name_kr: '분무',
            name_en: 'spray',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_spray.svg',
            auto_content: '잎이 건조하지 않게 분무를 해주었다!',
          },
          {
            name_kr: '영양제',
            name_en: 'nutrition',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_nutrition.svg',
            auto_content: '집에 먹을게 없어서 비료를 넣어주었다!',
          },
          {
            name_kr: '분갈이',
            name_en: 'repot',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_repot.svg',
            auto_content: '새 집으로 이사해주었다!',
          },
          {
            name_kr: '가지치기',
            name_en: 'prune',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_prune.svg',
            auto_content: '이쁘게 다듬었다!',
          },
          {
            name_kr: '오늘의모습',
            name_en: 'today',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_today.svg',
            auto_content: '오늘의 모습은 아주 이쁘다!',
          },
          {
            name_kr: '잎',
            name_en: 'leaf',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_leaf.svg',
            auto_content: '잎이 멋지다!',
          },
          {
            name_kr: '꽃',
            name_en: 'flower',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_flower.svg',
            auto_content: '꽃이 이쁘다!',
          },
          {
            name_kr: '열매',
            name_en: 'fruit',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_fruit.svg',
            auto_content: '열매가 맺혔다!',
          },
          {
            name_kr: '기타',
            name_en: 'etc',
            icon_uri:
              'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/icon_etc.svg',
            auto_content: '어떤 일이 있었다!',
          },
        ],
        success: true,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('kind')
  async getFeedKind() {
    return await this.feedService.getFeedKindInfo();
  }

  /**
   * 주어진 정보로 식물 피드를 생성합니다. 피드 종류는 enum 값이며, 식물 id는 필수입니다.
   * 유저의 id로 피드의 소유자를 설정합니다.
   */
  @ApiBadRequestResponse({
    description: '유효하지 않은 요청입니다.',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiCreatedResponse({
    description: '피드를 성공적으로 생성함',
    type: CreateFeedResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(ParseDateInBodyPipe) createFeedDto: CreateFeedDto,
    @Req() req,
  ) {
    createFeedDto.owner = req.user.id;
    return await this.feedService.create(createFeedDto);
  }

  /**
   * 피드 목록을 조회합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '피드들의 정보를 성공적으로 가져옴',
    type: GetFeedsResponse,
  })
  @ApiQuery({
    name: 'include_noti',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'plant_id',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'kind',
    enum: FeedKind,
    required: false,
  })
  @ApiQuery({
    name: 'publish_date',
    type: Date,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: '최대 개수이고, 기본값은 100000입니다. optional입니다.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description:
      '조회할 피드의 시작 위치입니다. 기본값은 0으로 설정되어있고, optional입니다.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'order_by',
    description:
      '피드 발행 시간에 따른 정렬기준으로, 기본은 내림차순입니다. optional입니다.',
    enum: GetFeedOrderBy,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('plant_id') plant_id: string,
    @Query('kind') kind: FeedKind,
    @Query('publish_date') publish_date: string,
    @Query('limit', new DefaultValuePipe(100000), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query(
      'order_by',
      new DefaultValuePipe(GetFeedOrderBy.DESC),
      new ParseEnumPipe(GetFeedOrderBy),
    )
    order_by: GetFeedOrderBy,
    @Req() req,
  ) {
    if (publish_date)
      publish_date = new Date(
        DateStrFormat(new Date(publish_date)),
      ).toISOString();
    const query: GetFeedQuery = queryParser(
      {
        owner: req.user.id,
        plant_id,
        kind,
        publish_date,
        limit,
        offset,
        order_by,
      },
      GetFeedQuery,
    );
    const feeds = await this.feedService.findAll(query);
    const result = feeds.map((feed) => ({
      viewType: FeedViewKind.feed,
      viewObject: feed,
    }));
    return {
      result,
      count: result.length,
      next_offset: offset + result.length,
    };
  }

  /**
   * 피드 화면에서 보여줄 목록을 조회합니다. 자신의 피드를 조회합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '피드들의 정보를 성공적으로 가져옴',
    type: GetFeedsWithNotiResponse,
  })
  @ApiQuery({
    name: 'plant_id',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: '최대 개수이고, 기본값은 100000입니다. optional입니다.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description:
      '조회할 피드의 시작 위치입니다. 기본값은 0으로 설정되어있고, optional입니다.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'order_by',
    description:
      '피드 발행 시간에 따른 정렬기준으로, 기본은 내림차순입니다. optional입니다.',
    enum: GetFeedOrderBy,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('list')
  async findAllWithNoti(
    @Query('plant_id') plant_id: string,
    @Query('limit', new DefaultValuePipe(100000), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query(
      'order_by',
      new DefaultValuePipe(GetFeedOrderBy.DESC),
      new ParseEnumPipe(GetFeedOrderBy),
    )
    order_by: GetFeedOrderBy,
    @Req() req,
  ) {
    const query: GetFeedQuery = queryParser(
      {
        owner: req.user.id,
        plant_id,
        limit,
        offset,
        order_by,
      },
      GetFeedQuery,
    );
    const feeds = await this.feedService.findAll(query);
    const notis = await this.notiService.findAll({
      owner: req.user.id.toString(),
    });
    let result: any = notis.map((noti) => ({
      viewType: FeedViewKind.noti,
      viewObject: noti,
    }));
    result = result.concat(
      feeds.map((feed) => ({
        viewType: FeedViewKind.feed,
        viewObject: feed,
      })),
    );
    return {
      result,
      count: result.length,
      next_offset: offset + result.length,
    };
  }

  /**
   * 피드 하나를 아이디로 조회합니다.
   */
  @ApiNotFoundResponse({
    description: '피드를 찾을 수 없습니다.',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '피드의 정보를 성공적으로 가져옴',
    type: GetFeedResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.feedService.findOne(id);
  }

  /**
   * 피드를 주어진 정보로 수정합니다. 피드 소유자가 요청 유저의 아이디와 동일해야 합니다.
   */
  @ApiNotFoundResponse({
    description: '피드를 찾을 수 없습니다.',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBadRequestResponse({
    description: '유효하지 않은 요청입니다.',
    type: BadRequestResponse,
  })
  @ApiForbiddenResponse({
    description: '유저가 피드를 수정할 권한이 없습니다.',
    type: ForbiddenResponse,
  })
  @ApiOkResponse({
    description: '피드을 성공적으로 수정함',
    type: UpdateFeedResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(FeedByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFeedDto: UpdateFeedDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.feedService.update(id, updateFeedDto);
  }

  /**
   * 주어진 아이디의 피드를 삭제합니다. 피드의 소유자가 요청 유저의 아이디와 동일해야 합니다.
   */
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: '유저가 피드를 삭제할 권한이 없습니다.',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: '피드를 찾을 수 없습니다.',
    type: NotFoundResponse,
  })
  @ApiOkResponse({
    description: '피드를 성공적으로 삭제함',
    type: SuccessResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(FeedByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.feedService.deleteOne(id);
  }
}
