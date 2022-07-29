import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { DateStrFormat } from '../utils';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.adopt_date)
      value.adopt_date = DateStrFormat(new Date(value.adopt_date));
    if (value.publish_date)
      value.publish_date = DateStrFormat(new Date(value.publish_date));
    if (value.timestamp)
      value.timestamp = DateStrFormat(new Date(value.timestamp));
    return value;
  }
}
