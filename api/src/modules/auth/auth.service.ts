import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Categories } from 'prisma/categories'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { UsersService } from '../users/users.service'
import { LoginUserDto, RegisterUserDto } from './dtos/auth.dto'
import { ResetPasswordDto } from './dtos/reset-password.dto'
import { AuthEntity } from './entities/auth.entity'
import type { RegisterResponse } from './interfaces/register-response.interface'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private usersService: UsersService,
		private mailService: MailService,
		private configService: ConfigService,
	) {}

	async register(registerUserDto: RegisterUserDto): Promise<RegisterResponse> {
		const { name, email, password } = registerUserDto

		// check if user already exists
		const findUser = await this.prisma.user.findUnique({
			where: { email },
		})

		if (findUser) throw new ConflictException('User already exists!')

		const hashedPassword = await bcrypt.hash(password, 10)

		// creates new user
		const { user } = await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					name,
					email,
					passwordHash: hashedPassword,
				},
			})

			await tx.category.createMany({
				data: Categories.map((category) => ({
					title: category.title,
					icon: category.icon,
					type: category.type,
					isDefault: true,
					userId: user.id,
				})),
			})

			return { user }
		})

		const payload = {
			sub: user.id,
			email: user.email,
		}

		// generate jwt token
		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.getOrThrow<string>('JWT_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRE_IN'),
		} as JwtSignOptions)
		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE_IN'),
		} as JwtSignOptions)

		return {
			user,
			tokens: { accessToken, refreshToken },
		}
	}

	async login(loginUserDto: LoginUserDto): Promise<RegisterResponse> {
		const { email, password } = loginUserDto

		const user = await this.prisma.user.findUnique({
			where: { email },
		})

		if (!user) throw new UnauthorizedException('Invalid email')

		if (!user.passwordHash)
			throw new UnauthorizedException('This account uses Google sign-in')

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

		if (!isPasswordValid) throw new UnauthorizedException('Invalid password')

		const payload = {
			sub: user.id,
			email: user.email,
		}

		// generate jwt token
		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.getOrThrow<string>('JWT_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRE_IN'),
		} as JwtSignOptions)
		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE_IN'),
		} as JwtSignOptions)

		return {
			user,
			tokens: { accessToken, refreshToken },
		}
	}

	async refresh(refreshToken: string): Promise<AuthEntity> {
		const payload = this.jwtService.verify(refreshToken, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
		})

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
		})

		if (!user) throw new UnauthorizedException('User not found')

		const newPayload = {
			sub: user.id,
			email: user.email,
		}

		const accessToken = this.jwtService.sign(newPayload, {
			secret: this.configService.getOrThrow<string>('JWT_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRE_IN'),
		} as JwtSignOptions)
		const newRefreshToken = this.jwtService.sign(newPayload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE_IN'),
		} as JwtSignOptions)

		return { accessToken, refreshToken: newRefreshToken }
	}

	async getProfile(userId: string) {
		const user = await this.usersService.findById(userId)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	async requestPasswordRecover(email: string) {
		const userFromEmail = await this.prisma.user.findUnique({
			where: { email },
		})

		if (!userFromEmail)
			throw new UnauthorizedException(
				'If email exists, you will receive a recover link',
			)

		// Generate 5-character alphanumeric code
		const code = this.generateRecoveryCode()

		const token = await this.prisma.token.create({
			data: {
				type: 'PASSWORD_RECOVER',
				code,
				userId: userFromEmail.id,
			},
		})

		// Send e-mail with password recover code
		await this.mailService.sendPasswordResetEmail(
			userFromEmail.email,
			token.code,
			userFromEmail.name,
		)

		return {
			message: 'If email exists, you will receive a recover code',
		}
	}

	private generateRecoveryCode(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let code = ''
		for (let i = 0; i < 5; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		return code
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		const { code, newPassword } = resetPasswordDto

		const tokenFromCode = await this.prisma.token.findUnique({
			where: {
				code,
			},
			include: {
				user: true,
			},
		})

		if (!tokenFromCode || tokenFromCode.type !== 'PASSWORD_RECOVER') {
			throw new UnauthorizedException('Invalid code')
		}

		// Check if code is expired (1 hour)
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
		if (tokenFromCode.createdAt < oneHourAgo) {
			await this.prisma.token.delete({ where: { code } })
			throw new UnauthorizedException('Code expired')
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10)

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: {
					id: tokenFromCode.userId,
				},
				data: {
					passwordHash: hashedPassword,
				},
			}),
			this.prisma.token.delete({
				where: {
					code,
				},
			}),
		])

		return {
			message: 'Password reset successfully',
		}
	}
}
