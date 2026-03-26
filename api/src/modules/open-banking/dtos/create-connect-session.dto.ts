import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateConnectSessionDto {
	@ApiPropertyOptional({
		example: 'banco_ctt_pt',
		description: 'Pre-select a specific bank provider',
	})
	@IsOptional()
	@IsString()
	providerCode?: string

	@ApiProperty({
		example: 'http://localhost:4200/accounts?connected=true',
		description: 'URL to redirect after connection',
	})
	@IsString()
	returnTo: string
}
