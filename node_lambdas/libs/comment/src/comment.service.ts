import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import {
  CreateCommentDto,
  GetCommentQuery,
  UpdateCommentDto,
} from './dto/comment.dto';
import { Comment } from '@app/comment/entities/comment.entity';
import { CommonService } from '@app/common/common.service';
import { NotiService } from '@app/noti/noti.service';
import { DeviceTokenService } from '@app/user/services/device-token.service';
import { NotiKind } from '@app/noti/types/noti-kind.type';
import { UserService } from '@app/user/services/user.service';

@Injectable()
export class CommentService extends CommonService<
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentQuery
> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly notiService: NotiService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly userService: UserService,
  ) {
    super(commentRepository);
  }

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const ret = await this.commentRepository.create(createCommentDto);
    const comment = await this.commentRepository.findOne(ret.id.toString());
    if (!ret.user_id) {
      const [deviceTokens, user] = await Promise.all([
        this.deviceTokenService.findAllByUserId(comment.feed.owner.toString()),
        this.userService.findOne(comment.feed.owner.toString()),
      ]);
      const notiRet = await Promise.all([
        user?.comment_push_noti
          ? this.notiService.sendPushNotiToMultiDevices(
              deviceTokens,
              '식물이 댓글을 달았어요!',
              `${comment.plant.name}: ` + ret.content,
            )
          : Promise.resolve(),
        this.notiService.create({
          owner: comment.feed.owner.toString(),
          content: `${comment.plant.name}이 댓글을 달았어요!`,
          kind: NotiKind.comment,
          feed_id: comment.feed?.id.toString(),
          comment_id: comment.id.toString(),
          plant_id: comment.plant?.id.toString(),
        }),
      ]);
      console.log(notiRet);
    }
    return ret;
  }

  async findAllInFeed(feedId: string): Promise<Comment[]> {
    return await this.commentRepository.findAllInFeed(feedId);
  }
}
