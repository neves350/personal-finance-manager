import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { Request } from 'express'
import { Strategy } from 'passport-jwt'

// Extract JWT from cookies
const cookieExtractor = (req: Request): string | null => {
	return req?.cookies?.accessToken ?? null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
		})
	}

	async validate(payload: { sub: string; email: string }) {
		// Return goes to request.user
		return {
			userId: payload.sub,
			email: payload.email,
		}
	}
}
