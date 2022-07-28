import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongoSchema } from 'mongoose';
import { ScheduleKind } from '@app/common/types';

export type ScheduleDocument = Schedule & Document;

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
export class Schedule {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'Plant' })
  plant_id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  kind: ScheduleKind;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
