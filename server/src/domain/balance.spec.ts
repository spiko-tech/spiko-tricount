import { DateTime, Option, Schema } from 'effect';
import { Cents, ExpenseId, SettlementId, TricountId, UserId } from '@spiko-tricount/primitives';
import { computeBalances, simplifyDebts, splitEqually } from './balance.js';
import { Expense } from './expense.js';
import { Settlement } from './settlement.js';

const alice = Schema.decodeSync(UserId)('00000000-0000-4000-8000-000000000001');
const bob = Schema.decodeSync(UserId)('00000000-0000-4000-8000-000000000002');
const carol = Schema.decodeSync(UserId)('00000000-0000-4000-8000-000000000003');
const tricountId = Schema.decodeSync(TricountId)('00000000-0000-4000-8000-0000000000aa');
const now = Option.getOrThrow(DateTime.make(0));

const expense = (id: string, paidBy: UserId, amount: number, participants: [UserId, ...UserId[]]) =>
  new Expense({
    id: Schema.decodeSync(ExpenseId)(`00000000-0000-4000-8000-0000000000${id}`),
    tricountId,
    title: 'expense',
    amount: Schema.decodeSync(Cents)(amount),
    paidBy,
    participants,
    date: now,
    createdAt: now,
  });

const settlement = (id: string, from: UserId, to: UserId, amount: number) =>
  new Settlement({
    id: Schema.decodeSync(SettlementId)(`00000000-0000-4000-8000-0000000000${id}`),
    tricountId,
    fromUserId: from,
    toUserId: to,
    amount: Schema.decodeSync(Cents)(amount),
    createdAt: now,
  });

describe('splitEqually', () => {
  it('splits evenly when divisible', () => {
    expect(splitEqually(300, [bob, alice, carol])).toEqual([
      [alice, 100],
      [bob, 100],
      [carol, 100],
    ]);
  });

  it('distributes remainder cents to the first participants sorted by id', () => {
    expect(splitEqually(100, [carol, bob, alice])).toEqual([
      [alice, 34],
      [bob, 33],
      [carol, 33],
    ]);
  });

  it('ignores duplicated participants', () => {
    expect(splitEqually(100, [alice, alice, bob])).toEqual([
      [alice, 50],
      [bob, 50],
    ]);
  });
});

describe('computeBalances', () => {
  it('returns zero balances for members without activity', () => {
    expect(computeBalances([alice, bob], [], [])).toEqual([
      { userId: alice, paid: 0, owed: 0, balance: 0 },
      { userId: bob, paid: 0, owed: 0, balance: 0 },
    ]);
  });

  it('computes paid, owed and balance from expenses', () => {
    const balances = computeBalances(
      [alice, bob, carol],
      [expense('10', alice, 3000, [alice, bob, carol]), expense('11', bob, 1000, [alice, bob])],
      []
    );
    expect(balances).toEqual([
      { userId: alice, paid: 3000, owed: 1500, balance: 1500 },
      { userId: bob, paid: 1000, owed: 1500, balance: -500 },
      { userId: carol, paid: 0, owed: 1000, balance: -1000 },
    ]);
  });

  it('applies settlements as payments from debtor to creditor', () => {
    const balances = computeBalances(
      [alice, bob],
      [expense('10', alice, 1000, [alice, bob])],
      [settlement('20', bob, alice, 500)]
    );
    expect(balances).toEqual([
      { userId: alice, paid: 1000, owed: 1000, balance: 0 },
      { userId: bob, paid: 500, owed: 500, balance: 0 },
    ]);
  });
});

describe('simplifyDebts', () => {
  it('returns no debts when everyone is settled', () => {
    expect(simplifyDebts(computeBalances([alice, bob], [], []))).toEqual([]);
  });

  it('produces a minimal set of transfers', () => {
    const balances = computeBalances(
      [alice, bob, carol],
      [expense('10', alice, 3000, [alice, bob, carol]), expense('11', bob, 1000, [alice, bob])],
      []
    );
    expect(simplifyDebts(balances)).toEqual([
      { from: carol, to: alice, amount: 1000 },
      { from: bob, to: alice, amount: 500 },
    ]);
  });

  it('sums of debts match total credit', () => {
    const balances = computeBalances(
      [alice, bob, carol],
      [expense('10', alice, 1000, [bob, carol]), expense('11', bob, 700, [alice, bob, carol])],
      []
    );
    const debts = simplifyDebts(balances);
    const totalCredit = balances.filter((b) => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
    expect(debts.reduce((sum, d) => sum + d.amount, 0)).toBe(totalCredit);
  });
});
