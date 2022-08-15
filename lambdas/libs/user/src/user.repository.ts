import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findByPhone(phone: string): Promise<User> {
    return await this.userModel.findOne({ phone }).exec();
  }

  async findOne(id: string): Promise<User> {
    return await this.userModel.findOne({ id }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userModel
      .findOneAndUpdate({ id }, updateUserDto, { new: true })
      .exec();
  }

  async deleteOne(id: string): Promise<void> {
    await this.userModel.findOneAndDelete({ id }).exec();
  }
}
