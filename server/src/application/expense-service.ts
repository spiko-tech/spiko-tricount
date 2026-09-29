import { Context, DateTime, Effect, Layer, Option, Schema } from 'effect';
import { Cents, TricountId, UserId } from '@spiko-tricount/primitives';

import { ExpenseNotFound, InvalidExpense, NotAMember, PersistenceError, TricountNotFound } from '../domain/errors.js';
import { Expense, ExpenseId } from '../domain/expense.js';
import { ExpenseRepository } from '../domain/expense-repository.js';
import { TricountService } from './tricount-service.js';

export class ExpenseService extends Context.Tag('ExpenseService')<
  ExpenseService,
  {
    readonly listExpenses: (
      userId: UserId,
      tricountId: TricountId
    ) => Effect.Effect<ReadonlyArray<Expense>, PersistenceError | TricountNotFound | NotAMember>;
    readonly createExpense: (params: {
      userId: UserId;
      tricountId: TricountId;
      title: string;
      amount: Cents;
      paidBy: UserId;
      participants: readonly [UserId, ...UserId[]];
      date: Option.Option<DateTime.Utc>;
    }) => Effect.Effect<Expense, PersistenceError | TricountNotFound | NotAMember | InvalidExpense>;
    readonly deleteExpense: (
      userId: UserId,
      tricountId: TricountId,
      expenseId: ExpenseId
    ) => Effect.Effect<boolean, PersistenceError | TricountNotFound | NotAMember | ExpenseNotFound>;
  }
>() {}

export const ExpenseServiceLive = Layer.effect(
  ExpenseService,
  Effect.gen(function* () {
    const repo = yield* ExpenseRepository;
    const tricounts = yield* TricountService;

    return {
      listExpenses: (userId, tricountId) =>
        tricounts.ensureMember(userId, tricountId).pipe(Effect.flatMap(() => repo.findByTricount(tricountId))),

      createExpense: ({ userId, tricountId, title, amount, paidBy, participants, date }) =>
        Effect.gen(function* () {
          const members = yield* tricounts.ensureMember(userId, tricountId);
          const memberIds = new Set(members.map((m) => m.userId));
          if (!memberIds.has(paidBy)) {
            return yield* new InvalidExpense({ reason: `Payer ${paidBy} is not a member of this tricount` });
          }
          const outsider = participants.find((p) => !memberIds.has(p));
          if (outsider !== undefined) {
            return yield* new InvalidExpense({ reason: `Participant ${outsider} is not a member of this tricount` });
          }
          const now = yield* DateTime.now;
          const id = yield* Schema.decode(ExpenseId)(crypto.randomUUID());
          return yield* repo.store(
            new Expense({
              id,
              tricountId,
              title,
              amount,
              paidBy,
              participants,
              date: Option.getOrElse(date, () => now),
              createdAt: now,
            })
          );
        }).pipe(Effect.catchTag('ParseError', PersistenceError.fromParseError)),

      deleteExpense: (userId, tricountId, expenseId) =>
        Effect.gen(function* () {
          yield* tricounts.ensureMember(userId, tricountId);
          const expense = yield* repo.findById(expenseId);
          if (Option.isNone(expense) || expense.value.tricountId !== tricountId) {
            return yield* new ExpenseNotFound({ expenseId });
          }
          return yield* repo.delete(expenseId);
        }),
    };
  })
);
