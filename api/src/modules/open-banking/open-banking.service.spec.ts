import { Test, TestingModule } from '@nestjs/testing'
import { OpenBankingService } from './open-banking.service'

describe('OpenBankingService', () => {
	let service: OpenBankingService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OpenBankingService],
		}).compile()

		service = module.get<OpenBankingService>(OpenBankingService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
