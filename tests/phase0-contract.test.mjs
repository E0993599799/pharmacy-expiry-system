import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const sql = fs.readFileSync('supabase/phase0/001_security_contract.sql', 'utf8')
const lower = sql.toLowerCase()

test('uses pharmacy-scoped schemas', () => {
  assert.match(lower, /create schema if not exists pharmacy_expiry/)
  assert.match(lower, /create schema if not exists pharmacy_private/)
})

test('approved role vocabulary is exact', () => {
  assert.match(lower, /role in \('admin','manager','rx','staff'\)/)
  assert.doesNotMatch(lower, /branch_user/)
})

test('all sensitive contract tables enable RLS', () => {
  for (const table of ['memberships','drug_master','inventory_lots','evidence','dispensing','dispensing_evidence','audit_log']) {
    assert.match(lower, new RegExp(`alter table pharmacy_expiry\\.${table} enable row level security`))
  }
})

test('evidence is append-only to clients', () => {
  assert.match(lower, /no update\/delete policy is intentionally defined for evidence/)
  assert.doesNotMatch(lower, /on pharmacy_expiry\.evidence\s+for update/)
  assert.doesNotMatch(lower, /on pharmacy_expiry\.evidence\s+for delete/)
})

test('security definer helper is not public executable', () => {
  assert.match(lower, /security definer/)
  assert.match(lower, /revoke all on function pharmacy_private\.has_pharmacy_role\(text, text\[\]\) from public/)
  assert.match(lower, /grant execute on function pharmacy_private\.has_pharmacy_role\(text, text\[\]\) to authenticated/)
})

test('approval contract requires KHY12 commit-time revalidation and Rx role', () => {
  assert.match(lower, /re-read drug master khy12 at commit time/)
  assert.match(lower, /require active pharmacy role=rx/)
  assert.match(lower, /reject stale expected_version/)
  assert.match(lower, /decrement inventory exactly once/)
  assert.match(lower, /retries idempotent/)
})

test('contract is non-destructive draft', () => {
  assert.match(lower, /phase 0 draft only\. do not apply to production/)
  assert.ok(lower.trimEnd().endsWith('rollback;'))
})
