import { SqlError } from '@effect/sql';
import { Cause, Effect, ParseResult } from 'effect';
import { PersistenceError } from '../domain/errors.js';

export const catchSqlErrors = <A, R>(
  effect: Effect.Effect<A, SqlError.SqlError | ParseResult.ParseError | Cause.NoSuchElementException, R>
): Effect.Effect<A, PersistenceError, R> =>
  effect.pipe(
    Effect.catchTags({
      SqlError: PersistenceError.fromSqlError,
      ParseError: PersistenceError.fromParseError,
      NoSuchElementException: PersistenceError.fromUnknownError,
    })
  );
