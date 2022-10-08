import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { PlantDoctorAnalysisModule } from './plant-doctor-analysis.module';
import { DiagnosisService } from '@app/plant/services/diagnosis.service';

let app: INestApplicationContext;

async function bootstrap() {
  return await NestFactory.createApplicationContext(PlantDoctorAnalysisModule);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!app) {
    app = await bootstrap();
  }
  const body = JSON.parse(event.body);
  const result: any[][] = body.result;
  const plantSymptoms = result.map((imageResult) => {
    return imageResult.map((detectedSymptom) => {
      return detectedSymptom.category;
    });
  });
  const diagnosisService = app.get(DiagnosisService);
  const ret = await diagnosisService.analysis(plantSymptoms, body.plant_id);
  return {
    data: JSON.stringify(ret),
    success: true,
  };
};
