import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { CardController } from './card.controller'
import { CardService } from './card.service'

@Module({
	imports: [PrismaModule],
	controllers: [CardController],
	providers: [CardService],
})
export class CardModule {}
