-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  sku VARCHAR(100),
  unit VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expiry records table
CREATE TABLE expiry_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  quantity_unit VARCHAR(50),
  notes TEXT,
  source_type VARCHAR(50) DEFAULT 'manual' CHECK (source_type IN ('manual', 'photo', 'pdf', 'line', 'other')),
  photo_url VARCHAR(500),
  pdf_url VARCHAR(500),
  ocr_raw_text TEXT,
  ai_extracted_json JSONB,
  ai_confidence NUMERIC(3, 2),
  confirmation_status VARCHAR(50) DEFAULT 'unconfirmed' CHECK (confirmation_status IN ('unconfirmed', 'confirmed', 'rejected')),
  risk_level VARCHAR(50) DEFAULT 'normal',
  needs_review BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (to store user-branch relationships beyond auth)
CREATE TABLE user_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'branch_user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expiry_records_branch_id ON expiry_records(branch_id);
CREATE INDEX idx_expiry_records_product_id ON expiry_records(product_id);
CREATE INDEX idx_expiry_records_expiry_date ON expiry_records(expiry_date);
CREATE INDEX idx_expiry_records_risk_level ON expiry_records(risk_level);
CREATE INDEX idx_user_branches_auth_user_id ON user_branches(auth_user_id);
CREATE INDEX idx_user_branches_branch_id ON user_branches(branch_id);

-- Row Level Security (RLS) Policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Policies for branches (admin can see all, branch_user can see assigned branches)
CREATE POLICY "Admins can see all branches"
  ON branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

CREATE POLICY "Branch users can see assigned branches"
  ON branches FOR SELECT
  USING (
    id IN (
      SELECT branch_id FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
    )
  );

-- Policies for products (anyone can read, admin can manage)
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

-- Policies for expiry_records
CREATE POLICY "Admins can see all expiry records"
  ON expiry_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

CREATE POLICY "Branch users can see own branch records"
  ON expiry_records FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'branch_user'
    )
  );

CREATE POLICY "Admins can insert expiry records"
  ON expiry_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

CREATE POLICY "Branch users can insert records in own branch"
  ON expiry_records FOR INSERT
  WITH CHECK (
    branch_id IN (
      SELECT branch_id FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'branch_user'
    )
  );

CREATE POLICY "Admins can update all expiry records"
  ON expiry_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'admin'
    )
  );

CREATE POLICY "Branch users can update own branch records"
  ON expiry_records FOR UPDATE
  USING (
    branch_id IN (
      SELECT branch_id FROM user_branches
      WHERE user_branches.auth_user_id = auth.uid()
      AND user_branches.role = 'branch_user'
    )
  );

-- Policy for user_branches
CREATE POLICY "Users can see their own role assignments"
  ON user_branches FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Only admins can manage user_branches"
  ON user_branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_branches AS ub
      WHERE ub.auth_user_id = auth.uid()
      AND ub.role = 'admin'
    )
  );
