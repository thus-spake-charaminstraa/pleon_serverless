import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plant, PlantDocument } from '../entities/plant.entity';
import {
  CreatePlantDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '../dto/plant.dto';
import { CommonRepository } from '@app/common/common.repository';

@Injectable()
export class PlantRepository extends CommonRepository<
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  GetPlantQuery
> {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
  ) {
    super(plantModel);
  }

  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    const createdPlant = new this.plantModel({
      ...createPlantDto,
      adopt_date: new Date(createPlantDto.adopt_date).toISOString(),
    });
    return await createdPlant.save();
  }

  async findAll(query: GetPlantQuery): Promise<Plant[]> {
    return await this.plantModel.find(query).populate('user').exec();
  }

  async findAllInfo(): Promise<any[]> {
    return await this.plantModel
      .find()
      .select({ id: 1, owner: 1, species: 1, name: 1 })
      .populate({
        path: 'user',
        populate: ['device_tokens'],
      })
      .exec();
  }

  async findOne(id: string): Promise<Plant> {
    return await this.plantModel.findOne({ id }).populate('user').exec();
  }
}
