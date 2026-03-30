# Backend Scaffold

This folder contains the initial modular-monolith backend baseline.

## Current Scope
1. Module boundaries and layered structure.
2. OpenAPI 3.1 contract for core academic tools.
3. PostgreSQL schema draft for multi-tool workflows.

## Layering Rules
1. Transport layer handles request and response mapping only.
2. Service layer contains business orchestration and policies.
3. Repository layer handles persistence through interfaces.
4. Domain contracts remain framework-agnostic.

## Next Build Steps
1. Initialize NestJS application shell.
2. Wire module controllers to service contracts.
3. Implement repository adapters for PostgreSQL.
4. Add queue workers for long-running analysis jobs.
