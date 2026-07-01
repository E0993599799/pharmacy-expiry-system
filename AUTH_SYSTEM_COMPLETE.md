# Complete Auth System Redesign — Luxi Brief

**From**: Zeus  
**To**: luxi-oracle  
**Priority**: URGENT (Before Week 1 UI refinement)  
**Date**: 2026-07-01  

---

## Current State ❌

✅ Google OAuth provider configured in Supabase  
✅ GoogleSignIn button component created  
✅ OAuth callback handler ready  
❌ **Registration page** — missing  
❌ **Login page** — missing  
❌ **Auth flow** — no session check, no redirects  
❌ **Protected routes** — no middleware  
❌ **User profile** — not saved/displayed  

---

## What We Need 🔐

### 1. **Auth Pages** (High Priority)

**Create these pages**:
```
app/auth/
├── register/page.tsx          (registration form + Gmail OAuth)
├── login/page.tsx             (login form + Gmail OAuth)
├── callback/
│   └── route.ts               (already exists, verify working)
└── reset-password/page.tsx    (password reset via email)
```

**Registration Page**:
- Email/password input fields
- "Sign up with Google" button (Gmail OAuth)
- Form validation (email format, password strength)
- Success → auto-login, redirect to /dashboard
- Error handling (email already exists)

**Login Page**:
- Email/password input fields
- "Sign in with Google" button (Gmail OAuth)
- "Forgot password?" link
- Success → redirect to /dashboard (or referrer)
- Error handling (invalid credentials)

**Reset Password Page**:
- Email input
- "Send reset link" button
- Verification email sent message
- Reset link in email → new password form

### 2. **Auth Middleware** (Medium Priority)

**Create**: `middleware.ts` (root of app/)
- Check session on every route
- Protect /dashboard/* routes (redirect to /login if not authenticated)
- Allow public routes: /auth/login, /auth/register, /auth/reset-password, /
- Redirect authenticated users away from /auth/* pages (go to /dashboard instead)

### 3. **Session Management** (Medium Priority)

**Update**: `app/layout.tsx`
- Check user session on mount
- Load current user email/profile
- Display in nav (profile menu)
- "Sign Out" button

**Update**: `lib/auth-client.ts`
- Add `getCurrentUser()` function (already exists, verify)
- Add `useAuth()` hook for components

### 4. **User Profile Storage** (Low Priority)

**Create table** (via Supabase migration):
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS policy: users can read/update own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

**Update**: OAuth callback
- On first Google sign-in, create user_profiles row
- Store email + Google name

### 5. **Styling** (High Priority)

**Use Hermes theme**:
- Dark mode (already in globals.css)
- Cyan buttons for "Sign in with Google"
- Red error messages
- Smooth transitions
- Mobile-responsive (320px+)

**Auth page layout**:
```
┌─────────────────────┐
│  Pharmacy Logo      │
├─────────────────────┤
│ [Email input]       │
│ [Password input]    │
│ [Sign in button]    │
│                     │
│ [Or sign in with]   │
│ [Google button]     │
│                     │
│ "No account?"       │
│ [Register link]     │
└─────────────────────┘
```

---

## Acceptance Criteria ✅

### Auth Pages
- [ ] Registration page renders
- [ ] Login page renders
- [ ] Reset password page renders
- [ ] Form validation works (email format, password length)
- [ ] Google OAuth button works on all pages
- [ ] Successful auth redirects to dashboard
- [ ] Failed auth shows error message

### Middleware
- [ ] Unauthenticated users redirected from /dashboard → /login
- [ ] Authenticated users redirected from /login → /dashboard
- [ ] Public routes accessible without auth
- [ ] Session persists across page reloads

### Styling
- [ ] Dark mode (Hermes theme applied)
- [ ] Buttons match color scheme (cyan primary, red error)
- [ ] Mobile responsive (tested at 320px, 768px)
- [ ] Smooth transitions (no jarring layout shifts)

### Deployment
- [ ] All auth routes working in production
- [ ] Gmail OAuth redirects to correct production URL
- [ ] Session persistence works across deployments

---

## Technical Notes

### Supabase Auth Flow

1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. Google redirects to `/auth/callback?code=...`
4. OAuth callback handler exchanges code for session
5. Session cookie stored (handled by @supabase/ssr)
6. Middleware checks session, allows access

### Environment Variables Ready

Already in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- Google OAuth credentials configured in Supabase dashboard ✅

### Optional Enhancements (Post-MVP)

- Two-factor authentication (TOTP via Supabase)
- Social sign-in (GitHub, Facebook)
- Email verification on registration
- Account recovery options

---

## Timeline

- **Immediate (Today)**: Create auth pages + middleware
- **Soon (Tomorrow)**: Test auth flow end-to-end
- **Final (EOW)**: Deploy to production, verify Gmail OAuth works

---

## Files to Create/Update

```
✨ New:
app/auth/register/page.tsx
app/auth/login/page.tsx
app/auth/reset-password/page.tsx
middleware.ts

🔄 Update:
app/layout.tsx (add session check)
lib/auth-client.ts (add useAuth hook)

📊 Supabase:
Create user_profiles table + RLS policy
```

---

## Success = Everything Below Works

1. User registers with email/password → creates account
2. User signs in with Gmail → creates account (first time) or logs in
3. User logged in → can access /dashboard
4. User logs out → redirected to /login
5. Deploy to production → Gmail OAuth still works

---

**Status**: READY FOR IMPLEMENTATION  
**Depends On**: Nothing (all groundwork done)  
**Owner**: luxi-oracle  
**Next**: Start with login/register pages, then middleware

🔐 Make auth beautiful AND functional!
