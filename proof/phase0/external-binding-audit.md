# Phase 0 external binding audit

Date: 2026-08-28
Status: PARTIAL / BLOCKED ON SUPABASE PERMISSION

## Verified bindings

- Repository Supabase config declares project ref `drillmssdmwnbbcyldif`.
- Current connected Supabase account cannot read that project ref: permission denied.
- Current connected Supabase account can see another project (`qsiebitoukfmsbplnzga`), which must not be treated as the pharmacy target without independent proof.
- Legacy `.env.example` referenced Vercel project id `prj_BE1k76SJzn94y448J7X32MjZ6rfv`.
- Connected Vercel account resolves that id to project `pharmacy-expiry-system`.
- Latest Vercel deployment is READY and targeted production, but project metadata reports `live=false` and the project object has no GitHub link. Treat as legacy deployment state, not production-readiness proof.

## Credential incident status

Credential values previously committed to the public repository are considered compromised. The repository HEAD has been sanitized, but history exposure remains until each owning service confirms rotation/revocation and the previous value is proven unusable.

Do not copy exposed credential values into proof, issues, logs, CI output, or future commits.

## Required proof before Phase 0 can close

1. Obtain authorized access to Supabase project `drillmssdmwnbbcyldif` or authoritative evidence that the pharmacy target has changed.
2. Rotate/revoke every exposed credential at its owning service.
3. Prove old credentials fail without publishing the values.
4. Inventory live database schemas/tables/RLS/functions/storage on the verified pharmacy target.
5. Run database-level negative tests only on a verified safe target.
6. Record repeatable database proof under `proof/phase0/`.

Feature implementation remains blocked.
