import { PlantAir, PlantLight } from '@app/common/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema({
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      ret.d_day =
        Math.round(
          (Date.now() - new Date(ret.adopt_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;
      return ret;
    },
  },
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      ret.d_day =
        Math.round(
          (Date.now() - new Date(ret.adopt_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;
      return ret;
    },
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
