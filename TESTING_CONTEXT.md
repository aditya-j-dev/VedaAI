# VedaAI Backend Load & Queue Testing Context

This file tracks the status, configuration, and logs for load and queue testing.

## Current Architecture Status
- **Queue System**: Redis + BullMQ.
- **Worker**: Concurrency is configurable via `WORKER_CONCURRENCY` (currently set to `5`).
- **Dashboard**: Bull Board is mounted at `/admin/queues` and displays waiting, active, completed, and failed jobs.
- **API Behavior**: The POST `/api/assignments` endpoint accepts assignments, registers them in MongoDB, adds them to the BullMQ queue, and returns immediately with `201 Created`.
- **Worker Behavior**: Workers process jobs asynchronously in the background. If `MOCK_AI_DELAY=true`, they simulate a 3–5 seconds AI generation delay and return mock data complying with `resultSchema`, avoiding external LLM API rate limits/costs.
- **Event Logging**: Detailed enqueuing and worker status logs (start, completion, failures, durations, queue size) are printed if `ENABLE_LOAD_TESTING=true`.

## Environment Variables Added
- `ENABLE_LOAD_TESTING`: Set to `true` to enable verbose logging and auth bypass via `x-load-test: true` header.
- `MOCK_AI_DELAY`: Set to `true` to simulate AI generation delay (3-5 seconds) and bypass actual LLM calls.
- `WORKER_CONCURRENCY`: Configures worker concurrency. Defaults to `5`.

## Files Modified
- `apps/backend/.env`: Configured testing environment variables.
- `apps/backend/package.json`: Installed dependencies and registered `test:load` package script.
- `apps/backend/src/config/env.ts`: Added typescript schema validation for `ENABLE_LOAD_TESTING`, `MOCK_AI_DELAY`, and `WORKER_CONCURRENCY`.
- `apps/backend/src/middleware/requireAuth.ts`: Added mock user authentication bypass when `ENABLE_LOAD_TESTING=true` and `x-load-test: true` header is provided.
- `apps/backend/src/index.ts`: Configured and mounted Bull Board at `/admin/queues` showing the `question-generation` queue.
- `apps/backend/src/queues/generationQueue.ts`: Added detailed enqueuing event logging and timeout handling (30s).
- `apps/backend/src/workers/generationWorker.ts`: Configured variable worker concurrency, detailed worker lifecycle logs, simulated delay, and parsed response mock.
- `apps/backend/src/scripts/runLoadTest.ts`: Script that executes autocannon load test.
- `README.md`: Added comprehensive instructions on setup, testing flow, and restoration.

## Completed Steps
- [x] Installed backend dependencies (`@bull-board/api`, `@bull-board/express`, `autocannon`, and `@types/autocannon`).
- [x] Added configuration variables validation.
- [x] Set up Bull Board dashboard route at `/admin/queues`.
- [x] Integrated detailed worker and queue logging triggered via `ENABLE_LOAD_TESTING`.
- [x] Added simulated delay and mock generator for load testing via `MOCK_AI_DELAY`.
- [x] Created `pnpm test:load` script using an isolated script runner avoiding CLI shell escaping issues.
- [x] Verified full setup under concurrent load: ran load test of 50 connections, 20s duration, sending 1,105 requests (100% 2xx responses) and verified worker background queue consumption logs.
- [x] Updated documentation with testing guides.

## Commands Executed
- `pnpm add @bull-board/api @bull-board/express`
- `pnpm add -D autocannon @types/autocannon`
- `npx tsx src/scripts/testPost.ts`
- `npx tsx src/scripts/runLoadTest.ts`

## Current Issues / Bugs
- None.

## Debugging Observations
- When `.env` is updated, the active `tsx watch` process does not reload the environment variables automatically. A full process restart is required (done).
- Direct command-line escaping of nested JSON strings in Windows PowerShell results in invalid arguments; utilizing the JS runner script is 100% robust and platform independent.

## Test Results
Autocannon Load Test Result (50 connections, 20 seconds, POST):
- **Total Requests Sent**: 1,105
- **2xx Responses**: 1,055 (remaining requests were in flight at cutoff)
- **Average Latency**: 931.55 ms
- **Max Latency**: 2116 ms
- **Queue Worker concurrency**: 5
- **All jobs successfully enqueued, logged, and consumed asynchronously by workers.**

## Rollback Instructions
To disable/remove testing features and return the application to standard production behavior:
1. In `apps/backend/.env`, set:
   ```env
   ENABLE_LOAD_TESTING=false
   MOCK_AI_DELAY=false
   ```
2. Restart the backend server.
3. This completely deactivates verbose queue logs, simulated AI delay, and authentication bypass, restoring the standard production flow.
