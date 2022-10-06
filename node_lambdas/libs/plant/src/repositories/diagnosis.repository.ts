import { Injectable } from '@nestjs/common';
import { CommonRepository } from '@app/common/common.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Diagnosis } from '../entities/diagnosis.entity';
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
    private readonly diagnosisRepository: DiagnosisRepository,
  ) {
    super(diagnosisRepository);
  }
}
