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
    const parsedPhone = parsePhoneNumber(value.phone, 'KR').format('E.164');
    return {
      ...value,
      phone: parsedPhone,
    };
  }
}

interface PhoneBody {
  phone: string;
}