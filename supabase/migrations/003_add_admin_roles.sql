-- Migration: Add admin account and store role support
-- Date: 2026-07-02
-- Purpose: Setup admin account (e.meephu@gmail.com) with admin+store roles

-- Update user_branches role constraint to include 'store' role
ALTER TABLE user_branches
DROP CONSTRAINT IF EXISTS user_branches_role_check;

ALTER TABLE user_branches
ADD CONSTRAINT user_branches_role_check
CHECK (role IN ('admin', 'branch_user', 'store'));

-- Create admin_users table to track admin accounts and their permissions
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  roles TEXT[] DEFAULT ARRAY['admin'],
  can_manage_members BOOLEAN DEFAULT true,
  can_manage_branches BOOLEAN DEFAULT true,
  can_manage_products BOOLEAN DEFAULT true,
  can_view_reports BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Admins can see all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Only system admins can insert admin users"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.can_manage_members = true
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Only system admins can update admin users"
  ON admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.can_manage_members = true
      AND admin_users.is_active = true
    )
  );

-- Update user_branches policy to allow admins to manage members
DROP POLICY IF EXISTS "Only admins can manage user_branches" ON user_branches;

CREATE POLICY "Admins can manage user_branches"
  ON user_branches FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.auth_user_id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.can_manage_members = true
      )
      OR
      EXISTS (
        SELECT 1 FROM user_branches AS ub
        WHERE ub.auth_user_id = auth.uid()
        AND ub.role = 'admin'
      )
    )
  );

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- Seed data: Note - the actual UUID for e.meephu@gmail.com will need to be replaced
-- after the user is created in Supabase Auth. For now, we'll leave this as a template.
-- The admin user must be created manually in Supabase Auth dashboard first, then:
-- INSERT INTO admin_users (auth_user_id, email, full_name, roles, can_manage_members, can_manage_branches, can_manage_products, can_view_reports)
-- VALUES ('REPLACE_WITH_ACTUAL_UUID', 'e.meephu@gmail.com', 'Admin User', ARRAY['admin', 'store'], true, true, true, true);
