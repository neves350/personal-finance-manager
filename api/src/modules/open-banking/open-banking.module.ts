import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { FindConnectionService } from './helpers/find-connection.helper'
import { OpenBankingController } from './open-banking.controller'
import { OpenBankingSyncService } from './open-banking-sync.service'
import { OpenBankingService } from './open-banking.service'
import { OpenBankingWebhookController } from './open-banking-webhook.controller'
import { SaltEdgeService } from './salt-edge.service'

@Module({
	imports: [PrismaModule, HttpModule],
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
