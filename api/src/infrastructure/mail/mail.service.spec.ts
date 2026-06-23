import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { MailService } from './mail.service'

const mockMailerService = {
	sendMail: jest.fn(),
}

describe('MailService', () => {
	let service: MailService

	beforeEach(async () => {
		jest.clearAllMocks()

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

		it('should include the reset code in the html body', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendPasswordResetEmail('test@email.com', 'ABC123', 'Jane')

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain('ABC123')
		})

		it('should include the user name in the html body', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendPasswordResetEmail('test@email.com', '123456', 'Jane')

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain('Hello Jane')
		})

		it('should include the reset URL with the code', async () => {
			process.env.FRONTEND_URL = 'http://localhost:4200'
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendPasswordResetEmail('test@email.com', 'XYZ789', 'John')

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain(
				'http://localhost:4200/password/reset?code=XYZ789',
			)
		})
	})

	describe('sendNotificationEmail', () => {
		it('should call sendMail with correct email and subject', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'John',
				'Budget Exceeded',
				'You have exceeded your Food budget.',
			)

			expect(mockMailerService.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'user@email.com',
					subject: 'Budget Exceeded',
				}),
			)
		})

		it('should include the user name in the html body', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'Jane',
				'Goal Completed',
				'You reached your savings goal!',
			)

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain('Hello Jane')
		})

		it('should include the title in the html body', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'John',
				'Goal Deadline Approaching',
				'Your goal ends in 7 days.',
			)

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain('Goal Deadline Approaching')
		})

		it('should include the message in the html body', async () => {
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'John',
				'Budget Warning',
				'You have spent 85% of your Food budget.',
			)

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain(
				'You have spent 85% of your Food budget.',
			)
		})

		it('should include the notifications link with FRONTEND_URL', async () => {
			process.env.FRONTEND_URL = 'http://localhost:4200'
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'John',
				'Test',
				'Test message',
			)

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain(
				'http://localhost:4200/notifications',
			)
		})

		it('should default to empty string when FRONTEND_URL is not set', async () => {
			delete process.env.FRONTEND_URL
			mockMailerService.sendMail.mockResolvedValue(undefined)

			await service.sendNotificationEmail(
				'user@email.com',
				'John',
				'Test',
				'Test message',
			)

			const call = mockMailerService.sendMail.mock.calls[0][0]
			expect(call.html).toContain('/notifications')
		})
	})
})
