# Load Testing Report Template (k6)

Use this template to document your concurrency and load test evidence for submission.

## 1. Test Objective

Validate that the backend handles at least `1000` concurrent transaction requests safely while preserving account consistency.

## 2. Test Environment

- Backend version/commit: `<commit-hash>`
- API base URL: `<url>`
- Machine specs:
  - CPU: `<value>`
  - RAM: `<value>`
  - OS: `<value>`
- Node.js version: `<value>`
- MongoDB deployment: `<Atlas/local + tier>`
- Test tool: `k6`
- Test script: `backend/load-tests/k6/transactions-load-test.js`

## 3. Scenarios Executed

### Scenario A: Required 1000 concurrent users

- Executor: `constant-vus`
- VUs: `1000`
- Duration: `30s` (or your chosen duration)
- Mix:
  - Deposit ~45%
  - Withdraw ~40%
  - Transfer ~15%

Run command:

```powershell
k6 run backend/load-tests/k6/transactions-load-test.js
```

Or from `backend` directory:

```powershell
npm run load:test
```

### Optional Scenario B: Stress ramp

```powershell
k6 run -e VUS=300 -e DURATION=20s backend/load-tests/k6/transactions-load-test.js
k6 run -e VUS=600 -e DURATION=20s backend/load-tests/k6/transactions-load-test.js
k6 run -e VUS=1000 -e DURATION=30s backend/load-tests/k6/transactions-load-test.js
```

## 4. Result Summary

Fill this table from terminal output and `backend/load-tests/results/summary.json`.

| Metric                         | Value     |
| ------------------------------ | --------- |
| Total requests                 | `<value>` |
| Success count                  | `<value>` |
| Business-safe failures (4xx)   | `<value>` |
| System failures (5xx/network)  | `<value>` |
| Error rate (`http_req_failed`) | `<value>` |
| P95 latency                    | `<value>` |
| P99 latency                    | `<value>` |
| Check pass rate                | `<value>` |
| Consistency failure rate       | `<value>` |

## 5. Data Consistency Validation

### Checks performed

- `No negative balances` after test
- `No race-condition corruption` (version-based optimistic concurrency + retry)
- `Transactions processed safely` under concurrent load

### Evidence

- Teardown account verification status: `<pass/fail>`
- Negative balance count: `<value>`
- Any unexpected account state anomalies: `<none/details>`

## 6. Observations

- Expected behavior observed:
  - `<example: high withdrawal contention produced valid business 4xx failures, not data corruption>`
- Unexpected behavior observed:
  - `<none or details>`

## 7. Conclusion

State whether assignment criteria are met:

- Handles at least `1000` concurrent transaction requests: `<yes/no>`
- Account balances remain consistent: `<yes/no>`
- No negative balances occur: `<yes/no>`
- No race conditions observed: `<yes/no>`
- Transactions processed safely: `<yes/no>`

## 8. Attached Artifacts

- k6 script: `backend/load-tests/k6/transactions-load-test.js`
- Summary JSON: `backend/load-tests/results/summary.json`
- Screenshots/terminal logs: `<paths>`

## Appendix: Useful Commands

Run with custom values:

```powershell
k6 run -e BASE_URL=http://localhost:5000 -e VUS=1000 -e DURATION=30s -e ACCOUNT_COUNT=30 backend/load-tests/k6/transactions-load-test.js
```

Run from backend folder:

```powershell
k6 run -e BASE_URL=http://localhost:5000 -e VUS=1000 -e DURATION=30s -e ACCOUNT_COUNT=30 load-tests/k6/transactions-load-test.js
```
