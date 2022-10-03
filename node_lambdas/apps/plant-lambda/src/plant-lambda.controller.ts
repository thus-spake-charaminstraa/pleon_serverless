import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import {
  PlantByParamsIdInterceptor,
  PlantService,
  SpeciesService,
  CreatePlantApiDto,
  CreateSpeciesDto,
  GetPlantQuery,
  UpdatePlantDto,
} from '@app/plant';
import { JwtAuthGuard } from '@app/auth';
import {
  CaslAbilityFactory,
  ParseDateInBodyPipe,
  DateStrFormat,
  queryParser,
} from '@app/common';

@Controller()
export class PlantLambdaController {
  constructor(
    private readonly plantService: PlantService,
    private readonly speciesService: SpeciesService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('species')
  async findAllSpecies() {
    return await this.speciesService.findAllSpecies();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('species')
  async createSpecies(@Body() createSpeciesDto: CreateSpeciesDto) {
    return await this.speciesService.create(createSpeciesDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('plant')
  async create(
    @Body(ParseDateInBodyPipe) createPlantDto: CreatePlantApiDto,
    @Req() req,
  ) {
    createPlantDto.owner = req.user.id;
    const plant = await this.plantService.create(createPlantDto);
    return plant;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('plant')
  async findAll(@Query('owner') owner: string, @Req() req) {
    if (!owner) {
      owner = req.user.id.toString();
    }
    const query: GetPlantQuery = queryParser({ owner }, GetPlantQuery);
    return await this.plantService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.plantService.findOne(id);
  }

  @UseInterceptors(PlantByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ParseDateInBodyPipe) updatePlantDto: UpdatePlantDto,
    @Req() req,
  ) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.plantService.update(id, updatePlantDto);
  }

  @UseInterceptors(PlantByParamsIdInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req) {
    const ability = this.caslAbilityFactory.createForEntity();
    ability.checkCanModify(req.user, req.entity);
    return await this.plantService.deleteOne(id);
  }
}
