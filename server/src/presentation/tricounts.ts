import { HttpApiBuilder } from '@effect/platform';
import { DateTime, Effect } from 'effect';

import {
  Api,
  TricountApiError,
  TricountResponse,
  TricountsListResponse,
} from '@spiko-tricount/api';
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

          return new TricountsListResponse({
            tricounts: tricounts.map(
              (t) =>
                new TricountResponse({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  createdAt: t.createdAt,
                  updatedAt: t.updatedAt,
                })
            ),
          });
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new TricountApiError({
                message: error.message,
              })
            )
          )
        )
      )
      .handle('create', ({ payload }) =>
        Effect.gen(function* () {
          const repo = yield* TricountRepository;
          const now = DateTime.unsafeNow();

          const tricount = new Tricount({
            id: crypto.randomUUID() as typeof Tricount.fields.id.Type,
            name: payload.name,
            description: payload.description,
            createdAt: now,
            updatedAt: now,
          });

          const stored = yield* repo.store(tricount);

          return new TricountResponse({
            id: stored.id,
            name: stored.name,
            description: stored.description,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
          });
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new TricountApiError({
                message: error.message,
              })
            )
          )
        )
      )
);
