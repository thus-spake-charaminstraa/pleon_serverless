import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CommonService } from './common.service';

@Module({
  providers: [CommonService, CaslAbilityFactory],
  exports: [CommonService, CaslAbilityFactory],
})
export class CommonModule {}
