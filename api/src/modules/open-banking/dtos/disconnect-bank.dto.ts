import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class DisconnectBankDto {
	@ApiPropertyOptional({
		example: false,
		description: 'Keep synced accounts and transactions after disconnecting',
	})
	@IsOptional()
	@IsBoolean()
	keepData?: boolean = false
}
