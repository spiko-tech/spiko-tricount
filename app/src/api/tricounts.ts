import { HttpApiClient, FetchHttpClient } from '@effect/platform';
import { Effect, Option } from 'effect';
import { Api, TricountResponse } from '@spiko-tricount/api';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Tricount type for frontend use (with plain values instead of Effect types)
 */
export interface Tricount {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTricountInput {
  name: string;
  description: string | null;
}

/**
 * Convert TricountResponse to plain Tricount object
 */
function toTricount(response: TricountResponse): Tricount {
  return {
    id: response.id,
    name: response.name,
    description: Option.getOrNull(response.description),
    createdAt: response.createdAt.toString(),
    updatedAt: response.updatedAt.toString(),
  };
}

/**
 * Create the API client effect
 */
const makeApiClient = Effect.gen(function* () {
  return yield* HttpApiClient.make(Api, {
    baseUrl: API_BASE_URL,
  });
});

/**
 * Fetch all tricounts
 */
export async function fetchTricounts(): Promise<Tricount[]> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* makeApiClient;
      const response = yield* client.tricounts.list();
      return response.tricounts.map(toTricount);
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );
}

/**
 * Create a new tricount
 */
export async function createTricount(
  input: CreateTricountInput
): Promise<Tricount> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* makeApiClient;
      const response = yield* client.tricounts.create({
        payload: {
          name: input.name,
          description: Option.fromNullable(input.description),
        },
      });
      return toTricount(response);
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );
}
