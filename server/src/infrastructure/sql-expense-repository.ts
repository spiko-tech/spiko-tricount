import { SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Schema } from 'effect';
import { Cents, TricountId, UserId } from '@spiko-tricount/primitives';
import { ExpenseRepository } from '../domain/expense-repository.js';
import { Expense, ExpenseId } from '../domain/expense.js';
import { catchSqlErrors } from './sql-errors.js';

class ExpenseRow extends Schema.Class<ExpenseRow>('ExpenseRow')({
  id: ExpenseId,
  tricount_id: TricountId,
  title: Schema.String,
  amount: Cents,
  paid_by: UserId,
  participants: Schema.NonEmptyArray(UserId),
  date: Schema.DateTimeUtcFromDate,
  created_at: Schema.DateTimeUtcFromDate,
}) {}

const ExpenseFromRow = Schema.transform(ExpenseRow, Schema.typeSchema(Expense), {
  strict: true,
  decode: (row) =>
    new Expense({
      id: row.id,
      tricountId: row.tricount_id,
      title: row.title,
      amount: row.amount,
      paidBy: row.paid_by,
      participants: row.participants,
      date: row.date,
      createdAt: row.created_at,
    }),
  encode: (expense) =>
    new ExpenseRow({
      id: expense.id,
      tricount_id: expense.tricountId,
      title: expense.title,
      amount: expense.amount,
      paid_by: expense.paidBy,
      participants: expense.participants,
      date: expense.date,
      created_at: expense.createdAt,
    }),
});

const selectExpenses = (sql: SqlClient.SqlClient, where: ReturnType<SqlClient.SqlClient['and']>) => sql`
  SELECT e.*, ARRAY_AGG(p.user_id ORDER BY p.user_id) AS participants
  FROM expenses e
  INNER JOIN expense_participants p ON p.expense_id = e.id
  WHERE ${where}
  GROUP BY e.id
  ORDER BY e.date DESC, e.created_at DESC
`;

export const SqlExpenseRepositoryLive = Layer.effect(
  ExpenseRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const findById = SqlSchema.findOne({
      Request: ExpenseId,
      Result: ExpenseFromRow,
      execute: (id) => selectExpenses(sql, sql.and([sql`e.id = ${id}`])),
    });

    const findByTricount = SqlSchema.findAll({
      Request: TricountId,
      Result: ExpenseFromRow,
      execute: (tricountId) => selectExpenses(sql, sql.and([sql`e.tricount_id = ${tricountId}`])),
    });

    const store = (expense: Expense) =>
      Effect.gen(function* () {
        const { participants, ...row } = yield* Schema.encode(ExpenseFromRow)(expense);
        yield* sql`
          INSERT INTO expenses ${sql.insert(row)}
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            amount = EXCLUDED.amount,
            paid_by = EXCLUDED.paid_by,
            date = EXCLUDED.date
        `;
        yield* sql`DELETE FROM expense_participants WHERE expense_id = ${row.id}`;
        yield* sql`
          INSERT INTO expense_participants ${sql.insert(participants.map((user_id) => ({ expense_id: row.id, user_id })))}
        `;
        return yield* findById(expense.id);
      }).pipe(sql.withTransaction, Effect.flatten);

    const deleteById = SqlSchema.findAll({
      Request: ExpenseId,
      Result: Schema.Struct({ id: ExpenseId }),
      execute: (id) => sql`DELETE FROM expenses WHERE id = ${id} RETURNING id`,
    });

    return {
      store: (expense: Expense) => catchSqlErrors(store(expense)),
      findById: (id: ExpenseId) => catchSqlErrors(findById(id)),
      findByTricount: (tricountId: TricountId) => catchSqlErrors(findByTricount(tricountId)),
      delete: (id: ExpenseId) => catchSqlErrors(deleteById(id)).pipe(Effect.map((rows) => rows.length > 0)),
    };
  })
);
