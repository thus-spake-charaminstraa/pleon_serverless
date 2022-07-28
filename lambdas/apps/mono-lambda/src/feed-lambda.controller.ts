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
import { FeedByParamsIdInterceptor } from '@app/common/interceptors/feedById.interceptor';
import { CreateFeedDto, FeedService, UpdateFeedDto } from '@app/feed';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
  async create(@Body() createFeedDto: CreateFeedDto, @Req() req) {
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    return await this.feedService.findAll();
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
    type: SuccessResponse
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
