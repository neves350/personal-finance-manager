import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'
import { TransferDto } from '../dtos/transfer.dto'

@ValidatorConstraint({ name: 'differentAccount', async: false })
export class DifferentAccountConstraint
	implements ValidatorConstraintInterface
{
	validate(toAccountId: string, args: ValidationArguments) {
		const dto = args.object as TransferDto
		return toAccountId !== dto.fromAccountId
	}

	defaultMessage() {
		return 'Source and destination accounts must be different'
	}
}
