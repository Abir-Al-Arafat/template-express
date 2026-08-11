# Antigravity Agent Directives

## 1. Token & Context Optimization
* Use bash commands (e.g., `tree -L 3`, `grep`, or `head`/`tail`) to navigate the codebase instead of natively reading entire files into context.
* Summarize directory contents and code structures instead of dumping raw output.
* Default to quiet and minimal output modes unless explicitly asked for verbose details.

## 2. TypeScript & Code Style Paradigms
* Enforce strict typing across all files; do not use `any` unless absolutely unavoidable.
* Utilize interfaces over types for object definitions to allow for easier declaration merging.
* Maintain the Repository Pattern. Controllers must not interact directly with the database; all data access must route through the designated repository classes (e.g., extending `base.repository.ts`).
* All error handling must utilize the custom `AppError` class to ensure consistent API responses.

## 3. Architecture & Infrastructure
* Ensure all database (MongoDB) and caching (Redis) connections remain cleanly decoupled and are strictly configured via environment variables.
* When modifying deployment scripts or the `Dockerfile`, assume standalone execution on a local machine or within an isolated Docker container. Do not generate or configure a `docker-compose.yml` file.

## 4. Testing Requirements
* Any newly generated generic routes or modules must include corresponding baseline unit tests.
* Update the K6 scripts in the `load-tests` directory to reflect any changes to standard API endpoints or real-time socket events.

## 5. Modular Layering & SOLID Principles
When generating or refactoring modules, enforce this 7-file architectural pattern:
1. `[module].model.ts`: Mongoose Schema & Interface definition with schema versioning.
2. `[module].types.ts`: DTOs and payload interfaces.
3. `[module].repository.ts`: Data access layer extending `BaseRepository`. Direct database operations belong ONLY here.
4. `[module].service.ts`: Core business logic, error throwing (`AppError`), and domain rules. Receives repository via constructor dependency injection.
5. `[module].controller.ts`: Express req/res handler. Translates service responses via `ResponseBuilder.success`.
6. `[module].validation.ts`: `express-validator` rules.
7. `[module].route.ts`: Express router using `asyncHandler` wrappers, binding validations and controller methods.

* Principles:
  * Single Responsibility (SOLID): Keep route, validation, business logic, and database logic strictly in their respective files.
  * Dependency Injection: Class dependencies must be passed via constructors.
  * DRY & KISS: Keep controller methods lean and delegate logic to services.