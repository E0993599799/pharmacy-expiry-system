# Admin Account Setup Guide

**Email**: e.meephu@gmail.com  
**Roles**: admin, store  
**Permissions**: Can add members, manage branches, manage products, view reports

---

## Step 1: Create User in Supabase Auth

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select the pharmacy-expiry-system project
3. Go to **Authentication > Users**
4. Click **Add User**
5. Enter:
   - Email: `e.meephu@gmail.com`
   - Password: Set a strong password
   - Auto Confirm User: ✅ (checked)
6. Click **Create User**
7. **Copy the UUID** from the user details (you'll need this)

---

## Step 2: Create Admin Record

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (
  auth_user_id, 
  email, 
  full_name, 
  roles, 
  can_manage_members, 
  can_manage_branches, 
  can_manage_products, 
  can_view_reports
) VALUES (
  'PASTE_UUID_FROM_STEP_1',           -- Replace with actual UUID
  'e.meephu@gmail.com',
  'Admin User',
  ARRAY['admin', 'store'],
  true,
  true,
  true,
  true
);
```

---

## Step 3: Add System Admin Role

Run this SQL to add the admin to user_branches for full system access:

```sql
-- Get the first branch ID (or replace with specific branch)
INSERT INTO user_branches (auth_user_id, branch_id, role)
SELECT 
  'PASTE_UUID_FROM_STEP_1',           -- Replace with actual UUID
  (SELECT id FROM branches LIMIT 1),  -- Gets first branch
  'admin';
```

Or for all branches:

```sql
INSERT INTO user_branches (auth_user_id, branch_id, role)
SELECT 
  'PASTE_UUID_FROM_STEP_1',           -- Replace with actual UUID
  id,
  'admin'
FROM branches;
```

---

## Step 4: Verify Setup

Test that the admin account works:

1. Log in with `e.meephu@gmail.com` at https://pharmacy-expiry-system.vercel.app
2. Verify you can see:
   - ✅ All branches
   - ✅ All products
   - ✅ All expiry records
3. Test adding a new member:
   - Go to Admin Panel > Members
   - Click "Add Member"
   - Enter member email and role
   - Verify member is created

---

## Admin Permissions

The admin account (`e.meephu@gmail.com`) has these permissions:

| Permission | Enabled |
|-----------|---------|
| **Can manage members** | ✅ Yes - Add, edit, remove users |
| **Can manage branches** | ✅ Yes - Create, edit, delete branches |
| **Can manage products** | ✅ Yes - Add, edit pharmaceutical products |
| **Can view reports** | ✅ Yes - Access all analytics |
| **Can view all data** | ✅ Yes - See all branches and records |

---

## Adding Members

Once admin is set up, the admin can add members via:

### Option 1: Admin Dashboard
- Go to **Settings > Members**
- Click **Add Member**
- Enter email and select role
- Confirm

### Option 2: Direct SQL (Advanced)

```sql
-- Create new user in Supabase Auth first, get UUID, then:

INSERT INTO user_branches (auth_user_id, branch_id, role)
VALUES (
  'MEMBER_UUID',              -- UUID from Supabase Auth
  (SELECT id FROM branches WHERE name = 'สาขาสยาม'),
  'branch_user'               -- Role: 'admin', 'store', or 'branch_user'
);
```

---

## Roles Explained

| Role | Permissions | Use Case |
|------|-------------|----------|
| **admin** | Full access to all data and settings | System administrator |
| **store** | Manage pharmacy operations, can add members | Store manager |
| **branch_user** | View own branch data only | Branch staff |

---

## Troubleshooting

**Problem**: Login fails with correct credentials  
**Solution**: Check that "Auto Confirm User" was enabled in Step 1

**Problem**: Can't see all branches after login  
**Solution**: Run the user_branches INSERT query to assign the admin to branches

**Problem**: Can't add members  
**Solution**: Verify `can_manage_members = true` in admin_users table

---

## Next Steps

1. ✅ Complete all steps above
2. Test login and basic operations
3. Deploy migration to production
4. Document any custom member approval workflows
