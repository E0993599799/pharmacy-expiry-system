import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const failures = []

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

// 1) Secrets must never be committed in the example env.
if (exists('.env.example')) {
  const env = read('.env.example')
  const forbidden = [
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*(?!<|$)[^\s#]+/,
    /GOOGLE_APP_PASSWORD\s*=\s*(?!<|$)[^\s#]+/,
    /LINE_CHANNEL_ACCESS_TOKEN\s*=\s*(?!<|$)[^\s#]+/,
    /LINE_CHANNEL_SECRET\s*=\s*(?!<|$)[^\s#]+/,
    /LINE_BIZ_CHANNEL_SECRET\s*=\s*(?!<|$)[^\s#]+/,
  ]
  for (const re of forbidden) {
    if (re.test(env)) failures.push(`credential-like value found in .env.example: ${re}`)
  }
}

// 2) Phase 0 governance/proof artifacts are mandatory.
for (const rel of [
  'PROJECT.md', 'PLAN.md', 'TODO.md', 'PROGRESS.md', 'VERSION.json',
  'CHANGELOG.md', '.project/manifest.json', 'proof/phase0/README.md',
  'proof/phase0/legacy-classification.md', 'proof/phase0/trust-boundary-matrix.md',
  'proof/phase0/negative-test-contract.md',
]) {
  if (!exists(rel)) failures.push(`missing mandatory Phase 0 artifact: ${rel}`)
}

// 3) Approved role vocabulary must be present in the Phase 0 contract.
if (exists('proof/phase0/negative-test-contract.md')) {
  const contract = read('proof/phase0/negative-test-contract.md')
  for (const role of ['admin', 'manager', 'rx', 'staff']) {
    if (!contract.toLowerCase().includes(role)) failures.push(`negative-test contract missing role: ${role}`)
  }
  for (const invariant of ['KHY12', 'print', 'approve', 'idempot', 'concurr', 'Mission Control']) {
    if (!contract.toLowerCase().includes(invariant.toLowerCase())) failures.push(`negative-test contract missing invariant: ${invariant}`)
  }
}

// 4) Any new Phase 0 SQL must be explicitly namespaced and deny-by-default.
const sqlRoot = path.join(root, 'supabase', 'phase0')
if (fs.existsSync(sqlRoot)) {
  for (const name of fs.readdirSync(sqlRoot).filter((n) => n.endsWith('.sql'))) {
    const sql = fs.readFileSync(path.join(sqlRoot, name), 'utf8').toLowerCase()
    if (!sql.includes('pharmacy_') && !sql.includes('pharmacy.')) failures.push(`${name}: missing pharmacy namespace marker`)
    if (!sql.includes('row level security')) failures.push(`${name}: missing RLS marker`)
    if (sql.includes('security definer') && !sql.includes('revoke execute')) failures.push(`${name}: SECURITY DEFINER without explicit EXECUTE revocation marker`)
  }
}

if (failures.length) {
  console.error('PHASE 0 STATIC GATE FAILED')
  for (const f of failures) console.error(`- ${f}`)
  process.exit(1)
}

console.log('PHASE 0 STATIC GATE PASSED')
