import { Context, Effect } from 'effect';
import { TricountId } from '@spiko-tricount/primitives';
import { PersistenceError } from './errors.js';
import { Settlement } from './settlement.js';

export class SettlementRepository extends Context.Tag('SettlementRepository')<
  SettlementRepository,
  {
    readonly store: (settlement: Settlement) => Effect.Effect<Settlement, PersistenceError>;
    readonly findByTricount: (tricountId: TricountId) => Effect.Effect<ReadonlyArray<Settlement>, PersistenceError>;
  }
>() {}
