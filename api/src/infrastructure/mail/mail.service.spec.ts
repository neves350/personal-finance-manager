import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { MailService } from './mail.service'

const mockMailerService = {
	sendMail: jest.fn(),
}

describe('MailService', () => {
	let service: MailService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailService,
				{ provide: MailerService, useValue: mockMailerService },
			],
		}).compile()

		service = module.get<MailService>(MailService)
	})

	describe('sendPasswordResetEmail', () => {
		it('should call sendMail with correct email and subject', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendPasswordResetEmail('test@email.com', '123456', 'John')

			expect(mockMailerService.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'test@email.com',
					subject: 'Password Recovery Code',
				}),
			)
		})
	})
})
