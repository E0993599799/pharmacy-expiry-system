# Phase 0 Legacy Classification

Baseline: `master@1180fad4f004911691609e695f08a783c93178e1`

Status: legacy implementation is NOT trusted as RFC implementation proof.

## KEEP (structure/reference only)
- Next.js application shell and generic styling assets, subject to later security review.
- Supabase SSR client pattern using publishable/anon key only; authorization remains database/backend responsibility.
- Existing domain concepts such as branches, products, expiry records as discovery input only.

## REWRITE
- Authorization model: replace legacy `admin|branch_user|store` with pharmacy-specific `admin|manager|rx|staff` membership model.
- Database namespace and RLS: move from generic public tables/policies to pharmacy-scoped ownership and deny-by-default access.
- UPDATE policies: require both `USING` and `WITH CHECK` where mutable rows remain allowed.
- Admin membership API: current endpoint incorrectly accepts `memberEmail` as `auth_user_id` UUID and depends on unverified legacy RLS.
- Evidence, dispensing, approval/print, KHY12 enforcement, audit, idempotency and concurrency paths: must be implemented from Phase 0 contracts, not inherited from legacy behavior.

## QUARANTINE
- `supabase/migrations/000_clean_schema.sql`
- `supabase/migrations/001_init_schema.sql`
- `supabase/migrations/002_phase2_tables.sql`
- `supabase/migrations/003_add_admin_roles.sql`
- `app/api/admin/members/route.ts`
- Legacy notification/LINE/OCR endpoints until authentication, authorization, signature verification, bounded resource usage and data ownership are independently proved.
- Legacy completion documents such as `AUTH_SYSTEM_COMPLETE.md`, `ADMIN_CONFIGURATION_COMPLETE.md`, `PHASE2.md`; these are historical notes, not current proof.

## REMOVE FROM TRUSTED CONFIGURATION
- Any real credential committed to `.env.example` or source control. HEAD has been sanitized; leaked values must be treated as compromised until rotated/revoked externally and rotation proof is recorded.

## Key audit findings
1. Public-schema table names are generic and can collide/leak in a shared Supabase project.
2. Legacy role model does not match the approved RFC roles.
3. Several UPDATE policies use only `USING`; Phase 0 requires `WITH CHECK` as well.
4. `admin_users` policies query `admin_users` from policies on the same table, which requires redesign/proof to avoid recursive RLS behavior.
5. Product SELECT policy is `USING (true)`, which is incompatible with deny-by-default shared-system isolation unless the table is intentionally public and non-sensitive.
6. Legacy admin API conflates email input with auth UUID identity.

No item in QUARANTINE may be promoted to KEEP without repeatable Phase 0 proof.