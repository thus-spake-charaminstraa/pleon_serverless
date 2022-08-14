import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';
import { PlantDifficulty, PlantHumidity, PlantLight } from '../types';

export type SpeciesDocument = Species & Document;

const transform = (doc, ret) => {
  delete ret.__v;
  delete ret._id;
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
export class Species {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  scientific_name: string;

  @Prop({ required: true })
  english_name: string;

  @Prop({ required: true })
  plant_feature: string;

  @Prop({ required: true })
  water_description: string;

  @Prop({ required: true })
  managing_point: string;

  @Prop({ required: true })
  species_family: string;

  @Prop({ required: true })
  proper_temperature: string;

  @Prop({ required: true })
  proper_light: PlantLight[];

  @Prop({ required: true })
  proper_humidity: PlantHumidity[];

  @Prop({ required: true })
  benefit: string;

  @Prop({ required: true })
  blight: string;

  @Prop({ required: true })
  managing_difficulty: PlantDifficulty;

  @Prop({ required: false, default: 'no' })
  poison: string;

  @Prop({ required: false })
  tip: string;
}

export const SpeciesSchema = SchemaFactory.createForClass(Species);
