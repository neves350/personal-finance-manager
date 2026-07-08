import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
	ApiCreateResponses,
	ApiDeleteResponses,
	ApiFindAllResponses,
	ApiFindOneResponses,
	ApiUpdateResponses,
} from 'src/common/decorators/api-responses/category-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CategoryService } from './category.service'
import { CreateCategory } from './dtos/create-category.dto'
import { QueryCategoryDto } from './dtos/query-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'

@ApiTags('Categories')
@Controller()
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@UseGuards(JwtAuthGuard)
	@Post('categories')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new category',
		description: 'Creates a new category with title, type and icon.',
	})
	@ApiCreateResponses()
	async create(@Body() createCategory: CreateCategory, @CurrentUser() user) {
		const category = await this.categoryService.create(
			createCategory,
			user.userId,
		)

		return {
			category,
			message: 'Category created successfull',
		}
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('categories')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get all categories',
		description: 'Get all categories from user.',
	})
	@ApiFindAllResponses()
	async findAll(@CurrentUser() user, @Query() query: QueryCategoryDto) {
		return this.categoryService.findAll(user.userId, query.type)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('categories/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get category by id',
		description: 'Get category for the user.',
	})
	@ApiFindOneResponses()
	async findOne(@Param('id') id: string, @CurrentUser() user) {
		return this.categoryService.findOne(id, user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Patch('categories/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update category by id',
		description: 'Updates the category information.',
	})
	@ApiUpdateResponses()
	async update(
		@Param('id') id: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
		@CurrentUser() user,
	) {
		return this.categoryService.update(id, user.userId, updateCategoryDto)
	}

	@UseGuards(JwtAuthGuard)
	@Delete('categories/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete category by id',
		description: 'Deletes the category information.',
	})
	@ApiDeleteResponses()
	async delete(@Param('id') id: string, @CurrentUser() user) {
		return this.categoryService.delete(id, user.userId)
	}
}
