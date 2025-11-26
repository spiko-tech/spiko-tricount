import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Layer } from 'effect';
import { createServer } from 'node:http';

import { Api } from '@spiko-tricount/api';
import { DatabaseLive } from '../infrastructure/index.js';
import { HealthApiGroupLive } from './health.js';

/**
 * Full API implementation layer
 */
const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(HealthApiGroupLive));

/**
 * HTTP server configuration layer
 */
export const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(DatabaseLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);
