import { Context, DateTime, Effect, Layer, Option } from 'effect';

import { PersistenceError } from '../domain/errors.js';
import { Tricount, TricountId } from '../domain/tricount.js';
import { TricountRepository } from '../domain/tricount-repository.js';

export class TricountService extends Context.Tag('TricountService')<
  TricountService,
  {
    readonly listTricounts: () => Effect.Effect<ReadonlyArray<Tricount>, PersistenceError>;
    readonly createTricount: (params: {
      name: string;
      description: Option.Option<string>;
    }) => Effect.Effect<Tricount, PersistenceError>;
    readonly deleteTricount: (id: TricountId) => Effect.Effect<boolean, PersistenceError>;
  }
>() {}

export const TricountServiceLive = Layer.effect(
  TricountService,
  Effect.gen(function* () {
    const repo = yield* TricountRepository;

    return {
      listTricounts: () => repo.findAll(),

      createTricount: ({ name, description }) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;

          const tricount = new Tricount({
            id: crypto.randomUUID() as TricountId,
            name,
            description,
            createdAt: now,
            updatedAt: now,
          });

          return yield* repo.store(tricount);
        }),

      deleteTricount: (id: TricountId) => repo.delete(id),
    };
  })
);
