import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSecurity,
} from '@effect/platform';
import { Context, Schema } from 'effect';
import { Cents, Email, ExpenseId, SettlementId, TricountId, UserId } from '@spiko-tricount/primitives';

export const CURRENT_USER_HEADER = 'x-user-id';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
  timestamp: Schema.DateTimeUtc,
});

export const HealthApiGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse)
);

export const UserResponse = Schema.Struct({
  id: UserId,
  email: Email,
  name: Schema.String,
  createdAt: Schema.DateTimeUtc,
});
export type UserResponse = typeof UserResponse.Type;

export class CurrentUser extends Context.Tag('CurrentUser')<CurrentUser, UserResponse>() {}

export class Authenticated extends HttpApiMiddleware.Tag<Authenticated>()('Authenticated', {
  failure: HttpApiError.Unauthorized,
  provides: CurrentUser,
  security: {
    userId: HttpApiSecurity.apiKey({ key: CURRENT_USER_HEADER, in: 'header' }),
  },
}) {}

export const SignUpRequest = Schema.Struct({
  email: Email,
  name: Schema.NonEmptyTrimmedString,
});

export const SignInRequest = Schema.Struct({
  email: Email,
});

export const UsersListResponse = Schema.Struct({
  users: Schema.Array(UserResponse),
});

export const UsersApiGroup = HttpApiGroup.make('users')
  .add(
    HttpApiEndpoint.post('signUp', '/users')
      .setPayload(SignUpRequest)
      .addSuccess(UserResponse, { status: 201 })
      .addError(HttpApiError.Conflict)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('signIn', '/users/sign-in')
      .setPayload(SignInRequest)
      .addSuccess(UserResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get('list', '/users')
      .addSuccess(UsersListResponse)
      .addError(HttpApiError.InternalServerError)
      .middleware(Authenticated)
  )
  .add(HttpApiEndpoint.get('me', '/users/me').addSuccess(UserResponse).middleware(Authenticated));

export const TricountResponse = Schema.Struct({
  id: TricountId,
  name: Schema.String,
  description: Schema.OptionFromNullOr(Schema.String),
  ownerId: UserId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
});
export type TricountResponse = typeof TricountResponse.Type;

export const TricountDetailsResponse = Schema.Struct({
  ...TricountResponse.fields,
  members: Schema.Array(UserResponse),
});
export type TricountDetailsResponse = typeof TricountDetailsResponse.Type;

export const TricountsListResponse = Schema.Struct({
  tricounts: Schema.Array(TricountResponse),
});

export const CreateTricountRequest = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  description: Schema.OptionFromNullOr(Schema.String),
});

export const DeleteTricountResponse = Schema.Struct({
  success: Schema.Boolean,
});

export const AddMemberRequest = Schema.Struct({
  email: Email,
});

const TricountPath = Schema.Struct({ id: TricountId });

export const TricountApiGroup = HttpApiGroup.make('tricounts')
  .add(
    HttpApiEndpoint.get('list', '/tricounts')
      .addSuccess(TricountsListResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('create', '/tricounts')
      .setPayload(CreateTricountRequest)
      .addSuccess(TricountResponse, { status: 201 })
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get('get', '/tricounts/:id')
      .setPath(TricountPath)
      .addSuccess(TricountDetailsResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.del('delete', '/tricounts/:id')
      .setPath(TricountPath)
      .addSuccess(DeleteTricountResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('addMember', '/tricounts/:id/members')
      .setPath(TricountPath)
      .setPayload(AddMemberRequest)
      .addSuccess(TricountDetailsResponse, { status: 201 })
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.Conflict)
      .addError(HttpApiError.InternalServerError)
  )
  .middleware(Authenticated);

export const ExpenseResponse = Schema.Struct({
  id: ExpenseId,
  tricountId: TricountId,
  title: Schema.String,
  amount: Cents,
  paidBy: UserId,
  participants: Schema.Array(UserId),
  date: Schema.DateTimeUtc,
  createdAt: Schema.DateTimeUtc,
});
export type ExpenseResponse = typeof ExpenseResponse.Type;

export const ExpensesListResponse = Schema.Struct({
  expenses: Schema.Array(ExpenseResponse),
});

export const CreateExpenseRequest = Schema.Struct({
  title: Schema.NonEmptyTrimmedString,
  amount: Cents,
  paidBy: UserId,
  participants: Schema.NonEmptyArray(UserId),
  date: Schema.optional(Schema.DateTimeUtc),
});

export const DeleteExpenseResponse = Schema.Struct({
  success: Schema.Boolean,
});

const ExpensePath = Schema.Struct({ id: TricountId, expenseId: ExpenseId });

export const ExpensesApiGroup = HttpApiGroup.make('expenses')
  .add(
    HttpApiEndpoint.get('list', '/tricounts/:id/expenses')
      .setPath(TricountPath)
      .addSuccess(ExpensesListResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('create', '/tricounts/:id/expenses')
      .setPath(TricountPath)
      .setPayload(CreateExpenseRequest)
      .addSuccess(ExpenseResponse, { status: 201 })
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.del('delete', '/tricounts/:id/expenses/:expenseId')
      .setPath(ExpensePath)
      .addSuccess(DeleteExpenseResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .middleware(Authenticated);

export const UserBalance = Schema.Struct({
  userId: UserId,
  paid: Schema.Int,
  owed: Schema.Int,
  balance: Schema.Int,
});
export type UserBalance = typeof UserBalance.Type;

export const Debt = Schema.Struct({
  from: UserId,
  to: UserId,
  amount: Schema.Int,
});
export type Debt = typeof Debt.Type;

export const BalancesResponse = Schema.Struct({
  balances: Schema.Array(UserBalance),
  debts: Schema.Array(Debt),
});
export type BalancesResponse = typeof BalancesResponse.Type;

export const SettlementResponse = Schema.Struct({
  id: SettlementId,
  tricountId: TricountId,
  fromUserId: UserId,
  toUserId: UserId,
  amount: Cents,
  createdAt: Schema.DateTimeUtc,
});
export type SettlementResponse = typeof SettlementResponse.Type;

export const SettlementsListResponse = Schema.Struct({
  settlements: Schema.Array(SettlementResponse),
});

export const CreateSettlementRequest = Schema.Struct({
  toUserId: UserId,
  amount: Cents,
});

export const SettlementsApiGroup = HttpApiGroup.make('settlements')
  .add(
    HttpApiEndpoint.get('balances', '/tricounts/:id/balances')
      .setPath(TricountPath)
      .addSuccess(BalancesResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get('list', '/tricounts/:id/settlements')
      .setPath(TricountPath)
      .addSuccess(SettlementsListResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('create', '/tricounts/:id/settlements')
      .setPath(TricountPath)
      .setPayload(CreateSettlementRequest)
      .addSuccess(SettlementResponse, { status: 201 })
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Forbidden)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .middleware(Authenticated);

export const Api = HttpApi.make('SpikoTricountApi')
  .add(HealthApiGroup)
  .add(UsersApiGroup)
  .add(TricountApiGroup)
  .add(ExpensesApiGroup)
  .add(SettlementsApiGroup);
