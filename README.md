# CampuSolve — Campus Complaint & Service Tracker

Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion +
React Three Fiber + Prisma/PostgreSQL + NextAuth + Recharts + canvas-confetti.

## Stack & where things live

| Concern | Location |
|---|---|
| DB schema (User, Complaint, Upvote, StatusLog) | `prisma/schema.prisma` |
| Auth (NextAuth, RBAC roles in JWT/session) | `src/lib/auth.ts` |
| RBAC route guard (blocks `/admin` for non-staff) | `src/middleware.ts` |
| Complaint API (CRUD, filters, upvote toggle) | `src/app/api/complaints/**` |
| 3D hero background (R3F) | `src/components/three/HeroCanvas.tsx` |
| 3D tilt card (Framer Motion) | `src/components/ui/TiltCard.tsx` |
| Magnetic CTA button | `src/components/ui/MagneticButton.tsx` |
| Complaint feed / card / upvote / status badge | `src/components/complaints/*` |
| Multi-step filing wizard | `src/components/complaints/ComplaintForm.tsx` |
| Admin Kanban (drag-drop) | `src/components/admin/KanbanBoard.tsx` |
| Admin analytics (Recharts) | `src/components/admin/AnalyticsCharts.tsx` |

## RBAC summary

- **STUDENT**: file complaints (`POST /api/complaints`), browse/filter the
  feed, upvote duplicates (`POST /api/complaints/:id/upvote`).
- **ADMIN / STAFF**: everything a student can do, plus `PATCH
  /api/complaints/:id` to change status/department/assignee (writes a
  `StatusLog` audit row), and access to `/admin` (blocked for students by
  `middleware.ts`).

Role lives on `session.user.role` (`STUDENT | ADMIN | STAFF`), sourced from
the `User.role` column and injected into the JWT in `src/lib/auth.ts`.

## Deploy: GitHub + Vercel

See the step-by-step walkthrough in the chat where this project was
generated. Short version:

1. `git init && git add . && git commit -m "Initial commit"`, create a repo
   on GitHub, push.
2. On your **database provider** (Neon/Supabase), run
   `npx prisma migrate dev --name init` **locally first** so a
   `prisma/migrations` folder exists and gets committed — Vercel doesn't
   generate migrations for you, it only applies them.
3. Import the repo on vercel.com → New Project.
4. Add environment variables in the Vercel project settings: `DATABASE_URL`,
   `NEXTAUTH_URL` (your `https://<project>.vercel.app` URL),
   `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. Deploy. The `build` script (`prisma generate && next build`) handles the
   Prisma client automatically via `postinstall` too.
6. Update your Google OAuth Console's authorized redirect URI to
   `https://<project>.vercel.app/api/auth/callback/google`.

## Local setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, NEXTAUTH_SECRET, Google OAuth creds
npx prisma migrate dev --name init
npm run seed               # optional demo data
npm run dev
```

Visit `http://localhost:3000`. Sign in via `/login`, then:
- Students land on `/complaints` and `/complaints/new`.
- Promote a user to `ADMIN`/`STAFF` directly in the DB (or via Prisma
  Studio: `npm run prisma:studio`) to unlock `/admin`.

## Notes on the animation system

- **HeroCanvas** renders floating/rotating icosahedron/torus/octahedron/box
  meshes inside a shared `<group>` that lerps its rotation toward the
  pointer each frame (`ParallaxRig`) — a cheap, GPU-friendly tilt effect
  that doesn't re-render React on every mouse move.
- **TiltCard** does perspective tilt in pure CSS transforms (via Framer
  Motion springs) rather than WebGL, so dozens of cards on the feed stay
  at 60fps.
- **Confetti** (`canvas-confetti`) fires once, on the transition into
  `RESOLVED`, both on individual complaint cards and when an admin drags a
  card into the Resolved Kanban column.
- Image uploads in the wizard use `URL.createObjectURL` for an instant
  local preview — swap `handleFiles` in `ComplaintForm.tsx` for a real
  upload to S3/Cloudinary/UploadThing in production.

## Production TODOs

- Wrap the Kanban's native `dataTransfer` drag with a library like
  `@dnd-kit` if you need touch-device support.
- Add rate limiting to `/api/complaints` (e.g. Upstash) to prevent spam.
- Swap the credentials provider's plaintext check for bcrypt-hashed
  passwords, or drop it entirely in favor of SSO/Google only.
