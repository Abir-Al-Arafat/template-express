import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";
const API_BASE = `${BASE_URL}/api/v1`;
const VUS = Number(__ENV.VUS || 1000);
const DURATION = __ENV.DURATION || "30s";
const ACCOUNT_COUNT = Number(__ENV.ACCOUNT_COUNT || 1000);
const INITIAL_BALANCE = Number(__ENV.INITIAL_BALANCE || 100000);
const REQ_TIMEOUT = __ENV.REQ_TIMEOUT || "5s";
const SETUP_TIMEOUT = __ENV.SETUP_TIMEOUT || "10m";
const THINK_TIME_MS = Number(__ENV.THINK_TIME_MS || 300);
const THINK_TIME_SECONDS = Math.max(0, THINK_TIME_MS / 1000);

const successCounter = new Counter("txn_success_count");
const businessFailureCounter = new Counter("txn_business_failure_count");
const systemFailureCounter = new Counter("txn_system_failure_count");
const consistencyFailureRate = new Rate("consistency_failure_rate");
const status2xxCounter = new Counter("txn_status_2xx_count");
const status4xxCounter = new Counter("txn_status_4xx_count");
const status5xxCounter = new Counter("txn_status_5xx_count");
const status0Counter = new Counter("txn_status_0_count");

export const options = {
  scenarios: {
    transactions_load: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
      gracefulStop: "10s",
    },
  },
  setupTimeout: SETUP_TIMEOUT,
  teardownTimeout: "5m",
  thresholds: {
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    http_req_failed: ["rate<0.20"],
    txn_system_failure_count: ["count==0"],
    consistency_failure_rate: ["rate==0"],
    checks: ["rate>0.95"],
  },
};

function toJson(response) {
  try {
    return response.json();
  } catch (_error) {
    return null;
  }
}

function accountId(prefix, index) {
  return `${prefix}-ACC-${String(index + 1).padStart(3, "0")}`;
}

function jsonPostParams(tags) {
  return {
    headers: { "Content-Type": "application/json" },
    tags,
    timeout: REQ_TIMEOUT,
  };
}

export function setup() {
  const runId = Date.now().toString();
  const ids = [];

  if (ACCOUNT_COUNT < VUS) {
    console.warn(
      `ACCOUNT_COUNT (${ACCOUNT_COUNT}) is lower than VUS (${VUS}). This increases hot-account contention and can inflate timeouts.`,
    );
  }

  const healthResponse = http.get(`${BASE_URL}/health`, {
    tags: { endpoint: "health" },
    timeout: REQ_TIMEOUT,
  });

  if (healthResponse.status !== 200) {
    throw new Error(
      `Health check failed before load test. Status: ${healthResponse.status}. BASE_URL: ${BASE_URL}`,
    );
  }

  for (let i = 0; i < ACCOUNT_COUNT; i += 1) {
    const id = accountId(runId, i);
    ids.push(id);

    const payload = JSON.stringify({
      accountId: id,
      holderName: `Load Test ${i + 1}`,
      initialBalance: INITIAL_BALANCE,
    });

    const response = http.post(
      `${API_BASE}/accounts`,
      payload,
      jsonPostParams({ endpoint: "create_account" }),
    );

    const isAcceptable = response.status === 201 || response.status === 409;
    check(response, {
      "setup account created or already exists": () => isAcceptable,
    });

    if (!isAcceptable) {
      throw new Error(
        `Setup failed creating account ${id}. Status: ${response.status}`,
      );
    }
  }

  return {
    accountIds: ids,
    runId,
    initialBalance: INITIAL_BALANCE,
  };
}

function pickTwoDistinct(ids) {
  const fromIndex = Math.floor(Math.random() * ids.length);
  let toIndex = Math.floor(Math.random() * ids.length);

  while (toIndex === fromIndex) {
    toIndex = Math.floor(Math.random() * ids.length);
  }

  return {
    from: ids[fromIndex],
    to: ids[toIndex],
  };
}

function postTransaction(payload, tags) {
  return http.post(
    `${API_BASE}/transactions`,
    JSON.stringify(payload),
    jsonPostParams(tags),
  );
}

