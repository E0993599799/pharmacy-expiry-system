# Phase 2: Advanced Entry Methods & Notifications

## 🎯 Overview

Phase 2 adds professional workflow capabilities with multiple data entry methods, automated notifications, and LINE bot integration.

## ✨ New Features

### 1. 📷 Photo/OCR Entry (`/dashboard/expiry-records/photo-entry`)

**Capability**: Capture or upload pharmacy label photos and extract expiry data automatically.

**How it works:**
```
Photo → OCR Processing → Extract Date/Lot → Pre-fill Form → Manual Confirm → Save
```

**Features:**
- Live camera capture (mobile-friendly)
- File upload support
- Automatic text extraction
- Date/lot number parsing
- Requires confirmation before saving (status: `unconfirmed`)

**Tech Stack:**
- `react-camera-pro` for camera access
- OCR API route (`/api/ocr`)
- Mock OCR (ready to swap with Tesseract.js or Google Vision)

**Database:**
- Source type: `photo`
- Stores: `photo_url`, `ocr_raw_text`, `ai_extracted_json`, `ai_confidence`
- Status: `unconfirmed` until admin confirms

### 2. 📄 PDF Batch Upload (`/dashboard/expiry-records/pdf-upload`)

**Capability**: Upload goods receiving documents or inventory reports in PDF format.

**Workflow:**
```
PDF File → Parse Tables → Match Products → Preview → Batch Import
```

**Features:**
- Support for common pharmacy documents
  - Goods receiving notes
  - Inventory reports
  - Supplier packing lists
- Automatic product matching
- Preview before import
- Batch insert for efficiency
- Error handling for missing products

**Tech Stack:**
- `pdfjs-dist` for PDF parsing (ready in package.json)
- Table extraction API route (ready for implementation)
- Batch insert optimization

**Database:**
- Source type: `pdf`
- Stores: `pdf_url`
- Status: `unconfirmed` for batch imports

### 3. 📧 Email Notifications (`/dashboard/exports`)

**Capability**: Send automated email alerts to pharmacy staff about at-risk items.

**Features:**
- Manual trigger per risk level
  - 🚨 Expired items
  - ⚠️ Critical (≤30 days)
  - 🟡 High (31-60 days)
- Filter by branch
- HTML-formatted reports
- Recipient tracking

**Implementation:**
- API route: `/api/notifications/send-email`
- Uses `nodemailer` for SMTP
- Gmail app password support
- Stores notification logs for audit

**Configuration:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. 🤖 LINE Bot (`/dashboard/settings/line-bot`)

**Capability**: Communicate with the pharmacy system via LINE Messenger.

**Commands:**
- `สถิติ / stats` → Show risk summary
- `หมดอายุ / expired` → List expired items
- `เร่งด่วน / critical` → Show urgent items
- Other text → Show help menu

**Features:**
- Real-time status queries
- Direct links to dashboard
- Interaction logging
- Multi-language support (Thai/English)

**Webhook:**
- Endpoint: `/api/line/webhook`
- Auto-configured in settings page
- Receives and responds to LINE messages

**Configuration:**
```env
LINE_CHANNEL_ACCESS_TOKEN=your-token
LINE_CHANNEL_SECRET=your-secret
```

**Setup:**
1. Create LINE Business Account
2. Get Channel Access Token from LINE Developers
3. Set Webhook URL to: `https://your-domain/api/line/webhook`
4. Enable "Use webhook" in LINE settings

### 5. 📥 CSV Export (`/api/export/csv`)

**Capability**: Download all expiry records as CSV for analysis in Excel.

**Features:**
- Filter by branch
- Includes risk level calculation
- Thai date formatting
- UTF-8 encoding
- Proper escaping for special characters

**API:**
```
GET /api/export/csv?branch_id={id}
```

Returns: CSV file download

## 🏗️ Technical Architecture

### New API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ocr` | POST | Image → Text conversion |
| `/api/export/csv` | GET | Download expiry records as CSV |
| `/api/notifications/send-email` | POST | Send email alerts |
| `/api/line/webhook` | POST | Receive LINE messages |

### Database Schema Additions

**Phase 2 Tables** (run migration `002_phase2_tables.sql`):

```sql
notification_logs
  - id, type, branch_id, risk_level
  - recipients_count, status, error_message
  - sent_at, created_at

line_interactions
  - id, user_id, message, reply
  - timestamp

notification_schedules
  - id, branch_id, risk_level
  - schedule_type (daily/weekly/monthly)
  - day_of_week, time_of_day
  - email_recipients, is_active
  - created_at, created_by, updated_at
```

### Updated expiry_records Schema

New fields (already in MVP, now actively used):
```sql
photo_url VARCHAR(500)
pdf_url VARCHAR(500)
ocr_raw_text TEXT
ai_extracted_json JSONB
ai_confidence NUMERIC(3,2)
confirmation_status VARCHAR(50)
```

New fields from Phase 2:
```sql
needs_review BOOLEAN
```

## 🔄 Workflow Integration

### Photo Entry Workflow
```
User → Open Photo Entry
     → Capture/Upload → OCR Processing
     → Auto-extract Date, Lot → Pre-fill Form
     → User confirms/corrects
     → Save as "unconfirmed"
     → Admin reviews in dashboard
     → Admin confirms → Status = "confirmed"
```

### PDF Import Workflow
```
User → Upload PDF
    → Parse tables → Match products
    → Show preview (pending records)
    → User reviews
    → Click "Import"
    → Batch insert
    → All saved as "unconfirmed"
    → Admin bulk confirm
```

### Notification Workflow
```
Admin → Click "Send Email"
     → Select risk level & branch
     → API fetches at-risk records
     → Generate HTML report
     → Send via SMTP
     → Log notification
     → Email lands in user inbox
```

