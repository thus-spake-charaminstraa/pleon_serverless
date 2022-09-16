import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type UserDocument = User & Document;

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

  @Prop({
    required: true,
    default:
      'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/default_user_img.png',
  })
  thumbnail: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('device_tokens', {
  ref: 'DeviceToken',
  localField: 'id',
  foreignField: 'owner',
});
