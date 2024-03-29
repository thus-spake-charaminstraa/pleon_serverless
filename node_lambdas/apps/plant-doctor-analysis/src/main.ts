import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { HttpException, INestApplicationContext } from '@nestjs/common';
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
  const plantSymptoms = result.filter((imageResult) => imageResult.length > 0);
  const diagnosisService = app.get(DiagnosisService);
  try {
    const ret = await diagnosisService.analysis(plantSymptoms, body.plant_id);
    ret.symptoms.forEach((s: any, index: number) => {
      delete s.score;
      delete s.category;
    });
    ret.causes.forEach((c: any) => {
      delete c.count;
    });
    console.log(ret);
    return {
      data: ret,
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      success: ret.symptoms.length > 0,
    };
  } catch (e: unknown) {
    let statusCode = e instanceof HttpException ? e.getStatus() : 500;
    const error =
      e instanceof HttpException
        ? e.getResponse()
        : { message: 'Internal server error' };
    return {
      error,
      statusCode,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      success: false,
    };
  }
};
