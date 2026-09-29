import { HttpApiError } from '@effect/platform';
import { Effect, Layer, Redacted, Schema } from 'effect';
import { Authenticated } from '@spiko-tricount/api';
import { UserId } from '@spiko-tricount/primitives';
import { UserService } from '../application/user-service.js';

export const AuthenticatedLive = Layer.effect(
  Authenticated,
  Effect.gen(function* () {
    const users = yield* UserService;
    return {
      userId: (header) =>
        Effect.gen(function* () {
          const id = yield* Schema.decode(UserId)(Redacted.value(header));
          const user = yield* users.getById(id);
          return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
        }).pipe(
          Effect.catchTags({
            ParseError: () => new HttpApiError.Unauthorized(),
            UserNotFound: () => new HttpApiError.Unauthorized(),
            PersistenceError: () => new HttpApiError.Unauthorized(),
          })
        ),
    };
  })
);
