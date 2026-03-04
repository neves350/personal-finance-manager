import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Length,
	Max,
	Min,
	ValidateIf,
} from 'class-validator'
import { CardColor, CardType } from 'src/generated/prisma/client'

export class CreateCardDto {
	@ApiProperty({ example: 'Nubank Credit Card' })
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'Bank account ID to link the card',
	})
	@IsUUID()
	@IsNotEmpty()
	bankAccountId: string

	@ApiProperty({ enum: CardColor, example: 'PURPLE' })
	@IsEnum(CardColor)
	@IsNotEmpty()
	color: CardColor

	@ApiProperty({ enum: CardType, example: 'CREDIT_CARD' })
	@IsEnum(CardType)
	@IsNotEmpty()
	type: CardType

	@ApiPropertyOptional({ example: '1234', description: 'Last 4 digits' })
	@IsString()
	@IsOptional()
	@Length(4, 4)
	lastFour?: string

	@ApiPropertyOptional({ example: '02/26', description: 'Expiration date' })
	@IsString()
	@IsNotEmpty()
	@Length(5, 5)
	expirationDate: string

	@ApiPropertyOptional({
		example: '121',
		description: 'Card Verification Code',
	})
	@IsString()
	@IsNotEmpty()
	@Length(3, 4)
	cvc: string

	@ApiPropertyOptional({ example: 5000.0, description: 'Credit limit' })
	@ValidateIf((o) => o.type === CardType.CREDIT_CARD)
	@IsNumber()
	@IsOptional()
	creditLimit?: number

	@ApiPropertyOptional({
		example: 15,
		description: 'Invoice closing day (1-31)',
	})
	@ValidateIf((o) => o.type === CardType.CREDIT_CARD)
	@IsInt()
	@Min(1)
	@Max(31)
	@IsOptional()
	closingDay?: number

	@ApiPropertyOptional({ example: 25, description: 'Invoice due day (1-31)' })
	@ValidateIf((o) => o.type === CardType.CREDIT_CARD)
	@IsInt()
	@Min(1)
	@Max(31)
	@IsOptional()
	dueDay?: number
}
