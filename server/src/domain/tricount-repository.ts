import { Context, Effect, Option } from 'effect';
import { UserId } from '@spiko-tricount/primitives';
import { PersistenceError } from './errors.js';
import { Membership, Tricount, TricountId } from './tricount.js';

export class TricountRepository extends Context.Tag('TricountRepository')<
  TricountRepository,
  {
    readonly store: (tricount: Tricount) => Effect.Effect<Tricount, PersistenceError>;
    readonly findById: (id: TricountId) => Effect.Effect<Option.Option<Tricount>, PersistenceError>;
    readonly findByMember: (userId: UserId) => Effect.Effect<ReadonlyArray<Tricount>, PersistenceError>;
    readonly delete: (id: TricountId) => Effect.Effect<boolean, PersistenceError>;
    readonly addMember: (membership: Membership) => Effect.Effect<Membership, PersistenceError>;
    readonly findMembers: (tricountId: TricountId) => Effect.Effect<ReadonlyArray<Membership>, PersistenceError>;
  }
>() {}
