import { Schema } from 'effect';

export const TricountId = Schema.UUID.pipe(Schema.brand('TricountId'));
export type TricountId = typeof TricountId.Type;

export const UserId = Schema.UUID.pipe(Schema.brand('UserId'));
export type UserId = typeof UserId.Type;

export const ExpenseId = Schema.UUID.pipe(Schema.brand('ExpenseId'));
export type ExpenseId = typeof ExpenseId.Type;

export const SettlementId = Schema.UUID.pipe(Schema.brand('SettlementId'));
export type SettlementId = typeof SettlementId.Type;

export const Cents = Schema.Int.pipe(Schema.positive(), Schema.brand('Cents'));
export type Cents = typeof Cents.Type;

export const Email = Schema.compose(Schema.Trim, Schema.Lowercase).pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.brand('Email')
);
export type Email = typeof Email.Type;
