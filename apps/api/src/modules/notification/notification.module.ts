import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { MailModule } from 'src/infrastructure/mail/mail.module'
import { NotificationController } from './notification.controller'
import { NotificationScheduler } from './notification.scheduler'
import { NotificationService } from './notification.service'

@Module({
	imports: [PrismaModule, MailModule],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationScheduler],
	exports: [NotificationService],
})
export class NotificationModule {}
