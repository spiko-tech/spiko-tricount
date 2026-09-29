import { Effect } from 'effect';
import { SqlClient } from '@effect/sql';

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
    CREATE TABLE expenses (
      id UUID PRIMARY KEY,
      tricount_id UUID NOT NULL REFERENCES tricounts(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      amount INTEGER NOT NULL CHECK (amount > 0),
      paid_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  yield* sql`CREATE INDEX expenses_tricount_id_idx ON expenses(tricount_id)`;
  yield* sql`
    CREATE TABLE expense_participants (
      expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (expense_id, user_id)
    )
  `;
});
