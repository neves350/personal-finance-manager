import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './infrastructure/db/prisma.module'
import { MailModule } from './infrastructure/mail/mail.module'
import { AuthModule } from './modules/auth/auth.module'
import { CustomThrottlerGuard } from './modules/auth/guards/custom-throttler.guard'
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
		ThrottlerModule.forRoot([
			{ name: 'strict', ttl: 60_000, limit: 5 }, // ttl - ms (60_000 = 60s)
			{ name: 'standard', ttl: 60_000, limit: 30 },
			{ name: 'lenient', ttl: 60_000, limit: 60 },
		]),
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
	providers: [
		{
			// for the throttler intercepts any request
			provide: APP_GUARD,
			useClass: CustomThrottlerGuard,
		},
	],
})
export class AppModule {}
