import { Effect } from 'effect';
import { SqlClient } from '@effect/sql';

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) =>
    sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `
);
