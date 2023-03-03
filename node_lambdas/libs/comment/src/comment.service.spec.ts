import { NotiService } from '@app/noti/noti.service';
import { DeviceTokenService } from '@app/user/services/device-token.service';
import { UserService } from '@app/user/services/user.service';
import { Test } from '@nestjs/testing';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { Schema } from 'mongoose';
import { Feed } from '@app/feed/entities/feed.entity';
import { Plant } from '@app/plant/entities/plant.entity';
import { User } from '@app/user/entities/user.entity';
import { CommentRes, CreateCommentDto } from './dto/comment.dto';
import { DeviceToken } from '@app/user/entities/device-token.entity';
import { NotiKind } from '@app/noti/types/noti-kind.type';

describe('CommentService', () => {
  let commentService: CommentService;
  let commentRepository: CommentRepository;
  let notiService: NotiService;
  let deviceTokenService: DeviceTokenService;
  let userService: UserService;

  const comment_id = new Schema.Types.ObjectId('comment_id');
  const feed_id = new Schema.Types.ObjectId('feed_id');
  const plant_id = new Schema.Types.ObjectId('plant_id');
  const user_id = new Schema.Types.ObjectId('user_id');

  const createCommentDto = {
    ...new CreateCommentDto(),
    content: 'content',
    feed_id: feed_id.toString(),
    plant_id: plant_id.toString(),
    user_id: user_id.toString(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: NotiService,
          useValue: {
            sendPushNotiToMultiDevices: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: DeviceTokenService,
          useValue: {
            findAllByUserId: jest.fn(() => Promise.resolve()),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = moduleRef.get<CommentService>(CommentService);
    commentRepository = moduleRef.get<CommentRepository>(CommentRepository);
    notiService = moduleRef.get<NotiService>(NotiService);
    deviceTokenService = moduleRef.get<DeviceTokenService>(DeviceTokenService);
    userService = moduleRef.get<UserService>(UserService);
  });

  describe('create', () => {
    let ret: Comment & CommentRes,
      deviceTokens: DeviceToken[],
      user: User,
      notiRet: any[],
      expectedComment: Comment & CommentRes,
      newCreateCommentDto: CreateCommentDto;

    beforeEach(() => {
      ret = {
        ...new Comment(),
        id: comment_id,
        content: 'content',
        feed: {
          ...new Feed(),
          id: feed_id,
          owner: user_id,
        },
        feed_id,
        plant: { ...new Plant(), id: plant_id },
        plant_id,
        user: new User(),
        user_id,
      };
      deviceTokens = [new DeviceToken()];
      user = { ...new User(), comment_push_noti: true };
      notiRet = [{ status: 'fulfilled' }, { status: 'fulfilled' }];
      expectedComment = {
        ...ret,
      };
      newCreateCommentDto = { ...createCommentDto };

      jest.spyOn(commentRepository, 'create').mockResolvedValue(ret);
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValue(expectedComment);
      jest
        .spyOn(deviceTokenService, 'findAllByUserId')
        .mockResolvedValue(deviceTokens);
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(notiService, 'sendPushNotiToMultiDevices')
        .mockResolvedValue(notiRet[0]);
      jest.spyOn(notiService, 'create').mockResolvedValue(null);
    });

    it('should create a new comment of user', async () => {
      const result = await commentService.create(newCreateCommentDto);
      expect(commentRepository.create).toHaveBeenCalledWith(
        newCreateCommentDto,
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith(ret.id.toString());
      expect(deviceTokenService.findAllByUserId).not.toHaveBeenCalled();
      expect(userService.findOne).not.toHaveBeenCalled();
      expect(notiService.sendPushNotiToMultiDevices).not.toHaveBeenCalled();
      expect(notiService.create).not.toHaveBeenCalled();
      expect(result).toEqual(ret);
    });

    it('should create a new comment of plant and send push noti', async () => {
      delete ret.user_id;
      jest.spyOn(commentRepository, 'create').mockResolvedValue(ret);
      const result = await commentService.create(newCreateCommentDto);
      expect(commentRepository.create).toHaveBeenCalledWith(
        newCreateCommentDto,
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith(ret.id.toString());
      expect(deviceTokenService.findAllByUserId).toHaveBeenCalledWith(
        expectedComment.feed.owner.toString(),
      );
      expect(userService.findOne).toHaveBeenCalledWith(
        expectedComment.feed.owner.toString(),
      );
      expect(notiService.sendPushNotiToMultiDevices).toHaveBeenCalled();
      expect(notiService.create).toHaveBeenCalledWith({
        owner: newCreateCommentDto.feed_id,
        content: `${expectedComment.plant.name}이 댓글을 달았어요!`,
        kind: NotiKind.comment,
        feed_id: expectedComment.feed?.id.toString(),
        comment_id: expectedComment.id.toString(),
        plant_id: expectedComment.plant?.id.toString(),
      });
      expect(result).toEqual(ret);
    });

    it('should create a new comment of plant and should not send push noti if user push noti setting is false', async () => {
      delete ret.user_id;
      user.comment_push_noti = false;

      jest.spyOn(commentRepository, 'create').mockResolvedValue(ret);

      const result = await commentService.create(newCreateCommentDto);

      expect(commentRepository.create).toHaveBeenCalledWith(
        newCreateCommentDto,
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith(ret.id.toString());

      expect(deviceTokenService.findAllByUserId).toHaveBeenCalledWith(
        expectedComment.feed.owner.toString(),
      );
      expect(userService.findOne).toHaveBeenCalledWith(
        expectedComment.feed.owner.toString(),
      );

      expect(notiService.sendPushNotiToMultiDevices).not.toHaveBeenCalled();
      expect(notiService.create).toHaveBeenCalledWith({
        owner: newCreateCommentDto.feed_id,
        content: `${expectedComment.plant.name}이 댓글을 달았어요!`,
        kind: NotiKind.comment,
        feed_id: expectedComment.feed?.id.toString(),
        comment_id: expectedComment.id.toString(),
        plant_id: expectedComment.plant?.id.toString(),
      });
      expect(result).toEqual(ret);
    });

    it('should ignore notiService errors', async () => {
      jest
        .spyOn(notiService, 'sendPushNotiToMultiDevices')
        .mockRejectedValueOnce(new Error());
      jest.spyOn(notiService, 'create').mockRejectedValueOnce(new Error());
      const result = await commentService.create(newCreateCommentDto);
      expect(result).toEqual(ret);
    });
  });
});
