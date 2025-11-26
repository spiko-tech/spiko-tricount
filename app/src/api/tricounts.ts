import { HttpApiClient, FetchHttpClient } from '@effect/platform';
import { Effect, Option } from 'effect';
import { Api, TricountResponse } from '@spiko-tricount/api';

const API_BASE_URL = 'http://localhost:3000';

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

function toTricount(response: TricountResponse): Tricount {
  return {
    id: response.id,
    name: response.name,
    description: Option.getOrNull(response.description),
    createdAt: response.createdAt.toString(),
    updatedAt: response.updatedAt.toString(),
  };
}

const makeApiClient = Effect.gen(function* () {
  return yield* HttpApiClient.make(Api, {
    baseUrl: API_BASE_URL,
  });
});

export async function fetchTricounts(): Promise<Tricount[]> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* makeApiClient;
      const response = yield* client.tricounts.list();
      return response.tricounts.map(toTricount);
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );
}

export async function createTricount(input: CreateTricountInput): Promise<Tricount> {
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

export async function deleteTricount(id: string): Promise<boolean> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* makeApiClient;
      const response = yield* client.tricounts.delete({
        path: { id },
      });
      return response.success;
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );
}
