import { Schema } from 'effect';
import { Cents, ExpenseId, TricountId, UserId } from '@spiko-tricount/primitives';

export { ExpenseId, Cents };

export class Expense extends Schema.Class<Expense>('Expense')({
  id: ExpenseId,
  tricountId: TricountId,
  title: Schema.String,
  amount: Cents,
  paidBy: UserId,
  participants: Schema.NonEmptyArray(UserId),
  date: Schema.DateTimeUtc,
  createdAt: Schema.DateTimeUtc,
}) {}
