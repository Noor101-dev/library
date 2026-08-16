# Server-side access control for scssssdigilib

## The gotcha first

Base44's RLS conditions (`{{user.email}}`, `{{user.role}}`, `user_condition`, etc.)
all resolve against **Base44's own platform `User` entity** — the login system
your app currently bypasses. Since Librarian and Student logins are custom
(checked in `AppAuthContext.jsx`, session kept in `localStorage`), Base44's
backend has no idea "which student" is making a request. That means:

- You **can** lock down who can create/update/delete records (only real,
  authenticated Base44 users — i.e. accounts you control).
- You **cannot** yet say "a student may only read their own Loan records" at
  the database level, because students aren't Base44-authenticated users.

So there are two tiers here: a quick win you can ship today, and the real fix.

## Quick win (ship today): lock writes to admin, keep reads scoped

Give your **two librarian accounts real Base44 logins** (not the hardcoded
array in `AppAuthContext.jsx`) with a `role: "admin"` custom field on the
Base44 `User` entity. Then apply this pattern to every sensitive entity:

```json
"rls": {
  "create": {"user_condition": {"role": "admin"}},
  "read": true,
  "update": {"user_condition": {"role": "admin"}},
  "delete": {"user_condition": {"role": "admin"}}
}
```

Apply this to: `Student`, `Loan`, `Badge`, `AvatarItem`, `MonthlyEvent`.

For `Book`, `Review`, `WishlistItem`, `Quiz` — same `create/update/delete`
lock, but keep `read: true` since students need to browse/read freely.

This closes the biggest hole right now: **anyone who opens devtools can call
your Base44 entity API directly and write/delete data**, bypassing your
React route guards entirely (route guards are client-side only, as the spec
notes). Locking `create/update/delete` to an admin-role Base44 user fixes
that immediately, even before you touch student-level scoping.

## The real fix: bring students into Base44 auth

To get true per-student RLS (a student only ever sees their own Loans,
points, badges), students need to *be* Base44 users, not just rows in a
`Student` table.

Two ways to do this without changing your phone+DOB UX:

**Option A — Base44 user per student, DOB as password**
When a librarian adds a student, also create a Base44 `User` account behind
the scenes (e.g. `phone@yourschool.local` as the email, DOB as the initial
password) and store that `user.id` on the `Student` record as `base44_user_id`.
Your `StudentLogin` page still asks for phone + DOB — you just exchange that
for a real Base44 session under the hood instead of only writing to
`localStorage`.

Then RLS becomes exact:

```json
// Loan entity
"rls": {
  "create": {"user_condition": {"role": "admin"}},
  "read": {
    "$or": [
      {"user_condition": {"role": "admin"}},
      {"data.student_base44_id": "{{user.id}}"}
    ]
  },
  "update": {"user_condition": {"role": "admin"}},
  "delete": {"user_condition": {"role": "admin"}}
}
```

(Add a `student_base44_id` field to `Loan`, `Review`, `WishlistItem` votes,
etc. mirroring `student_id`, populated at write time.)

**Option B — keep it simpler, accept partial protection**
If a full auth migration is too much right now, at minimum move the
Librarian PIN (`762525`) and login credentials out of source code and into
Base44's `User` + `role` system, and ship the Quick Win above. Student-level
data (which book a specific kid borrowed) is lower stakes than an open write
API — prioritize closing the write hole first.

## Rollout steps

1. Create Base44 `User` accounts for your two librarians, add a custom
   `role: "admin"` field via the User Schema.
2. Add `rls` blocks (Quick Win pattern) to each entity schema file.
3. Run `entities push` (or `deploy` for the whole project) to apply.
4. Swap `AppAuthContext.jsx`'s hardcoded librarian array for a real Base44
   login call, checking `user.data.role === "admin"` in `LibrarianRoute.jsx`.
5. (Later, when ready) do the student migration in Option A.

Full reference: https://docs.base44.com/developers/backend/resources/entities/security
