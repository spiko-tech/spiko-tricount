import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect, Option } from 'effect';
import { Api, CurrentUser } from '@spiko-tricount/api';
import { ExpenseService } from '../application/expense-service.js';

export const ExpensesApiGroupLive = HttpApiBuilder.group(Api, 'expenses', (handlers) =>
  handlers
    .handle('list', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ExpenseService;
        const user = yield* CurrentUser;
        const expenses = yield* service.listExpenses(user.id, path.id);
        return { expenses };
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('create', ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* ExpenseService;
        const user = yield* CurrentUser;
        return yield* service.createExpense({
          userId: user.id,
          tricountId: path.id,
          title: payload.title,
          amount: payload.amount,
          paidBy: payload.paidBy,
          participants: payload.participants,
          date: Option.fromNullable(payload.date),
        });
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          InvalidExpense: () => new HttpApiError.BadRequest(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
    .handle('delete', ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ExpenseService;
        const user = yield* CurrentUser;
        const success = yield* service.deleteExpense(user.id, path.id, path.expenseId);
        return { success };
      }).pipe(
        Effect.catchTags({
          TricountNotFound: () => new HttpApiError.NotFound(),
          ExpenseNotFound: () => new HttpApiError.NotFound(),
          NotAMember: () => new HttpApiError.Forbidden(),
          PersistenceError: () => new HttpApiError.InternalServerError(),
        })
      )
    )
);
