import { Schema } from 'effect';
import { TricountId, UserId } from '@spiko-tricount/primitives';

export { TricountId };

export class Tricount extends Schema.Class<Tricount>('Tricount')({
  id: TricountId,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
  ownerId: UserId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class Membership extends Schema.Class<Membership>('Membership')({
  tricountId: TricountId,
  userId: UserId,
  joinedAt: Schema.DateTimeUtc,
}) {}
