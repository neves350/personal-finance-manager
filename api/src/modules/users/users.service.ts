import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { UpdateUserDto } from './dtos/update-user.dto'

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				avatarUrl: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	}

	async updateById(id: string, updateUserDto: UpdateUserDto) {
		// check if user emails already exists
		const existingUser = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) throw new NotFoundException('User not found')

		// check if email has trying to be updated not exists
		if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
			const emailExists = await this.prisma.user.findUnique({
				where: {
					email: updateUserDto.email,
				},
			})

			if (emailExists)
				throw new ConflictException(
					'This email already exists, please choose a new one',
				)
		}

		// update user profile
		return this.prisma.user.update({
			where: {
				id,
			},
			data: updateUserDto,
		})
	}

	async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
		const { currentPassword, newPassword, confirmPassword } = changePasswordDto

		const existingUser = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) throw new NotFoundException('User not found')

		// newPassword is equal to the confirmPassword
		if (newPassword !== confirmPassword) {
			throw new BadRequestException(
				'New password and confirmation do not match',
			)
		}

		// newPassword needs to be different from currentPassword
		if (currentPassword === newPassword) {
			throw new BadRequestException(
				'New password must be different from current password',
			)
		}

		if (!existingUser.passwordHash)
			throw new UnauthorizedException('This account uses Google sign-in')

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			existingUser.passwordHash,
		)

		if (!isPasswordValid) throw new UnauthorizedException('Invalid password')

		// creates new password hash
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		await this.prisma.user.update({
			where: { id },
			data: {
				passwordHash: hashedPassword,
				updatedAt: new Date(),
			},
		})

		return {
			message: 'Password changed successfully',
			success: true,
		}
	}

	async delete(id: string) {
		await this.prisma.user.delete({
			where: { id },
		})

		return {
			message: 'Profile deleted successfully',
			success: true,
		}
	}
}
