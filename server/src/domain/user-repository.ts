import { Context, Effect, Option } from 'effect';
import { PersistenceError } from './errors.js';
import { Email, User, UserId } from './user.js';

export class UserRepository extends Context.Tag('UserRepository')<
  UserRepository,
  {
    readonly store: (user: User) => Effect.Effect<User, PersistenceError>;
    readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>, PersistenceError>;
    readonly findByEmail: (email: Email) => Effect.Effect<Option.Option<User>, PersistenceError>;
    readonly findByIds: (ids: ReadonlyArray<UserId>) => Effect.Effect<ReadonlyArray<User>, PersistenceError>;
    readonly findAll: () => Effect.Effect<ReadonlyArray<User>, PersistenceError>;
  }
>() {}
