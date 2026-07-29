# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for full project documentation including frontend, database, and monorepo commands.

## API Commands

```bash
npm run dev              # Start with hot reload (nest start --watch)
npm run start:debug      # Start with debugger
npm run build            # Build for production
npm run start:prod       # Run production build

# Testing
npm test                 # Run all Jest tests
npm run test:watch       # Watch mode
npm run test:cov         # With coverage
npm run test:e2e         # E2E tests
npm test -- <file-path>  # Run single test file

# Database (Prisma)
npx prisma migrate dev           # Create and apply migration
npx prisma migrate dev --name <migration-name>
npx prisma db push               # Push schema without migration
npx prisma studio                # Open database GUI
npx prisma generate              # Regenerate Prisma Client
npx prisma db seed               # Run seed script
```

## NestJS Coding Conventions

### Module Structure

Each feature module follows this structure:
```
modules/<feature>/
├── <feature>.module.ts      - Module definition
├── <feature>.controller.ts  - HTTP routes
├── <feature>.service.ts     - Business logic
├── dtos/                    - Request/response DTOs
├── entities/                - Response entities (for Swagger)
├── guards/                  - Feature-specific guards
├── helpers/                 - Utility functions
└── interfaces/              - TypeScript interfaces
```

### Controllers

- Use `@UseGuards(JwtAuthGuard)` on protected routes
- Use `@CurrentUser()` decorator to get authenticated user (`{ userId, email }`)
- Use Swagger decorators: `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`
- Use custom response decorators from `src/common/decorators/api-responses/`

```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Get('resource')
@ApiOperation({ summary: 'Get resource' })
@ApiResourceResponses()  // Custom decorator for Swagger responses
async get(@CurrentUser() user) {
  return this.service.get(user.userId)
}
```

### Services

- **CRITICAL:** Always filter queries by `userId` for data isolation
- Inject `PrismaService` for database access
- Throw NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.)

```typescript
@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.feature.findMany({
      where: { userId }  // REQUIRED for security
    })
  }
}
```

### DTOs

- Use class-validator decorators for validation
- Use class-transformer for transformation
- Extend `PartialType` for update DTOs

```typescript
export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsOptional()
  @IsDecimal()
  amount?: string
}
```

### Prisma

- Schema location: `prisma/schema.prisma`
- Client generated to: `src/generated/prisma` (custom output)
- Use `Decimal` type for monetary values: `@db.Decimal(12, 2)`
- Use snake_case for DB columns with `@map()` for camelCase in code
- Import Prisma types from `src/generated/prisma`

## Key Patterns

### Authentication Flow

1. Login/Register: Validates credentials, returns user + sets httpOnly cookies
2. Protected routes: `JwtAuthGuard` extracts JWT from `accessToken` cookie
3. Token refresh: `POST /refresh` uses `refreshToken` cookie to issue new tokens
4. Tokens: accessToken (15 min), refreshToken (7 days)

### API Endpoints

| Route | Description |
|-------|-------------|
| `POST /users` | Register new user |
| `POST /sessions/password` | Login with email/password |
| `POST /refresh` | Refresh access token |
| `GET /profile` | Get current user profile |
| `POST /password/recover` | Request password reset |
| `POST /password/reset` | Reset password with code |
| `POST /logout` | Clear auth cookies |

### Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWTs
- `USE_SECURE_COOKIES` - Set to `true` in production

### API Documentation

- Swagger UI: http://localhost:3000/api
- Scalar docs: http://localhost:3000/docs
