import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Layer } from 'effect';
import { createServer } from 'node:http';

import { Api } from '@spiko-tricount/api';
import { ExpenseServiceLive } from '../application/expense-service.js';
import { SettlementServiceLive } from '../application/settlement-service.js';
import { TricountServiceLive } from '../application/tricount-service.js';
import { UserServiceLive } from '../application/user-service.js';
import {
  DatabaseLive,
  MigratorLive,
  SqlExpenseRepositoryLive,
  SqlSettlementRepositoryLive,
  SqlTricountRepositoryLive,
  SqlUserRepositoryLive,
} from '../infrastructure/index.js';
import { AuthenticatedLive } from './authentication.js';
import { ExpensesApiGroupLive } from './expenses.js';
import { HealthApiGroupLive } from './health.js';
import { SettlementsApiGroupLive } from './settlements.js';
import { TricountsApiGroupLive } from './tricounts.js';
import { UsersApiGroupLive } from './users.js';

const RepositoriesLive = Layer.mergeAll(
  SqlUserRepositoryLive,
  SqlTricountRepositoryLive,
  SqlExpenseRepositoryLive,
  SqlSettlementRepositoryLive
);

export const ServicesLive = Layer.mergeAll(ExpenseServiceLive, SettlementServiceLive).pipe(
  Layer.provideMerge(TricountServiceLive),
  Layer.provideMerge(UserServiceLive),
  Layer.provide(RepositoriesLive)
);

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthApiGroupLive),
  Layer.provide(UsersApiGroupLive),
  Layer.provide(TricountsApiGroupLive),
  Layer.provide(ExpensesApiGroupLive),
  Layer.provide(SettlementsApiGroupLive),
  Layer.provide(AuthenticatedLive),
  Layer.provide(ServicesLive)
);

export const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({ path: '/docs' })),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(DatabaseLive),
  Layer.provide(MigratorLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);
