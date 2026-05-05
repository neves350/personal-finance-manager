import type { User } from './user.type'

export interface AuthResponse {
	message: string
	user?: User
}
