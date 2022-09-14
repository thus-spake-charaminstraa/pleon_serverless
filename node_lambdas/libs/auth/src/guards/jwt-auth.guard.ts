import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtCheckGuard extends AuthGuard('check-jwt') {}

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {}
