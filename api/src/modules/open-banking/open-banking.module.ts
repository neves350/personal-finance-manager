import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { FindConnectionService } from './helpers/find-connection.helper'
import { OpenBankingController } from './open-banking.controller'
import { OpenBankingService } from './open-banking.service'
import { SaltEdgeService } from './salt-edge.service'

@Module({
	imports: [PrismaModule, HttpModule],
	controllers: [OpenBankingController],
	providers: [OpenBankingService, SaltEdgeService, FindConnectionService],
	exports: [OpenBankingService, SaltEdgeService],
})
export class OpenBankingModule {}
