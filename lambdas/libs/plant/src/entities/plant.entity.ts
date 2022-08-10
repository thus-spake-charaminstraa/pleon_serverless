import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';
import { PlantAir, PlantLight } from '../types';

export type PlantDocument = Plant & Document;

const transform = (doc, ret) => {
  delete ret.__v;
  delete ret._id;
  ret.d_day =
    Math.round(
      (Date.now() - new Date(ret.adopt_date).getTime()) /
      (1000 * 60 * 60 * 24),
    ) + 1;
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
export class Plant {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, ref: 'User' })
  owner: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  species: string;

  @Prop({ required: true })
  adopt_date: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true })
  light: PlantLight;

  @Prop({ required: true })
  air: PlantAir;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);
