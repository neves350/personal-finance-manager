import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'src/generated/prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		const connectionString = process.env.DATABASE_URL as string
		const adapter =
			process.env.USE_NEON_ADAPTER === 'false'
				? new PrismaPg({ connectionString })
				: new PrismaNeon({ connectionString })
		super({ adapter })
	}

	async onModuleInit() {
		try {
			await this.$connect()
			console.log('✅ Connected to database')
		} catch (error) {
			console.error('❌ Failed to connect to database:', error)
			throw error
		}
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
