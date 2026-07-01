# Luxi UI Refinement Brief — Pharmacy Expiry System

**From**: Zeus Oracle  
**Priority**: High  
**Repo**: https://github.com/E0993599799/pharmacy-expiry-system

---

## Current State ✅
- **Theme**: Hermes design system (dark mode, glassmorphism)
- **Colors**: Pharmacy-themed (green ok, amber warning, red critical)
- **Auth**: Google OAuth + Gmail
- **Features**: Photo OCR, PDF batch, email, LINE bot
- **Status**: Production-ready, needs UI polish

---

## What Needs Refinement 🎨

### 1. **Dashboard Overview Cards**
**Current**: Basic stats cards with large numbers  
**Needed**:
- Better icon placement (left/right)
- Gradient backgrounds per status
- Micro-animations on hover
- Progress bars for expiry timeline
- Smaller "last updated" timestamps

### 2. **Data Tables**
**Current**: Plain Hermes tables  
**Needed**:
- Row hover highlights (subtle)
- Inline action buttons (view, edit, delete)
- Sort indicators (▲▼) on columns
- Pagination with clear prev/next
- Search/filter bar above table
- Empty state placeholder when no data

### 3. **Forms (Photo Entry, PDF Upload)**
**Current**: Basic inputs  
**Needed**:
- Upload drag-drop zones (visual feedback)
- Progress bars during upload
- Photo preview thumbnails
- Clear error messages (red badges)
- Success checkmarks (green)
- "Confirm before submit" modals

### 4. **Status Badges & Pills**
**Current**: Simple colored badges  
**Needed**:
- Animated status dots (pulse for critical)
- Tooltip on hover showing "expires in X days"
- Better contrast ratios
- Icon + text combination (e.g., 🔴 Critical)

### 5. **Navigation & Layout**
**Current**: None specified  
**Needed**:
- Sidebar or top nav with logo
- Breadcrumb trail (Dashboard > Records > Detail)
- User profile menu (name, sign out)
- Mobile hamburger menu

### 6. **Modal & Alert Dialogs**
**Current**: Not styled  
**Needed**:
- Overlay backdrop with blur
- Rounded corners, shadow depth
- Close button (✕) top-right
- Action buttons (Cancel, Confirm) at bottom
- Success/error state animations

### 7. **Loading States**
**Current**: Basic spinner  
**Needed**:
- Skeleton loaders for cards
- Pulse effect while fetching
- Progress indicator for long operations
- Animated dots or spinners matching theme

---

## Design Files to Create/Update

### Components to Polish
```
app/
├── components/
│   ├── Dashboard/
│   │   ├── StatsCard.tsx (improve)
│   │   ├── ExpiryChart.tsx (new)
│   │   └── UpcomingAlerts.tsx (new)
│   ├── Records/
│   │   ├── RecordsTable.tsx (improve)
│   │   ├── FilterBar.tsx (new)
│   │   └── BulkActions.tsx (new)
│   ├── Forms/
│   │   ├── UploadZone.tsx (improve)
│   │   ├── PhotoPreview.tsx (improve)
│   │   └── ConfirmModal.tsx (new)
│   ├── Layout/
│   │   ├── Sidebar.tsx (new)
│   │   ├── Navbar.tsx (new)
│   │   └── Breadcrumb.tsx (new)
│   └── Common/
│       ├── StatusBadge.tsx (improve)
│       ├── LoadingSkeleton.tsx (new)
│       └── EmptyState.tsx (new)
```

---

## Color Palette Reference

**Primary Actions**: `#4dd0e1` (cyan) — buttons, links, highlights  
**Success/Ok**: `#72e39d` (green) — confirmed, safe, operational  
**Warning**: `#ffa726` (amber) — expiring soon, attention needed  
**Critical**: `#ef5350` (red) — expired, urgent action  
**Expired**: `#c62828` (dark red) — no longer usable  
**Text**: `#ebf1ff` (light) on `#0b1020` (dark background)  
**Muted**: `#9fb0d9` (grey-blue) — secondary text, labels

---

## Acceptance Criteria ✅

- [ ] Dashboard cards have visual hierarchy & icons
- [ ] Tables are sortable, filterable, with inline actions
- [ ] Forms have drag-drop, previews, progress feedback
- [ ] Badges have animations (pulse for critical)
- [ ] Navigation structure in place (nav/sidebar)
- [ ] Modals match Hermes theme (blur backdrop, shadows)
- [ ] Loading states use skeleton loaders
- [ ] Empty states show helpful messages
- [ ] Mobile responsive (tested on 320px, 768px, 1200px)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color contrast meets WCAG AA standards

---

## Performance Notes

- Lazy load images in photo previews
- Debounce search/filter inputs
- Memoize table rows to avoid re-renders
- Virtual scroll if table has 100+ rows

---

## Timeline Suggestion

- **Week 1**: Layout (nav, sidebar, breadcrumbs)
- **Week 2**: Dashboard cards, forms
- **Week 3**: Tables, modals, loading states
- **Week 4**: Polish, animations, mobile testing

---

## Scope: Frontend Only

No backend/database changes needed. All work is UI/UX refinement using existing Hermes theme + current component structure.

**Owner**: luxi-oracle  
**Status**: Ready to start  
**Next**: Confirm timeline & priorities

🎨 Ready to make it beautiful!
