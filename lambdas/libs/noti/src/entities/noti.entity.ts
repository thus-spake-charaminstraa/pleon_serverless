import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as mongoSchema } from 'mongoose';
import { NotiKind } from '@app/common/types';

export type NotiDocument = Noti & Document;

@Schema({
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
  },
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
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

  @Prop({ required: true, ref: 'Plant', default: "" })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  kind: NotiKind;
}

export const NotiSchema = SchemaFactory.createForClass(Noti);
