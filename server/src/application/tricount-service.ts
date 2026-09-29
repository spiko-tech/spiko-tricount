import { Context, DateTime, Effect, Layer, Option, Schema } from 'effect';
import { UserId } from '@spiko-tricount/primitives';

import {
  AlreadyAMember,
  NotAMember,
  NotTheOwner,
  PersistenceError,
  TricountNotFound,
  UserNotFound,
} from '../domain/errors.js';
import { Membership, Tricount, TricountId } from '../domain/tricount.js';
import { TricountRepository } from '../domain/tricount-repository.js';
import { Email, User } from '../domain/user.js';
import { UserRepository } from '../domain/user-repository.js';

export interface TricountDetails {
  readonly tricount: Tricount;
  readonly members: ReadonlyArray<User>;
}

export class TricountService extends Context.Tag('TricountService')<
  TricountService,
  {
    readonly listTricounts: (userId: UserId) => Effect.Effect<ReadonlyArray<Tricount>, PersistenceError>;
    readonly createTricount: (params: {
      ownerId: UserId;
      name: string;
      description: Option.Option<string>;
    }) => Effect.Effect<Tricount, PersistenceError>;
    readonly getTricount: (
      userId: UserId,
      id: TricountId
    ) => Effect.Effect<TricountDetails, PersistenceError | TricountNotFound | NotAMember>;
    readonly deleteTricount: (
      userId: UserId,
      id: TricountId
    ) => Effect.Effect<boolean, PersistenceError | TricountNotFound | NotTheOwner>;
    readonly addMember: (params: {
      userId: UserId;
      tricountId: TricountId;
      email: Email;
    }) => Effect.Effect<
      TricountDetails,
      PersistenceError | TricountNotFound | NotAMember | UserNotFound | AlreadyAMember
    >;
    readonly ensureMember: (
      userId: UserId,
      id: TricountId
    ) => Effect.Effect<ReadonlyArray<Membership>, PersistenceError | TricountNotFound | NotAMember>;
  }
>() {}

export const TricountServiceLive = Layer.effect(
  TricountService,
  Effect.gen(function* () {
    const repo = yield* TricountRepository;
    const users = yield* UserRepository;

    const findTricount = (id: TricountId) =>
      repo
        .findById(id)
        .pipe(
          Effect.flatMap(
            Option.match({ onNone: () => new TricountNotFound({ tricountId: id }), onSome: Effect.succeed })
          )
        );

    const ensureMember = (userId: UserId, id: TricountId) =>
      Effect.gen(function* () {
        yield* findTricount(id);
        const members = yield* repo.findMembers(id);
        if (!members.some((m) => m.userId === userId)) {
          return yield* new NotAMember({ tricountId: id, userId });
        }
        return members;
      });

    const details = (tricount: Tricount): Effect.Effect<TricountDetails, PersistenceError> =>
      Effect.gen(function* () {
        const memberships = yield* repo.findMembers(tricount.id);
        const members = yield* users.findByIds(memberships.map((m) => m.userId));
        return { tricount, members };
      });

    return {
      listTricounts: (userId) => repo.findByMember(userId),

      createTricount: ({ ownerId, name, description }) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;
          const id = yield* Schema.decode(TricountId)(crypto.randomUUID());
          const tricount = yield* repo.store(
            new Tricount({ id, name, description, ownerId, createdAt: now, updatedAt: now })
          );
          yield* repo.addMember(new Membership({ tricountId: id, userId: ownerId, joinedAt: now }));
          return tricount;
        }).pipe(Effect.catchTag('ParseError', PersistenceError.fromParseError)),

      getTricount: (userId, id) =>
        Effect.gen(function* () {
          yield* ensureMember(userId, id);
          const tricount = yield* findTricount(id);
          return yield* details(tricount);
        }),

      deleteTricount: (userId, id) =>
        Effect.gen(function* () {
          const tricount = yield* findTricount(id);
          if (tricount.ownerId !== userId) {
            return yield* new NotTheOwner({ tricountId: id, userId });
          }
          return yield* repo.delete(id);
        }),

      addMember: ({ userId, tricountId, email }) =>
        Effect.gen(function* () {
          const members = yield* ensureMember(userId, tricountId);
          const invited = yield* users
            .findByEmail(email)
            .pipe(
              Effect.flatMap(
                Option.match({ onNone: () => new UserNotFound({ identifier: email }), onSome: Effect.succeed })
              )
            );
          if (members.some((m) => m.userId === invited.id)) {
            return yield* new AlreadyAMember({ tricountId, userId: invited.id });
          }
          const now = yield* DateTime.now;
          yield* repo.addMember(new Membership({ tricountId, userId: invited.id, joinedAt: now }));
          const tricount = yield* findTricount(tricountId);
          return yield* details(tricount);
        }),

      ensureMember,
    };
  })
);
