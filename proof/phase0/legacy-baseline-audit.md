# Legacy Baseline Audit — Initial

Baseline: `master@1180fad4f004911691609e695f08a783c93178e1`

## Verified observations
- Repository already contains application code under `app/` and `lib/`.
- Repository already contains `middleware.ts` and Supabase configuration/template material.
- Repository contains historical completion-oriented documents including `AUTH_SYSTEM_COMPLETE.md`, `ADMIN_CONFIGURATION_COMPLETE.md`, `PHASE2.md`, and UI refinement notes.
- `package.json` identifies a Next.js 14 / React 18 application with Supabase client libraries, PDF parsing, camera capture and related dependencies.

## Classification rule
These artifacts predate the approved RFC #251 gate and are therefore classified as `LEGACY / UNVERIFIED PRE-RFC`. Historical filenames or statements containing “COMPLETE” are not accepted as current proof.

## Current disposition
- Existing runtime code: QUARANTINE pending security/data review.
- Existing auth/admin code: QUARANTINE pending backend RBAC review.
- Existing Supabase integration: QUARANTINE pending table/RLS/storage/credential isolation audit.
- Existing import/camera/PDF dependencies: QUARANTINE pending bounded-resource and ingestion-threat review.
- Historical design/completion documents: REFERENCE ONLY.

No legacy surface is yet classified KEEP.
