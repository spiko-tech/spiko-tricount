import { Context, DateTime, Effect, Layer, Option, Schema } from 'effect';

import { EmailAlreadyUsed, PersistenceError, UserNotFound } from '../domain/errors.js';
import { Email, User, UserId } from '../domain/user.js';
import { UserRepository } from '../domain/user-repository.js';

export class UserService extends Context.Tag('UserService')<
  UserService,
  {
    readonly signUp: (params: {
      email: Email;
      name: string;
    }) => Effect.Effect<User, PersistenceError | EmailAlreadyUsed>;
    readonly signIn: (email: Email) => Effect.Effect<User, PersistenceError | UserNotFound>;
    readonly getById: (id: UserId) => Effect.Effect<User, PersistenceError | UserNotFound>;
    readonly listUsers: () => Effect.Effect<ReadonlyArray<User>, PersistenceError>;
  }
>() {}

export const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const repo = yield* UserRepository;

    return {
      signUp: ({ email, name }) =>
        Effect.gen(function* () {
          const existing = yield* repo.findByEmail(email);
          if (Option.isSome(existing)) {
            return yield* new EmailAlreadyUsed({ email });
          }
          const now = yield* DateTime.now;
          const id = yield* Schema.decode(UserId)(crypto.randomUUID());
          return yield* repo.store(new User({ id, email, name, createdAt: now }));
        }).pipe(Effect.catchTag('ParseError', PersistenceError.fromParseError)),

      signIn: (email) =>
        repo
          .findByEmail(email)
          .pipe(
            Effect.flatMap(
              Option.match({ onNone: () => new UserNotFound({ identifier: email }), onSome: Effect.succeed })
            )
          ),

      getById: (id) =>
        repo
          .findById(id)
          .pipe(
            Effect.flatMap(Option.match({ onNone: () => new UserNotFound({ identifier: id }), onSome: Effect.succeed }))
          ),

      listUsers: () => repo.findAll(),
    };
  })
);
