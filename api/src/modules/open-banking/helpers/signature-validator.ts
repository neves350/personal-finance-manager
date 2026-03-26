import { createVerify } from 'node:crypto'
import { Logger } from '@nestjs/common'

const logger = new Logger('WebhookSignatureValidator')

// Salt Edge public key for webhook signature verification
// See: https://docs.saltedge.com/account_information/v5/#callbacks
const SALT_EDGE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvL/Xxdmj7/cpZgvDMvxr
  nTTU/vkHGM/qkJ0Q+rmfYLru0Z/rSWthPDEK3orY5BTa0sAe2wUV5Fes677X6+Ib
  roCF8nODW5hSVTrqWcrQ55I7InpFkpTxyMkiFN8XPS7qmYXl/xofbYq0olcwE/aw
  9lfHlZD7iwOpVJqTsYiXzSMRu92ZdECV895kYS/ggymSEtoMSW3405dQ6OfnK53x
  7AJPdkAp0Wa2Lk4BNBMd24uu2tasO1bTYBsHpxonwbA+o8BXffdTEloloJgW7pV+
  TWvxB/Uxil4yhZZJaFmvTCefxWFovyzLdjn2aSAEI7D1y4IYOdByMOPYQ6Mn7J9A
  9wIDAQAB
-----END PUBLIC KEY-----`

export function validateWebhookSignature(
	signature: string,
	body: string,
): boolean {
	try {
		const verifier = createVerify('SHA256')
		verifier.update(body)
		verifier.end()
		return verifier.verify(SALT_EDGE_PUBLIC_KEY, signature, 'base64')
	} catch (error) {
		logger.error('Webhook signature validation failed', error)
		return false
	}
}
