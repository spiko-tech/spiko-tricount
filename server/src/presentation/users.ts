import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect } from 'effect';
import { Api, CurrentUser } from '@spiko-tricount/api';
import { UserService } from '../application/user-service.js';

export const UsersApiGroupLive = HttpApiBuilder.group(Api, 'users', (handlers) =>
  handlers
    .handle('signUp', ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* UserService;
        return yield* service.signUp(payload);
      }).pipe(
        Effect.catchTags({
          EmailAlreadyUsed: () => new HttpApiError.Conflict(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('signIn', ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* UserService;
        return yield* service.signIn(payload.email);
      }).pipe(
        Effect.catchTags({
          UserNotFound: () => new HttpApiError.NotFound(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('list', () =>
      Effect.gen(function* () {
        const service = yield* UserService;
        const users = yield* service.listUsers();
        return { users };
      }).pipe(Effect.catchTag('PersistenceError', () => new HttpApiError.InternalServerError()))
    )
    .handle('me', () => CurrentUser)
);
