import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from 'src/generated/prisma/client'

function buildPrismaOptions() {
	if (process.env.USE_NEON_ADAPTER === 'false') {
		return {}
	}
	const adapter = new PrismaNeon({
		connectionString: process.env.DATABASE_URL as string,
	})
	return { adapter }
}

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		super(buildPrismaOptions())
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
