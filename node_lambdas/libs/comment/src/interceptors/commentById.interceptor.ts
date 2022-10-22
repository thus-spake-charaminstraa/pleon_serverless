import { CommentRepository } from '@app/comment/comment.repository';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CommentByParamsIdInterceptor implements NestInterceptor {
  constructor(private readonly commentRepository: CommentRepository) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const entity = await this.commentRepository.findOne(id);
    if (!entity) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }
    request.entity = entity;
    return next.handle();
  }
}
