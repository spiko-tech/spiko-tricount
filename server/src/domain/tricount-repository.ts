import { Context, Effect, Option, Schema } from 'effect';
import { Tricount } from './tricount.js';

export class TricountRepositoryError extends Schema.TaggedError<TricountRepositoryError>()(
  'TricountRepositoryError',
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

export class TricountRepository extends Context.Tag('TricountRepository')<
  TricountRepository,
  {
    readonly store: (
      tricount: Tricount
    ) => Effect.Effect<Tricount, TricountRepositoryError>;
    readonly findById: (
      id: string
    ) => Effect.Effect<Option.Option<Tricount>, TricountRepositoryError>;
    readonly findAll: () => Effect.Effect<
      ReadonlyArray<Tricount>,
      TricountRepositoryError
    >;
    readonly delete: (
      id: string
    ) => Effect.Effect<boolean, TricountRepositoryError>;
  }
>() {}
