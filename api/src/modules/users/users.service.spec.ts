import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { UsersService } from './users.service'

describe('UsersService', () => {
	let service: UsersService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<UsersService>(UsersService)
	})

	describe('findById', () => {
		it('should return a user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
			})

			const result = await service.findById('user-id')

			expect(result).toHaveProperty('id', 'user-id')
		})
	})

	describe('updateById', () => {
		it('should update a user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
			})

			mockPrisma.user.update.mockResolvedValue({
				id: 'user-id',
				name: 'Updated User',
				email: 'user@example.com',
				avatarUrl: 'https://picture-1',
			})

			const result = await service.updateById('user-id', {
				name: 'Updated User',
			})

			expect(result).toHaveProperty('name', 'Updated User')
		})
		it('should throw if user not found', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null)

			await expect(
				service.updateById('invalid-id', { name: 'Updated User' }),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if email conflict', async () => {
			mockPrisma.user.findUnique
				.mockResolvedValueOnce({
					id: 'user-id',
					email: 'user@example.com',
				})
				.mockResolvedValueOnce({
					id: 'other-id',
					email: 'user-1@example.com',
				})

			await expect(
				service.updateById('user-id', { email: 'user-1@example.com' }),
			).rejects.toThrow(ConflictException)
		})
	})

	describe('changePassword', () => {
		it('should update password successfully', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
				passwordHash: await bcrypt.hash('OldPass1.', 10),
			})

			mockPrisma.user.update.mockResolvedValue({})

			const result = await service.changePassword('user-id', {
				currentPassword: 'OldPass1.',
				newPassword: 'NewPass1.',
				confirmPassword: 'NewPass1.',
			})

			expect(result).toHaveProperty('message')
			expect(result).toHaveProperty('success', true)
		})
		it('should throw if user not found', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null)

			await expect(
				service.changePassword('invalid-id', {
					currentPassword: 'OldPass1.',
					newPassword: 'NewPass1.',
					confirmPassword: 'NewPass1.',
				}),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if passwords do not match', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-id',
				passwordHash: await bcrypt.hash('OldPass1.', 10),
			})

			await expect(
				service.changePassword('user-id', {
					currentPassword: 'OldPass1.',
					newPassword: 'NewPass1.',
					confirmPassword: 'WrongPass1.',
				}),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('delete', () => {
		it('should delete a user', async () => {
			mockPrisma.user.delete.mockResolvedValue({
				id: 'user-id',
			})

			const result = await service.delete('user-id')

			expect(result).toHaveProperty('message')
			expect(result).toHaveProperty('success', true)
		})
	})
})
