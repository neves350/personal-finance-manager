import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import {
	ApiCreateUserResponses,
	ApiLoginUserResponses,
	ApiLogoutResponses,
	ApiProfileUserResponses,
	ApiRefreshResponses,
	ApiRequestPasswordRecoverResponses,
	ApiResetPasswordResponses,
} from 'src/common/decorators/api-responses/auth-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { AuthService } from './auth.service'
import { LoginUserDto, RegisterUserDto } from './dtos/auth.dto'
import { GoogleAuthDto } from './dtos/google-auth.dto'
import { ForgotPasswordDto } from './dtos/request-password-recover.dto'
import { ResetPasswordDto } from './dtos/reset-password.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('Auth')
@Controller()
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
	) {}

	@Post('users')
	@ApiOperation({
		summary: 'Create a new account',
		description: 'Creates a new user account with email and password.',
	})
	@ApiCreateUserResponses()
	async register(
		@Body() registerUserDto: RegisterUserDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { user, tokens } = await this.authService.register(registerUserDto)

		// send the token to client
		res.cookie('accessToken', tokens.accessToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 15 * 60 * 1000, // 15 min
		})
		res.cookie('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		return {
			user,
			message: 'Register successful',
		}
	}

	@Post('sessions/password')
	@ApiOperation({
		summary: 'Authenticate with e-mail & password',
		description: 'Authenticates user with email and password credentials.',
	})
	@ApiLoginUserResponses()
	async login(
		@Body() loginUserDto: LoginUserDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { user, tokens } = await this.authService.login(loginUserDto)

		// send the token to client
		res.cookie('accessToken', tokens.accessToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 15 * 60 * 1000, // 15 min
		})
		res.cookie('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		return {
			user,
			message: 'Login successful',
		}
	}

	@Post('sessions/google')
	@ApiOperation({
		summary: 'Authenticate with google',
		description: 'Authenticates user with google credentials.',
	})
	async googleAuth(
		@Body() dto: GoogleAuthDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { user, tokens } = await this.authService.googleAuth(dto.credential)

		// send the token to client
		res.cookie('accessToken', tokens.accessToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 15 * 60 * 1000, // 15 min
		})
		res.cookie('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		return {
			user,
			message: 'Google authentication successful',
		}
	}

	@Post('refresh')
	@ApiOperation({
		summary: 'Refresh access token',
		description:
			'Validates the refresh token and issues new access and refresh tokens.',
	})
	@ApiRefreshResponses()
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshToken = req.cookies.refreshToken // get refreshToken from cookies

		if (!refreshToken)
			throw new UnauthorizedException('Refresh token not found')

		// validate refreshToken
		const { accessToken, refreshToken: newRefreshToken } =
			await this.authService.refresh(refreshToken)

		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 15 * 60 * 1000, // 15 min
		})
		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: this.configService.getOrThrow<boolean>('USE_SECURE_COOKIES'),
			sameSite: this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true' ? 'none' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		return {
			message: 'Token refreshed successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get current user profile',
		description: 'Returns authenticated user profile information.',
	})
	@ApiProfileUserResponses()
	async getProfile(@CurrentUser() user) {
		return this.authService.getProfile(user.userId)
	}

	@Post('password/recover')
	@ApiOperation({
		summary: 'Request password recovery',
		description: 'Sends password recovery code to user email.',
	})
	@ApiRequestPasswordRecoverResponses()
	async requestPasswordRecover(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.requestPasswordRecover(forgotPasswordDto.email)
	}

	@Post('password/reset')
	@ApiOperation({
		summary: 'Reset password with recovery code',
		description: 'Resets user password using the code sent via email.',
	})
	@ApiResetPasswordResponses()
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(resetPasswordDto)
	}

	@Post('logout')
	@ApiOperation({
		summary: 'Logout user',
		description:
			'Clears authentication cookies. Works even with expired tokens.',
	})
	@ApiLogoutResponses()
	async logout(@Res({ passthrough: true }) res: Response) {
		const isSecure = this.configService.getOrThrow('USE_SECURE_COOKIES') === 'true'
		const clearOptions = {
			httpOnly: true,
			secure: isSecure,
			sameSite: isSecure ? 'none' as const : 'lax' as const,
		}
		res.clearCookie('accessToken', clearOptions)
		res.clearCookie('refreshToken', clearOptions)

		return {
			message: 'Logout successful',
		}
	}
}
