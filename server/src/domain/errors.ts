import { Schema } from 'effect';

export class PersistenceError extends Schema.TaggedError<PersistenceError>()('PersistenceError', {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}
