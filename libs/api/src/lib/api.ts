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
 * Main API definition for Spiko Tricount
 */
export const Api = HttpApi.make('SpikoTricountApi').add(HealthApiGroup);
