import { Context, DateTime, Effect, Layer, Option } from 'effect';

import { Tricount, TricountId } from '../domain/tricount.js';
import { TricountRepository, TricountRepositoryError } from '../domain/tricount-repository.js';

export class TricountService extends Context.Tag('TricountService')<
  TricountService,
  {
    readonly listTricounts: () => Effect.Effect<ReadonlyArray<Tricount>, TricountRepositoryError>;
    readonly createTricount: (params: {
      name: string;
      description: Option.Option<string>;
    }) => Effect.Effect<Tricount, TricountRepositoryError>;
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
    };
  })
);
