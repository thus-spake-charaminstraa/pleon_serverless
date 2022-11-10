import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongoSchema } from 'mongoose';
import { NotiKind } from '../types/noti-kind.type';

export type NotiDocument = Noti & Document;

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
export class Noti {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  owner: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Feed' })
  feed_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Comment' })
  comment_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: String, enum: NotiKind })
  kind: NotiKind;

  @Prop({ required: true, type: Boolean, default: false })
  is_confirmed: Boolean;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const NotiSchema = SchemaFactory.createForClass(Noti);

NotiSchema.virtual('feed', {
  ref: 'Feed',
  localField: 'feed_id',
  foreignField: 'id',
  justOne: true,
});

NotiSchema.virtual('comment', {
  ref: 'Comment',
  localField: 'comment_id',
  foreignField: 'id',
  justOne: true,
});

NotiSchema.virtual('plant', {
  ref: 'Plant',
  localField: 'plant_id',
  foreignField: 'id',
  justOne: true,
});
