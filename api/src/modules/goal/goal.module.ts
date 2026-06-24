import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { NotificationModule } from '../notification/notification.module'
import { GoalController } from './goal.controller'
import { GoalService } from './goal.service'
import { HeatmapService } from './helpers/heatmap.helper'
import { SavingsService } from './helpers/savings.helper'
import { SpendingLimitService } from './helpers/spending-limit.helper'

@Module({
	imports: [PrismaModule, NotificationModule],
	controllers: [GoalController],
	providers: [
		GoalService,
		SavingsService,
		SpendingLimitService,
		HeatmapService,
	],
})
export class GoalModule {}
