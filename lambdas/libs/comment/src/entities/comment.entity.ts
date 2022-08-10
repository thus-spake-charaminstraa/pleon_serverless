import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Schema as mongoSchema } from 'mongoose';
import { CommentAuthorKind } from '../types';

export type CommentDocument = Comment & Document;

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
export class Comment {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'Feed' })
  feed_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'User' })
  user_id: mongoSchema.Types.ObjectId;

  @Prop({ required: false, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  author_kind: CommentAuthorKind;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual('owner').get(function () {
  return this.author_kind === CommentAuthorKind.user ? this.user_id : this.plant_id;
});

CommentSchema.virtual('plant', {
  ref: 'Plant',
  localField: 'plant_id',
  foreignField: 'id',
  justOne: true,
});

CommentSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: 'id',
  justOne: true,
});
