import { PgClient, PgMigrator } from '@effect/sql-pg';
import { Config, Layer, Redacted } from 'effect';
import { fileURLToPath } from 'node:url';

/**
 * PostgreSQL database configuration layer
 *
 * Uses environment variables with defaults for local development:
 * - DATABASE_HOST (default: localhost)
 * - DATABASE_PORT (default: 5432)
 * - DATABASE_NAME (default: spiko_tricount)
 * - DATABASE_USER (default: postgres)
 * - DATABASE_PASSWORD (default: postgres)
 */
export const DatabaseLive = PgClient.layerConfig({
  host: Config.string('DATABASE_HOST').pipe(Config.withDefault('localhost')),
  port: Config.number('DATABASE_PORT').pipe(Config.withDefault(5432)),
  database: Config.string('DATABASE_NAME').pipe(
    Config.withDefault('spiko_tricount')
  ),
  username: Config.string('DATABASE_USER').pipe(Config.withDefault('postgres')),
  password: Config.redacted('DATABASE_PASSWORD').pipe(
    Config.withDefault(Redacted.make('postgres'))
  ),
});

/**
 * Database migrations layer
 *
 * Runs migrations from the migrations folder on startup
 */
export const MigratorLive = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(
    fileURLToPath(new URL('migrations', import.meta.url))
  ),
}).pipe(Layer.provide(DatabaseLive));
