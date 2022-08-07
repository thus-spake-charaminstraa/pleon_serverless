import { ForbiddenException, Injectable } from '@nestjs/common';
import { Plant } from '@app/plant';
import { User } from '@app/user';

type T = Plant;

class EntityPolicy {
  checkCanModify(user: User, resource: T): void {
    if (user.id.toString() !== resource.owner.toString()) {
      throw new ForbiddenException('리소스를 수정할 권한이 없습니다.');
    };
  }
}

class UserPolicy {
  constructor(
    private user: User,
  ) { }
  checkCanModify(id: string): void {
    if (this.user.id.toString() !== id) {
      throw new ForbiddenException('리소스를 수정할 권한이 없습니다.');
    }
  }
}

@Injectable()
export class CaslAbilityFactory {
  createForEntity(): EntityPolicy {
    return new EntityPolicy();
  }
  createForUser(user: User): UserPolicy {
    return new UserPolicy(user);
  }
}
