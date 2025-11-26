import { SqlClient } from '@effect/sql';
import { DateTime, Effect, Layer, Option } from 'effect';
import {
  TricountRepository,
  TricountRepositoryError,
} from '../domain/tricount-repository.js';
import { CreateTricount, Tricount } from '../domain/tricount.js';

/**
 * SQL-based implementation of TricountRepository
 */
export const SqlTricountRepositoryLive = Layer.effect(
  TricountRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const create = (data: CreateTricount) =>
      Effect.gen(function* () {
        const id = crypto.randomUUID();
        const now = DateTime.unsafeNow();

        const rows = yield* sql<{
          id: string;
          name: string;
          description: string | null;
          created_at: Date;
          updated_at: Date;
        }>`
          INSERT INTO tricounts (id, name, description, created_at, updated_at)
          VALUES (${id}, ${data.name}, ${Option.getOrNull(
          data.description
        )}, ${DateTime.toDate(now)}, ${DateTime.toDate(now)})
          RETURNING *
        `;

        const row = rows[0];
        return new Tricount({
          id: row.id,
          name: row.name,
          description: Option.fromNullable(row.description),
          createdAt: DateTime.unsafeFromDate(row.created_at),
          updatedAt: DateTime.unsafeFromDate(row.updated_at),
        });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to create tricount',
              cause: error,
            })
          )
        )
      );

    const findById = (id: string) =>
      Effect.gen(function* () {
        const rows = yield* sql<{
          id: string;
          name: string;
          description: string | null;
          created_at: Date;
          updated_at: Date;
        }>`
          SELECT * FROM tricounts WHERE id = ${id}
        `;

        if (rows.length === 0) {
          return Option.none<Tricount>();
        }

        const row = rows[0];
        return Option.some(
          new Tricount({
            id: row.id,
            name: row.name,
            description: Option.fromNullable(row.description),
            createdAt: DateTime.unsafeFromDate(row.created_at),
            updatedAt: DateTime.unsafeFromDate(row.updated_at),
          })
        );
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to find tricount',
              cause: error,
            })
          )
        )
      );

    const findAll = () =>
      Effect.gen(function* () {
        const rows = yield* sql<{
          id: string;
          name: string;
          description: string | null;
          created_at: Date;
          updated_at: Date;
        }>`
          SELECT * FROM tricounts ORDER BY created_at DESC
        `;

        return rows.map(
          (row) =>
            new Tricount({
              id: row.id,
              name: row.name,
              description: Option.fromNullable(row.description),
              createdAt: DateTime.unsafeFromDate(row.created_at),
              updatedAt: DateTime.unsafeFromDate(row.updated_at),
            })
        );
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to find tricounts',
              cause: error,
            })
          )
        )
      );

    const update = (id: string, data: Partial<CreateTricount>) =>
      Effect.gen(function* () {
        const now = DateTime.unsafeNow();

        const rows = yield* sql<{
          id: string;
          name: string;
          description: string | null;
          created_at: Date;
          updated_at: Date;
        }>`
          UPDATE tricounts
          SET
            name = COALESCE(${data.name ?? null}, name),
            description = COALESCE(${
              data.description ? Option.getOrNull(data.description) : null
            }, description),
            updated_at = ${DateTime.toDate(now)}
          WHERE id = ${id}
          RETURNING *
        `;

        if (rows.length === 0) {
          return Option.none<Tricount>();
        }

        const row = rows[0];
        return Option.some(
          new Tricount({
            id: row.id,
            name: row.name,
            description: Option.fromNullable(row.description),
            createdAt: DateTime.unsafeFromDate(row.created_at),
            updatedAt: DateTime.unsafeFromDate(row.updated_at),
          })
        );
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TricountRepositoryError({
              message: 'Failed to update tricount',
              cause: error,
            })
          )
        )
      );

    const deleteFn = (id: string) =>
      Effect.gen(function* () {
        const result = yield* sql`
          DELETE FROM tricounts WHERE id = ${id}
        `;

        return (
          result.length > 0 ||
          (result as unknown as { rowCount?: number }).rowCount !== 0
        );
      }).pipe(
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
      create,
      findById,
      findAll,
      update,
      delete: deleteFn,
    };
  })
);
