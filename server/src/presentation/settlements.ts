import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect } from 'effect';
import { Api, CurrentUser } from '@spiko-tricount/api';
import { SettlementService } from '../application/settlement-service.js';

export const SettlementsApiGroupLive = HttpApiBuilder.group(Api, 'settlements', (handlers) =>
  handlers
    .handle('balances', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* SettlementService;
        const user = yield* CurrentUser;
        return yield* service.getBalances(user.id, path.id);
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('list', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* SettlementService;
        const user = yield* CurrentUser;
        const settlements = yield* service.listSettlements(user.id, path.id);
        return { settlements };
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('create', ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* SettlementService;
        const user = yield* CurrentUser;
        return yield* service.settle({
          userId: user.id,
          tricountId: path.id,
          toUserId: payload.toUserId,
          amount: payload.amount,
        });
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          InvalidSettlement: () => new HttpApiError.BadRequest(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
);
