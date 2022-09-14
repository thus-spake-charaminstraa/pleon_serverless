import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlantRepository } from '@app/plant';

@Injectable()
export class PlantByParamsIdInterceptor implements NestInterceptor {
  constructor(
    private readonly plantRepository: PlantRepository) { }
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const entity = await this.plantRepository.findOne(id);
    if (!entity) {
      throw new NotFoundException('존재하지 않는 식물입니다.');
    }
    request.entity = entity;
    return next.handle();
  }
}

@Injectable()
export class PlantByBodyIdInterceptor implements NestInterceptor {
  constructor(private readonly plantRepository: PlantRepository) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.body.plant_id;
    const entity = await this.plantRepository.findOne(id);
    if (!entity) {
      throw new NotFoundException('존재하지 않는 식물입니다.');
    }
    request.entity = entity;
    return next.handle();
  }
}
