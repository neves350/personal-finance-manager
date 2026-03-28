import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { RecurringController } from './recurring.controller'
import { RecurringDetectionService } from './recurring-detection.service'
import { RecurringScheduler } from './recurring.scheduler'
import { RecurringService } from './recurring.service'

@Module({
	imports: [PrismaModule],
	controllers: [RecurringController],
	providers: [RecurringService, RecurringScheduler, RecurringDetectionService],
	exports: [RecurringDetectionService],
})
export class RecurringModule {}
