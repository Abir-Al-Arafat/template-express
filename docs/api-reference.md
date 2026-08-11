# Backend API Reference

## Base URL

Local development:

```text
http://localhost:5000/api/v1
```

Health check:

```text
http://localhost:5000/health
```

## Standard response format

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Failure

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 1. Health Check

### GET /health

Returns server status.

#### Response

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 2. Create Account

### POST /accounts

Creates a new account.

#### Request Body

```json
{
  "accountId": "ACC1001",
  "holderName": "John Doe",
  "initialBalance": 1000
}
```

#### Validation Rules

- `accountId` is required, string, non-empty
- `holderName` is required, string, non-empty
- `initialBalance` is optional, number, must be `>= 0`

#### Success Response

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "accountId": "ACC1001",
    "holderName": "John Doe",
    "balance": 1000,
    "version": 0,
    "_id": "67f123abc...",
    "createdAt": "2026-04-08T10:00:00.000Z",
    "updatedAt": "2026-04-08T10:00:00.000Z"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Account already exists"
}
```

---

## 3. Get Account By ID

### GET /accounts/:accountId

Fetches a single account.

#### Example

```text
GET /accounts/ACC1001
```

#### Validation Rules

- `accountId` path parameter is required

#### Success Response

```json
{
  "success": true,
  "message": "Account fetched successfully",
  "data": {
    "accountId": "ACC1001",
    "holderName": "John Doe",
    "balance": 1200,
    "version": 1,
    "_id": "67f123abc...",
    "createdAt": "2026-04-08T10:00:00.000Z",
    "updatedAt": "2026-04-08T10:05:00.000Z"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Account not found"
}
```

---

## 4. Create Transaction

### POST /transactions

Creates a deposit, withdrawal, or transfer.

#### Request Body - Deposit

```json
{
  "type": "deposit",
  "amount": 200,
  "accountId": "ACC1001"
}
```

#### Request Body - Withdraw

```json
{
  "type": "withdraw",
  "amount": 150,
  "accountId": "ACC1001"
}
```

#### Request Body - Transfer

```json
{
  "type": "transfer",
  "amount": 100,
  "fromAccountId": "ACC1001",
  "toAccountId": "ACC2001"
}
```

#### Validation Rules

- `type` is required and must be one of `deposit`, `withdraw`, `transfer`
- `amount` is required and must be greater than `0`
- `accountId` is required for `deposit` and `withdraw`
- `fromAccountId` and `toAccountId` are required for `transfer`
- `fromAccountId` and `toAccountId` must be different

#### Success Response - Deposit/Withdraw

```json
{
  "success": true,
  "message": "Transaction processed successfully",
  "data": {
    "type": "deposit",
    "amount": 200,
    "accountId": "ACC1001",
    "status": "success",
    "_id": "67f456abc...",
    "createdAt": "2026-04-08T10:10:00.000Z",
    "updatedAt": "2026-04-08T10:10:00.000Z"
  }
}
```

#### Success Response - Transfer

```json
{
  "success": true,
  "message": "Transaction processed successfully",
  "data": {
    "type": "transfer",
    "amount": 100,
    "fromAccountId": "ACC1001",
    "toAccountId": "ACC2001",
    "status": "success",
    "_id": "67f789abc...",
    "createdAt": "2026-04-08T10:12:00.000Z",
    "updatedAt": "2026-04-08T10:12:00.000Z"
  }
}
```

#### Error Response - Insufficient Balance

```json
{
  "success": false,
  "message": "Insufficient balance for account ACC1001"
}
```

#### Error Response - Concurrency Conflict

```json
{
  "success": false,
  "message": "Could not process request due to concurrent update conflict"
}
```

---

## 5. Realtime Socket.IO Events

### transaction:created

Emitted after a successful transaction.

```json
{
  "transactionId": "67f456abc...",
  "type": "deposit",
  "amount": 200,
  "accountId": "ACC1001",
  "status": "success",
  "createdAt": "2026-04-08T10:10:00.000Z"
}
```

### balance:updated

Emitted after a balance changes.

```json
{
  "accountId": "ACC1001",
  "balance": 1200,
  "version": 1
}
```

### transaction:failed

Emitted when a transaction is rejected.

```json
{
  "type": "withdraw",
  "amount": 500,
  "accountId": "ACC1001",
  "reason": "Insufficient balance for account ACC1001"
}
```
