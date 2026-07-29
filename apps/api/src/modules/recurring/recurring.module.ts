import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { RecurringController } from './recurring.controller'
import { RecurringScheduler } from './recurring.scheduler'
import { RecurringService } from './recurring.service'
import { RecurringDetectionService } from './recurring-detection.service'

@Module({
	imports: [PrismaModule],
	controllers: [RecurringController],
	providers: [RecurringService, RecurringScheduler, RecurringDetectionService],
	exports: [RecurringDetectionService],
})
export class RecurringModule {}
