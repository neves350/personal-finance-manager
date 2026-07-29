import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { mockConfig } from 'src/__mocks__/config.mock'
import { mockJwt } from 'src/__mocks__/jwt.mock'
import { mockMail } from 'src/__mocks__/mail.mock'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { mockUsers } from 'src/__mocks__/users.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

jest.mock('google-auth-library', () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: jest.fn().mockResolvedValue({
			getPayload: jest.fn().mockReturnValue({
				sub: 'google-id',
				email: 'user@example.com',
				name: 'John Doe',
				picture: 'https://pic.url',
			}),
		}),
	})),
}))

describe('AuthService', () => {
	let service: AuthService

	beforeEach(async () => {
		// generate the module of AuthService
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: PrismaService, useValue: mockPrisma },
				{ provide: JwtService, useValue: mockJwt },
				{ provide: ConfigService, useValue: mockConfig },
				{ provide: UsersService, useValue: mockUsers },
				{ provide: MailService, useValue: mockMail },
			],
		}).compile()

		service = module.get<AuthService>(AuthService)
	})

	describe('register', () => {
		it('should sign up an user', async () => {
			// no user exists
			mockPrisma.user.findUnique.mockResolvedValue(null)

			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					user: {
						create: jest.fn().mockResolvedValue({
							id: 'user-id',
							email: 'user@example.com',
						}),
					},
					category: {
						createMany: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			const result = await service.register({
				name: 'John Doe',
				email: 'user@example.com',
				password: 'User26.',
			})

			expect(result).toHaveProperty('tokens')
		})
	})

	describe('login', () => {
		it('should sign in an user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
				email: 'user@example.com',
				passwordHash: await bcrypt.hash('User26.', 10),
			})

			const result = await service.login({
				email: 'user@example.com',
				password: 'User26.',
			})

			expect(result).toHaveProperty('tokens')
		})
	})

	describe('googleAuth', () => {
		it('should authenticate an existing Google user', async () => {
			mockPrisma.user.findFirst.mockResolvedValue({
				id: 'user-id',
				email: 'user@example.com',
				googleId: 'google-id',
			})

			const result = await service.googleAuth('mock-credential')

			expect(result).toHaveProperty('tokens')
		})
	})

	describe('refresh', () => {
		it('should return new tokens', async () => {
			mockJwt.verify.mockReturnValue({
				sub: 'user-id',
				email: 'user@example.com',
			})

			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
				email: 'user@example.com',
			})

			const result = await service.refresh('mock-refresh-token')

			expect(result).toHaveProperty('accessToken')
			expect(result).toHaveProperty('refreshToken')
		})

		it('should throw if user not found', async () => {
			mockJwt.verify.mockReturnValue({ sub: 'invalid-id' })
			mockPrisma.user.findUnique.mockResolvedValue(null)

			await expect(service.refresh('mock-refresh-token')).rejects.toThrow(
				UnauthorizedException,
			)
		})
	})

	describe('getProfile', () => {
		it('should return user profile', async () => {
			mockUsers.findById.mockResolvedValue('user-id')

			const user = await service.getProfile('user-id')

			expect(user).toBe('user-id')
		})
	})

	describe('requestPasswordRecover', () => {
		it('should send an e-mail if exists', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
				email: 'user@example.com',
			})

			mockPrisma.token.create.mockResolvedValue({
				code: 'ABC12',
				id: 'user-id',
			})

			mockMail.sendPasswordResetEmail.mockResolvedValue({
				email: 'user@example.com',
				token: 'recovery-code',
				name: 'John Doe',
			})

			const token = await service.requestPasswordRecover('user@example.com')

			expect(token).toHaveProperty('message')
		})
	})

	describe('resetPassword', () => {
		it('should reset user password', async () => {
			mockPrisma.token.findUnique.mockResolvedValue({
				code: 'ABC12',
				type: 'PASSWORD_RECOVER',
				createdAt: new Date(),
				userId: 'user-id',
			})

			mockPrisma.$transaction.mockResolvedValue([{}, {}])

			const result = await service.resetPassword({
				code: 'ABC12',
				newPassword: 'NewPass1.',
			})

			expect(result).toHaveProperty('message')
		})
	})
})
