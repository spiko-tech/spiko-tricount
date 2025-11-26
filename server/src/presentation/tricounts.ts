import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect } from 'effect';
import { Api } from '@spiko-tricount/api';
import { TricountService } from '../application/tricount-service.js';

export const TricountsApiGroupLive = HttpApiBuilder.group(Api, 'tricounts', (handlers) =>
  handlers
    .handle('list', () =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const tricounts = yield* service.listTricounts();
        return { tricounts };
      }).pipe(Effect.catchTag('PersistenceError', () => new HttpApiError.InternalServerError()))
    )
    .handle('create', ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const tricount = yield* service.createTricount({
          name: payload.name,
          description: payload.description,
        });
        return tricount;
      }).pipe(Effect.catchTag('PersistenceError', () => new HttpApiError.InternalServerError()))
    )
);
