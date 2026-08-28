# Phase 0 — Trust Boundary Matrix

Canonical RFC: E0993599799/mission-control#251

| Boundary | Trusted identity | Allowed | Must deny by default | Enforcement proof |
|---|---|---|---|---|
| Browser → Pharmacy app | authenticated pharmacy user | authenticated UI/API requests | service-role/secret access, direct privileged mutation | browser bundle scan + API negative tests |
| Pharmacy app → Supabase Auth | server/client with publishable key + user session | session validation | role elevation from user-editable metadata | auth tests |
| Pharmacy app → Pharmacy DB | assigned pharmacy role/store | scoped CRUD per role | cross-store, cross-role, Mission Control access | RLS + backend tests |
| Mission Control → shared Supabase | Mission Control identity | Mission Control-owned objects only | pharmacy patient/dispense/evidence objects | cross-system negative tests |
| Pharmacy app → Mission Control data | pharmacy identity | none unless explicitly designed later | Mission Control-owned protected objects | cross-system negative tests |
| Pharmacy backend → privileged DB path | narrowly scoped server identity | only operations requiring elevated path | general browser access, unrestricted bypass-RLS path | server-only secret scan + function grants/tests |
| Evidence upload → Storage | authorized pharmacy actor | create immutable evidence version | public bucket/read, destructive replacement without audit | storage policy tests |
| Signed evidence download | authorized actor after application check | short-lived object access | permanent/public URL | signed URL tests |
| Worker → PDF/image pipeline | bounded worker identity | process referenced job/object | arbitrary bucket/database traversal | job-scope tests |
| Dispense approve/print | Rx at correct store + fresh invariant re-check | approve/print valid state | non-Rx, stale state, missing KHY12 evidence | transaction/negative tests |

## Hard rules

1. `service_role`/secret keys are server-only and must never use a `NEXT_PUBLIC_` name.
2. `TO authenticated` alone is not authorization; protected rows require application/store/role predicates.
3. User-editable auth metadata cannot grant pharmacy roles.
4. Critical actions re-check current role, store scope, Drug Master classification, evidence state, and record version at commit time.
5. Shared Supabase infrastructure does not imply shared data authority.
6. Patient/regulatory evidence storage is private by default.
7. Elevated functions, if any, live outside exposed schemas, have explicit grants, validate caller identity, and are tested for bypass behavior.
