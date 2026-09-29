import { Array as Arr, Order, pipe } from 'effect';
import { UserId } from '@spiko-tricount/primitives';
import { Expense } from './expense.js';
import { Settlement } from './settlement.js';

export interface UserBalance {
  readonly userId: UserId;
  readonly paid: number;
  readonly owed: number;
  readonly balance: number;
}

export interface Debt {
  readonly from: UserId;
  readonly to: UserId;
  readonly amount: number;
}

const byUserId = Order.mapInput(Order.string, (userId: UserId) => userId);

export const splitEqually = (amount: number, participants: ReadonlyArray<UserId>): ReadonlyArray<[UserId, number]> => {
  const sorted = Arr.sort(Arr.dedupe(participants), byUserId);
  const base = Math.floor(amount / sorted.length);
  const remainder = amount - base * sorted.length;
  return sorted.map((userId, index) => [userId, index < remainder ? base + 1 : base]);
};

export const computeBalances = (
  members: ReadonlyArray<UserId>,
  expenses: ReadonlyArray<Expense>,
  settlements: ReadonlyArray<Settlement>
): ReadonlyArray<UserBalance> => {
  const paid = new Map<UserId, number>();
  const owed = new Map<UserId, number>();
  const add = (map: Map<UserId, number>, userId: UserId, amount: number) =>
    map.set(userId, (map.get(userId) ?? 0) + amount);

  for (const expense of expenses) {
    add(paid, expense.paidBy, expense.amount);
    for (const [userId, share] of splitEqually(expense.amount, expense.participants)) {
      add(owed, userId, share);
    }
  }

  for (const settlement of settlements) {
    add(paid, settlement.fromUserId, settlement.amount);
    add(owed, settlement.toUserId, settlement.amount);
  }

  const allUsers = Arr.dedupe([...members, ...paid.keys(), ...owed.keys()]);

  return pipe(
    allUsers,
    Arr.sort(byUserId),
    Arr.map((userId) => {
      const totalPaid = paid.get(userId) ?? 0;
      const totalOwed = owed.get(userId) ?? 0;
      return { userId, paid: totalPaid, owed: totalOwed, balance: totalPaid - totalOwed };
    })
  );
};

export const simplifyDebts = (balances: ReadonlyArray<UserBalance>): ReadonlyArray<Debt> => {
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ userId: b.userId, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining || byUserId(a.userId, b.userId));
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ userId: b.userId, remaining: -b.balance }))
    .sort((a, b) => b.remaining - a.remaining || byUserId(a.userId, b.userId));

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.remaining, creditor.remaining);
    if (amount > 0) {
      debts.push({ from: debtor.userId, to: creditor.userId, amount });
    }
    debtor.remaining -= amount;
    creditor.remaining -= amount;
    if (debtor.remaining === 0) i++;
    if (creditor.remaining === 0) j++;
  }
  return debts;
};
