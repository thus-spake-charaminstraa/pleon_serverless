import { FeedKind } from '@app/common/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongoSchema } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema({
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
  },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
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

  @Prop({ required: true })
  publish_date: Date;

  @Prop({ required: true })
  kind: FeedKind;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  image_url: string;

  @Prop({ required: true })
  comments: Array<mongoSchema.Types.ObjectId>;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);

FeedSchema.virtual('plant', {
  ref: 'Plant',
  localField: 'plant_id',
  foreignField: 'id',
  justOne: true,
});
