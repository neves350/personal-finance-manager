import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { FindConnectionService } from './helpers/find-connection.helper'
import { OpenBankingService } from './open-banking.service'
import { SaltEdgeService } from './salt-edge.service'

describe('OpenBankingService', () => {
	let service: OpenBankingService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OpenBankingService,
				{ provide: PrismaService, useValue: mockPrisma },
				{
					provide: SaltEdgeService,
					useValue: {
						createCustomer: jest.fn(),
						createConnectSession: jest.fn(),
						getConnections: jest.fn(),
						getAccounts: jest.fn(),
						getTransactions: jest.fn(),
					},
				},
				{
					provide: FindConnectionService,
					useValue: {
						findConnectionByUser: jest.fn(),
					},
				},
			],
		}).compile()

		service = module.get<OpenBankingService>(OpenBankingService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
