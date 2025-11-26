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