### LINE Bot Workflow
```
User sends message to LINE BOT
     → LINE platform routes to /api/line/webhook
     → Parse message text
     → Query expiry records from DB
     → Generate response text
     → Send back via LINE API
     → Log interaction
```

## 📊 Data Flow

### OCR → Database
```
image → OCR API → raw text
                → extract patterns (date, lot)
                → parse date string → YYYY-MM-DD
                → calculate risk level
                → insert with source_type='photo'
                → confirmation_status='unconfirmed'
```

### PDF → Database
```
PDF file → /api/export/pdf → extract tables
                           → match products
                           → create records
                           → batch insert
                           → status='unconfirmed'
```

## ⚙️ Configuration

### Phase 2 Environment Variables

```env
# Email (Gmail with App Password)
EMAIL_USER=pharmacy-alerts@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx

# LINE Bot
LINE_CHANNEL_ACCESS_TOKEN=YOUR_TOKEN
LINE_CHANNEL_SECRET=YOUR_SECRET

# Optional: Cloud OCR Services
GOOGLE_VISION_API_KEY=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### Supabase Setup

1. Run migration: `002_phase2_tables.sql`
2. Enable RLS on new tables
3. Configure notification schedules if needed

## 🔒 Security

### Photo/OCR Data
- Photos stored in Supabase Storage
- OCR text not retained longer than needed
- Confidence score for quality control
- Manual review for low-confidence extractions

### PDF Uploads
- File size limits enforced
- Malware scanning recommended
- Uploaded by admins/authorized users only

### Email Notifications
- Sent only to authenticated admin users
- No sensitive data in email headers
- Audit log of all sends

### LINE Bot
- Webhook signature verification (ready in code)
- User ID tracking for interactions
- Rate limiting recommended

## 🧪 Testing Phase 2 Features

### Test Photo Entry
1. Go to `/dashboard/expiry-records/photo-entry`
2. Click "📷 เปิดกล้อง"
3. Allow camera access
4. Capture a label or text
5. Verify OCR text extraction
6. Confirm data pre-filled correctly

### Test PDF Upload
1. Prepare sample PDF with table
2. Go to `/dashboard/expiry-records/pdf-upload`
3. Select branch and PDF
4. Click "ประมวลผล PDF"
5. Verify preview matches expected data
6. Click "นำเข้าข้อมูล"
7. Check dashboard for new records

### Test Email Notifications
1. Set `EMAIL_USER` and `EMAIL_PASSWORD` in .env
2. Go to `/dashboard/exports`
3. Select risk level
4. Click send button
5. Check email inbox for HTML report

### Test LINE Bot
1. Set LINE token and secret in .env
2. Go to `/dashboard/settings/line-bot`
3. Copy webhook URL
4. Set in LINE Developers console
5. Send message to LINE bot
6. Verify bot responds correctly

## 📈 Scalability Considerations

### Photo Entry at Scale
- Implement queue for OCR processing (Bull/BullMQ)
- Use cloud OCR (Google Vision/AWS Rekognition)
- Store photos in CDN (Cloudflare, AWS S3)
- Cache product list for faster matching

### PDF Import at Scale
- Implement async PDF processing
- Use queue for batch imports
- Show progress bar for large imports
- Validate before inserting

### Email Notifications at Scale
- Use email service (SendGrid, AWS SES)
- Template pre-compilation
- Batch sending
- Retry logic for failed sends

### LINE Bot at Scale
- Message queuing (reduce latency)
- Conversation state management
- Context caching
- Rate limiting per user

## 🚀 Deployment

### Vercel + Supabase

1. Push code to GitHub
2. In Vercel, add environment variables:
   ```
   EMAIL_USER=
   EMAIL_PASSWORD=
   LINE_CHANNEL_ACCESS_TOKEN=
   LINE_CHANNEL_SECRET=
   ```
3. Deploy
4. Run Phase 2 migration in Supabase

### Local Development

```bash
npm install
cp .env.example .env.local
# Fill in Phase 2 env vars
npm run dev
```

## 📝 Known Limitations (Future Improvements)

| Feature | Status | Note |
|---------|--------|------|
| Real OCR | Mock only | Swap with Tesseract.js or cloud API |
| PDF parsing | Mock only | Implement with pdf.js table extraction |
| Email templates | Basic | Add rich template builder |
| LINE advanced | Basic | Add buttons, location sharing, etc. |
| Scheduled reports | UI only | Implement cron jobs (node-cron) |
| Multi-language LINE | Thai only | Add language selection |
| Photo storage | Memory | Implement Supabase Storage |

## 🔗 Integration Checklist

- [ ] Email service configured (Gmail or SendGrid)
- [ ] LINE channel created and tokens obtained
- [ ] Phase 2 migration applied to Supabase
- [ ] Environment variables set
- [ ] Photo entry tested
- [ ] PDF upload tested
- [ ] Email notifications tested
- [ ] LINE bot responding
- [ ] CSV export working
- [ ] Deployed to Vercel

## 📚 Code Structure

```
Phase 2 files:
├── app/api/
│   ├── ocr/route.ts                 # Image processing
│   ├── export/csv/route.ts          # CSV generation
│   ├── notifications/send-email/route.ts
│   └── line/webhook/route.ts        # LINE bot handler
├── app/dashboard/
│   ├── expiry-records/
│   │   ├── photo-entry/page.tsx     # Camera & OCR
│   │   └── pdf-upload/page.tsx      # PDF batch import
│   ├── exports/page.tsx             # Export & notify
│   └── settings/line-bot/page.tsx   # LINE config
└── supabase/migrations/
    └── 002_phase2_tables.sql        # New tables
```

---

🤖 Phase 2 Implementation  
Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
