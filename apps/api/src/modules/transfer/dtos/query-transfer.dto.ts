import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator'
import { TransferStatus } from 'src/generated/prisma/enums'

export class QueryTransferDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	accountId?: string // filter by fromAccountId OR toAccountId

	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(TransferStatus)
	status?: TransferStatus

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startDate?: Date

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endDate?: Date

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	limit?: number = 10

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	offset?: number = 0
}
