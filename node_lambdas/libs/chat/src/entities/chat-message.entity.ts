import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

const toObjectOptions = {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

@Schema({
  toJSON: toObjectOptions,
  toObject: toObjectOptions,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class ChatMessage {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'ChatRoom' })
  chat_room_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'User' })
  owner: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
