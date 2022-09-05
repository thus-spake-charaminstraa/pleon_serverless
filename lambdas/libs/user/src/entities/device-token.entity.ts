import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongoSchema } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

const toObjectOptions = {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

@Schema({
  toJSON: toObjectOptions,
  toObject: toObjectOptions,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class DeviceToken {
  @Prop({
    type: mongoSchema.Types.ObjectId,
    required: true,
    auto: true,
    unique: true,
  })
  id: mongoSchema.Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  owner: mongoSchema.Types.ObjectId;

  @Prop({ required: true })
  device_token: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
