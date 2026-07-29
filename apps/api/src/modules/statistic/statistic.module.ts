import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/infrastructure/db/prisma.module'
import { CategoryService } from './helpers/category.helper'
import { TransactionFiltersService } from './helpers/transaction-filters.helper'
import { TrendsService } from './helpers/trends.helper'
import { StatisticController } from './statistic.controller'
import { StatisticService } from './statistic.service'

@Module({
	imports: [PrismaModule],
	controllers: [StatisticController],
	providers: [
		StatisticService,
		TransactionFiltersService,
		CategoryService,
		TrendsService,
	],
})
export class StatisticModule {}
