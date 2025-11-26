import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Layer } from 'effect';
import { createServer } from 'node:http';

import { Api } from '@spiko-tricount/api';
import {
  DatabaseLive,
  MigratorLive,
  SqlTricountRepositoryLive,
} from '../infrastructure/index.js';
import { HealthApiGroupLive } from './health.js';
import { TricountsApiGroupLive } from './tricounts.js';

/**
 * Full API implementation layer
 */
const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthApiGroupLive),
  Layer.provide(TricountsApiGroupLive)
);

/**
 * HTTP server configuration layer
 */
export const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(SqlTricountRepositoryLive),
  Layer.provide(DatabaseLive),
  Layer.provide(MigratorLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);
