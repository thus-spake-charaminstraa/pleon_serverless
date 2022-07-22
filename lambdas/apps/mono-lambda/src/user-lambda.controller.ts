import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserService, CreateUserDto, CreateUserResDto } from '@app/user';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtCheckGuard } from '@app/auth';
import { PhonePipe } from '@app/common/pipes';
import {
  BadRequestResponse,
  UnauthorizedResponse,
  CreateUserResponse,
} from '@app/common/dto';

@ApiTags('User')
@Controller('user')
export class UserLambdaController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) { }

  /*
   * 새 유저를 생성합니다. 이미 존재하는 폰번호로 생성하려고 하면 BadRequestException을 던집니다.
   */
  @ApiBadRequestResponse({
    description: '중복된 전화번호입니다.',
    type: BadRequestResponse,
  })
  @ApiOkResponse({
    description: '유저 생성을 성공합니다.',
    type: CreateUserResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 verify token입니다.',
    type: UnauthorizedResponse,
  })
  @ApiHeader({
    name: 'Authorization',
    description:
      'Bearer token으로 /auth/verify-sms에서 받은 token을 전달합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtCheckGuard)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @Body(PhonePipe) createUserDto: CreateUserDto,
    @Req() req,
  ): Promise<CreateUserResDto> {
    return await this.userService.create(createUserDto, req.user.sub);
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(id, updateUserDto);
  // }
}
