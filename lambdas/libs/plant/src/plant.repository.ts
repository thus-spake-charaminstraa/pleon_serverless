import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plant, PlantDocument } from './entities/plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantRepository {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
  ) {}

  async create(CreatePlantDto: CreatePlantDto): Promise<Plant> {
    const createdPlant = new this.plantModel(CreatePlantDto);
    return await createdPlant.save();
  }

  async findAll(): Promise<Plant[]> {
    return await this.plantModel.find().exec();
  }

  async findOne(id: string): Promise<Plant> {
    return await this.plantModel.findOne({ id }).exec();
  }

  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    return await this.plantModel
      .findOneAndUpdate({ id }, updatePlantDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return await this.plantModel.deleteOne({ id }).exec();
  }
}
