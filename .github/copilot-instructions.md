# Spiko Tricount - GitHub Copilot Instructions

## Build/Lint/Test Commands

- Install: `pnpm install`
- Build all: `pnpm exec nx run-many -t build`
- Lint all: `pnpm exec nx run-many -t lint`
- Test all: `pnpm exec nx run-many -t test`
- Typecheck all: `pnpm exec nx run-many -t typecheck`
- Single project: `pnpm exec nx test <project>` (e.g., `pnpm exec nx test api`)
- Single test file: `pnpm exec nx test <project> --testFile=<filename>`

## Code Style

- **Formatting**: Prettier with single quotes. Run `pnpm exec prettier --write <file>`
- **Imports**: Use `.js` extension for local imports (ESM). Use `@spiko-tricount/*` path aliases for libs
- **Types**: Strict TypeScript enabled. No implicit any, unused locals, or missing returns
- **Naming**: PascalCase for classes/components/schemas, camelCase for functions/variables
- **Components**: Function components with named exports. Use Tailwind for styling
- **Effect**: Use Effect-TS patterns - Schema.Class for data types, Layer for DI, Effect for async ops
- **Errors**: Use Effect's error handling. Define errors as Schema classes when needed
- **Tests**: Vitest with `describe`/`it` blocks. Place specs alongside source as `*.spec.ts`
