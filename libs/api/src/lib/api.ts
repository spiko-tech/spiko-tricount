import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
  timestamp: Schema.DateTimeUtc,
});

export const HealthApiGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse)
);

export const TricountResponse = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
});
export type TricountResponse = typeof TricountResponse.Type;

export const TricountsListResponse = Schema.Struct({
  tricounts: Schema.Array(TricountResponse),
});

export const CreateTricountRequest = Schema.Struct({
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
});

export const DeleteTricountResponse = Schema.Struct({
  success: Schema.Boolean,
});

export const TricountApiGroup = HttpApiGroup.make('tricounts')
  .add(
    HttpApiEndpoint.get('list', '/tricounts')
      .addSuccess(TricountsListResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('create', '/tricounts')
      .setPayload(CreateTricountRequest)
      .addSuccess(TricountResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.del('delete', '/tricounts/:id')
      .setPath(Schema.Struct({ id: Schema.String }))
      .addSuccess(DeleteTricountResponse)
      .addError(HttpApiError.InternalServerError)
  );

export const Api = HttpApi.make('SpikoTricountApi').add(HealthApiGroup).add(TricountApiGroup);
