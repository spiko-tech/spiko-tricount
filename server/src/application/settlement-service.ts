import { Context, DateTime, Effect, Layer, Schema } from 'effect';
import { Cents, TricountId, UserId } from '@spiko-tricount/primitives';

import { computeBalances, Debt, simplifyDebts, UserBalance } from '../domain/balance.js';
import { InvalidSettlement, NotAMember, PersistenceError, TricountNotFound } from '../domain/errors.js';
import { ExpenseRepository } from '../domain/expense-repository.js';
import { Settlement, SettlementId } from '../domain/settlement.js';
import { SettlementRepository } from '../domain/settlement-repository.js';
import { TricountService } from './tricount-service.js';

export interface Balances {
  readonly balances: ReadonlyArray<UserBalance>;
  readonly debts: ReadonlyArray<Debt>;
}

export class SettlementService extends Context.Tag('SettlementService')<
  SettlementService,
  {
    readonly getBalances: (
      userId: UserId,
      tricountId: TricountId
    ) => Effect.Effect<Balances, PersistenceError | TricountNotFound | NotAMember>;
    readonly listSettlements: (
      userId: UserId,
      tricountId: TricountId
    ) => Effect.Effect<ReadonlyArray<Settlement>, PersistenceError | TricountNotFound | NotAMember>;
    readonly settle: (params: {
      userId: UserId;
      tricountId: TricountId;
      toUserId: UserId;
      amount: Cents;
    }) => Effect.Effect<Settlement, PersistenceError | TricountNotFound | NotAMember | InvalidSettlement>;
  }
>() {}

export const SettlementServiceLive = Layer.effect(
  SettlementService,
  Effect.gen(function* () {
    const settlements = yield* SettlementRepository;
    const expenses = yield* ExpenseRepository;
    const tricounts = yield* TricountService;

    return {
      getBalances: (userId, tricountId) =>
        Effect.gen(function* () {
          const members = yield* tricounts.ensureMember(userId, tricountId);
          const [allExpenses, allSettlements] = yield* Effect.all(
            [expenses.findByTricount(tricountId), settlements.findByTricount(tricountId)],
            { concurrency: 'unbounded' }
          );
          const balances = computeBalances(
            members.map((m) => m.userId),
            allExpenses,
            allSettlements
          );
          return { balances, debts: simplifyDebts(balances) };
        }),

      listSettlements: (userId, tricountId) =>
        tricounts.ensureMember(userId, tricountId).pipe(Effect.flatMap(() => settlements.findByTricount(tricountId))),

      settle: ({ userId, tricountId, toUserId, amount }) =>
        Effect.gen(function* () {
          const members = yield* tricounts.ensureMember(userId, tricountId);
          if (toUserId === userId) {
            return yield* new InvalidSettlement({ reason: 'Cannot settle a debt with yourself' });
          }
          if (!members.some((m) => m.userId === toUserId)) {
            return yield* new InvalidSettlement({ reason: `User ${toUserId} is not a member of this tricount` });
          }
          const now = yield* DateTime.now;
          const id = yield* Schema.decode(SettlementId)(crypto.randomUUID());
          return yield* settlements.store(
            new Settlement({ id, tricountId, fromUserId: userId, toUserId, amount, createdAt: now })
          );
        }).pipe(Effect.catchTag('ParseError', PersistenceError.fromParseError)),
    };
  })
);
