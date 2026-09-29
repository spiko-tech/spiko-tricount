import { Effect } from 'effect';
import { SqlClient } from '@effect/sql';

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
    CREATE TABLE settlements (
      id UUID PRIMARY KEY,
      tricount_id UUID NOT NULL REFERENCES tricounts(id) ON DELETE CASCADE,
      from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL CHECK (amount > 0),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  yield* sql`CREATE INDEX settlements_tricount_id_idx ON settlements(tricount_id)`;
});
