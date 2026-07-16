# Trocos

A full-stack expense tracking application built as a learning project. Monorepo with **NestJS** backend and **Angular 21** frontend.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Angular](https://img.shields.io/badge/Angular-21-red)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Prisma](https://img.shields.io/badge/Prisma-7-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue)

## Screenshots

| Dashboard |
|-----------|
| ![Dashboard](screenshots/Dashboard.png) |

| Transactions | Recurrings |
|--------------|--------------|
| ![Transactions](screenshots/Transactions.png) | ![Recurrings](screenshots/Recurrings.png) |

| Accounts | Statistics |
|----------|------------|
| ![Accounts](screenshots/Accounts.png) | ![Statistics](screenshots/Statistics.png) |

| Goals | Budgets |
|-------|---------|
| ![Goals](screenshots/Goals.png) | ![Budgets](screenshots/Budgets.png) |

## Features

- User registration & login with JWT (httpOnly cookies) + Google OAuth
- Bank account management (Checking, Savings, Wallet, Investment)
- Credit & debit card tracking with color themes and 6-month cashflow history
- Income & expense transaction recording with search and filtering
- Recurring transactions (monthly/annual) with auto-generation and pattern detection
- Transfers between accounts with status tracking
- Envelope budgeting with monthly budgets, category allocations, and envelope transfers
- Savings goals and spending limits with deposit tracking and heatmap
- In-app notifications for recurring income, budget thresholds, goal milestones
- Statistics dashboard with charts (by category, trends, daily totals, overview)
- CSV and PDF export of transactions
- Custom & default expense/income categories with icons and colors
- Open banking integration (Salt Edge) for account syncing
- Password recovery via email
- Light & dark theme support

## Tech Stack

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| **Frontend** | Angular 21, Signals, TailwindCSS 4, Spartan UI, ApexCharts |
| **Backend**  | NestJS 11, Passport JWT, Prisma 7, class-validator          |
| **Database** | PostgreSQL (Neon serverless)                                |
| **Tooling**  | npm workspaces, Biome, Vitest, Jest, Playwright, Concurrently |

## Project Structure

```
trocos/
├── api/                    # NestJS REST API
│   ├── prisma/             #   Database schema & migrations
│   └── src/
│       ├── modules/        #   Feature modules (auth, bank-account, budget, ...)
│       ├── infrastructure/ #   Prisma & mail services
│       └── common/         #   Shared decorators & utilities
├── web/                    # Angular 21 SPA
│   └── src/app/
│       ├── core/           #   Services, guards, interceptors, API clients
│       ├── pages/          #   Route components (lazy loaded)
│       └── shared/         #   Reusable components & UI library
├── e2e/                    # Playwright end-to-end tests
├── package.json            # Workspace root
├── biome.json              # Linter/formatter config
└── CLAUDE.md               # AI assistant context
```

## Application Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ANGULAR SPA (port 4200)                               │
│                                                                          │
│  ┌────────────┐   ┌────────────┐   ┌──────────────────────────────────┐  │
│  │  Guest     │   │   Auth     │   │  Protected Pages                 │  │
│  │  Pages     │   │   Flow     │   │  (behind authGuard)              │  │
│  │            │   │            │   │                                  │  │
│  │ /login    ─┼──►│  AuthApi   │   │  /dashboard      Overview        │  │
│  │ /register  │   │     ↓      │   │  /transactions   Income/expense  │  │
│  │ /recover   │   │  AuthSvc   │   │  /recurrings     Recurring txns  │  │
│  │ /reset     │   │  (signals) │   │  /accounts       Bank accounts   │  │
│  └────────────┘   └─────┬──────┘   │  /cards          → /accounts     │  │
│                         │          │  /categories     Categories      │  │
│                         │          │  /budgets        Envelope budget │  │
│                         │          │  /goals          Savings goals   │  │
│                         │          │  /statistics     Analytics       │  │
│                         │          │  /notifications  Notifications   │  │
│                         │          │  /settings       User prefs      │  │
│                         │          └───────────┬──────────────────────┘  │
│                         ▼                      │                         │
│               ┌──────────────────┐             │                         │
│               │ authInterceptor  │◄────────────┘                         │
│               │ • withCredentials│                                       │
│               │ • 401 → refresh  │                                       │
│               │ • retry request  │                                       │
│               └────────┬─────────┘                                       │
└────────────────────────┼─────────────────────────────────────────────────┘
                         │  HTTP + httpOnly cookies
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NESTJS API (port 3000)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Middleware Layer                         │  │
│  │  cookie-parser → ValidationPipe → JwtAuthGuard            │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │                   Module Router                           │  │
│  │                                                           │  │
│  │  /auth           → register, login, refresh, logout       │  │
│  │  /users          → profile, update avatar                 │  │
│  │  /bank-accounts  → CRUD + balance history + recent moves  │  │
│  │  /cards          → CRUD cards + cashflow history          │  │
│  │  /transactions   → CRUD transactions + filters            │  │
│  │  /recurring      → CRUD recurring transactions            │  │
│  │  /categories     → CRUD categories (default + custom)     │  │
│  │  /transfers      → CRUD transfers between accounts        │  │
│  │  /statistics     → overview, by-category, trends, daily   │  │
│  │  /export         → CSV + PDF transaction export           │  │
│  │  /goals          → CRUD goals + deposits                  │  │
│  │  /budgets        → envelope budgeting + transfers         │  │
│  │  /notifications  → in-app notifications + scheduler       │  │
│  │  /open-banking   → connect/sync/disconnect bank accounts  │  │
│  │  /webhooks       → Salt Edge webhook receiver             │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │           Services + @CurrentUser() decorator             │  │
│  │      All queries filtered by userId (data isolation)      │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                    POSTGRESQL (Neon)                          │
│                                                               │
│  ┌────────┐ ┌──────────────┐ ┌───────┐ ┌─────────────┐        │
│  │ users  │ │bank_accounts │ │ cards │ │transactions │        │
│  └────────┘ └──────────────┘ └───────┘ └─────────────┘        │
│  ┌────────┐ ┌──────────────┐ ┌───────┐ ┌─────────────┐        │
│  │ tokens │ │  transfers   │ │ goals │ │ categories  │        │
│  └────────┘ └──────────────┘ └───────┘ └─────────────┘        │
│  ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌───────────┐        │
│  │ deposits │ │ recurrings │ │ budgets │ │ envelopes │        │
│  └──────────┘ └────────────┘ └─────────┘ └───────────┘        │
│  ┌───────────────┐                                            │
│  │ notifications │                                            │
│  └───────────────┘                                            │
│  ┌────────────────────┐ ┌─────────────────────┐               │
│  │ open_banking_      │ │ open_banking_       │               │
│  │ customers          │ │ connections         │               │
│  └────────────────────┘ └─────────────────────┘               │
│  ┌────────────────────┐                                       │
│  │ open_banking_      │                                       │
│  │ accounts           │                                       │
│  └────────────────────┘                                       │
└───────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
  Register/Login                        Authenticated Request
  ─────────────                         ─────────────────────

  Client              API               Client              API
    │                  │                   │                  │
    │  POST /login     │                   │  GET /accounts   │
    │  {email, pass}   │                   │  Cookie: token   │
    ├────────────────► │                   ├────────────────► │
    │                  │                   │                  │
    │  validate creds  │                   │  JwtAuthGuard    │
    │  sign JWT pair   │                   │  extract user    │
    │  set cookies     │                   │  @CurrentUser()  │
    │                  │                   │                  │
    │ ◄────────────────┤                   │ ◄────────────────┤
    │  Set-Cookie:     │                   │  200 OK          │
    │  access (15min)  │                   │                  │
    │  refresh (7d)    │


  Token Refresh (automatic via authInterceptor)
  ─────────────────────────────────────────────

  Client              API
    │  GET /resource    │
    ├─────────────────► │
    │  401 Unauthorized │
    │ ◄─────────────────┤
    │                   │
    │  POST /refresh    │   ← interceptor catches 401
    │  Cookie: refresh  │
    ├─────────────────► │
    │  new cookies      │
    │ ◄─────────────────┤
    │                   │
    │  retry original   │   ← retry with new token
    ├─────────────────► │
    │  200 OK           │
    │ ◄─────────────────┤
```

## Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │       │   BankAccount    │       │     Card     │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id       (PK)│──┐    │ id           (PK)│──┐    │ id       (PK)│
│ googleId     │  │    │ userId       (FK)│  │    │ userId   (FK)│
│ email        │  │    │ name             │  │    │ bankAccId(FK)│
│ name         │  │    │ type  (enum)     │  │    │ name         │
│ passwordHash │  │    │ currency (enum)  │  │    │ color  (enum)│
│ avatarUrl    │  │    │ balance          │  │    │ type   (enum)│
└──────┬───────┘  │    │ initialBalance   │  │    │ lastFour     │
       │          │    │ isLinked         │  │    │ creditLimit  │
       │ 1:N      │    │ isCardAccount    │  │    │ cardNetwork  │
       │          │    └────────┬─────────┘  │    │ closingDay   │
       ▼          │             │            │    │ dueDay       │
┌──────────────┐  │             │ 1:N        │    └──────┬───────┘
│   Category   │  │    ┌────────▼─────────┐  │           │ 1:N
├──────────────┤  │    │    Transfer      │  │    ┌──────▼───────┐
│ id       (PK)│  │    ├──────────────────┤  │    │ Transaction  │
│ userId   (FK)│  │    │ id           (PK)│  │    ├──────────────┤
│ title        │  │    │ userId       (FK)│  │    │ id       (PK)│
│ icon         │  │    │ fromAccId    (FK)│  │    │ cardId   (FK)│
│ color        │  │    │ toAccId      (FK)│  │    │ bankAccId(FK)│
│ isDefault    │  │    │ amount           │  │    │ categoryId   │
│ type  (enum) │  │    │ date             │  │    │ recurringId  │
└──────────────┘  │    │ description      │  │    │ title        │
                  │    │ status (enum)    │  │    │ type   (enum)│
┌──────────────┐  │    └──────────────────┘  │    │ amount       │
│     Goal     │  │                          │    │ date         │
├──────────────┤  │                          │    │ isPaid       │
│ id       (PK)│◄─┘    ┌──────────────────┐  │    │ source (enum)│
│ userId   (FK)│       │    Deposit       │  │    └──────────────┘
│ categoryId   │       ├──────────────────┤  │
│ bankAccId    │       │ id           (PK)│  │
│ title        │       │ amount           │  │
│ amount       │───1:N─│ goalId       (FK)│  │
│ currentAmount│       │ date             │  │
│ startDate    │       │ note             │  │
│ endDate      │       └──────────────────┘  │
│ type  (enum) │                             │
└──────────────┘  ┌──────────────────┐       │
                  │    Token         │       │
                  ├──────────────────┤       │
                  │ id           (PK)│◄──────┘
                  │ type       (enum)│  belongs to User
                  │ code    (5 char) │
                  │ userId       (FK)│
                  └──────────────────┘

┌──────────────────┐
│    Recurring     │
├──────────────────┤
│ id           (PK)│
│ userId       (FK)│
│ description      │
│ type      (enum) │   INCOME | EXPENSE
│ amount           │
│ frequency (enum) │   MONTH | ANNUAL
│ monthDay         │
│ paymentMethod    │   MONEY | CARD
│ startDate        │
│ endDate          │
│ cardId    (FK)?  │
│ bankAccId (FK)?  │
│ categoryId (FK)? │
│ autoDetected     │
└──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│     Budget       │       │    Envelope      │
├──────────────────┤       ├──────────────────┤
│ id           (PK)│──1:N──│ id           (PK)│
│ userId       (FK)│       │ budgetId     (FK)│
│ month            │       │ categoryId   (FK)│
│ year             │       │ allocatedAmount  │
│ note             │       └──────────────────┘
└──────────────────┘
  unique(userId, month, year)

┌──────────────────┐
│  Notification    │
├──────────────────┤
│ id           (PK)│
│ userId       (FK)│
│ type       (enum)│   RECURRING_INCOME_EXPECTED | BUDGET_THRESHOLD_REACHED
│ title            │   BUDGET_EXCEEDED | GOAL_COMPLETED
│ message          │   GOAL_DEADLINE_APPROACHING
│ entityType       │
│ entityId         │
│ isRead           │
│ year             │
│ month            │
└──────────────────┘

Open Banking (Salt Edge integration)

┌──────────────────────┐       ┌───────────────────────┐       ┌──────────────────────┐
│ OpenBankingCustomer  │       │ OpenBankingConnection │       │  OpenBankingAccount  │
├──────────────────────┤       ├───────────────────────┤       ├──────────────────────┤
│ id              (PK) │──1:N──│ id              (PK)  │──1:N──│ id              (PK) │
│ userId          (FK) │       │ customerId      (FK)  │       │ connectionId    (FK) │
│ saltEdgeCustomerId   │       │ saltEdgeConnectionId  │       │ bankAccountId   (FK) │
│ createdAt            │       │ providerCode          │       │ saltEdgeAccountId    │
│ updatedAt            │       │ providerName          │       │ iban                 │
└──────────────────────┘       │ providerLogoUrl       │       │ currencyCode         │
                               │ status      (enum)    │       │ nature               │
                               │ consentExpiresAt      │       │ lastSyncAt           │
                               │ lastSyncAt            │       └──────────────────────┘
                               │ nextRefreshPossibleAt │
                               └───────────────────────┘
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** (or a [Neon](https://neon.tech) account)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd trocos
   npm install
   ```

2. **Configure the database**

   ```bash
   cp api/.env.example api/.env
   # Edit api/.env and set your DATABASE_URL
   # Example: DATABASE_URL="postgresql://user:pass@localhost:5432/trocos"
   ```

3. **Run migrations and seed**

   ```bash
   cd api
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development servers**

   ```bash
   # From root — starts both API and Web
   npm run dev
   ```

   - API: http://localhost:3000
   - Web: http://localhost:4200
   - Swagger: http://localhost:3000/api
   - Scalar docs: http://localhost:3000/docs

### Available Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start both API and Web concurrently |
| `npm run dev:api`    | Start API only                      |
| `npm run dev:web`    | Start Web only                      |
| `npm run build`      | Build both workspaces               |
| `npm run test:e2e`   | Run Playwright E2E tests            |

## Learning Goals

This project was built to learn and practice:

- **Angular 21** — Signals, standalone components, new control flow (`@if`, `@for`), lazy loading
- **NestJS** — Modular architecture, guards, decorators, Swagger docs
- **Prisma** — Schema design, migrations, relations, custom generators
- **JWT Authentication** — httpOnly cookies, refresh tokens, interceptors
- **TailwindCSS 4** — Utility-first CSS, theming, dark mode
- **Monorepo** — npm workspaces, shared tooling

## License

This project is for personal learning purposes.
