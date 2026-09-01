# Pharmacy Expiry System

Status: PHASE 0 — SECURITY & DATA INVARIANTS

Canonical RFC: E0993599799/mission-control#251
Human approval: issue comment 5447658957

## Scope
A separate in-house pharmacy application with its own repository and deployment lifecycle. It may share an existing Supabase project only if database, storage, role, and policy isolation is proven.

## Current baseline
The repository contains legacy pre-RFC implementation artifacts. They are treated as unverified baseline material and MUST NOT be assumed compliant with the approved RFC.

## Phase 0 rule
No feature implementation may proceed until the Phase 0 proof gate passes.

## Phase 0 objectives
1. Define trust boundaries and data ownership.
2. Prove backend RBAC and fail-closed authorization contracts.
3. Define shared-Supabase isolation and cross-system leakage tests.
4. Define idempotency, concurrency, stale-write and replay protections.
5. Define immutable evidence/audit/print-version contracts.
6. Define recovery, rollback and failure-injection tests.
7. Define bounded resource and retry budgets.
8. Inventory legacy code and classify each surface as keep, rewrite, quarantine, or remove.
