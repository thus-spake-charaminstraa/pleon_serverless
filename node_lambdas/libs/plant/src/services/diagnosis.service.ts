import { CommonService } from '@app/common/common.service';
import { NotiKind } from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateDiagnosisDto } from '../dto/diagnosis.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisRepository } from '../repositories/diagnosis.repository';
import { PlantCause } from '../resources/plant-cause';
import { PlantSymptom } from '../resources/plant-symptom';
import { v4 as uuid4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { PlantService } from '@app/plant/services/plant.service';
import { SpeciesService } from '@app/plant/services/species.service';
import { Plant } from '../entities/plant.entity';
import { PlantLight } from '../types';

@Injectable()
export class DiagnosisService extends CommonService<
  Diagnosis,
  CreateDiagnosisDto,
  any,
  any
> {
  symptomInfoMap: any;
  constructor(
    private readonly diagnosisRepository: DiagnosisRepository,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    @Inject(forwardRef(() => SpeciesService))
    private readonly speciesService: SpeciesService,
    @Inject(forwardRef(() => NotiService))
    private readonly notiService: NotiService,
    private readonly configService: ConfigService,
  ) {
    super(diagnosisRepository);
    this.symptomInfoMap = PlantSymptom;
  }

  async analysis(symptomsInImages: any[][], plantId?: string) {
    const plantCause = Object.assign({}, PlantCause);
    const plantSymptomAndCause = {};
    Object.keys(plantCause).forEach((key) => {
      plantCause[key].count = 0;
    });
    symptomsInImages.forEach((symptomsInOneImage) => {
      symptomsInOneImage.forEach((symptom) => {
        if (symptom.category <= 2 || symptom.category == 8) return;
        if (
          !plantSymptomAndCause[this.symptomInfoMap[symptom.category].symptom]
        ) {
          plantSymptomAndCause[this.symptomInfoMap[symptom.category].symptom] =
            {
              ...this.symptomInfoMap[symptom.category],
              cause: [],
              ...symptom,
              image_key: 'plant-doctor-' + uuid4() + '.jpg',
              origin_image_url: symptom.image_url,
            };
        }
        const cause = this.symptomInfoMap[symptom.category].cause;
        cause.forEach((c) => {
          plantCause[c].count += 1;
        });
      });
    });
    if (Object.values(plantSymptomAndCause).length === 0) {
      return {
        symptoms: [],
        causes: [],
        plant: plantId ? await this.plantService.findOne(plantId) : null,
      };
    }
    const sortedPlantCause = Object.values(plantCause).sort(
      (a: any, b: any) => {
        return b.count - a.count;
      },
    );
    const plantCauseRet = [];
    let maxCnt = 1;
    sortedPlantCause.forEach((cause: any) => {
      if (maxCnt <= cause.count) {
        maxCnt = cause.count;
        plantCauseRet.push(cause);
      }
    });

    let plant: Plant = null;
    if (plantId) {
      plant = await this.plantService.findOne(plantId);

      const causeIdx: any = {};
      plantCauseRet.forEach((cause: any, idx: number) => {
        causeIdx[cause.cause] = idx;
      });
      const [plantNotis, plantSpecies] = await Promise.all([
        this.notiService.findNotisByPlantId(plantId),
        this.speciesService.findOneByName(plant.species),
      ]);
      const causes = Object.keys(causeIdx);
      if (causes.includes('water_lack') && causes.includes('water_excess')) {
        if (plantNotis.some((noti) => noti.kind === NotiKind.water)) {
          plantCauseRet.splice(causeIdx.water_excess, 1);
        } else plantCauseRet.splice(causeIdx.water_lack, 1);
      }
      if (
        causes.includes('nutrition_lack') &&
        causes.includes('nutrition_excess')
      ) {
        if (plantNotis.some((noti) => noti.kind === NotiKind.nutrition)) {
          plantCauseRet.splice(causeIdx.nutrition_excess, 1);
        } else plantCauseRet.splice(causeIdx.nutrition_lack, 1);
      }
      if (causes.includes('light_excess')) {
        if (
          plantSpecies.proper_light.includes(PlantLight.bright) ||
          (plantSpecies.proper_light.includes(PlantLight.half_bright) &&
            plant.light != PlantLight.bright) ||
          (plantSpecies.proper_light.includes(PlantLight.dark) &&
            plant.light == PlantLight.dark)
        )
          plantCauseRet.splice(causeIdx.light_excess, 1);
      }
    }
    Object.values(plantSymptomAndCause).forEach((symptomAndCause: any) => {
      symptomAndCause.cause = plantCauseRet
        .map((cause) => {
          if (cause.symptom.some((s) => symptomAndCause.symptom === s)) {
            return cause.cause;
          } else return undefined;
        })
        .filter((c) => c);
    });

    if (plantId) {
      const ret = await this.create({
        owner: plant.owner.toString(),
        plant_id: plantId,
        symptoms: Object.values(plantSymptomAndCause).map((s: any) => {
          return {
            ...s,
            image_url:
              'https://' +
              this.configService.get<string>('AWS_S3_BUCKET_NAME') +
              '.s3.amazonaws.com/' +
              s.image_key,
          };
        }),
        causes: plantCauseRet,
        image_urls: Object.values(plantSymptomAndCause).map((s: any) => {
          return (
            'https://' +
            this.configService.get<string>('AWS_S3_BUCKET_NAME') +
            '.s3.amazonaws.com/' +
            s.image_key
          );
        }),
      });
    }

    return {
      symptoms: Object.values(plantSymptomAndCause) as any,
      causes: plantCauseRet,
      plant,
    };
  }
}
