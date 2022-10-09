import { ApiProperty } from '@nestjs/swagger';

export class Symptom {
  @ApiProperty()
  symptom: string;

  @ApiProperty()
  symptom_en: string;

  @ApiProperty()
  symptom_ko: string;

  @ApiProperty()
  cause: string[];
}

export class Cause {
  @ApiProperty()
  cause: string;

  @ApiProperty()
  cause_ko: string;

  @ApiProperty()
  cause_en: string;

  @ApiProperty()
  guide: string;

  @ApiProperty()
  symptom: string[];
}
