import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export class HealthResponse extends Schema.Class<HealthResponse>(
  'HealthResponse'
)({
  status: Schema.Literal('ok'),
  timestamp: Schema.DateTimeUtc,
}) {}

export const HealthApiGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse)
);

export class TricountResponse extends Schema.Class<TricountResponse>(
  'TricountResponse'
)({
  id: Schema.String,
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class TricountsListResponse extends Schema.Class<TricountsListResponse>(
  'TricountsListResponse'
)({
  tricounts: Schema.Array(TricountResponse),
}) {}

export class CreateTricountRequest extends Schema.Class<CreateTricountRequest>(
  'CreateTricountRequest'
)({
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
}) {}

export class TricountApiError extends Schema.TaggedError<TricountApiError>()(
  'TricountApiError',
  {
    message: Schema.String,
  }
) {}

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

export const Api = HttpApi.make('SpikoTricountApi')
  .add(HealthApiGroup)
  .add(TricountApiGroup);
