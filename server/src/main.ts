import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { DateTime, Effect, Layer } from 'effect';
import { createServer } from 'node:http';

import { Api, HealthResponse } from '@spiko-tricount/api';
import { DatabaseLive } from './database.js';

/**
 * Implementation of the Health API group handlers
 */
const HealthApiGroupLive = HttpApiBuilder.group(Api, 'health', (handlers) =>
  handlers.handle('check', () =>
    Effect.succeed(
      new HealthResponse({
        status: 'ok',
        timestamp: DateTime.unsafeNow(),
      })
    )
  )
);

/**
 * Full API implementation layer
 */
const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(HealthApiGroupLive));

/**
 * HTTP server configuration
 */
const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(DatabaseLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

/**
 * Launch the server
 */
Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
