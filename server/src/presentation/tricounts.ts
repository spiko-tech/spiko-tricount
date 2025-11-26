import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';

import {
  Api,
  TricountApiError,
  TricountResponse,
  TricountsListResponse,
} from '@spiko-tricount/api';
import { TricountRepository } from '../domain/tricount-repository.js';
import { CreateTricount } from '../domain/tricount.js';

/**
 * Implementation of the Tricounts API group handlers
 */
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

          const createData = new CreateTricount({
            name: payload.name,
            description: payload.description,
          });

          const tricount = yield* repo.create(createData);

          return new TricountResponse({
            id: tricount.id,
            name: tricount.name,
            description: tricount.description,
            createdAt: tricount.createdAt,
            updatedAt: tricount.updatedAt,
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
