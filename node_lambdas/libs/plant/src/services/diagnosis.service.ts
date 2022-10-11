import { CommonService } from '@app/common/common.service';
import { NotiKind } from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateDiagnosisDto } from '../dto/diagnosis.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisRepository } from '../repositories/diagnosis.repository';
import { PlantCause } from '../resources/plant-cause';
import { PlantSymptom } from '../resources/plant-symptom';
import { PlantRepository } from '@app/plant';

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
    @Inject(forwardRef(() => PlantRepository))
    private readonly PlantRepository: PlantRepository,
    private readonly notiService: NotiService,
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
        if (symptom.category <= 2) return;
        if (
          !plantSymptomAndCause[this.symptomInfoMap[symptom.category].symptom]
        ) {
          plantSymptomAndCause[this.symptomInfoMap[symptom.category].symptom] =
            {
              ...this.symptomInfoMap[symptom.category],
              cause: [],
              ...symptom,
            };
        }
        const cause = this.symptomInfoMap[symptom.category].cause;
        cause.forEach((c) => {
          plantCause[c].count += 1;
        });
      });
    });
    if (Object.values(plantSymptomAndCause).length === 0) {
      throw new BadRequestException('No symptoms detected');
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
    if (plantId) {
      const opposeCause = {
        water_lack: -1,
        water_excess: -1,
        temperature_lack: -1,
        temperature_excess: -1,
        nutrition_lack: -1,
        nutrition_excess: -1,
      };
      plantCauseRet.forEach((cause: any, idx: number) => {
        if (cause.cause in Object.keys(opposeCause))
          opposeCause[cause.cause] = idx;
      });
      const plantNotis = await this.notiService.findNotisByPlantId(plantId);
      if (opposeCause.water_lack >= 0 && opposeCause.water_excess >= 0) {
        if (plantNotis.some((noti) => noti.kind === NotiKind.water)) {
          plantCauseRet.splice(opposeCause.water_excess, 1);
        } else plantCauseRet.splice(opposeCause.water_lack, 1);
      }
      if (
        opposeCause.nutrition_lack >= 0 &&
        opposeCause.nutrition_excess >= 0
      ) {
        if (plantNotis.some((noti) => noti.kind === NotiKind.nutrition)) {
          plantCauseRet.splice(opposeCause.nutrition_excess, 1);
        } else plantCauseRet.splice(opposeCause.nutrition_lack, 1);
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
        plant_id: plantId,
        symptoms: Object.values(plantSymptomAndCause),
        causes: plantCauseRet,
      });
      console.log(ret);
    }
    return {
      symptoms: Object.values(plantSymptomAndCause) as any,
      causes: plantCauseRet,
      plant: plantId ? await this.PlantRepository.findOne(plantId) : null,
    };
  }
}
