import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { TransferController } from './transfer.controller'
import { TransferScheduler } from './transfer.scheduler'
import { TransferService } from './transfer.service'

@Module({
	imports: [PrismaModule],
	controllers: [TransferController],
	providers: [TransferService, TransferScheduler],
})
export class TransferModule {}
