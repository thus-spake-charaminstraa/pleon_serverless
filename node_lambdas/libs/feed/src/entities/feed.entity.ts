import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongoSchema } from 'mongoose';
import { FeedKind } from '../types/feed-kind.type';

export type FeedDocument = Feed & Document;

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
export class Feed {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  owner: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Schedule' })
  schedule_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  publish_date: Date;

  @Prop({ required: true, enum: FeedKind, type: String })
  kind: FeedKind;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  image_url: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);

FeedSchema.virtual('plant', {
  ref: 'Plant',
  localField: 'plant_id',
  foreignField: 'id',
  justOne: true,
});

FeedSchema.virtual('comments', {
  ref: 'Comment',
  localField: 'id',
  foreignField: 'feed_id',
});

FeedSchema.virtual('user', {
  ref: 'User',
  localField: 'owner',
  foreignField: 'id',
  justOne: true,
});
