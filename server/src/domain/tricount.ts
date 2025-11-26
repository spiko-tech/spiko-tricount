import { Schema } from 'effect';

/**
 * Tricount domain entity
 *
 * Represents an expense-sharing group where users can track shared expenses
 */
export class Tricount extends Schema.Class<Tricount>('Tricount')({
  id: Schema.String,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

/**
 * Schema for creating a new Tricount (without id and timestamps)
 */
export class CreateTricount extends Schema.Class<CreateTricount>(
  'CreateTricount'
)({
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'Option' }),
}) {}
