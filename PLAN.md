# Phase 0 Plan — Security & Data Invariants

Source of truth: mission-control issue #251 and approved corrected-plan gate.

## P0.1 Legacy baseline audit
- Inventory existing app/auth/admin/Supabase/storage/import/label code.
- Mark each surface KEEP / REWRITE / QUARANTINE / REMOVE.
- No legacy `*_COMPLETE.md` file is accepted as proof by itself.

## P0.2 Trust boundaries
- Define pharmacy-owned tables, storage buckets, functions, service credentials and namespaces.
- Define explicitly prohibited Mission Control access paths.
- Document which identities may access which store and record classes.

## P0.3 Backend authorization contract
- Roles: admin, manager, rx, staff.
- Rx-only: approve label, print label, final pharmacist review.
- KHY12: attachment required at backend before approve, print or complete.
- Drug classification editable only through Drug Master authorization path.
- UI state is never authoritative for authorization.

## P0.4 Data integrity and concurrency
- Lot identity uses store + icode + lot uniqueness.
- Verified expiry cannot be overwritten by lower-trust import/capture paths.
- Mutations define idempotency keys and optimistic version checks.
- Stale approvals and duplicate/replayed submissions fail closed.

## P0.5 Evidence, audit and print integrity
- Original evidence is private, immutable after acceptance, hash-addressed/audited.
- Corrections create new versions; originals remain recoverable.
- Printed labels reference an immutable approved label/version record.
- Audit records identify actor, action, target, timestamp and before/after/version reference where applicable.

## P0.6 Recovery and failure injection
Test at minimum:
- duplicate import submission;
- concurrent lot update;
- stale approval;
- missing KHY12 attachment;
- unauthorized print/approve;
- interrupted upload/import;
- attachment deletion attempt;
- cross-system table/bucket access;
- retry after transient failure;
- rollback after partial write.

## P0.7 Safety/resource budget
- bounded upload size and accepted MIME types;
- bounded PDF pages/file size;
- bounded worker concurrency;
- retry cap with backoff;
- no unbounded polling or spawn loops;
- timeouts for OCR/PDF/image processing;
- rate limits for high-cost ingestion paths.

## P0 exit gate
Phase 0 is complete only when executable proof demonstrates:
1. backend RBAC fail-closed;
2. KHY12 backend attachment gate;
3. Rx-only approve/print;
4. shared-Supabase isolation;
5. concurrency/idempotency protections;
6. immutable evidence/audit contract;
7. failure-injection/recovery behavior;
8. bounded resource limits;
9. legacy baseline disposition is documented.

No feature phase begins automatically after this gate; a fresh proof summary is required first.
