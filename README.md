# Spiko Tricount

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

## Getting Started

### Prerequisites

- Node.js LTS (v24.x)
- pnpm

### Installation

```sh
pnpm install
```

### Development

Run all projects in watch mode:

```sh
pnpm nx run-many -t serve
```

This starts:

- **App**: http://localhost:4200 (React frontend)
- **Server**: http://localhost:3000 (API backend)

Run a specific project:

```sh
pnpm nx serve server
```

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
server/       # Node.js backend API
packages/     # Shared packages
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
