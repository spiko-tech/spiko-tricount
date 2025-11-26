import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

/**
 * Health check endpoint response
 */
export class HealthResponse extends Schema.Class<HealthResponse>(
  'HealthResponse'
)({
  status: Schema.Literal('ok'),
  timestamp: Schema.DateTimeUtc,
}) {}

/**
 * Health API group - for health checks and basic info
 */
export const HealthApiGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse)
);

/**
 * Tricount response schema
 */
export class TricountResponse extends Schema.Class<TricountResponse>(
  'TricountResponse'
)({
  id: Schema.String,
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

/**
 * List tricounts response
 */
export class TricountsListResponse extends Schema.Class<TricountsListResponse>(
  'TricountsListResponse'
)({
  tricounts: Schema.Array(TricountResponse),
}) {}

/**
 * Create tricount request body
 */
export class CreateTricountRequest extends Schema.Class<CreateTricountRequest>(
  'CreateTricountRequest'
)({
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
}) {}

/**
 * Tricount API error
 */
export class TricountApiError extends Schema.TaggedError<TricountApiError>()(
  'TricountApiError',
  {
    message: Schema.String,
  }
) {}

/**
 * Tricount API group - for tricount operations
 */
export const TricountApiGroup = HttpApiGroup.make('tricounts')
  .add(
    HttpApiEndpoint.get('list', '/tricounts')
      .addSuccess(TricountsListResponse)
      .addError(TricountApiError)
  )
  .add(
    HttpApiEndpoint.post('create', '/tricounts')
      .setPayload(CreateTricountRequest)
      .addSuccess(TricountResponse)
      .addError(TricountApiError)
  );

/**
 * Main API definition for Spiko Tricount
 */
export const Api = HttpApi.make('SpikoTricountApi')
  .add(HealthApiGroup)
  .add(TricountApiGroup);
