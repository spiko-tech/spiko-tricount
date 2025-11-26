import { Schema } from 'effect';

export class Tricount extends Schema.Class<Tricount>('Tricount')({
  id: Schema.UUID,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class CreateTricount extends Schema.Class<CreateTricount>(
  'CreateTricount'
)({
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
}) {}