export default function (data) {
  const ids = data.accountIds;
  const selector = Math.random();
  let response;

  if (selector < 0.45) {
    const accountIdValue = ids[Math.floor(Math.random() * ids.length)];
    response = postTransaction(
      {
        type: "deposit",
        amount: Math.floor(Math.random() * 5) + 1,
        accountId: accountIdValue,
      },
      { endpoint: "deposit" },
    );
  } else if (selector < 0.85) {
    const accountIdValue = ids[Math.floor(Math.random() * ids.length)];
    response = postTransaction(
      {
        type: "withdraw",
        amount: Math.floor(Math.random() * 5) + 1,
        accountId: accountIdValue,
      },
      { endpoint: "withdraw" },
    );
  } else {
    const pair = pickTwoDistinct(ids);
    response = postTransaction(
      {
        type: "transfer",
        amount: Math.floor(Math.random() * 5) + 1,
        fromAccountId: pair.from,
        toAccountId: pair.to,
      },
      { endpoint: "transfer" },
    );
  }

  const json = toJson(response);

  if (response.status === 0) {
    status0Counter.add(1);
  } else if (response.status >= 200 && response.status < 300) {
    status2xxCounter.add(1);
  } else if (response.status >= 400 && response.status < 500) {
    status4xxCounter.add(1);
  } else if (response.status >= 500 && response.status < 600) {
    status5xxCounter.add(1);
  }

  if (response.status >= 200 && response.status < 300) {
    successCounter.add(1);
  } else if (response.status >= 400 && response.status < 500) {
    businessFailureCounter.add(1);
  } else {
    systemFailureCounter.add(1);
  }

  check(response, {
    "response is json-shaped": () => json !== null,
    "status is success or business-safe failure": () =>
      (response.status >= 200 && response.status < 300) ||
      (response.status >= 400 && response.status < 500),
  });

  sleep(THINK_TIME_SECONDS);
}

export function teardown(data) {
  let negativeBalances = 0;

  for (const id of data.accountIds) {
    const response = http.get(`${API_BASE}/accounts/${id}`, {
      tags: { endpoint: "get_account" },
      timeout: REQ_TIMEOUT,
    });

    const json = toJson(response);
    const account = json && json.data ? json.data : null;
    const hasNegative =
      account && typeof account.balance === "number" && account.balance < 0;

    if (hasNegative) {
      negativeBalances += 1;
      consistencyFailureRate.add(1);
    } else {
      consistencyFailureRate.add(0);
    }

    check(response, {
      "teardown account fetch success": (r) => r.status === 200,
      "teardown balance non-negative": () => !hasNegative,
    });
  }

  if (negativeBalances > 0) {
    throw new Error(
      `Consistency failed: ${negativeBalances} account(s) ended with negative balance.`,
    );
  }
}

export function handleSummary(data) {
  const summary = {
    runAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    vus: VUS,
    duration: DURATION,
    accountCount: ACCOUNT_COUNT,
    requestTimeout: REQ_TIMEOUT,
    setupTimeout: SETUP_TIMEOUT,
    thinkTimeMs: THINK_TIME_MS,
    metrics: {
      http_req_duration_p95: data.metrics.http_req_duration.values["p(95)"],
      http_req_duration_p99: data.metrics.http_req_duration.values["p(99)"],
      http_req_failed_rate: data.metrics.http_req_failed.values.rate,
      checks_rate: data.metrics.checks.values.rate,
      txn_success_count: data.metrics.txn_success_count
        ? data.metrics.txn_success_count.values.count
        : 0,
      txn_business_failure_count: data.metrics.txn_business_failure_count
        ? data.metrics.txn_business_failure_count.values.count
        : 0,
      txn_system_failure_count: data.metrics.txn_system_failure_count
        ? data.metrics.txn_system_failure_count.values.count
        : 0,
      consistency_failure_rate: data.metrics.consistency_failure_rate
        ? data.metrics.consistency_failure_rate.values.rate
        : 0,
      txn_status_2xx_count: data.metrics.txn_status_2xx_count
        ? data.metrics.txn_status_2xx_count.values.count
        : 0,
      txn_status_4xx_count: data.metrics.txn_status_4xx_count
        ? data.metrics.txn_status_4xx_count.values.count
        : 0,
      txn_status_5xx_count: data.metrics.txn_status_5xx_count
        ? data.metrics.txn_status_5xx_count.values.count
        : 0,
      txn_status_0_count: data.metrics.txn_status_0_count
        ? data.metrics.txn_status_0_count.values.count
        : 0,
    },
  };

  return {
    stdout: `\nLoad test complete.\n${JSON.stringify(summary, null, 2)}\n`,
    "load-tests/results/summary.json": JSON.stringify(summary, null, 2),
  };
}
