# Phase 0 TODO

- [x] Create isolated Phase 0 branch from legacy master.
- [x] Establish PROJECT.md and PLAN.md.
- [ ] Inventory legacy code and classify KEEP / REWRITE / QUARANTINE / REMOVE.
- [ ] Map existing Supabase tables, policies, functions, buckets and credentials used by this repo.
- [ ] Write explicit trust-boundary and data-ownership matrix.
- [ ] Define backend RBAC matrix and negative tests.
- [ ] Define KHY12 backend attachment invariant and tests.
- [ ] Define Rx-only approve/print invariant and tests.
- [ ] Define idempotency/concurrency/stale-write contracts.
- [ ] Define evidence immutability, audit and print-version contracts.
- [ ] Define recovery/rollback/failure-injection test matrix.
- [ ] Define upload/PDF/worker/retry/time/resource budgets.
- [ ] Implement only the minimum Phase 0 enforcement/test scaffolding needed to prove invariants.
- [ ] Produce repeatable proof under proof/phase0/.
- [ ] Review proof before opening any feature implementation phase.
