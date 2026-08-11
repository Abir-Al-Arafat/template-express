# End-to-End Test Flow

This guide shows a quick manual verification flow for the backend and Socket.IO events.

## Prerequisites

- MongoDB connection string configured in `.env`
- Backend installed and compiled
- Two terminals available

## Start the backend

```powershell
npm run dev
```

Expected output:

- MongoDB connection success
- Server running on `http://localhost:5000`

## Start the Socket.IO test client

Open a second terminal in the backend folder and run:

```powershell
npm run socket:test
```

Expected output:

- Socket connected message
- Event logs when transactions happen

## Create two accounts

### Account 1

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/accounts" -ContentType "application/json" -Body '{"accountId":"ACC1001","holderName":"John Doe","initialBalance":1000}'
```

### Account 2

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/accounts" -ContentType "application/json" -Body '{"accountId":"ACC2001","holderName":"Jane Doe","initialBalance":500}'
```

## Test a deposit

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/transactions" -ContentType "application/json" -Body '{"type":"deposit","amount":200,"accountId":"ACC1001"}'
```

Expected result:

- HTTP success response
- `transaction:created` event
- `balance:updated` event for `ACC1001`

## Test a withdrawal

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/transactions" -ContentType "application/json" -Body '{"type":"withdraw","amount":150,"accountId":"ACC1001"}'
```

Expected result:

- HTTP success response
- `transaction:created` event
- `balance:updated` event for `ACC1001`

## Test a transfer

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/transactions" -ContentType "application/json" -Body '{"type":"transfer","amount":100,"fromAccountId":"ACC1001","toAccountId":"ACC2001"}'
```

Expected result:

- HTTP success response
- `transaction:created` event
- `balance:updated` event for `ACC1001`
- `balance:updated` event for `ACC2001`

## Test a failed withdrawal

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/transactions" -ContentType "application/json" -Body '{"type":"withdraw","amount":999999,"accountId":"ACC1001"}'
```

Expected result:

- HTTP error response
- `transaction:failed` event in the socket client

## Validate account fetch

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/v1/accounts/ACC1001"
```

Expected result:

- Account details with the updated balance and version

## What to confirm

- Balance never becomes negative
- Transaction failures are returned clearly
- Socket events appear in realtime
- Version increases after successful updates

## Stop the test client

Press `Ctrl + C` in the client terminal.
