import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CommentService } from '@app/comment/comment.service';
import {
  CreateCommentResponse,
  GetCommentResponse,
  GetCommentsResponse,
  UpdateCommentResponse,
} from '@app/comment/dto/comment-success-response.dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '@app/comment/dto/comment.dto';
import { CommentByParamsIdInterceptor } from '@app/comment/interceptors/commentById.interceptor';
import { CommentAuthorKind } from '@app/comment/types/comment-author-kind.type';
import { CaslAbilityFactory } from '@app/common/casl-ability.factory';
import {
  BadRequestResponse,
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '@app/common/dto/error-response.dto';
import { SuccessResponse } from '@app/common/dto/success-response.dto';
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

@ApiTags('Comment')
@Controller('comment')
export class CommentLambdaController {
  constructor(
    private readonly commentService: CommentService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * 댓글을 생성합니다. 댓글은 유저와 유저가 소유한 식물이 생성할 수 있으며,
   * author_kind를 통해 유저가 생성한 것인지, 소유한 식물이 생성한 것인지 구분합니다.
   * 해당 값에 맞춰서 user_id, plant_id를 설정하여 생성해야 합니다.
   */
  @ApiBadRequestResponse({
    description: '잘못된 요청입니다.',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다.',
    type: UnauthorizedResponse,
  })
  @ApiCreatedResponse({
    description: '성공적으로 댓글을 생성하였습니다.',
    type: CreateCommentResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    if (createCommentDto.author_kind == CommentAuthorKind.user) {
      createCommentDto.user_id = req.user.id.toString();
    }
    return await this.commentService.create(createCommentDto);
  }

  /**
   * 특정 피드에 대한 댓글 목록을 가져옵니다.
   */
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '댓글 목록을 가져옵니다.',
    type: GetCommentsResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('feed/:feed_id')
  async findAllInFeed(@Req() req, @Param('feed_id') feedId: string) {
    return await this.commentService.findAllInFeed(feedId);
  }

  /**
   * 특정 댓글에 대한 정보를 가져옵니다.
   */
  @ApiNotFoundResponse({
    description: '존재하지 않는 댓글입니다.',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다.',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: '댓글을 하나 가져옵니다.',
    type: GetCommentResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentService.findOne(id);
  }

  /**
   * 특정 댓글을 수정합니다.
   */
  @ApiNotFoundResponse({
    description: '존재하지 않는 댓글입니다.',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다.',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: '수정 권한이 없습니다.',
    type: ForbiddenResponse,
  })
  @ApiOkResponse({
    description: '댓글을 성공적으로 수정하였습니다.',
    type: UpdateCommentResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(CommentByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.commentService.update(id, updateCommentDto);
  }

  /**
   * 댓글을 삭제합니다.
   */
  @ApiNotFoundResponse({
    description: '존재하지 않는 댓글입니다.',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다.',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: '삭제 권한이 없습니다.',
    type: ForbiddenResponse,
  })
  @ApiOkResponse({
    description: '댓글이 삭제되었습니다.',
    type: SuccessResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(CommentByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.commentService.deleteOne(id);
  }
}
