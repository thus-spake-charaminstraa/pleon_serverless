import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  BadRequestResponse,
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '@app/common/dto/error-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
import {
  ParseDateInBodyPipe,
  ParseMonthPipe,
  ParseYearPipe,
} from '@app/common/pipes/parse-date.pipe';
import { DateStrFormat } from '@app/common/utils/date-parser';
import { queryParser } from '@app/common/utils/query-parser';
import {
  CreateFeedResponse,
  FeedViewKind,
  GetFeedCalendarResponse,
  GetFeedResponse,
  GetFeedsResponse,
  GetFeedsWithOtherResponse,
  UpdateFeedResponse,
} from '@app/feed/dto/feed-success-response.dto';
import {
  CreateFeedDto,
  GetFeedAndDiagnosisQuery,
  GetFeedCalendarQuery,
  GetFeedOrderBy,
  UpdateFeedDto,
} from '@app/feed/dto/feed.dto';
import { FeedService } from '@app/feed/feed.service';
import { FeedByParamsIdInterceptor } from '@app/feed/interceptors/feedById.interceptor';
import { FeedKindInfos } from '@app/feed/resources/feed-kind-infos';
import { FeedKind } from '@app/feed/types/feed-kind.type';
import { DiagnosisService } from '@app/plant/services/diagnosis.service';
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
    private readonly diagnosisService: DiagnosisService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * 피드 작성 시 피드 종류 정보입니다. 한글이름, 영어이름, 아이콘 url, 피드 자동완성 텍스트입니다.
   */
  @ApiOkResponse({
    description:
      '피드 작성 시 피드 종류 정보입니다. 한글이름, 영어이름, 아이콘 url, 피드 자동완성 텍스트입니다.',
    schema: {
      example: {
        data: FeedKindInfos,
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
   * 피드 캘린더 목록을 조회합니다.
   */
  @ApiOkResponse({
    description: '피드 캘린더 조회 성공',
    type: GetFeedCalendarResponse,
  })
  @ApiQuery({
    name: 'plant_id',
    description: '캘린더를 조회할 식물의 id',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'year',
    description: '캘린더를 조회할 년도, (예: 2020)',
    type: Date,
    required: false,
  })
  @ApiQuery({
    name: 'month',
    description: '캘린더를 조회할 달, (1~12)로 주세요',
    type: Date,
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('calendar')
  async findFeedCalendar(
    @Query('plant_id') plant_id: string,
    @Query('year', ParseIntPipe, ParseYearPipe) year: number,
    @Query('month', ParseIntPipe, ParseMonthPipe) month: number,
  ) {
    const start = new Date(year, 0, 1);
    start.setMonth(month - 2);
    const end = new Date(year, 0, 31);
    end.setMonth(month);
    const query: GetFeedCalendarQuery = queryParser(
      { plant_id, year, month, start, end },
      GetFeedCalendarQuery,
    );
    return await this.feedService.findAllAndGroupBy(query);
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
    let start: Date, end: Date;
    if (publish_date) {
      publish_date = new Date(
        DateStrFormat(new Date(publish_date)),
      ).toISOString();
      start = new Date(publish_date);
      end = new Date(publish_date);
      end.setDate(end.getDate() + 1);
    }
    const feedQuery: GetFeedAndDiagnosisQuery = queryParser(
      {
        owner: req.user.id,
        plant_id,
        kind,
        publish_date,
        limit,
        offset,
        order_by,
      },
      GetFeedAndDiagnosisQuery,
    );
    const feeds = await this.feedService.findAll(feedQuery);
    const result = feeds.data.map((feed) => ({
      viewType: 'feed',
      viewObject: feed,
    }));
    return {
      result,
      count: feeds.data.length,
      next_offset: offset + feeds.data.length,
      isLast: feeds.totalCount <= offset + feeds.data.length,
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
    type: GetFeedsWithOtherResponse,
  })
  @ApiQuery({
    name: 'plant_id',
    type: String,
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
  @Get('list')
  async findAllWithNoti(
    @Query('plant_id') plant_id: string,
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
    let start: Date = undefined,
      end: Date = undefined;
    if (publish_date) {
      publish_date = new Date(
        DateStrFormat(new Date(publish_date)),
      ).toISOString();
      start = new Date(publish_date);
      end = new Date(publish_date);
      end.setDate(end.getDate() + 1);
    }
    const feedQuery: GetFeedAndDiagnosisQuery = queryParser(
      {
        owner: req.user.id,
        plant_id,
        publish_date,
        limit,
        offset,
        order_by,
        start,
        end,
      },
      GetFeedAndDiagnosisQuery,
    );
    console.log(feedQuery);
    const feeds: any = await this.feedService.findAll(feedQuery);
    const result: any[] = feeds.data.map((item: any) => {
      return {
        viewType: !!item.symptoms ? FeedViewKind.diagnosis : FeedViewKind.feed,
        viewObject: item,
      };
    });
    const count = feeds.data.length,
      next_offset = offset + feeds.data.length;
    const isLast = feeds.totalCount <= next_offset;
    return {
      result,
      count,
      next_offset,
      isLast,
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
