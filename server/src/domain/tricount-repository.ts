import { Context, Effect, Option } from 'effect';
import { PersistenceError } from './errors.js';
import { Tricount, TricountId } from './tricount.js';

export class TricountRepository extends Context.Tag('TricountRepository')<
  TricountRepository,
  {
    readonly store: (tricount: Tricount) => Effect.Effect<Tricount, PersistenceError>;
    readonly findById: (id: TricountId) => Effect.Effect<Option.Option<Tricount>, PersistenceError>;
    readonly findAll: () => Effect.Effect<ReadonlyArray<Tricount>, PersistenceError>;
    readonly delete: (id: TricountId) => Effect.Effect<boolean, PersistenceError>;
  }
>() {}
