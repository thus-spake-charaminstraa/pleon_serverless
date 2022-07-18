import { ForbiddenException, Injectable } from '@nestjs/common';
import { Plant } from '@app/plant';
import { User } from '@app/user';

type T = Plant;

class EntityPolicy {
  cannotModify(user: User, resource: T): void {
    if (user.id.toString() !== resource.owner.toString()) {
      throw new ForbiddenException('리소스를 수정할 권한이 없습니다.');
    };
  }
}

@Injectable()
export class CaslAbilityFactory {
  createForEntity(): EntityPolicy {
    return new EntityPolicy();
  }
}
