import { testHandler } from '../src/main';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplicationContext } from '@nestjs/common';
import { GuideNotiLambdaModule } from '../src/guide-noti-lambda.module';
import { UserService } from '@app/user/services/user.service';
import { PlantService } from '@app/plant/services/plant.service';
import { CreateUserDto } from '@app/user/dto/user.dto';
import {
  PlantAir,
  PlantDifficulty,
  PlantHumidity,
  PlantLight,
} from '@app/plant/types/plant-env.type';
import { User } from '@app/user/entities/user.entity';
import { SpeciesService } from '@app/plant/services/species.service';

describe('GuideNotiLambda (e2e)', () => {
  let app: TestingModule & INestApplicationContext,
    userService: UserService,
    plantService: PlantService,
    speciesService: SpeciesService,
    handler: any,
    newUser: User;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [GuideNotiLambdaModule],
    }).compile();
    userService = app.get(UserService);
    plantService = app.get(PlantService);
    speciesService = app.get(SpeciesService);

    handler = testHandler(app);

    const newUserDto: CreateUserDto = {
      nickname: 'test',
      phone: '010-1234-5678',
      email: 'test@test.com',
      kakao_id: 'test',
    };
    newUser = (await userService.create(newUserDto, '010-1234-5678')).user;

    await speciesService.create({
      name: 'test',
      scientific_name: 'test',
      english_name: 'test',
      plant_feature: 'test',
      water_description: 'test',
      managing_point: 'test',
      species_family: 'test',
      proper_temperature: 'test',
      proper_light: [PlantLight.bright],
      proper_humidity: [PlantHumidity.high],
      benefit: 'test',
      blight: 'test',
      managing_difficulty: PlantDifficulty.hard,
      poison: 'test',
      tip: 'test',
      class_label: 1,
      proper_watering_other: 1000000,
      proper_watering_winter: 1000000,
    });
    await plantService.create({
      name: 'test',
      owner: newUser.id.toString(),
      species: 'test',
      water_date: new Date('2021-01-01'),
      adopt_date: new Date('2021-01-01'),
      thumbnail: 'test.jpg',
      light: PlantLight.bright,
      air: PlantAir.yes,
    });
  });

  afterAll(async () => {
    await userService.deleteOne(newUser.id.toString());
    await plantService.deleteMany({});
    await speciesService.deleteMany({});
  });

  it('should return 200 and noti success', async () => {
    const event = {};
    const res = await handler(event, null, null);
    expect(res.statusCode).toBe(200);
    expect(res.body).toIncludeAnyMembers([
      { status: 'fulfilled', value: true },
      { status: 'fulfilled', value: false },
      { status: 'rejected', reason: expect.anything() },
    ]);
  });
});
