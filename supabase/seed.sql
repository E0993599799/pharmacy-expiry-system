-- Seed branches
INSERT INTO branches (name, location, phone) VALUES
  ('สาขาสยาม', 'กรุงเทพฯ', '02-123-4567'),
  ('สาขาลาดพร้าว', 'กรุงเทพฯ', '02-234-5678'),
  ('สาขาเชียงใหม่', 'เชียงใหม่', '053-345-6789'),
  ('สาขาภูเก็ต', 'ภูเก็ต', '076-456-7890');

-- Seed products
INSERT INTO products (name, generic_name, sku, unit) VALUES
  ('ยา เพนนิซิลิน 500mg', 'Amoxicillin', 'SKU-001', 'tablet'),
  ('ยา พาราเซตามอล 500mg', 'Paracetamol', 'SKU-002', 'tablet'),
  ('ยา ไอบูโพรเฟน 200mg', 'Ibuprofen', 'SKU-003', 'tablet'),
  ('ยา ลอราแทดีน 10mg', 'Loratadine', 'SKU-004', 'tablet'),
  ('ยา มีโทโพรลล 25mg', 'Metoprolol', 'SKU-005', 'tablet'),
  ('ยา ไลซิโนโปรล 10mg', 'Lisinopril', 'SKU-006', 'tablet'),
  ('น้ำหนึ่งในยา ออมิพราโซล 20mg', 'Omeprazole', 'SKU-007', 'tablet'),
  ('ยา เมตฟอร์มิน 500mg', 'Metformin', 'SKU-008', 'tablet'),
  ('ยา อะลอพูริโนล 100mg', 'Allopurinol', 'SKU-009', 'tablet'),
  ('ยา อะตอร์วาสตาติน 20mg', 'Atorvastatin', 'SKU-010', 'tablet');

-- Seed sample expiry records with various risk levels
-- Expired
INSERT INTO expiry_records (branch_id, product_id, lot_number, expiry_date, quantity, quantity_unit, notes, source_type, confirmation_status, created_by)
VALUES
  ((SELECT id FROM branches WHERE name = 'สาขาสยาม'), (SELECT id FROM products WHERE sku = 'SKU-001'), 'LOT-2023-001', '2024-12-15', 50, 'box', 'หมดอายุแล้ว', 'manual', 'confirmed', auth.uid()),
  ((SELECT id FROM branches WHERE name = 'สาขาสยาม'), (SELECT id FROM products WHERE sku = 'SKU-002'), 'LOT-2024-001', '2025-01-10', 100, 'box', '', 'manual', 'confirmed', auth.uid());

-- Critical (≤30 days)
INSERT INTO expiry_records (branch_id, product_id, lot_number, expiry_date, quantity, quantity_unit, notes, source_type, confirmation_status, created_by)
VALUES
  ((SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว'), (SELECT id FROM products WHERE sku = 'SKU-003'), 'LOT-2025-015', (CURRENT_DATE + INTERVAL '15 days')::date, 75, 'box', 'เร่งด่วน', 'manual', 'confirmed', auth.uid());

-- High (31-60 days)
INSERT INTO expiry_records (branch_id, product_id, lot_number, expiry_date, quantity, quantity_unit, notes, source_type, confirmation_status, created_by)
VALUES
  ((SELECT id FROM branches WHERE name = 'สาขาเชียงใหม่'), (SELECT id FROM products WHERE sku = 'SKU-004'), 'LOT-2025-045', (CURRENT_DATE + INTERVAL '45 days')::date, 120, 'box', '', 'manual', 'confirmed', auth.uid());

-- Medium (61-90 days)
INSERT INTO expiry_records (branch_id, product_id, lot_number, expiry_date, quantity, quantity_unit, notes, source_type, confirmation_status, created_by)
VALUES
  ((SELECT id FROM branches WHERE name = 'สาขาภูเก็ต'), (SELECT id FROM products WHERE sku = 'SKU-005'), 'LOT-2025-075', (CURRENT_DATE + INTERVAL '75 days')::date, 200, 'box', '', 'manual', 'confirmed', auth.uid());

-- Normal (>90 days)
INSERT INTO expiry_records (branch_id, product_id, lot_number, expiry_date, quantity, quantity_unit, notes, source_type, confirmation_status, created_by)
VALUES
  ((SELECT id FROM branches WHERE name = 'สาขาสยาม'), (SELECT id FROM products WHERE sku = 'SKU-006'), 'LOT-2025-120', (CURRENT_DATE + INTERVAL '120 days')::date, 300, 'box', '', 'manual', 'confirmed', auth.uid()),
  ((SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว'), (SELECT id FROM products WHERE sku = 'SKU-007'), 'LOT-2025-150', (CURRENT_DATE + INTERVAL '150 days')::date, 250, 'box', '', 'manual', 'confirmed', auth.uid());
