export type { User } from './auth/types/user.type'

export interface UpdateUserRequest {
	name?: string
	email?: string
	avatarUrl?: string
}

export interface ChangePasswordRequest {
	currentPassword: string
	newPassword: string
	confirmPassword: string
}

export interface UserActionResponse {
	message: string
	success: boolean
}
