import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer <token>
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
		})
	}

	async validate(payload: any) {
		// Return go to request.user
		return {
			userId: payload.sub,
			email: payload.email,
		}
	}
}
