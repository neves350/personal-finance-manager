import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateBudgetDto } from './dtos/create-budget.dto'

@Injectable()
export class BudgetService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateBudgetDto, userId: string) {
		const { month, year, note } = dto

		try {
			const budget = await this.prisma.budget.create({
				data: {
					month,
					year,
					note,
					userId,
				},
			})

			return budget
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException(
					'A budget for this month and year already exists',
				)
			}
			throw error
		}
	}
}
