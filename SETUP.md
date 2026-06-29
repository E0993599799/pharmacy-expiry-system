# Pharmacy Expiry System - Setup Guide

## Quick Start

### 1. Supabase Setup

1. Create project at supabase.com
2. Copy URL and ANON KEY
3. Run SQL migrations: `/supabase/migrations/001_init_schema.sql`
4. Add sample data: `/supabase/seed.sql`

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in Supabase credentials.

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Test User Setup

In Supabase > Authentication, create user:
- Email: test@pharmacy.local
- Password: (any)

Then in SQL Editor:
```sql
INSERT INTO user_branches (auth_user_id, branch_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@pharmacy.local'),
  (SELECT id FROM branches LIMIT 1),
  'admin'
);
```

## Build & Deploy

```bash
npm run build
npm run start
```

For Vercel: Connect repo and add env vars.

## Features Included

✅ Login/Auth (Supabase)
✅ Branch Access Control
✅ Product Master CRUD
✅ Manual Expiry Record Entry
✅ Risk Dashboard (Expired, Critical, High, Medium, Normal)
✅ Filtering & Search
✅ Reports (by risk, branch, product)
✅ Thai language UI
✅ Multi-branch support
✅ Role-based access (admin, branch_user)

## Routes

- `/` - Redirect to dashboard or login
- `/login` - Login page
- `/dashboard` - Main dashboard with stats
- `/dashboard/products` - Product management
- `/dashboard/expiry-records` - Manual entry & list
- `/dashboard/reports` - Risk/branch/product reports

## Database Tables

- `branches` - Pharmacy locations
- `products` - Medicine master
- `expiry_records` - Recorded expiry dates
- `user_branches` - User role assignments

## Known Limitations

- No OCR/photo in MVP (Phase 2)
- No PDF bulk import (Phase 2)
- No email notifications (Phase 2)
- No export/CSV (Phase 2)
- Missing expiry counter not implemented

## Next Phase Features

- Photo/OCR entry
- PDF goods receiving upload
- LINE bot integration
- Email/SMS alerts
- Data export
- Advanced user management
