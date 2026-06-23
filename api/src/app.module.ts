import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './infrastructure/db/prisma.module'
import { MailModule } from './infrastructure/mail/mail.module'
import { AuthModule } from './modules/auth/auth.module'
import { BankAccountModule } from './modules/bank-account/bank-account.module'
import { BudgetModule } from './modules/budget/budget.module'
import { CardModule } from './modules/card/card.module'
import { CategoryModule } from './modules/category/category.module'
import { ExportModule } from './modules/export/export.module'
import { GoalModule } from './modules/goal/goal.module'
import { NotificationModule } from './modules/notification/notification.module'
import { OpenBankingModule } from './modules/open-banking/open-banking.module'
import { RecurringModule } from './modules/recurring/recurring.module'
import { StatisticModule } from './modules/statistic/statistic.module'
import { TransactionModule } from './modules/transaction/transaction.module'
import { TransferModule } from './modules/transfer/transfer.module'
import { UsersModule } from './modules/users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
		ScheduleModule.forRoot(),
		AuthModule,
		UsersModule,
		PrismaModule,
		MailModule,
		CardModule,
		CategoryModule,
		TransactionModule,
		StatisticModule,
		ExportModule,
		GoalModule,
		BankAccountModule,
		TransferModule,
		RecurringModule,
		OpenBankingModule,
		BudgetModule,
		NotificationModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
