# Trocos API

REST API backend built with **NestJS 11**, **Prisma 7**, and **PostgreSQL**.

## Architecture

```
src/
├── main.ts                    # Bootstrap, CORS, Swagger, cookies
├── app.module.ts              # Root module
├── modules/                   # Feature modules
│   ├── auth/                  #   JWT auth (login, register, refresh, recover)
│   ├── users/                 #   User profile management
│   ├── bank-account/          #   Bank account CRUD
│   ├── card/                  #   Credit/debit card CRUD
│   ├── transaction/           #   Income/expense transactions
│   ├── category/              #   Default + custom categories
│   ├── transfer/              #   Account-to-account transfers
│   ├── recurring/             #   Recurring transaction management
│   ├── statistic/             #   Overview, by-category, trends, daily totals
│   ├── export/                #   CSV + PDF transaction export
│   ├── goal/                  #   Savings goals + deposits
│   ├── budget/                #   Envelope budgeting + envelopes
│   ├── notification/          #   In-app notifications + scheduler
│   └── open-banking/          #   Salt Edge bank connection & sync
├── infrastructure/
│   ├── db/                    #   PrismaService (Neon adapter)
│   └── mail/                  #   Email service (nodemailer)
└── common/
    └── decorators/            #   @CurrentUser(), API response decorators
```

## Request Lifecycle

```
Incoming Request
       │
       ▼
┌──────────────┐
│ cookie-parser│   Parse httpOnly cookies (accessToken, refreshToken)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ CORS         │   Allow frontend origin with credentials
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Validation   │   class-validator + class-transformer via global pipe
│ Pipe         │   Strips unknown properties, transforms types
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ JwtAuthGuard │   Extract JWT from cookie → validate → attach user
│ (protected)  │   Skipped for public routes (/auth/login, /auth/register)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controller   │   Route handler with @CurrentUser() decorator
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Service      │   Business logic — ALL queries filtered by userId
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Prisma ORM   │   Type-safe database queries
└──────┬───────┘
       │
       ▼
   PostgreSQL
```

## API Endpoints

### Auth (`/auth`)

| Method | Route               | Auth | Description            |
| ------ | ------------------- | ---- | ---------------------- |
| POST   | `/auth/register`    | No   | Create new account     |
| POST   | `/auth/login`       | No   | Login, set JWT cookies |
| POST   | `/auth/refresh`     | No   | Refresh access token   |
| POST   | `/auth/logout`      | Yes  | Clear auth cookies     |
| POST   | `/auth/forgot`      | No   | Send recovery email    |
| POST   | `/auth/reset`       | No   | Reset password w/ code |

### Users (`/users`)

| Method | Route               | Auth | Description            |
| ------ | ------------------- | ---- | ---------------------- |
| GET    | `/users/profile`    | Yes  | Get current user       |
| PUT    | `/users`            | Yes  | Update user profile    |

### Bank Accounts (`/bank-accounts`)

| Method | Route                                  | Auth | Description              |
| ------ | -------------------------------------- | ---- | ------------------------ |
| GET    | `/bank-accounts`                       | Yes  | List all accounts        |
| GET    | `/bank-accounts/:id`                   | Yes  | Get single account       |
| POST   | `/bank-accounts`                       | Yes  | Create account           |
| PUT    | `/bank-accounts/:id`                   | Yes  | Update account           |
| DELETE | `/bank-accounts/:id`                   | Yes  | Delete account           |
| GET    | `/bank-accounts/:id/balance-history`   | Yes  | 6-month balance history  |
| GET    | `/bank-accounts/:id/recent-movements`  | Yes  | Recent transactions      |

### Cards (`/cards`)

| Method | Route                      | Auth | Description                     |
| ------ | -------------------------- | ---- | ------------------------------- |
| GET    | `/cards`                   | Yes  | List all cards                  |
| GET    | `/cards/:id`               | Yes  | Get single card                 |
| GET    | `/cards/:id/transactions`  | Yes  | Recent card transactions        |
| GET    | `/cards/:id/cashflow`      | Yes  | 6-month income/expense totals   |
| POST   | `/cards`                   | Yes  | Create card                     |
| PUT    | `/cards/:id`               | Yes  | Update card                     |
| DELETE | `/cards/:id`               | Yes  | Delete card                     |

