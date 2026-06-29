-- Phase 2: Additional tables for notifications and LINE bot

-- Notification logs
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

-- LINE bot interactions
CREATE TABLE line_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Notification schedules
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

-- OCR confidence tracking
ALTER TABLE expiry_records
ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3, 2),
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

-- Indexes for Phase 2
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_line_interactions_user_id ON line_interactions(user_id);
CREATE INDEX idx_notification_schedules_active ON notification_schedules(is_active);
