# Spiko Tricount

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/spiko-tech/spiko-tricount?quickstart=1)

A fullstack expense-sharing application built as a practical case for Spiko's software engineering interviews.

## Context

This project is a "Tricount" application (similar to [Tricount](https://www.tricount.com/) or [Splitwise](https://www.splitwise.com/)) that allows users to track shared expenses and settle debts using EUTBL tokens (Spiko tokens).

## Features

### Authentication

- Sign up with email/password
- Sign in
- Log out

### Tricount Management

- Create a new tricount instance (expense group)
- Invite users to join a tricount

### Expense Tracking

- Add expenses to a tricount
- Specify who paid and how the expense should be split
- View expense history

### Settlement

- Automatic computation of refunds/balances between participants
- Settle debts using EUTBL tokens (Spiko tokens)

## Tech Stack

This is an [Nx](https://nx.dev) monorepo containing:

- **App** (`app/`): React frontend application
- **Server** (`server/`): Node.js backend API built with esbuild
- **Database**: PostgreSQL 16

## Getting Started

### Option 1: GitHub Codespaces (Recommended)

The fastest way to get started is using GitHub Codespaces:

1. Click the "Open in GitHub Codespaces" badge above
2. Wait for the environment to build (2-3 minutes on first launch)
3. Once ready, run `pnpm nx run-many -t dev` to start the development servers

Everything is pre-configured: Node.js, pnpm, PostgreSQL, and VS Code extensions.

### Option 2: Local Development

#### Prerequisites

- Node.js LTS (v24.x)
- pnpm
- Docker (for PostgreSQL database)

#### Database Setup

Start the PostgreSQL database:

```sh
docker compose up -d
```

This starts a PostgreSQL instance with:

- **Host**: localhost
- **Port**: 5432
- **Database**: spiko_tricount
- **User**: postgres
- **Password**: postgres

To stop the database:

```sh
docker compose down
```

#### Installation

```sh
pnpm install
```

#### Development

Run all projects in watch mode:

```sh
pnpm nx run-many -t dev
```

This starts:

- **App**: http://localhost:4200 (React frontend)
- **Server**: http://localhost:3000 (API backend)

Run a specific project:

```sh
pnpm nx serve server
```

### Seed data

Populate the database with three users (Alice, Bob, Carol), one tricount, a few expenses and a settlement:

```sh
pnpm nx seed @spiko-tricount/server
```

The command prints the user ids to use in the `x-user-id` header.

## API

The backend exposes a JSON API on http://localhost:3000. Interactive documentation (Swagger UI) is served at http://localhost:3000/docs.

### Identity

There is no password based authentication. A user is created with `POST /users` and "signs in" with `POST /users/sign-in` (email only). Every other endpoint identifies the caller through the `x-user-id` header containing the user's id. A missing or unknown id yields `401 Unauthorized`. Signing out is a client concern: drop the header.

### Endpoints

| Method | Path                                 | Description                                                     |
| ------ | ------------------------------------ | --------------------------------------------------------------- |
| GET    | `/health`                            | Health check                                                    |
| POST   | `/users`                             | Sign up `{ email, name }` (409 if the email is taken)           |
| POST   | `/users/sign-in`                     | Sign in `{ email }` (404 if unknown)                            |
| GET    | `/users/me`                          | Current user                                                    |
| GET    | `/users`                             | All users                                                       |
| GET    | `/tricounts`                         | Tricounts the caller is a member of                             |
| POST   | `/tricounts`                         | Create `{ name, description }`, caller becomes owner            |
| GET    | `/tricounts/:id`                     | Tricount with its members                                       |
| DELETE | `/tricounts/:id`                     | Owner only (403 otherwise)                                      |
| POST   | `/tricounts/:id/members`             | Invite `{ email }` of an existing user (404 / 409)              |
| GET    | `/tricounts/:id/expenses`            | Expenses, newest first                                          |
| POST   | `/tricounts/:id/expenses`            | Create `{ title, amount, paidBy, participants, date? }`         |
| DELETE | `/tricounts/:id/expenses/:expenseId` | Delete an expense                                               |
| GET    | `/tricounts/:id/balances`            | Per member `{ paid, owed, balance }` and simplified `debts`     |
| GET    | `/tricounts/:id/settlements`         | Recorded EUTBL settlements                                      |
| POST   | `/tricounts/:id/settlements`         | Settle `{ toUserId, amount }` from the caller to another member |

Amounts are integers in cents. Expenses are split equally between `participants`; remainder cents go to the first participants sorted by id. A settlement counts as a payment from the caller to the recipient and offsets the balances.

### Build

```sh
npx nx run-many -t build
```

### Testing

```sh
npx nx run-many -t test
```

### Linting

```sh
npx nx run-many -t lint
```

## Project Structure

```
app/          # React frontend application
server/       # Node.js backend API (DDD architecture)
  src/
    domain/         # Business entities, repository interfaces
    application/    # Use cases, application services
    infrastructure/ # Database, repositories, migrations
    presentation/   # HTTP handlers, API routes
packages/     # Shared packages
libs/         # Shared libraries
```

## Useful Commands

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `npx nx graph`             | Visualize project dependencies |
| `npx nx affected -t build` | Build only affected projects   |
| `npx nx affected -t test`  | Test only affected projects    |

## Interview Instructions

Please refer to the instructions provided by your interviewer for specific requirements and evaluation criteria.

## License

MIT
