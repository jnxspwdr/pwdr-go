# pwdr GO — project overview

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

**Config files:**

- `next.config.ts` — `devIndicators: false`; `images.remotePatterns` allows
  `i.pravatar.cc` (seeded users' fake avatar URLs, `src/data/generate-users.ts`).
- `tsconfig.json` — path aliases: `~/*` → `src/*`, plus narrower aliases
  (`~/ui/*`, `~/components/*`, `~/lib/*`, `~/hooks/*`, `~/data/*`,
  `~/utils` → `src/lib/utils.ts`) mirrored in `components.json`'s `aliases`.
- `eslint.config.mjs` — flat config, `eslint-config-next`'s `core-web-vitals`
  - `typescript` presets, no custom rules.
- `drizzle.config.ts` — postgresql dialect, schema `src/server/db/schema.ts`,
  migrations output to `./drizzle` (unused today — see `db:push` below).
- `postcss.config.mjs` — just `@tailwindcss/postcss`.
- `prettier.config.mjs` — `useTabs: true`; `prettier-plugin-tailwindcss` with
  `tailwindStylesheet: "./src/app/globals.css"` (required for Tailwind v4,
  no JS config to auto-detect) and `tailwindFunctions: ["tw"]` (see
  `src/lib/tw.ts` below). Not wired into a package.json script — run via
  `bunx prettier --check .` / `--write .`.

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
- `bun run build` / `start` — `next build` / `next start` (production)
- `bun run lint` — `eslint .`

There is no self-serve sign-up. Users only exist via the seed script; sign-in
is by OTP emailed (currently just console-logged — no email provider wired
up yet, see `sendVerificationOTP` in `src/server/auth/index.ts`) to a seeded
address. "Powder" is seeded as a **distinct admin account per organization**
(not one account with memberships everywhere) — `jnxspwdr@acme.com` for Acme
Corp, `jnxspwdr@globex.com` for Globex Inc, one per `ORG_DEFS` entry in
`src/data/seed.ts` — so each org can be tested as its own admin without an
org switcher.

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

- `organization` — one row per tenant. Also has a `plan` column (pg enum
  `free | pro | enterprise`, default `free`, values sourced from
  `PLAN_IDS` in `src/lib/plans.ts`) used for feature gating — see below.
- `member` — join table, `organizationId` + `userId` + `role`
  (`"owner" | "admin" | "member"`). `userId` is `unique` — this app pins
  every user to exactly one org (see the recipe section below), unlike
  better-auth's default multi-org-per-user assumption.
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

## Plans / feature gating (`src/lib/plans.ts`)

Data model + gating only — no real payment processor wired up. Single
source of truth, importable from both client and server code (unlike
`src/server/*`, which is server-only):

- `PLAN_IDS` (`"free" | "pro" | "enterprise"`) — also backs the `plan`
  pg enum in `src/server/db/schema.ts`.
- `PLANS` — per-plan `limits` (e.g. `maxDevices`) and `features` (e.g.
  `reports: boolean`). Placeholder values — Devices/Reports will read
  these once they exist; nothing consumes `limits` yet.
- `planHasFeature(plan, feature)` — plain boolean check, used by
  `requiresPlanFeature` below and (once there's UI to gate) directly from
  client components.

## tRPC layer (`src/server/api/`)

- `trpc.ts` — `createTRPCContext` resolves the better-auth session from
  request headers. Procedure tiers, each building on the last:
  - `publicProcedure` — no auth.
  - `protectedProcedure` — throws `UNAUTHORIZED` if no session.
  - `orgProcedure` — additionally resolves `ctx.session.session.activeOrganizationId`
    into a loaded `org` + `member` row, throwing `FORBIDDEN` if either is
    missing. Every org-scoped router should build on this, not
    `protectedProcedure` directly.
  - `requiresPlanFeature(feature)` — builds on `orgProcedure`, throws
    `FORBIDDEN` (naming the required plan) unless
    `planHasFeature(ctx.org.plan, feature)`. Not used by any router yet —
    Reports (planned) will be the first consumer.
- `root.ts` — `appRouter` mounts `tickets`, `organization`, `users`, and `search`.
- `routers/tickets.ts`:
  - `list` — all tickets for the caller's active org, with `reportedBy`/`assignedTo` joined.
  - `byId` — single ticket, scoped to the caller's org (cross-org IDs 404, not leak).
  - `create` — validates `title`/`description`/`priority` via Zod, always
    creates as `status: "open"`, `type: "support incident"`,
    `reportedById: <caller>`. No update/assign/status-change mutations exist yet.
- `routers/organization.ts`:
  - `current` — the caller's active org (`id`, `name`, `plan`). Only
    consumer so far is manual verification; no UI reads it yet.
- `routers/users.ts`:
  - `list` — every `user` in the caller's active org, queried through
    `member` (`with: { user: true }`), per the "user is not org-scoped"
    rule below.
  - `byId` — single user, scoped to the caller's org via `member`
    (cross-org IDs 404, not leak, same pattern as `tickets.byId`).
- `routers/search.ts`:
  - `global` — org-scoped `ilike` search across tickets
    (`title`/`ticketNumber`) and users (`name`/`email`), capped at 5 results
    per entity. Backs the command palette's live search groups (below) —
    see "Adding a searchable detail page to cmdk" for how to extend it.

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

## Adding an org-scoped resource (recipe)

Follow `routers/tickets.ts` as the template — it's the one router that's
never needed a fix. Steps, in order:

1. **Schema** (`schema.ts`, "app tables" section): new `pgTable` with an
   `organizationId: text(...).notNull().references(() => organization.id,
{ onDelete: "cascade" })` column. If it needs joined data (like tickets'
   `reportedBy`/`assignedTo`), add a `relations()` block for it too.
2. **Router**: build every procedure on `orgProcedure`, never
   `protectedProcedure` directly. `orgProcedure` already verified the caller
   is a real member of `ctx.org` — that check is the entire authorization
   model here, so each query just needs `eq(table.organizationId,
ctx.org.id)` (or `and(...)` with more conditions for `byId`-style
   lookups). No separate permission/ACL layer to write.
3. **Mount it** in `root.ts`.
4. **Push the schema**: `bun run db:push` (dev-only workflow, no migration
   files yet — see `drizzle.config.ts`). It prompts y/n for
   destructive-looking changes (new unique constraints, column type changes
   on non-empty tables); that prompt needs a real TTY, so it'll hang if
   piped/non-interactive.
5. **Client type**: `RouterOutputs["yourRouter"]["list"][number]` in the
   component that renders it (see `users-table.tsx` / `tickets-table.tsx`)
   — never hand-write the row type.

**One deliberate exception:** `user` is _not_ an org-scoped table, even
though every user belongs to an org. Org membership for `user` lives
entirely in `member` (`organizationId` + `userId` + `role`), because that's
what better-auth's own drizzle adapter expects — it manages `user` rows
itself and doesn't know about extra required columns you bolt on unless
they're declared in `auth.ts`'s `user.additionalFields`. Query "users in
this org" by querying `member` (`with: { user: true }`), the way
`routers/users.ts` does — don't add `organizationId` back onto `user`.

Also: this app pins each `user` row to exactly one org, enforced by a
`unique` constraint on `member.userId` (not just convention) — a person
needing access to more than one org gets a second, separate `user` row
(separate login) rather than a second membership on the same row. See
`createPwdrUser` / `ORG_DEFS` in `src/data/seed.ts`.

## Adding a searchable detail page to cmdk (recipe)

The command palette (`src/components/cmdk.tsx`) has two kinds of entries:
static pages (mirrored from the sidebar) and live search results (backed by
`routers/search.ts`). To make a new detail page (e.g. a future `/devices/[id]`)
searchable from cmdk:

1. **Server**: add a branch to `search.global` in `routers/search.ts` —
   `Promise.all` alongside the existing ticket/user queries, org-scoped and
   capped at `RESULT_LIMIT`. Add the new key to the returned object.
2. **Client**: in `cmdk.tsx`, add one `<SearchResultGroup>` call for the new
   key, passing `heading`, `icon`, `items` (from the query result), and
   `getHref`/`getLabel`/`getSublabel` mappers. `SearchResultGroup` is a
   small generic helper already in that file — it renders nothing when
   `items` is empty, so no extra guard is needed.

No other wiring required — `trpc.search.global.useQuery` already fires
(debounced) whenever the palette input is 2+ characters.

**Static top-level pages** (the "Pages" group in cmdk, and the sidebar) are
driven by one shared array, `MAIN_NAV_ITEMS` in `src/lib/nav.ts` — add a page
there once and both the sidebar and cmdk pick it up.

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
  - `/users` — server-rendered directory of the org's members, fetches via
    `api.users.list()`, renders `<UsersTable>` (currently just a `name`
    column linking to `/users/[id]`, which doesn't exist yet).
- The command palette links to `/profile`, but the page doesn't exist yet —
  a known gap, not a broken link by accident.
- `api/auth/[...all]` — better-auth's catch-all handler (`toNextJsHandler`).
- `api/trpc/[trpc]` — tRPC fetch adapter handler.

## UI / components

- `src/lib/tw.ts` — `` tw`...` `` tagged template for Tailwind class strings
  that live outside JSX (constants, `cva`/variant maps, config objects).
  Returns a branded `TwClass` (plain `string` underneath, so it flows into
  `cn(...)` unchanged); interpolation is a compile-time error (`never[]`
  rest param) since interpolated classes can't be statically scanned. Wired
  for tooling via `.vscode/settings.json`'s `tailwindCSS.classFunctions` and
  `prettier.config.mjs`'s `tailwindFunctions` above — Tailwind's v4 automatic
  source detection already covers any `.ts`/`.tsx` file project-wide, so no
  `@source` directive is needed. Not used inside existing components by
  convention — plain `className`/`cn()` strings there already get full
  Tailwind tooling for free.
- `src/components/ui/*` — a hand-copied shadcn/radix-based primitive set
  (button, card, dialog, dropdown, sidebar, table, input-otp, command palette
  via `cmdk`, etc.), not pulled in via the shadcn CLI (`components.json`
  exists mainly for editor tooling/import aliases).
- `src/components/app-sidebar.tsx` / `app-header.tsx` — the app chrome.
  Header hosts the breadcrumb trail, a search button that opens the command
  palette, and a "new ticket" shortcut. Sidebar nav items come from
  `MAIN_NAV_ITEMS` (`src/lib/nav.ts`), shared with the cmdk "Pages" group.
- `src/components/breadcrumb-portal.tsx` — breadcrumbs are set imperatively
  from any page via `useCrumbs()` (client) or `<ServerCrumbs>` (server
  component wrapper), backed by a jotai atom, and rendered in the header via
  `<Breadcrumbs>`. Supports nested/dropdown crumb segments.
- `src/components/cmdk.tsx` — ⌘K command palette (`cmdk` primitive), toggled
  via the zustand store (`src/store.app.ts`). Three sections: a "Pages" group
  (from `MAIN_NAV_ITEMS`), live search-result groups (tickets/users, via
  `trpc.search.global`, debounced, shown once the query is 2+ characters —
  see the cmdk recipe above for adding a new one), and a "Settings" group.
  Emoji search/Calculator/Billing/Settings entries are still placeholder
  items with no destination yet.
- `src/components/tickets-table.tsx` — `@tanstack/react-table` columns for
  title (links to detail page), relative last-active time (`date-fns`), and
  a status badge with variant-per-status color mapping.

State: `store.app.ts` (zustand) only holds `cmdkIsOpen` — deliberately tiny,
since most state is server data via tRPC/React Query or ephemeral UI state
(jotai for cross-tree UI signals like breadcrumbs, local `useState` elsewhere).

## Fake data (`src/data/`)

`seed.ts` wipes and reseeds the whole DB (FK-ordered deletes, then inserts).
`ORG_DEFS` (name/slug/email-domain) drives everything — splits the faker
roster evenly across however many orgs are listed there, and gives each org
its own "Powder" admin (`createPwdrUser(domain)`), e.g. `jnxspwdr@acme.com`
for Acme Corp. Adding an org to `ORG_DEFS` is enough to get it a working
admin login; regardless of the faker seed, `jnxspwdr@<domain>` is always
that org's admin, so manual sign-in testing stays predictable.

- `generate-users.ts` — `generateUsers()` returns the faker-generated roster
  (deliberately broad set of gender/pronoun combinations — see
  `src/types/schemas/user.ts`); `createPwdrUser(domain)` separately builds
  one org-scoped "Powder" admin per call, used by `seed.ts` once per org.
- `generate-tickets.ts` — faker-generated tickets per org, validated against
  `ticketSchema` before insert.
- Faker seed is either `ENV_FAKER_SEED` or a fresh random seed logged to the
  console at generation time, so a run can be reproduced later if needed.

## Planned (not yet implemented)

- **Devices** — a company's IT assets (laptops/phones/etc), each owned by
  one user. Regular users see only their own devices; admins see every
  device in the org (mirrors the tickets tenant-isolation pattern in
  `routers/tickets.ts`, plus a role check on `ctx.member.role`). Likely
  limited by `PLANS[...].limits.maxDevices` (`src/lib/plans.ts`).
- **Reports** — KPI/graph dashboard (cases per user, "most troublesome"
  user, ticket volume over time, etc). Meant to be the first consumer of
  `requiresPlanFeature("reports")` — free-plan orgs won't have access.
- **`/users/[id]`** — `/users` links each row to it, but no detail page
  exists yet (mirrors `/tickets/[ticketId]`'s pattern once built).
- **cmdk "recently opened" / result ranking** — the command palette's search
  results (`routers/search.ts`) are unordered beyond the DB query's own
  ordering; no per-user recency tracking or relevance scoring yet.

## Known gaps (intentionally out of scope, not forgotten)

- Dashboard is static placeholder content — no real metrics/queries.
- No ticket update/assign/status-change/comment mutations — create-only.
- No `/profile` page, despite the command palette linking to it.
- No org switcher UI (schema/session support exists; every seeded user only
  belongs to one org today).
- No invite flow (organization `invitation` table exists, unused).
- OTP emails are console-logged only — no real email provider wired up.
- Plan gating infra exists (`requiresPlanFeature`, `src/lib/plans.ts`) but
  nothing actually uses it yet — every org defaults to `free` and there's
  no UI to change plans or upsell. Also no real billing/payment processor.
