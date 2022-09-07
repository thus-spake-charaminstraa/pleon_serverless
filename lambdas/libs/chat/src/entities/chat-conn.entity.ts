import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type ChatConnDocument = ChatConn & Document;

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
export class ChatConn {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  user_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'ChatRoom' })
  chat_room_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  connection_id: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const ChatConnSchema = SchemaFactory.createForClass(ChatConn);
