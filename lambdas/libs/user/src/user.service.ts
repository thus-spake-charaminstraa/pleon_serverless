import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, CreateUserResDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { AuthService } from '@app/auth';

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
    const user = await this.userRepository.create({ ...createUserDto, phone });
    const token = await this.authService.login(user);
    return {
      user,
      token,
    };
  }

  async checkPhoneDuplicate(phone: string): Promise<boolean> {
    const user = await this.userRepository.findByPhone(phone);
    return !!user;
  }
}
