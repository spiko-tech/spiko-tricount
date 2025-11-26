# App AGENTS.md

## Project Structure

- `src/routes/` - File-based routes (TanStack Router). `routeTree.gen.ts` is auto-generated
- `src/components/` - Reusable UI components
- `src/api/` - API client functions wrapping Effect-TS HttpApiClient
- `src/collections/` - TanStack DB collections for reactive data management

## API Layer

- API functions return Promises (not Effects) for TanStack DB compatibility
- Use `Effect.runPromise` to convert Effect-based API calls to Promises
- Transform API responses to frontend-friendly types (e.g., `Option` to `null`)

## Data Fetching

- Prefer suspense-based query hooks (e.g., `useLiveSuspenseQuery`) with `<Suspense>` boundaries over non-suspense alternatives