### Transactions (`/transactions`)

| Method | Route                    | Auth | Description            |
| ------ | ------------------------ | ---- | ---------------------- |
| GET    | `/transactions`          | Yes  | List (filtered/paged)  |
| POST   | `/transactions`          | Yes  | Create transaction     |
| PUT    | `/transactions/:id`      | Yes  | Update transaction     |
| DELETE | `/transactions/:id`      | Yes  | Delete transaction     |

### Categories (`/categories`)

| Method | Route                    | Auth | Description            |
| ------ | ------------------------ | ---- | ---------------------- |
| GET    | `/categories`            | Yes  | List all categories    |
| POST   | `/categories`            | Yes  | Create custom category |
| PUT    | `/categories/:id`        | Yes  | Update category        |
| DELETE | `/categories/:id`        | Yes  | Delete category        |

### Transfers (`/transfers`)

| Method | Route                    | Auth | Description            |
| ------ | ------------------------ | ---- | ---------------------- |
| GET    | `/transfers`             | Yes  | List all transfers     |
| POST   | `/transfers`             | Yes  | Create transfer        |
| PUT    | `/transfers/:id`         | Yes  | Update transfer        |
| DELETE | `/transfers/:id`         | Yes  | Delete transfer        |

### Statistics (`/statistics`)

| Method | Route                       | Auth | Description                      |
| ------ | --------------------------- | ---- | -------------------------------- |
| GET    | `/statistics/overview`      | Yes  | Totals, averages, top categories |
| GET    | `/statistics/by-category`   | Yes  | Category breakdown + percentages |
| GET    | `/statistics/trends`        | Yes  | Period comparison + % changes    |
| GET    | `/statistics/daily-totals`  | Yes  | Daily income/expense/balance     |

### Recurring Transactions (`/recurring`)

| Method | Route              | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------ |
| GET    | `/recurring`       | Yes  | List all recurring transactions      |
| POST   | `/recurring`       | Yes  | Create recurring transaction         |
| PATCH  | `/recurring/:id`   | Yes  | Update recurring transaction         |
| DELETE | `/recurring/:id`   | Yes  | Delete recurring (+ generated txns)  |

### Export (`/export`)

| Method | Route                            | Auth | Description       |
| ------ | -------------------------------- | ---- | ----------------- |
| GET    | `/export/transactions/csv`       | Yes  | Download CSV      |
| GET    | `/export/transactions/pdf`       | Yes  | Download PDF      |

### Goals (`/goals`)

| Method | Route                       | Auth | Description              |
| ------ | --------------------------- | ---- | ------------------------ |
| GET    | `/goals`                    | Yes  | List all goals           |
| POST   | `/goals`                    | Yes  | Create goal              |
| PUT    | `/goals/:id`                | Yes  | Update goal              |
| DELETE | `/goals/:id`                | Yes  | Delete goal              |
| POST   | `/goals/:id/deposits`       | Yes  | Add deposit to goal      |
| GET    | `/goals/:id/deposits`       | Yes  | List deposits for goal   |

### Budgets (`/budgets`)

| Method | Route                                     | Auth | Description                          |
| ------ | ----------------------------------------- | ---- | ------------------------------------ |
| GET    | `/budgets`                                | Yes  | List all budgets                     |
| POST   | `/budgets`                                | Yes  | Create budget                        |
| GET    | `/budgets/current`                        | Yes  | Get current month budget             |
| GET    | `/budgets/:year/:month`                   | Yes  | Get budget by month and year         |
| PATCH  | `/budgets/:id`                            | Yes  | Update budget                        |
| DELETE | `/budgets/:id`                            | Yes  | Delete budget (cascades envelopes)   |
| POST   | `/budgets/:budgetId/envelopes`            | Yes  | Add envelope to budget               |
| PATCH  | `/budgets/:budgetId/envelopes/:id`        | Yes  | Update envelope allocation           |
| DELETE | `/budgets/:budgetId/envelopes/:id`        | Yes  | Remove envelope from budget          |
| POST   | `/budgets/:budgetId/envelopes/transfer`   | Yes  | Transfer between envelopes           |
| POST   | `/budgets/:id/copy-previous`              | Yes  | Copy envelopes from previous month   |

