# Phase 0 — Negative Test Contract

Canonical RFC: E0993599799/mission-control#251
Status: REQUIRED BEFORE FEATURE IMPLEMENTATION

## Identity and role matrix

Actors:
- anonymous
- authenticated/no-pharmacy-role
- staff/store A
- staff/store B
- rx/store A
- rx/store B
- manager/store A
- admin
- Mission Control/non-pharmacy identity
- server maintenance identity (only where explicitly authorized)

Every privileged operation must be tested with allowed and denied actors. A UI-hidden button is never proof.

## Required fail-closed tests

### Authentication / authorization
1. Anonymous cannot read patient, dispense, regulatory attachment or private evidence data.
2. Authenticated user with no pharmacy assignment gets zero protected rows and cannot mutate protected records.
3. Staff cannot approve a dispense.
4. Staff cannot print a medication label.
5. Manager cannot perform Rx-only approve/print unless separately assigned the `rx` role by the canonical role model.
6. Rx for store B cannot approve/print/access store A protected encounter data.
7. Disabled/revoked assignment cannot continue a critical action after backend re-check.
8. Client/user metadata changes cannot grant roles.

### KHY12 invariant
9. If Drug Master `khy12=true` and attachment count is zero, approve fails.
10. Same condition: print fails.
11. Same condition: complete fails.
12. Uploading an attachment and then deleting/revoking it before commit causes the critical action to fail on re-check.
13. Changing Drug Master classification concurrently from non-KHY12 to KHY12 before commit causes backend re-evaluation; stale approval cannot bypass the attachment requirement.

### Rx-only invariant
14. Backend rejects approve by admin/manager/staff without Rx authorization even if a forged client request calls the endpoint directly.
15. Backend rejects print by non-Rx identity even if the record was previously approved by an Rx.
16. Print binds to an approved immutable/versioned dispense state; stale or superseded approval cannot print.

### Cross-store / cross-system isolation
17. Store A identity cannot select/update/delete Store B patient, dispense, lot or evidence rows.
18. Mission Control identity sharing the same Supabase project cannot read/write pharmacy-owned protected objects by default.
19. Pharmacy application identity cannot read/write Mission Control-owned protected objects by default.
20. Generic authenticated Supabase role alone is insufficient to access protected pharmacy rows.

### Evidence immutability / audit
21. Evidence replacement creates a new immutable version/object rather than silently overwriting the original.
22. Original object digest/version remains auditable after replacement/rejection.
23. Unauthorized direct storage-object fetch fails.
24. Signed URL issuance fails unless application authorization succeeds.
25. Approve/print/complete writes append an audit event with actor, timestamp, target/version and decision context.

### Concurrency / idempotency
26. Duplicate import with same idempotency key cannot duplicate stock effect.
27. Duplicate approve request cannot create two approvals/audit side effects.
28. Duplicate print request is either explicitly idempotent or produces separately identified print events without corrupting state.
29. Concurrent edits to the same dispense/lot use version/locking semantics; stale writer is rejected.
30. Retry after timeout cannot repeat a committed side effect unknowingly.

### Failure injection / recovery
31. Failure after evidence upload but before DB commit leaves no approved orphan state.
32. Failure after DB transaction but before response can be retried safely.
33. Worker/job retry is bounded and dead-letter/review state is observable.
34. Reboot/restart does not convert pending/unverified work into approved/complete state.
35. Rollback restores application compatibility without deleting immutable audit/evidence records.

### Resource/safety budget
36. PDF/image processing has bounded file size/page count/runtime/retries/concurrency.
37. Malformed or decompression-bomb-like inputs fail closed without unbounded memory/CPU consumption.
38. Queue retry count and concurrency are capped.
39. Search/list endpoints are paginated and cannot preload the full Drug Master or patient corpus.
40. Expensive extraction runs asynchronously and cannot block critical interactive transaction paths indefinitely.

## Proof format

Each test must produce:
- test id
- actor/role/store
- preconditions
- request/action
- expected result
- actual result
- database/storage/audit evidence reference
- PASS/FAIL

No Phase 1 feature work is authorized until all applicable Phase 0 tests have executable scaffolding and the critical authorization/isolation tests pass against a controlled environment.
