import { Controller } from '@nestjs/common'
import { MailService } from './mail.service'

@Controller('mail')
export class MailController {
	constructor(readonly _mailService: MailService) {}
}
