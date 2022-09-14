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
  Delete,
} from '@nestjs/common';
import {
  UserService,
  CreateUserDto,
  CreateUserResDto,
  UpdateUserDto,
  DeviceTokenService,
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
import { JwtAuthGuard, JwtCheckGuard } from '@app/auth';
import { PhonePipe } from '@app/common/pipes';
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@app/common/dto';
import { CaslAbilityFactory } from '@app/common';
import { CreateUserResponse, UpdateUserResponse } from '@app/user/dto';
import { CreateDeviceTokenDto } from '@app/user/dto/device-token.dto';

@ApiTags('User')
@Controller('user')
export class UserLambdaController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly deviceTokenService: DeviceTokenService
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

  /**
   * 유저 정보를 수정합니다. 유저 자신만 수정할 수 있습니다. 썸네일을 수정할 때는 삭제하고 싶으면 빈 스트링으로 보내면 됩니다.
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    const id = req.user.id;
    const ability = this.caslAbilityFactory.createForUser(req.user);
    ability.checkCanModify(id);
    return this.userService.update(id, updateUserDto);
  }


  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.deleteOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post(':id/token')
  async createToken(@Param('id') id: string, @Body() createDeviceTokenDto: CreateDeviceTokenDto) {
    createDeviceTokenDto.owner = id;
    return await this.deviceTokenService.create(createDeviceTokenDto);
  }
}
