# pwdr GO — app writeup

> Keep this in sync. Whenever the app changes in a way that would make a
> section below wrong, update that section in the same change — don't let
> this drift into a description of an old version of the app.

An internal ticketing tool (think a minimal Zendesk/Jira-lite), multi-tenant
by organization. Next.js App Router frontend, tRPC API, Postgres via Drizzle,
auth via better-auth (email OTP, no passwords).

## Stack

- **Next.js 16** (App Router, Turbopack dev server), **React 19**
- **tRPC v11** — typed API layer, no REST
- **Drizzle ORM** + **Postgres** (`postgres` driver, `drizzle-orm/postgres-js`)
- **better-auth** — sessions, email-OTP sign-in, organization plugin (multi-tenancy)
- **Tailwind v4**, shadcn/radix-based UI kit (hand-copied components, not the shadcn CLI)
- **Zod v4** for input/schema validation, **react-hook-form** for forms
- **jotai** (cross-tree UI state like breadcrumbs), **zustand** (small global UI store)
- **@tanstack/react-table** for the tickets table
- **bun** as package manager/runtime; `docker compose` for local Postgres

The whole stack was hand-assembled file by file rather than via `create-t3-app`
or the better-auth/shadcn CLIs — see git history / commit `aecd3bc` for the
migration off an earlier fake JSON+zustand backend.

## Environment & running it locally

Env vars (`.env`, see `.env.example`), validated in `src/env.ts` via `@t3-oss/env-nextjs`:

