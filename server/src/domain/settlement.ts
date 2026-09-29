import { Schema } from 'effect';
import { Cents, SettlementId, TricountId, UserId } from '@spiko-tricount/primitives';

export { SettlementId };

export class Settlement extends Schema.Class<Settlement>('Settlement')({
  id: SettlementId,
  tricountId: TricountId,
  fromUserId: UserId,
  toUserId: UserId,
  amount: Cents,
  createdAt: Schema.DateTimeUtc,
}) {}
