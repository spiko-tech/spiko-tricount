import { Schema } from 'effect';
import { Email, UserId } from '@spiko-tricount/primitives';

export { Email, UserId };

export class User extends Schema.Class<User>('User')({
  id: UserId,
  email: Email,
  name: Schema.String,
  createdAt: Schema.DateTimeUtc,
}) {}
