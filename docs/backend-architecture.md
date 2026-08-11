# Backend Architecture

## Pattern

This backend follows a layered MVC-style architecture with additional service and repository layers.

## Layers

### 1. Routes

The route layer maps HTTP endpoints to controllers and attaches validation middleware.

Examples:

- `src/modules/account/account.route.ts`
- `src/modules/transaction/transaction.route.ts`

### 2. Controllers

Controllers handle request/response orchestration and delegate business work to services.

### 3. Services

Services contain business rules, concurrency logic, and realtime event emission.

### 4. Repositories

Repositories isolate all MongoDB/Mongoose access and keep database queries reusable.

### 5. Models

Mongoose models define the data structure for accounts and transactions.

## Realtime design

Socket.IO is initialized from the HTTP server during bootstrap. A singleton socket service is used to emit:

- `transaction:created`
- `balance:updated`
- `transaction:failed`

This keeps realtime notifications centralized and reusable.

## Concurrency strategy

The backend uses:

- MongoDB sessions and transactions for atomic multi-document updates
- optimistic concurrency with account version numbers
- retry logic for concurrent update conflicts

This helps avoid negative balances and inconsistent account states.

## Request flow example

1. Client sends a transaction request.
2. Validation middleware checks payload format.
3. Controller forwards to service.
4. Service updates account data through repository methods.
5. Service emits realtime events through Socket.IO.
6. API response is returned to the caller.

## Why this structure scales well

- Business logic is separated from database logic.
- Validation is reusable and centralized.
- Socket events are emitted from one service layer.
- MongoDB access is isolated behind repositories.
- New features can be added without rewriting existing code paths.
