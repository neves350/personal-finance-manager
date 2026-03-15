import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { ExportService } from './export.service'

describe('ExportService', () => {
	let service: ExportService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ExportService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<ExportService>(ExportService)
	})

	describe('exportTransactionToCsv', () => {
		it('should return exported csv transactions', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([{ id: 'account-id' }])
			mockPrisma.transaction.findMany.mockResolvedValue([])

			const result = await service.exportTransactionToCsv('user-id', {})

			expect(typeof result).toBe('string')
		})
	})
	describe('exportTransactionToPdf', () => {
		it('should return exported pdf transactions', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([{ id: 'account-id' }])
			mockPrisma.transaction.findMany.mockResolvedValue([])

			const result = await service.exportTransactionToPdf('user-id', {})

			expect(result).toBeInstanceOf(Buffer)
		})
	})
})