- `DATABASE_URL` — Postgres connection string
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`
- `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` — used by `docker-compose.yml`
- `ENV_FAKER_SEED` (optional) — pins the faker seed used by the seed script

Scripts (`package.json`):

- `bun run dev` — `bun run db:up; next dev --turbopack` (semicolon, not `&&`,
  so a missing/broken Docker doesn't block frontend-only work)
- `bun run db:up` / `db:down` — Postgres via `docker-compose.yml`
- `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` — drizzle-kit
- `bun run generate` — runs `src/data/seed.ts` to wipe and reseed the DB with
  fake orgs/users/tickets

There is no self-serve sign-up. Users only exist via the seed script; sign-in
is by OTP emailed (currently just console-logged — no email provider wired
up yet, see `sendVerificationOTP` in `src/server/auth/index.ts`) to a seeded
address. `jnxspwdr@pwdr.com` ("Powder") is always seeded as admin of the
first org, for predictable manual testing.

## Data model (`src/server/db/schema.ts`)

**better-auth core tables** (field names/shapes dictated by better-auth's
drizzle adapter — see the comment at the top of the file):

- `user` — better-auth's identity table, extended with app-specific
  `additionalFields`: `firstName`, `lastName`, `gender`, `pronouns` (jsonb
  string array), `phoneNumber`. All `input: false` — nobody self-registers,
  so these never need to arrive from client input.
- `session`, `account`, `verification` — standard better-auth tables.
  `session` additionally carries `activeOrganizationId`, set by a database
  hook (below).

**better-auth organization plugin tables** (multi-tenancy):

- `organization` — one row per tenant. Also has a `plan` column
  (`free` default) for future plan/feature gating — not enforced anywhere yet.
- `member` — join table, `organizationId` + `userId` + `role`
  (`"owner" | "admin" | "member"`).
- `invitation` — standard better-auth invitation table. No invite flow is
  wired up in the UI yet; orgs/members only come from the seed script.

**App tables:**

- `tickets` — `id`, `ticketNumber` (e.g. `TICKET-20260101-0042`), `title`,
  `description`, `priority` (int), `status` (pg enum, see below), `type` (pg
  enum), `organizationId` FK, `reportedById` FK → `user`, `assignedToId`
  (nullable) FK → `user`, timestamps. No denormalized reporter/assignee
  fields — those are resolved at query time via `ticketsRelations`.
  - `status` enum: `open | in progress | closed | waiting`
  - `type` enum: `support incident | purchase request | work order`
  - `priority`: numeric, with named constants `low=10 normal=20 high=30`
    (`TICKET_PRIORITIES` in `src/types/schemas/ticket.ts`) — numeric so more
    granularity can be added later without a migration.

Every org-scoped table carries `organizationId`; tenant isolation is enforced
in the tRPC layer (below), not at the DB layer (no RLS).

## Auth (`src/server/auth/index.ts`, `src/lib/auth-client.ts`)

better-auth config:

- `drizzleAdapter` against the schema above.
- `emailOTP` plugin, `disableSignUp: true` (fixed roster, no self-registration).
  `sendVerificationOTP` just logs the code to the console — replace this to
  actually send email.
- `organization` plugin, `allowUserToCreateOrganization: false` — no
  self-serve org creation flow.
- `databaseHooks.session.create.before` — looks up the signing-in user's
  `member` row and pins `session.activeOrganizationId` to it. Since every
  seeded user belongs to exactly one org and there's no org switcher yet,
  this resolves the org once at session-creation time instead of per-request.

Client side: `authClient` (`src/lib/auth-client.ts`) wires up
`emailOTPClient`, `organizationClient`, and `inferAdditionalFields<typeof auth>()`
so `additionalFields` (firstName etc.) are typed on the client session object
too. Exports `useSession` / `signOut`.

**Sign-in flow** (`src/components/sign-in-form.tsx`): two-step animated form
(email → OTP), calls `authClient.emailOtp.sendVerificationOtp` then
`authClient.signIn.emailOtp`, redirects to `/dashboard` on success.

**Route protection** (`src/proxy.ts` — Next 16 renamed `middleware.ts` to
`proxy.ts`, and the exported function must literally be named `proxy` or the
production build fails): optimistic cookie-presence check only (not
signature/DB validated — cheap enough to run on every request). Redirects
unauthenticated requests to `/sign-in`, and redirects already-authenticated
requests away from `/sign-in` to `/dashboard`. Anything that actually needs
the session (Server Components, protected tRPC procedures) re-verifies
against the DB via `auth.api.getSession`.

## tRPC layer (`src/server/api/`)

- `trpc.ts` — `createTRPCContext` resolves the better-auth session from
  request headers. Three procedure tiers, each building on the last:
  - `publicProcedure` — no auth.
  - `protectedProcedure` — throws `UNAUTHORIZED` if no session.
  - `orgProcedure` — additionally resolves `ctx.session.session.activeOrganizationId`
    into a loaded `org` + `member` row, throwing `FORBIDDEN` if either is
    missing. Every org-scoped router should build on this, not
    `protectedProcedure` directly.
- `root.ts` — `appRouter` currently mounts only `tickets`.
- `routers/tickets.ts`:
  - `list` — all tickets for the caller's active org, with `reportedBy`/`assignedTo` joined.
  - `byId` — single ticket, scoped to the caller's org (cross-org IDs 404, not leak).
  - `create` — validates `title`/`description`/`priority` via Zod, always
    creates as `status: "open"`, `type: "support incident"`,
    `reportedById: <caller>`. No update/assign/status-change mutations exist yet.

**Two client entry points**, both typed against `AppRouter`:

- `src/trpc/server.ts` — `api`, a direct in-process caller (no HTTP hop) for
  Server Components, built via `createCaller` + `createTRPCContext` from
  request headers.
- `src/trpc/react.tsx` — `trpc`, a React Query–backed client for Client
  Components, POSTing to `/api/trpc` (`src/app/api/trpc/[trpc]/route.ts`,
  a plain `fetchRequestHandler`). Uses `superjson` as the transformer (so
  `Date`s etc. survive the wire) and a shared `QueryClient` config
  (`src/trpc/query-client.ts`, 30s `staleTime`).
- `src/trpc/shared.ts` — `RouterInputs`/`RouterOutputs` type helpers, used
  e.g. by `tickets-table.tsx` to type its rows off the actual router output.

## Routing (`src/app/`)

- `/` — redirects to `/dashboard`.
- `/sign-in` — the OTP sign-in form. Outside the `(app)` layout group (no
  sidebar/header).
- `(app)/` layout — sidebar + header shell (`AppSidebar`, `AppHeader`,
  breadcrumb portal, command palette), wraps everything below:
  - `/dashboard` — static placeholder cards, no real data yet.
  - `/tickets` — server-rendered list, fetches via `api.tickets.list()`,
    renders `<TicketsTable>`.
  - `/tickets/[ticketId]` — server-rendered detail page; `NOT_FOUND` tRPC
    errors are caught and mapped to Next's `notFound()`.
  - `/tickets/new` — client-side form (react-hook-form + zod), calls
    `trpc.tickets.create.useMutation`, redirects to the new ticket on success.
- Sidebar links to `/users` and the command palette links to `/profile`, but
  neither page exists yet — known gaps, not broken links by accident.
- `api/auth/[...all]` — better-auth's catch-all handler (`toNextJsHandler`).
- `api/trpc/[trpc]` — tRPC fetch adapter handler.

## UI / components

- `src/components/ui/*` — a hand-copied shadcn/radix-based primitive set
  (button, card, dialog, dropdown, sidebar, table, input-otp, command palette
  via `cmdk`, etc.), not pulled in via the shadcn CLI (`components.json`
  exists mainly for editor tooling/import aliases).
- `src/components/app-sidebar.tsx` / `app-header.tsx` — the app chrome.
  Header hosts the breadcrumb trail, a search button that opens the command
  palette, and a "new ticket" shortcut.
- `src/components/breadcrumb-portal.tsx` — breadcrumbs are set imperatively
  from any page via `useCrumbs()` (client) or `<ServerCrumbs>` (server
  component wrapper), backed by a jotai atom, and rendered in the header via
  `<Breadcrumbs>`. Supports nested/dropdown crumb segments.
- `src/components/cmdk.tsx` — ⌘K command palette (`cmdk` primitive), toggled
  via the zustand store (`src/store.app.ts`). Some entries (Emoji search,
  Calculator, Billing, Settings) are placeholder items with no destination yet.
- `src/components/tickets-table.tsx` — `@tanstack/react-table` columns for
  title (links to detail page), relative last-active time (`date-fns`), and
  a status badge with variant-per-status color mapping.

State: `store.app.ts` (zustand) only holds `cmdkIsOpen` — deliberately tiny,
since most state is server data via tRPC/React Query or ephemeral UI state
(jotai for cross-tree UI signals like breadcrumbs, local `useState` elsewhere).

## Fake data (`src/data/`)

`seed.ts` wipes and reseeds the whole DB (FK-ordered deletes, then inserts).
Splits generated users across **two** orgs (Acme Corp, Globex Inc) so tenant
isolation is actually exercised end-to-end rather than only in code review;
the fixed test user `jnxspwdr@pwdr.com` always lands as admin of the first
org regardless of the faker seed, so manual sign-in testing stays predictable.

- `generate-users.ts` — faker-generated users with a deliberately broad set
  of gender/pronoun combinations (`src/types/schemas/user.ts` enumerates the
  options), plus a fixed "Powder" user.
- `generate-tickets.ts` — faker-generated tickets per org, validated against
  `ticketSchema` before insert.
- Faker seed is either `ENV_FAKER_SEED` or a fresh random seed logged to the
  console at generation time, so a run can be reproduced later if needed.

## Known gaps (intentionally out of scope, not forgotten)

- Dashboard is static placeholder content — no real metrics/queries.
- No ticket update/assign/status-change/comment mutations — create-only.
- No `/users` or `/profile` pages, despite nav entries linking to them.
- No org switcher UI (schema/session support exists; every seeded user only
  belongs to one org today).
- No invite flow (organization `invitation` table exists, unused).
- OTP emails are console-logged only — no real email provider wired up.
