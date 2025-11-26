import { SqlClient, SqlResolver, SqlSchema } from '@effect/sql';
import { DateTime, Effect, Layer, Option, ParseResult, Schema } from 'effect';
import { TricountRepository, TricountRepositoryError } from '../domain/tricount-repository.js';
import { Tricount, TricountId } from '../domain/tricount.js';

class TricountRow extends Schema.Class<TricountRow>('TricountRow')({
  id: TricountId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  created_at: Schema.DateFromSelf,
  updated_at: Schema.DateFromSelf,
}) {}

const TricountFromRow = Schema.transformOrFail(TricountRow, Schema.typeSchema(Tricount), {
  strict: true,
  decode: (row, _, ast) =>
    Effect.all({
      createdAt: DateTime.make(row.created_at),
      updatedAt: DateTime.make(row.updated_at),
    }).pipe(
      Effect.mapError(() => new ParseResult.Type(ast, row, 'Invalid date')),
      Effect.map(
        ({ createdAt, updatedAt }) =>
          new Tricount({
            id: row.id,
            name: row.name,
            description: Option.fromNullable(row.description),
            createdAt,
            updatedAt,
          })
      )
    ),
  encode: (tricount) =>
    Effect.succeed(
      new TricountRow({
        id: tricount.id,
        name: tricount.name,
        description: Option.getOrNull(tricount.description),
        created_at: DateTime.toDate(tricount.createdAt),
        updated_at: DateTime.toDate(tricount.updatedAt),
      })
    ),
});

const encodeTricount = Schema.encode(TricountFromRow);

export const SqlTricountRepositoryLive = Layer.effect(
  TricountRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const storeSchema = SqlSchema.single({
      Request: Schema.typeSchema(Tricount),
      Result: TricountFromRow,
      execute: (tricount) =>
        Effect.gen(function* () {
          const row = yield* encodeTricount(tricount);
          return sql`
            INSERT INTO tricounts ${sql.insert(row)}
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              updated_at = EXCLUDED.updated_at
            RETURNING *
          `;
        }).pipe(Effect.flatten),
    });

    const store = (tricount: Tricount) =>
      storeSchema(tricount).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to store tricount',
              cause: error,
            })
          )
        )
      );

    const findByIdResolver = yield* SqlResolver.findById('FindTricountById', {
      Id: TricountId,
      Result: TricountFromRow,
      ResultId: (result) => result.id,
      execute: (ids) => sql`SELECT * FROM tricounts WHERE id IN ${sql.in(ids)}`,
    });

    const findById = (id: TricountId) =>
      findByIdResolver.execute(id).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to find tricount',
              cause: error,
            })
          )
        )
      );

    const findAllSchema = SqlSchema.findAll({
      Request: Schema.Void,
      Result: TricountFromRow,
      execute: () => sql`SELECT * FROM tricounts ORDER BY created_at DESC`,
    });

    const findAll = () =>
      findAllSchema(undefined as void).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to find tricounts',
              cause: error,
            })
          )
        )
      );

    const deleteResolver = yield* SqlResolver.void('DeleteTricount', {
      Request: TricountId,
      execute: (ids) => sql`DELETE FROM tricounts WHERE id IN ${sql.in(ids)}`,
    });

    const deleteFn = (id: TricountId) =>
      deleteResolver.execute(id).pipe(
        Effect.map(() => true),
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to delete tricount',
              cause: error,
            })
          )
        )
      );

    return {
      store,
      findById,
      findAll,
      delete: deleteFn,
    };
  })
);
