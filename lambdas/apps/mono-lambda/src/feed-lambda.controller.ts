import { JwtAuthGuard } from '@app/auth';
import { CaslAbilityFactory } from '@app/common';
import {
  BadRequestResponse,
  CreateFeedResponse,
  ForbiddenResponse,
  GetFeedResponse,
  GetFeedsResponse,
  NotFoundResponse,
  SuccessResponse,
  UnauthorizedResponse,
  UpdateFeedResponse,
} from '@app/common/dto';
import { FeedByParamsIdInterceptor } from '@app/common/interceptors';
import {
  CreateFeedDto,
  FeedService,
  GetFeedOrderBy,
  GetFeedQuery,
  UpdateFeedDto,
} from '@app/feed';
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
import { FeedKind } from '@app/common/types';
import { queryParser } from '@app/common/utils';
import { ParseDatePipe } from '@app/common/pipes';

@ApiTags('Feed')
@Controller('feed')
export class FeedLambdaController {
  constructor(
    private readonly feedService: FeedService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

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
  async create(@Body(ParseDatePipe) createFeedDto: CreateFeedDto, @Req() req) {
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
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'order_by',
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
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('order_by') order_by: GetFeedOrderBy,
    @Req() req,
  ) {
    if (publish_date) publish_date = new Date(publish_date).toISOString();
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
    const result = await this.feedService.findAll(query);
    return {
      result,
      count: result.length,
      next_offset: offset + result.length,
    }
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
  async delete(@Param('id') id: string, @Req() req) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.feedService.delete(id);
  }
}
