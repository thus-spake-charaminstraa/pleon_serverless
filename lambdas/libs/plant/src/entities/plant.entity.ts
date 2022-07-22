import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema()
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
  location: string;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);
