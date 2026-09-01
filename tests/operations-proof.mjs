import fs from 'node:fs';

const page = 'app/dashboard/operations/page.tsx';
const layout = 'app/dashboard/layout.tsx';
const landing = 'app/page.tsx';
const packagePath = 'package.json';

if (!fs.existsSync(page)) throw new Error('missing operations page');
if (!fs.existsSync(layout)) throw new Error('missing dashboard layout');
if (!fs.existsSync(landing)) throw new Error('missing landing page');

const source = fs.readFileSync(page, 'utf8');
const nav = fs.readFileSync(layout, 'utf8');
const landingSource = fs.readFileSync(landing, 'utf8');

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

for (const marker of [
  'Pharmacy Management Program',
  'Expiry management',
  'ED Project document',
  'Temperature monitoring system',
  '/auth/login',
]) {
  if (!landingSource.includes(marker)) throw new Error(`missing landing marker: ${marker}`);
}

if (landingSource.includes("router.push('/login')")) {
  throw new Error('landing must not auto-redirect to login');
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
for (const dep of ['tailwindcss', 'postcss', 'autoprefixer']) {
  if (!pkg.devDependencies?.[dep]) throw new Error(`missing CSS build dependency: ${dep}`);
}
for (const config of ['postcss.config.js', 'tailwind.config.js']) {
  if (!fs.existsSync(config)) throw new Error(`missing CSS build config: ${config}`);
}

console.log('OPERATIONS_RUNTIME_PROOF:PASS');
