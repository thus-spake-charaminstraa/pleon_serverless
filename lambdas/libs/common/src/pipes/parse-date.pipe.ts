import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { DateStrFormat } from '../utils';

@Injectable()
export class ParseDateInBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.adopt_date)
      value.adopt_date = DateStrFormat(new Date(value.adopt_date));
    if (value.publish_date)
      value.publish_date = DateStrFormat(new Date(value.publish_date));
    if (value.timestamp)
      value.timestamp = DateStrFormat(new Date(value.timestamp));
    else
      value = new Date(value);
    return value;
  }
}

@Injectable()
export class ParseMonthPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value < 1 || value > 12)
      throw new BadRequestException('잘못된 달입니다.');
    return value;
  }
}


@Injectable()
export class ParseYearPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value < 0)
      throw new BadRequestException('잘못된 년도입니다.');
    return value;
  }
}

