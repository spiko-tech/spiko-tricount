import { HttpApiClient, HttpClient, HttpClientRequest, FetchHttpClient } from '@effect/platform';
import { DateTime, Effect, Option } from 'effect';
import { Api, CURRENT_USER_HEADER, TricountResponse } from '@spiko-tricount/api';
import { TricountId } from '@spiko-tricount/primitives';

const API_BASE_URL = 'http://localhost:3000';
const CURRENT_USER_STORAGE_KEY = 'spiko-tricount:userId';

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_STORAGE_KEY);
}

export function setCurrentUserId(userId: string | null): void {
  if (userId === null) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, userId);
  }
}

export interface Tricount {
  id: TricountId;
  name: string;
  description: string | null;
  createdAt: DateTime.Utc;
  updatedAt: DateTime.Utc;
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
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

const makeApiClient = Effect.gen(function* () {
  return yield* HttpApiClient.make(Api, {
    baseUrl: API_BASE_URL,
    transformClient: HttpClient.mapRequest((request) => {
      const userId = getCurrentUserId();
      return userId === null ? request : HttpClientRequest.setHeader(request, CURRENT_USER_HEADER, userId);
    }),
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

export async function deleteTricount(id: TricountId): Promise<boolean> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* makeApiClient;
      const response = yield* client.tricounts.delete({ path: { id } });
      return response.success;
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );
}
