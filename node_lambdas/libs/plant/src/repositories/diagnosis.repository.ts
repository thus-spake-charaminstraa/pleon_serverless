import { Injectable } from '@nestjs/common';
import { CommonRepository } from '@app/common/common.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diagnosis, DiagnosisDocument } from '../entities/diagnosis.entity';
import { CreateDiagnosisDto } from '../dto/diagnosis.dto';

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

  async findAll(query: any) {
    return await this.diagnosisModel.find(query).populate('plant').exec();
  }
}
