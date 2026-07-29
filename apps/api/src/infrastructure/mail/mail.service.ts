import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	async sendPasswordResetEmail(email: string, code: string, name: string) {
		const resetUrl = `${process.env.FRONTEND_URL}/password/reset?code=${code}`

		await this.mailerService.sendMail({
			to: email,
			subject: 'Password Recovery Code',
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 30px 10px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); max-width: 600px; width: 100%;">

                    <!-- Header -->
                    <tr>
                      <td style="padding: 48px 48px 32px; text-align: center;">
                        <div style="margin-bottom: 24px;">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                            <rect x="3" y="3" width="4" height="18" rx="1" fill="#3b82f6"/>
                            <rect x="10" y="6" width="4" height="12" rx="1" fill="#3b82f6"/>
                            <rect x="17" y="9" width="4" height="6" rx="1" fill="#3b82f6"/>
                          </svg>
                        </div>
                        <h1 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e293b; letter-spacing: 2px; text-transform: uppercase;">
                          EXPENSES TRACKER APP
                        </h1>
                        <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                          Reset your password
                        </h2>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 48px;">
                        <div style="height: 1px; background: #e2e8f0;"></div>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 48px;">
                        <p style="margin: 0 0 24px; font-size: 16px; color: #0f172a; font-weight: 600;">
                          Hello ${name},
                        </p>
                        <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                          Use the code below to reset your password. You can type it manually or click the button to auto-fill.
                        </p>

                        <!-- Code Display -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 16px 0 32px;">
                              <div style="display: inline-block; padding: 16px 32px; background: #f1f5f9; border-radius: 12px; border: 2px dashed #cbd5e1;">
                                <span style="font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 8px; font-family: monospace;">
                                  ${code}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 8px 0;">
                              <a href="${resetUrl}" style="display: inline-block; width: 100%; max-width: 400px; padding: 16px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                Reset password with this code
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 0 48px 48px;">
                        <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                          This code expires in 1 hour. If you didn't request this, please ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
		})
	}

	async sendNotificationEmail(
		email: string,
		name: string,
		title: string,
		message: string,
	) {
		const appUrl = process.env.FRONTEND_URL ?? ''

		await this.mailerService.sendMail({
			to: email,
			subject: title,
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 30px 10px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); max-width: 600px; width: 100%;">

                    <!-- Header -->
                    <tr>
                      <td style="padding: 48px 48px 32px; text-align: center;">
                        <div style="margin-bottom: 24px;">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                            <rect x="3" y="3" width="4" height="18" rx="1" fill="#3b82f6"/>
                            <rect x="10" y="6" width="4" height="12" rx="1" fill="#3b82f6"/>
                            <rect x="17" y="9" width="4" height="6" rx="1" fill="#3b82f6"/>
                          </svg>
                        </div>
                        <h1 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e293b; letter-spacing: 2px; text-transform: uppercase;">
                          EXPENSES TRACKER APP
                        </h1>
                        <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                          ${title}
                        </h2>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 48px;">
                        <div style="height: 1px; background: #e2e8f0;"></div>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 48px;">
                        <p style="margin: 0 0 24px; font-size: 16px; color: #0f172a; font-weight: 600;">
                          Hello ${name},
                        </p>
                        <p style="margin: 0 0 32px; font-size: 15px; color: #475569; line-height: 1.6;">
                          ${message}
                        </p>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 8px 0;">
                              <a href="${appUrl}/notifications" style="display: inline-block; width: 100%; max-width: 400px; padding: 16px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                View in app
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 0 48px 48px;">
                        <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                          You're receiving this because you have notifications enabled on your account.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
		})
	}
}
