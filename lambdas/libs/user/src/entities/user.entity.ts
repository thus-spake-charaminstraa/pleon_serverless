import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type UserDocument = User & Document;

const transform = (doc, ret) => {
  delete ret._id;
  delete ret.__v;
  return ret;
};

@Schema({
  toObject: {
    transform,
  },
  toJSON: {
    transform,
  },
})
export class User {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, default: '' })
  thumbnail: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
