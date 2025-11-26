# AGENTS.md

## Build/Lint/Test Commands

- Install: `pnpm install`
- Start database: `docker compose up -d`
- Stop database: `docker compose down`
- Dev: `pnpm nx run-many -t dev` (app on localhost:4200, server on localhost:3000)
- Build all: `pnpm nx run-many -t build`
- Lint all: `pnpm nx run-many -t lint`
- Test all: `pnpm nx run-many -t test`
- Typecheck all: `pnpm nx run-many -t typecheck`
- Single project: `pnpm nx test <project>` (e.g., `pnpm nx test api`)
- Single test file: `pnpm nx test <project> --testFile=<filename>`

## Code Style

- **Formatting**: Prettier. Run `pnpm nx run-many -t lint --fix`
- **Imports**: Use `.js` extension for local imports (ESM). Use `@spiko-tricount/*` path aliases for libs
- **Types**: Strict TypeScript enabled. No implicit any, unused locals, or missing returns
- **Naming**: PascalCase for classes/components/schemas, camelCase for functions/variables
- **Components**: Function components with named exports. Use Tailwind for styling
- **Effect**: Use Effect-TS patterns - Schema.Class for data types, Layer for DI, Effect for async ops
- **Errors**: Always use `Schema.TaggedError` for custom errors
- **Tests**: Vitest with `describe`/`it` blocks. Place specs alongside source as `*.spec.ts`

## Server Architecture (DDD)

The server follows Domain-Driven Design with 4 layers:

- **domain/**: Business entities (Schema.Class), repository interfaces (Context.Tag), domain errors (Schema.TaggedError)
- **application/**: Use cases and application services
- **infrastructure/**: Database, repositories implementations, external services, migrations
- **presentation/**: HTTP handlers, API routes, server configuration
