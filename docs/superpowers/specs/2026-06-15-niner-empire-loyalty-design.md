# Niner Empire Loyalty — Design Spec
**Date:** 2026-06-15

## Overview

A web app where San Francisco 49ers fans fill out a multi-step form, answer a trivia question, take a selfie, and receive a downloadable PNG fan credential styled in 49ers colors. Registrations are stored in Google Sheets; photos are stored in Supabase Storage.

**Stack:** Next.js 14 (App Router) · Vercel · Supabase Storage · Google Sheets API  
**Future:** Apple Wallet (.pkpass) and Google Wallet integration when Apple Developer account is acquired.

---

## Architecture

```
/app
  /page.tsx              ← Multi-step form (single page)
  /api
    /upload-photo        ← POST: uploads photo to Supabase Storage, returns public URL
    /submit              ← POST: saves form data + photo URL to Google Sheets
    /generate-card       ← POST: (optional server-side fallback for card generation)
/components
  /FanForm.tsx           ← Orchestrates the 3-step form with progress bar
  /CameraCapture.tsx     ← Camera input with preview
  /FanCard.tsx           ← Canvas-based PNG card renderer and download trigger
```

---

## User Flow

1. **Step 1 — Fan Data:** User enters full name, email (required), WhatsApp number (optional, shown with "Recomendado" badge), and the year they became a 49ers fan (1946–2026). "Next" button activates only when name, email, and year are filled. WhatsApp is not required to proceed.
2. **Step 2 — Trivia:** User is asked *"¿Cuántos Super Bowls ha ganado San Francisco?"* and selects from 4 options (3, 4, **5**, 6). Correct answer (5) unlocks Step 3 with a success animation. Wrong answers show a friendly error and allow retry with no attempt limit.
3. **Step 3 — Photo:** User taps a button to activate the front-facing camera (`<input type="file" capture="user" accept="image/*">`). A preview is shown before confirming. "Generar mi tarjeta" button submits the form.
4. **Submit:** Photo is uploaded to Supabase Storage → public URL returned → form data + URL sent to Google Sheets API → PNG card is generated client-side and downloaded automatically.

---

## Fan Card PNG Design

- **Dimensions:** 1012×638px (standard credit card ratio at 300dpi)
- **Background:** Red gradient (`#AA0000` → `#CC0000`)
- **Layout:**
  - Header bar: "🏈 NINER EMPIRE LOYALTY / San Francisco 49ers" in gold on dark red
  - Left column: circular fan photo with gold border
  - Right column: Name (white label, gold value), Fan Since year, `#FAITHFULFOREVER` hashtag
  - Footer bar: black background, gold text, unique fan ID (timestamp-based)
- **Generation:** `html2canvas` library, runs client-side, triggers automatic PNG download on successful submit

---

## Data Storage

### Supabase Storage
- Bucket: `fan-photos` (public)
- File naming: `{timestamp}-{sanitized-name}.jpg`
- Upload happens client-side via Supabase JS SDK before form submit

### Google Sheets
- Sheet name: `NinerEmpireFans`
- Columns: `ID | Nombre | Email | WhatsApp | Fan Desde | Año de Registro | URL Foto | Fecha/Hora`
- Writes via Google Sheets API from `/api/submit` serverless route using a service account
- Credentials stored as Vercel environment variables, never in source code

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_SHEET_ID
```

---

## Visual Design

- **Primary:** Red `#AA0000` / `#CC0000`
- **Accent:** Gold `#B3995D`
- **Support:** White `#FFFFFF`, Black `#000000`
- **Style:** Bold, energetic, fan-credential aesthetic
- **Typography:** Heavy sans-serif (e.g. Inter Black or similar)

---

## Out of Scope (Phase 1)

- Apple Wallet (.pkpass) — requires Apple Developer account ($99 USD/year)
- Google Wallet — requires Google Pay Business Console setup
- User authentication / login
- Admin dashboard
- Email confirmation

---

## Deployment

- Local dev: Vercel CLI (`vercel dev`)
- Production: Vercel (auto-deploy from main branch)
- Domain: TBD (user's own domain, to be configured after testing)
