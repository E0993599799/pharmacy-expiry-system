-- Clean schema for Pharmacy Expiry Monitor
-- Drop old tables if exist (safe for fresh start)
DROP TABLE IF EXISTS notification_schedules CASCADE;
DROP TABLE IF EXISTS line_interactions CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS user_branches CASCADE;
DROP TABLE IF EXISTS expiry_records CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

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
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  unit VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expiry records (clean - no generated columns)
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

-- User branch relationships
CREATE TABLE user_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'branch_user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification logs (Phase 2)
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'line', 'push')),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  risk_level VARCHAR(50),
  recipients_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- LINE interactions (Phase 2)
CREATE TABLE line_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Notification schedules (Phase 2)
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  risk_level VARCHAR(50),
  schedule_type VARCHAR(50) CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  day_of_week VARCHAR(20),
  time_of_day TIME,
  email_recipients TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expiry_records_branch_id ON expiry_records(branch_id);
CREATE INDEX idx_expiry_records_product_id ON expiry_records(product_id);
CREATE INDEX idx_expiry_records_expiry_date ON expiry_records(expiry_date);
CREATE INDEX idx_expiry_records_risk_level ON expiry_records(risk_level);
CREATE INDEX idx_user_branches_auth_user_id ON user_branches(auth_user_id);
CREATE INDEX idx_user_branches_branch_id ON user_branches(branch_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_line_interactions_user_id ON line_interactions(user_id);
CREATE INDEX idx_notification_schedules_active ON notification_schedules(is_active);

-- RLS Policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Public access for now (set up proper policies in production)
CREATE POLICY "Allow all access" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON expiry_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON user_branches FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
