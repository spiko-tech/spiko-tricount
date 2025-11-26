import { HttpApiBuilder } from '@effect/platform';
import { DateTime, Effect } from 'effect';

import { Api } from '@spiko-tricount/api';

export const HealthApiGroupLive = HttpApiBuilder.group(
  Api,
  'health',
  (handlers) =>
    handlers.handle('check', () =>
      Effect.succeed({
        status: 'ok' as const,
        timestamp: DateTime.unsafeNow(),
      })
    )
);
