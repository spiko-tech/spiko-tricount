import { HttpApiBuilder } from '@effect/platform';
import { DateTime, Effect } from 'effect';

import { Api, HealthResponse } from '@spiko-tricount/api';

export const HealthApiGroupLive = HttpApiBuilder.group(
  Api,
  'health',
  (handlers) =>
    handlers.handle('check', () =>
      Effect.succeed(
        new HealthResponse({
          status: 'ok',
          timestamp: DateTime.unsafeNow(),
        })
      )
    )
);
