import { Injectable } from '@nestjs/common';
import { CommonRepository } from '@app/common/common.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diagnosis, DiagnosisDocument } from '../entities/diagnosis.entity';
import { CreateDiagnosisDto, GetDiagnosisQuery } from '../dto/diagnosis.dto';

@Injectable()
export class DiagnosisRepository extends CommonRepository<
  Diagnosis,
  CreateDiagnosisDto,
  any,
  any
> {
  constructor(
    @InjectModel(Diagnosis.name)
    private readonly diagnosisModel: Model<DiagnosisDocument>,
  ) {
    super(diagnosisModel);
  }

  async findAll(query: GetDiagnosisQuery) {
    if (query.start && query.end) {
      query.created_at = { $gte: query.start, $lte: query.end };
    }
    return await this.diagnosisModel.find(query).populate('plant').exec();
  }

  async findOne(id: string) {
    return await this.diagnosisModel.findOne({ id }).populate('plant').exec();
  }
}
