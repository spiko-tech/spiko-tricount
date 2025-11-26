import { Schema } from 'effect';

export const TricountId = Schema.UUID.pipe(Schema.brand('TricountId'));
export type TricountId = typeof TricountId.Type;

export class Tricount extends Schema.Class<Tricount>('Tricount')({
  id: TricountId,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class CreateTricount extends Schema.Class<CreateTricount>('CreateTricount')({
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
}) {}
