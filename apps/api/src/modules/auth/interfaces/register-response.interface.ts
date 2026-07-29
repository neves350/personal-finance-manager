import type { User } from 'src/generated/prisma/client'
import { AuthEntity } from '../entities/auth.entity'

export interface RegisterResponse {
	user: User
	tokens: AuthEntity
}
