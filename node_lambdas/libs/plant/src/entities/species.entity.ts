import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';
import { PlantDifficulty, PlantHumidity, PlantLight } from '../types/plant-env.type';

export type SpeciesDocument = Species & Document;

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

  @Prop({ required: true, type: [String] })
  proper_light: PlantLight[];

  @Prop({ required: true, type: [String] })
  proper_humidity: PlantHumidity[];

  @Prop({ required: true })
  benefit: string;

  @Prop({ required: true })
  blight: string;

  @Prop({ required: true, enum: PlantDifficulty, type: String })
  managing_difficulty: PlantDifficulty;

  @Prop({ required: false, default: 'no' })
  poison: string;

  @Prop({ required: false })
  tip: string;

  @Prop({ required: true })
  class_label: number;

  @Prop({ required: true })
  proper_watering_other: number;

  @Prop({ required: true })
  proper_watering_winter: number;
}

export const SpeciesSchema = SchemaFactory.createForClass(Species);
