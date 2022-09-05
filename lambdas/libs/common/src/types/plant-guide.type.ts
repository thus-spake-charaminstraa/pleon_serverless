import { GetUserDto } from '@app/user/dto';
import { Schema as mongoSchema } from 'mongoose';

export type plantInfoForGuide = {
  id: mongoSchema.Types.ObjectId;

  species: string;

  owner: mongoSchema.Types.ObjectId;
  
  name: string;

  user: GetUserDto;
};
