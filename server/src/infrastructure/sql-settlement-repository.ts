import { SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Schema } from 'effect';
import { Cents, TricountId, UserId } from '@spiko-tricount/primitives';
import { Settlement, SettlementId } from '../domain/settlement.js';
import { SettlementRepository } from '../domain/settlement-repository.js';
import { catchSqlErrors } from './sql-errors.js';

class SettlementRow extends Schema.Class<SettlementRow>('SettlementRow')({
  id: SettlementId,
  tricount_id: TricountId,
  from_user_id: UserId,
  to_user_id: UserId,
  amount: Cents,
  created_at: Schema.DateTimeUtcFromDate,
}) {}

const SettlementFromRow = Schema.transform(SettlementRow, Schema.typeSchema(Settlement), {
  strict: true,
  decode: (row) =>
    new Settlement({
      id: row.id,
      tricountId: row.tricount_id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      amount: row.amount,
      createdAt: row.created_at,
    }),
  encode: (s) =>
    new SettlementRow({
      id: s.id,
      tricount_id: s.tricountId,
      from_user_id: s.fromUserId,
      to_user_id: s.toUserId,
      amount: s.amount,
      created_at: s.createdAt,
    }),
});

export const SqlSettlementRepositoryLive = Layer.effect(
  SettlementRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const store = SqlSchema.single({
      Request: Schema.typeSchema(Settlement),
      Result: SettlementFromRow,
      execute: (settlement) =>
        Schema.encode(SettlementFromRow)(settlement).pipe(
          Effect.flatMap((row) => sql`INSERT INTO settlements ${sql.insert(row)} RETURNING *`)
        ),
    });

    const findByTricount = SqlSchema.findAll({
      Request: TricountId,
      Result: SettlementFromRow,
      execute: (tricountId) =>
        sql`SELECT * FROM settlements WHERE tricount_id = ${tricountId} ORDER BY created_at DESC`,
    });

    return {
      store: (settlement: Settlement) => catchSqlErrors(store(settlement)),
      findByTricount: (tricountId: TricountId) => catchSqlErrors(findByTricount(tricountId)),
    };
  })
);
