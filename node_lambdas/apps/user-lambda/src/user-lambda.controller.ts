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
  CreateDeviceTokenDto,
  UpdateDeviceTokenDto,
} from '@app/user';
import { JwtAuthGuard, JwtCheckGuard } from '@app/auth';
import { CaslAbilityFactory, PhonePipe } from '@app/common';

@Controller()
export class UserLambdaController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/token')
  async createToken(
    @Param('id') id: string,
    @Body() createDeviceTokenDto: CreateDeviceTokenDto,
  ) {
    createDeviceTokenDto.owner = id;
    return await this.deviceTokenService.create(createDeviceTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/token/:token')
  async updateToken(
    @Param('token') token: string,
    @Body() updateDeviceTokenDto: UpdateDeviceTokenDto,
    @Req() req,
  ) {
    const id = req.user.id;
    const ability = this.caslAbilityFactory.createForUser(req.user);
    ability.checkCanModify(id);
    return await this.deviceTokenService.updateTimestampByToken(
      token,
      updateDeviceTokenDto,
    );
  }
}
