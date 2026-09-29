import { Context, Effect, Option } from 'effect';
import { TricountId } from '@spiko-tricount/primitives';
import { PersistenceError } from './errors.js';
import { Expense, ExpenseId } from './expense.js';

export class ExpenseRepository extends Context.Tag('ExpenseRepository')<
  ExpenseRepository,
  {
    readonly store: (expense: Expense) => Effect.Effect<Expense, PersistenceError>;
    readonly findById: (id: ExpenseId) => Effect.Effect<Option.Option<Expense>, PersistenceError>;
    readonly findByTricount: (tricountId: TricountId) => Effect.Effect<ReadonlyArray<Expense>, PersistenceError>;
    readonly delete: (id: ExpenseId) => Effect.Effect<boolean, PersistenceError>;
  }
>() {}
