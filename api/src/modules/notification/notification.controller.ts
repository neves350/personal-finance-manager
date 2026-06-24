import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { QueryNotificationDto } from './dtos/query-notification.dto'
import { NotificationService } from './notification.service'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all notifications (paginated)' })
	async findAll(
		@Query() query: QueryNotificationDto,
		@CurrentUser() user,
	) {
		return this.notificationService.findAll(user.userId, query)
	}
}
