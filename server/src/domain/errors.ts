import { SqlError } from '@effect/sql';
import { ParseResult, Schema } from 'effect';

export const getUnknownErrorMessage = (e: unknown): string => {
  if (e instanceof Error) {
    return 'reason' in e && typeof e.reason === 'string' ? e.reason : e.message;
  }
  return `Unknown error: ${e}`;
};

export class PersistenceError extends Schema.TaggedError<PersistenceError>()('PersistenceError', {
  reason: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {
  static fromSqlError = (e: SqlError.SqlError) => new PersistenceError({ reason: e.message, cause: e.cause });
  static fromUnknownError = (e: unknown): PersistenceError =>
    new PersistenceError({ reason: getUnknownErrorMessage(e), cause: e });
  static fromParseError = (e: ParseResult.ParseError): PersistenceError =>
    new PersistenceError({ reason: ParseResult.TreeFormatter.formatErrorSync(e), cause: e });
}

export class UserNotFound extends Schema.TaggedError<UserNotFound>()('UserNotFound', {
  identifier: Schema.String,
}) {}

export class EmailAlreadyUsed extends Schema.TaggedError<EmailAlreadyUsed>()('EmailAlreadyUsed', {
  email: Schema.String,
}) {}

export class TricountNotFound extends Schema.TaggedError<TricountNotFound>()('TricountNotFound', {
  tricountId: Schema.String,
}) {}

export class NotAMember extends Schema.TaggedError<NotAMember>()('NotAMember', {
  tricountId: Schema.String,
  userId: Schema.String,
}) {}

export class NotTheOwner extends Schema.TaggedError<NotTheOwner>()('NotTheOwner', {
  tricountId: Schema.String,
  userId: Schema.String,
}) {}

export class AlreadyAMember extends Schema.TaggedError<AlreadyAMember>()('AlreadyAMember', {
  tricountId: Schema.String,
  userId: Schema.String,
}) {}

export class ExpenseNotFound extends Schema.TaggedError<ExpenseNotFound>()('ExpenseNotFound', {
  expenseId: Schema.String,
}) {}

export class InvalidExpense extends Schema.TaggedError<InvalidExpense>()('InvalidExpense', {
  reason: Schema.String,
}) {}

export class InvalidSettlement extends Schema.TaggedError<InvalidSettlement>()('InvalidSettlement', {
  reason: Schema.String,
}) {}
