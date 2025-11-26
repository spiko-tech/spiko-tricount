import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { DateTime, Effect } from 'effect';

import { Api } from '@spiko-tricount/api';
import { TricountRepository } from '../domain/tricount-repository.js';
import { Tricount } from '../domain/tricount.js';

export const TricountsApiGroupLive = HttpApiBuilder.group(
  Api,
  'tricounts',
  (handlers) =>
    handlers
      .handle('list', () =>
        Effect.gen(function* () {
          const repo = yield* TricountRepository;
          const tricounts = yield* repo.findAll();

          return {
            tricounts: tricounts.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
            })),
          };
        }).pipe(
          Effect.catchAll(() =>
            Effect.fail(new HttpApiError.InternalServerError())
          )
        )
      )
      .handle('create', ({ payload }) =>
        Effect.gen(function* () {
          const repo = yield* TricountRepository;
          const now = yield* DateTime.now;

          const tricount = new Tricount({
            id: crypto.randomUUID() as typeof Tricount.fields.id.Type,
            name: payload.name,
            description: payload.description,
            createdAt: now,
            updatedAt: now,
          });

          const stored = yield* repo.store(tricount);

          return {
            id: stored.id,
            name: stored.name,
            description: stored.description,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
          };
        }).pipe(
          Effect.catchAll(() =>
            Effect.fail(new HttpApiError.InternalServerError())
          )
        )
      )
);
