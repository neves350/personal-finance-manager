import { Test, TestingModule } from '@nestjs/testing'
import { OpenBankingController } from './open-banking.controller'
import { OpenBankingService } from './open-banking.service'
import { OpenBankingSyncService } from './open-banking-sync.service'

describe('OpenBankingController', () => {
	let controller: OpenBankingController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [OpenBankingController],
			providers: [
				{
					provide: OpenBankingService,
					useValue: {
						getOrCreateCustomer: jest.fn(),
						createConnectSession: jest.fn(),
						getConnections: jest.fn(),
						disconnect: jest.fn(),
					},
				},
				{
					provide: OpenBankingSyncService,
					useValue: {
						syncAccounts: jest.fn(),
						syncTransactions: jest.fn(),
					},
				},
			],
		}).compile()

		controller = module.get<OpenBankingController>(OpenBankingController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
