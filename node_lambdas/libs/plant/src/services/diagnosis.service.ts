import { CommonService } from '@app/common/common.service';
import { NotiKind } from '@app/noti';
import { NotiService } from '@app/noti/noti.service';
import { Injectable } from '@nestjs/common';
import { CreateDiagnosisDto } from '../dto/diagnosis.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisRepository } from '../repositories/diagnosis.repository';
import { PlantCause } from '../resources/plant-cause';
import { PlantSymptom } from '../resources/plant-symptom';

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
    private readonly notiService: NotiService,
  ) {
    super(diagnosisRepository);
    this.symptomInfoMap = PlantSymptom;
  }

  async analysis(symptomsInImages: number[][], plantId?: string) {
    const plantCause = Object.assign({}, PlantCause);
    const plantSymptomAndCause = [];
    Object.keys(plantCause).forEach((key) => {
      plantCause[key].count = 0;
    });
    symptomsInImages.forEach((symptomsInOneImage) => {
      symptomsInOneImage.forEach((symptomIndex) => {
        if (!plantSymptomAndCause[this.symptomInfoMap[symptomIndex].symptom]) {
          plantSymptomAndCause.push({
            ...this.symptomInfoMap[symptomIndex],
            cause: [],
          });
        }
        const cause = this.symptomInfoMap[symptomIndex].cause;
        cause.forEach((c) => {
          plantCause[c].count += 1;
        });
      });
    });
    const sortedPlantCause = Object.values(plantCause).sort(
      (a: any, b: any) => {
        return b.count - a.count;
      },
    );
    const plantCauseRet = [];
    let maxCnt = 0;
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
    plantSymptomAndCause.forEach((symptomAndCause) => {
      symptomAndCause.cause = plantCauseRet
        .map((cause) => {
          if (cause.symptom.some((s) => symptomAndCause.symptom === s)) {
            return cause.cause;
          } else return undefined;
        })
        .filter((c) => c);
    });
    return {
      symptoms: plantSymptomAndCause,
      causes: plantCauseRet,
    };
  }
}