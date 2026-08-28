-- PHASE 0 DRAFT ONLY. DO NOT APPLY TO PRODUCTION.
-- Canonical RFC: E0993599799/mission-control#251
-- Purpose: executable target contract for isolation/RBAC proof.

begin;

create schema if not exists pharmacy_expiry;
create schema if not exists pharmacy_private;

-- App-local role assignment. Never derive authorization from user_metadata.
create table if not exists pharmacy_expiry.memberships (
  user_id uuid not null,
  store_id text not null,
  role text not null check (role in ('admin','manager','rx','staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

alter table pharmacy_expiry.memberships enable row level security;

-- Internal helper is deliberately outside exposed app schema.
create or replace function pharmacy_private.has_pharmacy_role(
  p_store_id text,
  p_roles text[]
) returns boolean
language sql
stable
security definer
set search_path = pharmacy_expiry, pg_temp
as $$
  select exists (
    select 1
    from pharmacy_expiry.memberships m
    where m.user_id = (select auth.uid())
      and m.store_id = p_store_id
      and m.active = true
      and m.role = any(p_roles)
  );
$$;

revoke all on function pharmacy_private.has_pharmacy_role(text, text[]) from public;
grant execute on function pharmacy_private.has_pharmacy_role(text, text[]) to authenticated;

-- Membership visibility is self-only by default. Administrative mutation must
-- happen through separately reviewed server/database operations, not broad table UPDATE.
create policy memberships_select_self
on pharmacy_expiry.memberships
for select
to authenticated
using (user_id = (select auth.uid()));

-- Drug classification is canonical in Drug Master only.
create table if not exists pharmacy_expiry.drug_master (
  icode text primary key,
  drug_name text not null,
  dangerous_drug boolean not null default false,
  khy12 boolean not null default false,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table pharmacy_expiry.drug_master enable row level security;

-- Inventory lot identity is store + icode + lot.
create table if not exists pharmacy_expiry.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  icode text not null references pharmacy_expiry.drug_master(icode),
  lot text not null,
  qty numeric not null check (qty >= 0),
  expiry_date date,
  expiry_verified boolean not null default false,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, icode, lot)
);

alter table pharmacy_expiry.inventory_lots enable row level security;

create policy inventory_select_store_member
on pharmacy_expiry.inventory_lots
for select
to authenticated
using (pharmacy_private.has_pharmacy_role(store_id, array['admin','manager','rx','staff']));

-- Evidence metadata is immutable after insert. Storage object itself must live in a private bucket.
create table if not exists pharmacy_expiry.evidence (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  inventory_lot_id uuid references pharmacy_expiry.inventory_lots(id),
  storage_path text not null,
  sha256 text not null,
  media_type text not null,
  source_kind text not null check (source_kind in ('expiry_photo','expiry_pdf','khy12_attachment')),
  uploaded_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (store_id, sha256, source_kind)
);

alter table pharmacy_expiry.evidence enable row level security;

create policy evidence_select_store_member
on pharmacy_expiry.evidence
for select
to authenticated
using (pharmacy_private.has_pharmacy_role(store_id, array['admin','manager','rx','staff']));

create policy evidence_insert_staff_or_rx
on pharmacy_expiry.evidence
for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())
  and pharmacy_private.has_pharmacy_role(store_id, array['admin','manager','rx','staff'])
);

-- No UPDATE/DELETE policy is intentionally defined for evidence.

create table if not exists pharmacy_expiry.dispensing (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  patient_id uuid not null,
  icode text not null references pharmacy_expiry.drug_master(icode),
  inventory_lot_id uuid not null references pharmacy_expiry.inventory_lots(id),
  quantity numeric not null check (quantity > 0),
  directions text not null,
  status text not null default 'draft' check (status in ('draft','approved','completed','void')),
  approved_by uuid,
  approved_at timestamptz,
  immutable_version bigint,
  version bigint not null default 1,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pharmacy_expiry.dispensing enable row level security;

create table if not exists pharmacy_expiry.dispensing_evidence (
  dispensing_id uuid not null references pharmacy_expiry.dispensing(id),
  evidence_id uuid not null references pharmacy_expiry.evidence(id),
  attached_by uuid not null default auth.uid(),
  attached_at timestamptz not null default now(),
  primary key (dispensing_id, evidence_id)
);

alter table pharmacy_expiry.dispensing_evidence enable row level security;

-- Direct client approval/completion updates are deliberately not granted here.
-- Phase 0 requires one reviewed transactional backend operation to:
--   1. lock/read the current dispense + inventory version,
--   2. re-read Drug Master KHY12 at commit time,
--   3. require >=1 qualifying attachment when KHY12=true,
--   4. require active pharmacy role=rx for approve/complete/print,
--   5. reject stale expected_version,
--   6. decrement inventory exactly once,
--   7. stamp immutable approved version + audit record,
--   8. make retries idempotent.

create table if not exists pharmacy_expiry.audit_log (
  id bigint generated always as identity primary key,
  store_id text not null,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  request_id text not null,
  before_hash text,
  after_hash text,
  created_at timestamptz not null default now(),
  unique (store_id, request_id, action)
);

alter table pharmacy_expiry.audit_log enable row level security;

-- Audit is append-only from reviewed privileged backend path; no client mutation policies.

rollback;
