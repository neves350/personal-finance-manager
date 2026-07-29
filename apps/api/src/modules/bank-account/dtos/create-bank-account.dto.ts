import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { BankType } from 'src/generated/prisma/client'

export class CreateBankAccountDto {
	@ApiProperty({ example: 'Revolut Credit Card' })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({ enum: BankType, example: 'CHECKING' })
	@IsEnum(BankType)
	@IsNotEmpty()
	type: BankType

	@ApiProperty()
	@IsNumber()
	@IsNotEmpty()
	balance: number
}
