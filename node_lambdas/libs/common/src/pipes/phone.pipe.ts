import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { parsePhoneNumber } from 'libphonenumber-js';

@Injectable()
export class PhonePipe implements PipeTransform {
  transform(value: PhoneBody, metadata: ArgumentMetadata) {
    if (value.phone) {
      value.phone = parsePhoneNumber(value.phone, 'KR').format('E.164');
    }
    return value;
  }
}

interface PhoneBody {
  phone: string;
}
