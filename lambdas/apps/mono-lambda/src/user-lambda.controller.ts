import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Inject,
  forwardRef,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import {
  UserService,
  CreateUserDto,
  CreateUserResDto,
  UpdateUserDto,
} from '@app/user';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
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
  UpdateUserResponse,
  ForbiddenResponse,
} from '@app/common/dto';
import { CaslAbilityFactory } from '@app/common';

@ApiTags('User')
@Controller('user')
export class UserLambdaController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

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

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(id);
  // }

  /**
   * 유저 정보를 수정합니다. 유저 자신만 수정할 수 있습니다.
   */
  @ApiForbiddenResponse({
    description: '이 유저는 수정할 수 없습니다.',
    type: ForbiddenResponse,
  })
  @ApiUnauthorizedResponse({
    description: '유저 확인 실패',
    type: UnauthorizedResponse,
  })
  @ApiBadRequestResponse({
    description: '적절하지 않은 입력입니다.',
    type: BadRequestResponse,
  })
  @ApiOkResponse({
    description: '유저 정보를 성공적으로 수정합니다.',
    type: UpdateUserResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtCheckGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    ability.checkCanModify(id);
    return this.userService.update(id, updateUserDto);
  }
}
