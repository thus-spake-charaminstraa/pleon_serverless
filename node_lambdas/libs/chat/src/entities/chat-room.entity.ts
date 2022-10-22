import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';
import { ChatRoomKind } from '../types/chat-room.type';

export type ChatRoomDocument = ChatRoom & Document;

const toObjectOptions = {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
  virtuals: true,
};

@Schema({
  toJSON: toObjectOptions,
  toObject: toObjectOptions,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class ChatRoom {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ChatRoomKind, type: String })
  kind: ChatRoomKind;

  @Prop({ required: true, ref: 'User' })
  participant_ids: mongoSchema.Types.ObjectId[];

  @Prop({ required: false, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({
    required: true,
    default:
      'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/default_user_img.png',
  })
  thumbnail: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
