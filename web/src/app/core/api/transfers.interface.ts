/**
 * ENUM
 */
export enum TransferStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

/**
 * TRANSFER
 */
export interface Transfer {
	id?: string
	amount: number
	fromAccountId: string
	toAccountId: string
	date: Date
	description?: string
	status: TransferStatus
	executedAt?: Date
	createdAt?: string
	fromAccount?: {
		id: string
		name: string
	}
	toAccount?: {
		id: string
		name: string
	}
}

/**
 * CREATE TRANSFER
 */
export interface CreateTransferRequest {
	amount: number
	fromAccountId: string
	toAccountId: string
	date: Date
	description?: string
}

/**
 * CREATE RESPONSE
 */
export interface CreateTransferResponse {
	transfer: Transfer
	message: string
}

/**
 * QUERY PARAMS
 */
export interface TransfersQueryParams {
	status?: TransferStatus
	fromAccountId?: string
	toAccountId?: string
	startDate?: string
	endDate?: string
}

/**
 * GENERIC RESPONSE
 */
export interface TransferActionResponse {
	message: string
	success: boolean
}

export interface TransfersResponse {
	data: Transfer[]
}
