import { SqlClient, SqlResolver, SqlSchema } from '@effect/sql';
import { DateTime, Effect, Layer, Option, Schema } from 'effect';
import {
  TricountRepository,
  TricountRepositoryError,
} from '../domain/tricount-repository.js';
import { Tricount } from '../domain/tricount.js';

/**
 * Database row schema representing the raw SQL result
 */
class TricountRow extends Schema.Class<TricountRow>('TricountRow')({
  id: Schema.String,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  created_at: Schema.DateFromSelf,
  updated_at: Schema.DateFromSelf,
}) {}

/**
 * Transform from database row to domain entity
 */
const TricountFromRow = Schema.transform(
  TricountRow,
  Schema.typeSchema(Tricount),
  {
    strict: true,
    decode: (row) =>
      new Tricount({
        id: row.id as typeof Tricount.fields.id.Type,
        name: row.name,
        description: Option.fromNullable(row.description),
        createdAt: DateTime.unsafeFromDate(row.created_at),
        updatedAt: DateTime.unsafeFromDate(row.updated_at),
      }),
    encode: (tricount) =>
      new TricountRow({
        id: tricount.id,
        name: tricount.name,
        description: Option.getOrNull(tricount.description),
        created_at: DateTime.toDate(tricount.createdAt),
        updated_at: DateTime.toDate(tricount.updatedAt),
      }),
  }
);

/**
 * SQL-based implementation of TricountRepository
 */
export const SqlTricountRepositoryLive = Layer.effect(
  TricountRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    // Store tricount using upsert (insert or update on conflict)
    const storeSchema = SqlSchema.single({
      Request: Schema.typeSchema(Tricount),
      Result: TricountFromRow,
      execute: (tricount) => {
        const description = Option.getOrNull(tricount.description);
        const createdAt = DateTime.toDate(tricount.createdAt);
        const updatedAt = DateTime.toDate(tricount.updatedAt);
        return sql`
          INSERT INTO tricounts (id, name, description, created_at, updated_at)
          VALUES (${tricount.id}, ${tricount.name}, ${description}, ${createdAt}, ${updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            updated_at = EXCLUDED.updated_at
          RETURNING *
        `;
      },
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

    // Find tricount by ID using SqlResolver for caching/batching support
    const findByIdResolver = yield* SqlResolver.findById('FindTricountById', {
      Id: Schema.String,
      Result: TricountFromRow,
      ResultId: (result) => result.id,
      execute: (ids) => sql`SELECT * FROM tricounts WHERE id IN ${sql.in(ids)}`,
    });

    const findById = (id: string) =>
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

    // Find all tricounts
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

    // Delete tricount using SqlResolver.void for side effects
    const deleteResolver = yield* SqlResolver.void('DeleteTricount', {
      Request: Schema.String,
      execute: (ids) => sql`DELETE FROM tricounts WHERE id IN ${sql.in(ids)}`,
    });

    const deleteFn = (id: string) =>
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
