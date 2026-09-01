import fs from 'node:fs';

const page = 'app/dashboard/operations/page.tsx';
const layout = 'app/dashboard/layout.tsx';

if (!fs.existsSync(page)) throw new Error('missing operations page');
if (!fs.existsSync(layout)) throw new Error('missing dashboard layout');

const source = fs.readFileSync(page, 'utf8');
const nav = fs.readFileSync(layout, 'utf8');

for (const marker of [
  'Stock import',
  'Expiry review',
  'Patient & dispense',
  'Required documents',
  'Arabic label',
  'Production guard',
  'PAGE_SIZE = 25',
  'max 50',
]) {
  if (!source.includes(marker)) throw new Error(`missing operations marker: ${marker}`);
}

if (!nav.includes('/dashboard/operations')) throw new Error('missing operations nav link');
if (!source.includes('AI/free-form Arabic cannot be final-printed')) throw new Error('missing Arabic print safety guard');
if (!source.includes('KHY12 document required before completion')) throw new Error('missing KHY12 backend guard notice');
if (!source.includes('Rx approval required before final print')) throw new Error('missing Rx print guard notice');

console.log('OPERATIONS_RUNTIME_PROOF:PASS');
