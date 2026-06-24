import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { NotificationModule } from '../notification/notification.module'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'

@Module({
	imports: [PrismaModule, NotificationModule],
	controllers: [TransactionController],
	providers: [TransactionService],
})
export class TransactionModule {}
