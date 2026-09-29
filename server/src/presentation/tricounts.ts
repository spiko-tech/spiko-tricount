import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect } from 'effect';
import { Api, CurrentUser } from '@spiko-tricount/api';
import { TricountDetails, TricountService } from '../application/tricount-service.js';

const toDetails = ({ tricount, members }: TricountDetails) => ({ ...tricount, members });

export const TricountsApiGroupLive = HttpApiBuilder.group(Api, 'tricounts', (handlers) =>
  handlers
    .handle('list', () =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const user = yield* CurrentUser;
        const tricounts = yield* service.listTricounts(user.id);
        return { tricounts };
      }).pipe(Effect.catchTag('PersistenceError', () => new HttpApiError.InternalServerError()))
    )
    .handle('create', ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const user = yield* CurrentUser;
        return yield* service.createTricount({
          ownerId: user.id,
          name: payload.name,
          description: payload.description,
        });
      }).pipe(Effect.catchTag('PersistenceError', () => new HttpApiError.InternalServerError()))
    )
    .handle('get', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const user = yield* CurrentUser;
        return toDetails(yield* service.getTricount(user.id, path.id));
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('delete', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const user = yield* CurrentUser;
        const success = yield* service.deleteTricount(user.id, path.id);
        return { success };
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotTheOwner: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('addMember', ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* TricountService;
        const user = yield* CurrentUser;
        return toDetails(yield* service.addMember({ userId: user.id, tricountId: path.id, email: payload.email }));
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          UserNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          AlreadyAMember: () => new HttpApiError.Conflict(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
);
