import { Effect } from 'effect';
import { SqlClient } from '@effect/sql';

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`DELETE FROM tricounts`;
  yield* sql`ALTER TABLE tricounts ADD COLUMN owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`;
  yield* sql`
    CREATE TABLE tricount_members (
      tricount_id UUID NOT NULL REFERENCES tricounts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tricount_id, user_id)
    )
  `;
  yield* sql`CREATE INDEX tricount_members_user_id_idx ON tricount_members(user_id)`;
});