### Notifications (`/notifications`)

| Method | Route                        | Auth | Description                      |
| ------ | ---------------------------- | ---- | -------------------------------- |
| GET    | `/notifications`             | Yes  | List notifications (paginated)   |
| GET    | `/notifications/unread-count`| Yes  | Get unread count                 |
| PATCH  | `/notifications/read-all`    | Yes  | Mark all as read                 |
| PATCH  | `/notifications/:id/read`    | Yes  | Mark single as read              |
| DELETE | `/notifications/:id`         | Yes  | Delete notification              |

### Open Banking (`/open-banking`)

| Method | Route                                    | Auth | Description                     |
| ------ | ---------------------------------------- | ---- | ------------------------------- |
| POST   | `/open-banking/connect`                  | Yes  | Initiate bank connection        |
| POST   | `/open-banking/handle-callback`          | Yes  | Handle Salt Edge callback       |
| GET    | `/open-banking/connections`              | Yes  | List all connections            |
| GET    | `/open-banking/connections/:id`          | Yes  | Get connection details          |
| POST   | `/open-banking/connections/:id/refresh`  | Yes  | Refresh connection data         |
| POST   | `/open-banking/connections/:id/sync`     | Yes  | Sync transactions               |
| DELETE | `/open-banking/connections/:id`          | Yes  | Disconnect bank                 |
| GET    | `/open-banking/providers`                | Yes  | List available bank providers   |

### Webhooks (`/webhooks`)

| Method | Route                      | Auth | Description                     |
| ------ | -------------------------- | ---- | ------------------------------- |
| POST   | `/webhooks/open-banking`   | No   | Salt Edge webhook receiver      |

## Key Patterns

### Protected Route Pattern

Every protected endpoint uses the same pattern:

```typescript
@UseGuards(JwtAuthGuard)
@Get()
async findAll(@CurrentUser() user: { userId: string; email: string }) {
  return this.service.findAll(user.userId)
}
```

### Data Isolation

All service methods filter by `userId` to ensure users only access their own data:

```typescript
async findAll(userId: string) {
  return this.prisma.bankAccount.findMany({
    where: { userId }, // CRITICAL — never omit this
  })
}
```

### Authentication

- **Access token**: JWT in httpOnly cookie, expires in 15 minutes
- **Refresh token**: JWT in httpOnly cookie, expires in 7 days
- Passport JWT strategy reads tokens from cookies (not Authorization header)
- `@CurrentUser()` custom decorator extracts `{ userId, email }` from request
- Google OAuth supported via `google-auth-library`

### Prisma Setup

- Custom client output: `src/generated/prisma`
- Neon serverless adapter for connection pooling
- Decimal(12, 2) for all monetary values
- Snake_case DB columns mapped to camelCase via `@map()`

## Commands

```bash
# Development
npm run dev              # Start with hot reload (watch mode)
npm run start:debug      # Start with debugger attached

# Build
npm run build            # Compile to dist/
npm run start:prod       # Run compiled build

# Testing
npm test                 # Run all unit tests
npm run test:watch       # Watch mode
npm run test:cov         # With coverage report
npm run test:e2e         # End-to-end tests

# Database
npx prisma migrate dev                    # Create + apply migration
npx prisma migrate dev --name add-goals   # Named migration
npx prisma db push                        # Push schema (no migration)
npx prisma studio                         # Database GUI
npx prisma generate                       # Regenerate client
npx prisma db seed                        # Seed default categories
```

## Environment Variables

Create a `.env` file in this directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/trocos"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
FRONTEND_URL="http://localhost:4200"
MAIL_HOST="smtp.example.com"
MAIL_USER="user@example.com"
MAIL_PASS="password"
```

## API Documentation

When the server is running:

- **Swagger UI**: http://localhost:3000/api
- **Scalar Docs**: http://localhost:3000/docs
