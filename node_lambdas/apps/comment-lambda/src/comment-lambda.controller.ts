import { JwtAuthGuard } from '@app/auth';
import {
  CommentService,
  CreateCommentDto,
  UpdateCommentDto,
  CommentByParamsIdInterceptor,
} from '@app/comment';
import { CaslAbilityFactory } from '@app/common';
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
import { CommentAuthorKind } from '@app/comment/types';

@Controller()
export class CommentLambdaController {
  constructor(
    private readonly commentService: CommentService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('comment')
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    if (createCommentDto.author_kind == CommentAuthorKind.user) {
      createCommentDto.user_id = req.user.id.toString();
    }
    return await this.commentService.create(createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('feed/:feed_id')
  async findAllInFeed(@Req() req, @Param('feed_id') feedId: string) {
    return await this.commentService.findAllInFeed(feedId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentService.findOne(id);
  }

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
