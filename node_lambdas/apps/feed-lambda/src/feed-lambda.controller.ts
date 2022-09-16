import { JwtAuthGuard } from '@app/auth';
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
  CaslAbilityFactory,
  DateStrFormat,
  queryParser,
  ParseDateInBodyPipe,
} from '@app/common';
import { NotiService } from '@app/noti';
import {
  FeedByParamsIdInterceptor,
  FeedService,
  CreateFeedDto,
  FeedViewKind,
  GetFeedOrderBy,
  GetFeedQuery,
  UpdateFeedDto,
} from '@app/feed';
import { FeedKind } from '@app/feed/types';

@Controller()
export class FeedLambdaController {
  constructor(
    private readonly feedService: FeedService,
    private readonly notiService: NotiService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.feedService.findOne(id);
  }

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
