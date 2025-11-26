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
- **Tests**: Vitest with `describe`/`it` blocks. Place specs alongside source as `*.spec.ts`
- **Comments**: Avoid unnecessary comments. Code should be self-documenting through clear naming. No JSDoc or inline comments unless absolutely necessary for complex logic

## Effect-TS Guidelines

- Use Effect-TS patterns: `Schema.Class` for domain entities, `Schema.Struct` for API schemas, `Layer` for DI, `Effect` for async ops
- Never use `unsafe` methods (e.g., `unsafeNow`, `unsafeFromDate`, `unsafeMake`) - use safe alternatives like `DateTime.now` (Effect) or `DateTime.make` (Option) instead
- Use branded types for entity IDs (e.g., `Schema.UUID.pipe(Schema.brand('TricountId'))`)

## Error Handling

- Use `Schema.TaggedError` for domain errors, `HttpApiError.*` (e.g., `InternalServerError`, `NotFound`) for API errors
- In TaggedError `cause` fields, use `Schema.Defect` instead of `Schema.Unknown`
- Use `Effect.catchTag`/`Effect.catchTags` to handle specific errors by their `_tag` discriminator - never use `Effect.catchAll` which catches all errors indiscriminately
- `Schema.TaggedError` and `HttpApiError` are yieldable, so return them directly without `Effect.fail()` wrapper

## Server Architecture (DDD)

The server follows Domain-Driven Design with 4 layers:

- **domain/**: Business entities (Schema.Class), repository interfaces (Context.Tag), domain errors (Schema.TaggedError)
- **application/**: Use cases and application services (Context.Tag + Layer). Presentation layer should call application services, not repositories directly
- **infrastructure/**: Database, repositories implementations, external services, migrations
- **presentation/**: HTTP handlers, API routes, server configuration. Handlers should only depend on application services
