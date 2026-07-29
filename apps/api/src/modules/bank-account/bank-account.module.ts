import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { BankAccountController } from './bank-account.controller'
import { BankAccountService } from './bank-account.service'

@Module({
	imports: [PrismaModule],
	controllers: [BankAccountController],
	providers: [BankAccountService],
})
export class BankAccountModule {}
