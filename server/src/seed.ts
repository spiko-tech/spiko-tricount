import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect, Layer, Option, Schema } from 'effect';
import { Cents, Email, UserId } from '@spiko-tricount/primitives';

import { ExpenseService } from './application/expense-service.js';
import { SettlementService } from './application/settlement-service.js';
import { TricountService } from './application/tricount-service.js';
import { UserService } from './application/user-service.js';
import { User } from './domain/user.js';
import { DatabaseLive, MigratorLive } from './infrastructure/index.js';
import { ServicesLive } from './presentation/server.js';

const seedUsers = [
  { email: 'alice@spiko.io', name: 'Alice' },
  { email: 'bob@spiko.io', name: 'Bob' },
  { email: 'carol@spiko.io', name: 'Carol' },
];

const program = Effect.gen(function* () {
  const users = yield* UserService;
  const tricounts = yield* TricountService;
  const expenses = yield* ExpenseService;
  const settlements = yield* SettlementService;

  const upsertUser = (input: { email: string; name: string }) =>
    Effect.gen(function* () {
      const email = yield* Schema.decode(Email)(input.email);
      return yield* users
        .signUp({ email, name: input.name })
        .pipe(Effect.catchTag('EmailAlreadyUsed', () => users.signIn(email)));
    });

  const [alice, bob, carol]: ReadonlyArray<User> = yield* Effect.forEach(seedUsers, upsertUser);

  const existing = yield* tricounts.listTricounts(alice.id);
  if (existing.length > 0) {
    yield* Effect.log('Database already seeded, skipping');
    yield* Effect.log(`Alice: ${alice.id}`);
    yield* Effect.log(`Bob: ${bob.id}`);
    yield* Effect.log(`Carol: ${carol.id}`);
    return;
  }

  const trip = yield* tricounts.createTricount({
    ownerId: alice.id,
    name: 'Weekend in Lisbon',
    description: Option.some('Flights, food and fun'),
  });
  yield* tricounts.addMember({ userId: alice.id, tricountId: trip.id, email: bob.email });
  yield* tricounts.addMember({ userId: alice.id, tricountId: trip.id, email: carol.email });

  const cents = Schema.decodeSync(Cents);
  const all: readonly [UserId, ...UserId[]] = [alice.id, bob.id, carol.id];

  yield* expenses.createExpense({
    userId: alice.id,
    tricountId: trip.id,
    title: 'Airbnb',
    amount: cents(45000),
    paidBy: alice.id,
    participants: all,
    date: Option.none(),
  });
  yield* expenses.createExpense({
    userId: bob.id,
    tricountId: trip.id,
    title: 'Dinner at Time Out Market',
    amount: cents(9600),
    paidBy: bob.id,
    participants: all,
    date: Option.none(),
  });
  yield* expenses.createExpense({
    userId: carol.id,
    tricountId: trip.id,
    title: 'Tram tickets',
    amount: cents(1200),
    paidBy: carol.id,
    participants: [bob.id, carol.id],
    date: Option.none(),
  });
  yield* settlements.settle({ userId: bob.id, tricountId: trip.id, toUserId: alice.id, amount: cents(5000) });

  yield* Effect.log(`Seeded tricount ${trip.id}`);
  yield* Effect.log(`Alice: ${alice.id}`);
  yield* Effect.log(`Bob: ${bob.id}`);
  yield* Effect.log(`Carol: ${carol.id}`);
});

const SeedLive = ServicesLive.pipe(
  Layer.provideMerge(MigratorLive),
  Layer.provideMerge(DatabaseLive),
  Layer.provide(NodeContext.layer)
);

program.pipe(Effect.provide(SeedLive), NodeRuntime.runMain);
