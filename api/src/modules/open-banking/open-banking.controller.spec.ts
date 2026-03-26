import { Test, TestingModule } from '@nestjs/testing'
import { OpenBankingController } from './open-banking.controller'
import { OpenBankingService } from './open-banking.service'

describe('OpenBankingController', () => {
	let controller: OpenBankingController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [OpenBankingController],
			providers: [OpenBankingService],
		}).compile()

		controller = module.get<OpenBankingController>(OpenBankingController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
