# scssssdigilib — Digital Library App

Two-portal digital library system for Shaheed Chamkaur Singh Govt Sen Sec
School: a Librarian admin panel and a Student portal, built React + Vite +
Tailwind.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## How data works right now

This build runs **fully standalone** — no backend required. All data
(students, books, loans, points, etc.) is stored in your browser's
localStorage via `src/lib/db.js`, which exposes the exact same shape as the
Base44 SDK (`Entity.list()`, `.filter()`, `.create()`, `.update()`). Demo data
seeds in automatically on first load.

**Demo student login:** phone `9999999999`, DOB `10041 2015` → enter as
day `10`, month `04`, year `2015`.

**Librarian logins:**
- `vishal1984.verma@gmail.com` / `762525`
- `codemrredeem@gmail.com` / `8855`

**Issue-flow admin PIN:** `762525`

⚠️ Move these off hardcoded values before going live — see
`RLS_SETUP_GUIDE.md`.

## Moving to real Base44

1. Set up your entities in Base44 matching the shapes in `src/lib/db.js` and
   `src/lib/seed.js` (Book, Student, Loan, Badge, AvatarItem, Review, Quiz,
   WishlistItem, MonthlyEvent).
2. Swap each page's import from `@/lib/db` to your generated
   `@/api/entities` (Base44 SDK). The call shape (`.list()`, `.filter()`,
   `.create()`, `.update()`) matches, so page code shouldn't need to change.
3. Replace the local `UploadFile` helper with Base44's `UploadFile`
   integration for real cloud file storage.
4. Follow `RLS_SETUP_GUIDE.md` to lock down entity permissions — this is
   important before real student data goes in.
5. Replace `AppAuthContext.jsx`'s hardcoded librarian credentials with real
   Base44 `User` accounts + roles.

## What's built

- Librarian: dashboard with charts, student CRUD + block/unblock, book
  catalog with ISBN auto-fill (Open Library → Google Books), 4-step issue
  flow with PIN, returns with extensions + overdue sweep, monthly events.
- Student: home with borrowed books + daily check-in streaks, digital
  storybook reader (PDF via pdfjs, or scanned-page flipbook) with read-aloud
  and end-of-book quiz, badges, leaderboard + Wall of Fame, wishlist voting,
  avatar shop.
- QR Smart Pass ID card generator (`src/components/QRSmartPass.jsx`) —
  printable single or bulk PDF passes from the Students page.

## Known gaps (see RLS_SETUP_GUIDE.md)

- No server-side access control yet — this build has no backend, so it's a
  non-issue locally, but matters the moment you connect Base44.
- Barcode/camera scanning (`html5-qrcode`, live camera capture) isn't wired
  in this build — ISBN and phone lookups use plain text inputs instead, since
  camera access needs a real device to test. Swap in `html5-qrcode` once
  you're testing on-device.
