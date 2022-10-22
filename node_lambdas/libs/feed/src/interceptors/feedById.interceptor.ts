import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FeedRepository } from '@app/feed/feed.repository';

@Injectable()
export class FeedByParamsIdInterceptor implements NestInterceptor {
  constructor(private readonly feedRepository: FeedRepository) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const entity = await this.feedRepository.findOne(id);
    if (!entity) {
      throw new NotFoundException('존재하지 않는 피드입니다.');
    }
    request.entity = entity;
    return next.handle();
  }
}
