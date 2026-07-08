import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	Patch,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
	ApiChangePasswordResponses,
	ApiDeleteResponses,
	ApiFindByIdResponses,
	ApiUpdateByIdResponses,
} from 'src/common/decorators/api-responses/users-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get user by id',
		description: 'Retrieves the authenticated user data by ID.',
	})
	@ApiFindByIdResponses()
	async findById(@Param('id') id: string, @CurrentUser() user) {
		// verify if user can access own data
		if (id !== user.userId)
			throw new ForbiddenException('You can only access your own data')

		return await this.usersService.findById(id)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update user by id',
		description: 'Updates the authenticated user information.',
	})
	@ApiUpdateByIdResponses()
	async updateById(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
		@CurrentUser() user,
	) {
		if (id !== user.userId) {
			throw new ForbiddenException('You can only access your own data')
		}

		return this.usersService.updateById(id, updateUserDto)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/password')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update user password by id',
		description: 'Updates the authenticated user password.',
	})
	@ApiChangePasswordResponses()
	async changePassword(
		@Param('id') id: string,
		@Body() changePasswordDto: ChangePasswordDto,
		@CurrentUser() user,
	) {
		if (id !== user.userId)
			throw new ForbiddenException('You can only access your own data')

		return this.usersService.changePassword(id, changePasswordDto)
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete user by id',
		description: 'Deletes the authenticated user account.',
	})
	@ApiDeleteResponses()
	async delete(@Param('id') id: string, @CurrentUser() user) {
		if (id !== user.userId)
			throw new ForbiddenException('You can only access your own data')

		return this.usersService.delete(id)
	}
}
