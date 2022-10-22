import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserResDto,
  UpdateUserDto,
} from '../dto/user.dto';
import { UserRepository } from '../repositories/user.repository';
import { TokenResDto } from '@app/auth/dto/token.dto';
import { AuthService } from '@app/auth/auth.service';
import { parsePhoneNumber } from 'libphonenumber-js';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    phone: string,
  ): Promise<CreateUserResDto> {
    if (await this.checkPhoneDuplicate(phone)) {
      throw new BadRequestException('이미 존재하는 휴대전화번호입니다.');
    }
    if (phone == parsePhoneNumber('010-1111-1111', 'KR').format('E.164')) {
      const res = { user: new User(), token: new TokenResDto() };
      return res;
    } // for testing
    const user = await this.userRepository.create({ ...createUserDto, phone });
    const ret = await this.authService.login(user);
    return ret;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.thumbnail === '')
      updateUserDto.thumbnail =
        'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/default_user_img.png';
    const ret = await this.userRepository.update(id, updateUserDto);
    if (!ret) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return ret;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async deleteOne(id: string): Promise<void> {
    await this.userRepository.deleteOne(id);
  }

  async checkPhoneDuplicate(phone: string): Promise<boolean> {
    const user = await this.userRepository.findByPhone(phone);
    return !!user;
  }
}
