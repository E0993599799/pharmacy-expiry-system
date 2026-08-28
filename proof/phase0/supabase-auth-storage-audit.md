# Phase 0 — Supabase/Auth/Storage Audit

Status: BLOCKED pending remediation proof
Canonical RFC: E0993599799/mission-control#251
Legacy baseline: master@1180fad4f004911691609e695f08a783c93178e1

## Critical finding — exposed credentials

The public repository contained live-looking credentials in `.env.example`, including a Supabase service-role key, Google app password, and LINE credentials. The file has been sanitized on `master` and on the Phase 0 branch.

Security invariant: all previously committed secret values are considered compromised until rotated/revoked. Repository sanitization alone does not revoke credentials and Git history may retain old values.

Rotation of the shared Supabase project credential is intentionally not performed automatically because the RFC explicitly states this application shares an existing Supabase project/database backend; uncoordinated rotation can break other systems. Rotation requires an impact-aware credential inventory and coordinated cutover.

## Schema and isolation findings

### P0-ISO-01 — no application namespace
Legacy migrations create generic tables (`branches`, `products`, `expiry_records`, `user_branches`, `admin_users`) in the default exposed schema. For a shared Supabase project this is insufficient isolation and creates collision/cross-system authorization risk.

Required remediation contract:
- pharmacy-owned objects must have an explicit ownership boundary (prefer dedicated private/application schema plus narrowly exposed API surface, or an equivalently proven namespace strategy);
- Mission Control identities and APIs must not gain read/write access to pharmacy patient, dispense, regulatory or evidence data merely because both systems share a Supabase project;
- every exposed table must have RLS and least-privilege grants;
- no service-role key may be used in browser code.

### P0-RBAC-01 — legacy roles do not match approved contract
Legacy roles are `admin`, `branch_user`, and later `store`; approved Phase 0 contract is `admin`, `manager`, `rx`, `staff`.

Required remediation contract:
- one canonical role model;
- role assignment stored in server-controlled authorization data, not user-editable metadata;
- Rx-only approve/print and KHY12 attachment enforcement must be server/database enforced;
- no UI-only authorization is accepted as proof.

### P0-RLS-01 — UPDATE policies incomplete
Legacy UPDATE policies use `USING` without `WITH CHECK`. Phase 0 requires both predicates for authorization-sensitive updates so a permitted row cannot be reassigned across branch/store/owner boundaries.

### P0-RLS-02 — self-referential admin policy risk
`admin_users` policies query `admin_users` from policies attached to `admin_users`. This design requires explicit proof that it does not recurse/fail and does not create an authorization bypass. Phase 0 default is REJECT until replaced or proven safe.

### P0-PUBLIC-01 — broad public product read
Legacy policy `Anyone can read products` uses `USING (true)`. This is not automatically acceptable for the approved Drug Master because regulatory classification fields (dangerous-drug and KHY12 flags) are integrity-sensitive. Public readability and writable surfaces must be explicitly separated.

## Auth findings

The server Supabase helper uses the public/anon client with request cookies. That is compatible with RLS-based user access, but it is not itself proof of authorization. Sensitive actions must call server-side authorization checks and must commit through database/API paths that fail closed.

Phase 0 must reject authorization based on user-editable metadata. Authorization state must be server-controlled and fresh enough for approve/print/complete operations.

## Storage findings

No Phase 0-approved private evidence storage contract exists in the legacy baseline. Patient documents and KHY12 evidence therefore remain UNVERIFIED.

Required contract:
- private bucket(s), no public URLs;
- object path bound to pharmacy app + store/encounter/evidence identity;
- signed access only after authorization;
- immutable evidence identity/hash/version metadata;
- replacement is append/new-version, not destructive overwrite;
- audit event for upload, review, approve, reject, print-reference and access where required.

## Immediate disposition

- Legacy schema/code: UNVERIFIED / DO NOT PROMOTE.
- Secret leakage: SECURITY INCIDENT OPEN until rotation/revocation evidence exists.
- Shared-Supabase isolation: BLOCKER.
- Backend RBAC/KHY12/Rx-only proof: BLOCKER.
- Private evidence storage proof: BLOCKER.
