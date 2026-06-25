import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { RecurringModule } from '../recurring/recurring.module'
import { FindConnectionService } from './helpers/find-connection.helper'
import { OpenBankingController } from './open-banking.controller'
import { OpenBankingService } from './open-banking.service'
import { OpenBankingSyncService } from './open-banking-sync.service'
import { OpenBankingWebhookController } from './open-banking-webhook.controller'
import { SaltEdgeService } from './salt-edge.service'

@Module({
	imports: [PrismaModule, HttpModule, RecurringModule],
	controllers: [OpenBankingController, OpenBankingWebhookController],
	providers: [
		OpenBankingService,
		OpenBankingSyncService,
		SaltEdgeService,
		FindConnectionService,
	],
	exports: [OpenBankingService, OpenBankingSyncService, SaltEdgeService],
})
export class OpenBankingModule {}
