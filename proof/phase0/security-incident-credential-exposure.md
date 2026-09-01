# Security Incident — Credential Exposure in Public Repository

Status: OPEN
Severity: CRITICAL
Detected during Phase 0 audit on 2026-08-28.

## What happened

The legacy public repository committed non-placeholder credentials inside `.env.example`.

## Immediate containment completed

- Sanitized `.env.example` on default branch `master`.
- Sanitized `.env.example` on `phase0/security-data-invariants`.
- No leaked secret value is repeated in this proof document.

## Why incident remains open

Git history may retain the old values and public exposure may already have allowed scraping. Removing values from HEAD is containment, not revocation.

## Required rotation/revocation proof

1. Supabase privileged/service credential associated with the exposed legacy project: revoke/rotate using an impact-aware cutover because the RFC states Supabase infrastructure is shared.
2. Google app password: revoke and issue a replacement only if the notification feature remains required.
3. LINE channel access token: revoke/rotate.
4. LINE channel secret(s): rotate where supported and update all consumers.
5. Inventory every deployment/automation consuming these credentials before shared-key rotation.
6. Update runtime secret stores only; never commit replacement secrets.
7. Validate old credentials fail after rotation.
8. Consider Git history rewrite only after rotation; history rewriting is not a substitute for revocation and may disrupt clones/refs.

## Connector observation

The currently connected Supabase account exposes project ref `qsiebitoukfmsbplnzga`; the legacy leaked Supabase URL referenced a different project ref. Therefore this session cannot safely assert ownership or rotate the exposed Supabase credential through the connected project without additional verified access.

## Exit criteria

Incident closes only when rotation/revocation evidence exists for every exposed credential class and dependent systems pass post-rotation health checks.
