import { SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Schema } from 'effect';
import { Email, User, UserId } from '../domain/user.js';
import { UserRepository } from '../domain/user-repository.js';
import { catchSqlErrors } from './sql-errors.js';

class UserRow extends Schema.Class<UserRow>('UserRow')({
  id: UserId,
  email: Email,
  name: Schema.String,
  created_at: Schema.DateTimeUtcFromDate,
}) {}

const UserFromRow = Schema.transform(UserRow, Schema.typeSchema(User), {
  strict: true,
  decode: (row) => new User({ id: row.id, email: row.email, name: row.name, createdAt: row.created_at }),
  encode: (user) => new UserRow({ id: user.id, email: user.email, name: user.name, created_at: user.createdAt }),
});

export const SqlUserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const store = SqlSchema.single({
      Request: Schema.typeSchema(User),
      Result: UserFromRow,
      execute: (user) =>
        Schema.encode(UserFromRow)(user).pipe(
          Effect.flatMap(
            (row) => sql`
              INSERT INTO users ${sql.insert(row)}
              ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
              RETURNING *
            `
          )
        ),
    });

    const findById = SqlSchema.findOne({
      Request: UserId,
      Result: UserFromRow,
      execute: (id) => sql`SELECT * FROM users WHERE id = ${id}`,
    });

    const findByEmail = SqlSchema.findOne({
      Request: Email,
      Result: UserFromRow,
      execute: (email) => sql`SELECT * FROM users WHERE email = ${email}`,
    });

    const findByIds = SqlSchema.findAll({
      Request: Schema.Array(UserId),
      Result: UserFromRow,
      execute: (ids) =>
        ids.length === 0
          ? sql`SELECT * FROM users WHERE FALSE`
          : sql`SELECT * FROM users WHERE id IN ${sql.in(ids)} ORDER BY name`,
    });

    const findAll = SqlSchema.findAll({
      Request: Schema.Void,
      Result: UserFromRow,
      execute: () => sql`SELECT * FROM users ORDER BY name`,
    });

    return {
      store: (user: User) => catchSqlErrors(store(user)),
      findById: (id: UserId) => catchSqlErrors(findById(id)),
      findByEmail: (email: Email) => catchSqlErrors(findByEmail(email)),
      findByIds: (ids: ReadonlyArray<UserId>) => catchSqlErrors(findByIds(ids)),
      findAll: () => catchSqlErrors(findAll(undefined as void)),
    };
  })
);
