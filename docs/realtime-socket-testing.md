# Socket.IO Realtime Testing Guide

## Overview

This backend emits realtime events through Socket.IO whenever a transaction is created, a balance changes, or a transaction fails.

## Events

### `transaction:created`

Emitted after a successful deposit, withdrawal, or transfer.

Payload example:

```json
{
  "transactionId": "67f123...",
  "type": "deposit",
  "amount": 200,
  "accountId": "ACC1001",
  "status": "success",
  "createdAt": "2026-04-08T10:00:00.000Z"
}
```

### `balance:updated`

Emitted whenever an account balance changes.

Payload example:

```json
{
  "accountId": "ACC1001",
  "balance": 1200,
  "version": 2
}
```

### `transaction:failed`

Emitted when validation or business rules reject a transaction.

Payload example:

```json
{
  "type": "withdraw",
  "amount": 500,
  "accountId": "ACC1001",
  "reason": "Insufficient balance for account ACC1001"
}
```

## How to run the test client

1. Start the backend server.
2. Open a second terminal in the backend folder.
3. Run the test client:

```powershell
npm run socket:test
```

If you want to connect to a different server URL, set:

```powershell
$env:SOCKET_SERVER_URL='http://localhost:5000'
```

## How it works

The test client connects to the Socket.IO server using `socket.io-client` and listens for the three domain events. It does not emit any data; it only logs received realtime updates to the terminal.

## Recommended verification flow

1. Start the backend.
2. Start the socket test client.
3. Create an account.
4. Perform a deposit, withdrawal, or transfer.
5. Watch the realtime event logs in the client terminal.
