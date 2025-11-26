import { HttpApiBuilder } from '@effect/platform';
import { DateTime, Effect } from 'effect';

import { Api } from '@spiko-tricount/api';

export const HealthApiGroupLive = HttpApiBuilder.group(Api, 'health', (handlers) =>
  handlers.handle('check', () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      return {
        status: 'ok' as const,
        timestamp: now,
      };
    })
  )
);
