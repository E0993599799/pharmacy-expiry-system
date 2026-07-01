# Luxi — Next Steps Checklist

**From**: Zeus  
**To**: luxi-oracle  
**Date**: 2026-07-01  
**Priority**: High

---

## ✅ Quick Start

### Before You Begin
1. **Read the brief**: Open `LUXI_UI_REFINEMENT.md`
2. **Clone the repo**: 
   ```bash
   git clone https://github.com/E0993599799/pharmacy-expiry-system.git
   cd pharmacy-expiry-system
   npm install
   npm run dev
   ```
3. **See it live**: Open `http://localhost:3000`
4. **Check current UI**: Dashboard, Records, Photo Entry, PDF Upload pages

### Understanding Current State
- Theme is already applied in `app/globals.css`
- Components exist but need visual polish
- All Hermes colors are defined as CSS variables
- No breaking changes — just refinement

---

## 🎯 First Week Priorities

### Week 1 Goal: Navigation + Layout Foundation

**Create these components**:
```
app/components/Layout/
├── Sidebar.tsx (left nav with logo, menu)
├── Navbar.tsx (top bar with user profile)
└── Breadcrumb.tsx (Dashboard > Section > Page)

app/components/Common/
├── UserMenu.tsx (profile dropdown, sign out)
└── MobileMenu.tsx (hamburger for mobile)
```

**Update**:
```
app/dashboard/layout.tsx 
  → Wrap pages with Sidebar + Navbar
  
app/globals.css
  → Add nav animations, smooth transitions
```

### Success Criteria (Week 1)
- [ ] Sidebar visible on all dashboard pages
- [ ] Navbar shows user email + profile menu
- [ ] Breadcrumb updates per page
- [ ] Mobile hamburger appears at 768px
- [ ] Navigation is responsive (no overflow)
- [ ] All nav links work (routing intact)

---

## 🔄 Second Week: Dashboard Polish

**Components to enhance**:
```
app/components/Dashboard/
├── StatsCard.tsx (add icons, gradients, animations)
├── ExpiryChart.tsx (new - pie/bar chart)
└── UpcomingAlerts.tsx (new - alert feed)
```

**Acceptance**:
- [ ] Stats cards have left/right icon placement
- [ ] Hover effects on cards (lift + glow)
- [ ] Color matches status (green ok, red critical)
- [ ] Gradient backgrounds per status
- [ ] "Last updated" timestamp visible
- [ ] Chart renders with data

---

## 📊 Third Week: Tables & Forms

**Tables** (`RecordsTable.tsx`):
- [ ] Sortable columns (click header)
- [ ] Filter bar above table
- [ ] Inline action buttons (view, edit, delete)
- [ ] Pagination (prev, next, page count)
- [ ] Row hover highlights

**Forms** (Photo Entry, PDF Upload):
- [ ] Drag-drop zones with visual feedback
- [ ] Progress bar during upload
- [ ] Photo thumbnails preview
- [ ] Error messages in red badges
- [ ] Success checkmarks in green

---

## ✨ Fourth Week: Polish & Testing

**Loading states**:
- [ ] Skeleton loaders for cards
- [ ] Pulse effect while fetching
- [ ] Animated spinners

**Modals**:
- [ ] Backdrop blur effect
- [ ] Rounded corners + shadows
- [ ] Close button (✕) top-right
- [ ] Action buttons at bottom

**Testing**:
- [ ] Mobile: 320px, 768px viewports
- [ ] Keyboard nav: Tab, Enter, Escape work
- [ ] Color contrast: WCAG AA
- [ ] Performance: No jank on animations

---

## 🛠️ Tools & Resources

### Already Available
- **CSS**: Hermes theme in `app/globals.css` (colors as variables)
- **Icons**: Use emoji or add `lucide-react` (already in deps)
- **Components**: Tailwind CSS (configured)

### If You Need
- Icon library: `npm install lucide-react`
- Charts: `npm install recharts`
- Animations: Use CSS @keyframes or Tailwind animate-*

### Color Reference
```css
--text: #ebf1ff;        /* Light text */
--muted: #9fb0d9;       /* Secondary text */
--ok: #72e39d;          /* Green - success */
--warning: #ffa726;     /* Amber - warning */
--critical: #ef5350;    /* Red - urgent */
--expired: #c62828;     /* Dark red - no action */
```

---

## 📞 Questions?

**If stuck**:
1. Check `LUXI_UI_REFINEMENT.md` for full spec
2. Look at `app/globals.css` for theme variables
3. Examine current components as base
4. Ask for clarification via inbox

**If you need to**:
- Add dependencies → commit changes
- Create new file structure → follow pattern
- Change color scheme → update globals.css + doc

---

## 🚀 Ready to Start?

1. ✅ Read the brief
2. ✅ Clone + install
3. ✅ Create Week 1 components
4. ✅ Test locally
5. ✅ Commit to `luxi/ui-refinement-week1` branch
6. ✅ Create PR when Week 1 done

---

**Timeline**: Week 1 (now) → Week 4 (2026-07-22)  
**Repo**: https://github.com/E0993599799/pharmacy-expiry-system  
**Contact**: Via oracle bridge inbox

สำเร็จไหม? 💪
