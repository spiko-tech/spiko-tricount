import { SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, Schema } from 'effect';
import { UserId } from '@spiko-tricount/primitives';
import { TricountRepository } from '../domain/tricount-repository.js';
import { Membership, Tricount, TricountId } from '../domain/tricount.js';
import { catchSqlErrors } from './sql-errors.js';

class TricountRow extends Schema.Class<TricountRow>('TricountRow')({
  id: TricountId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  owner_id: UserId,
  created_at: Schema.DateTimeUtcFromDate,
  updated_at: Schema.DateTimeUtcFromDate,
}) {}

const TricountFromRow = Schema.transform(TricountRow, Schema.typeSchema(Tricount), {
  strict: true,
  decode: (row) =>
    new Tricount({
      id: row.id,
      name: row.name,
      description: Option.fromNullable(row.description),
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }),
  encode: (tricount) =>
    new TricountRow({
      id: tricount.id,
      name: tricount.name,
      description: Option.getOrNull(tricount.description),
      owner_id: tricount.ownerId,
      created_at: tricount.createdAt,
      updated_at: tricount.updatedAt,
    }),
});

class MembershipRow extends Schema.Class<MembershipRow>('MembershipRow')({
  tricount_id: TricountId,
  user_id: UserId,
  joined_at: Schema.DateTimeUtcFromDate,
}) {}

const MembershipFromRow = Schema.transform(MembershipRow, Schema.typeSchema(Membership), {
  strict: true,
  decode: (row) => new Membership({ tricountId: row.tricount_id, userId: row.user_id, joinedAt: row.joined_at }),
  encode: (m) => new MembershipRow({ tricount_id: m.tricountId, user_id: m.userId, joined_at: m.joinedAt }),
});

export const SqlTricountRepositoryLive = Layer.effect(
  TricountRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const store = SqlSchema.single({
      Request: Schema.typeSchema(Tricount),
      Result: TricountFromRow,
      execute: (tricount) =>
        Schema.encode(TricountFromRow)(tricount).pipe(
          Effect.flatMap(
            (row) => sql`
              INSERT INTO tricounts ${sql.insert(row)}
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                updated_at = EXCLUDED.updated_at
              RETURNING *
            `
          )
        ),
    });

    const findById = SqlSchema.findOne({
      Request: TricountId,
      Result: TricountFromRow,
      execute: (id) => sql`SELECT * FROM tricounts WHERE id = ${id}`,
    });

    const findByMember = SqlSchema.findAll({
      Request: UserId,
      Result: TricountFromRow,
      execute: (userId) => sql`
        SELECT t.* FROM tricounts t
        INNER JOIN tricount_members m ON m.tricount_id = t.id
        WHERE m.user_id = ${userId}
        ORDER BY t.created_at DESC
      `,
    });

    const deleteById = SqlSchema.findAll({
      Request: TricountId,
      Result: Schema.Struct({ id: TricountId }),
      execute: (id) => sql`DELETE FROM tricounts WHERE id = ${id} RETURNING id`,
    });

    const addMember = SqlSchema.single({
      Request: Schema.typeSchema(Membership),
      Result: MembershipFromRow,
      execute: (membership) =>
        Schema.encode(MembershipFromRow)(membership).pipe(
          Effect.flatMap(
            (row) => sql`
              INSERT INTO tricount_members ${sql.insert(row)}
              ON CONFLICT (tricount_id, user_id) DO UPDATE SET joined_at = tricount_members.joined_at
              RETURNING *
            `
          )
        ),
    });

    const findMembers = SqlSchema.findAll({
      Request: TricountId,
      Result: MembershipFromRow,
      execute: (tricountId) =>
        sql`SELECT * FROM tricount_members WHERE tricount_id = ${tricountId} ORDER BY joined_at ASC`,
    });

    return {
      store: (tricount: Tricount) => catchSqlErrors(store(tricount)),
      findById: (id: TricountId) => catchSqlErrors(findById(id)),
      findByMember: (userId: UserId) => catchSqlErrors(findByMember(userId)),
      delete: (id: TricountId) => catchSqlErrors(deleteById(id)).pipe(Effect.map((rows) => rows.length > 0)),
      addMember: (membership: Membership) => catchSqlErrors(addMember(membership)),
      findMembers: (tricountId: TricountId) => catchSqlErrors(findMembers(tricountId)),
    };
  })
);
