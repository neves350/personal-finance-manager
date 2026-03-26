import { Controller } from '@nestjs/common'
import { OpenBankingService } from './open-banking.service'

@Controller('open-banking')
export class OpenBankingController {
	constructor(private readonly openBankingService: OpenBankingService) {}
}
