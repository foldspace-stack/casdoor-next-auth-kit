# casdoor-next-auth-kit

Source repository for the reusable `@foldspace/casdoor-next-auth-kit` package, its CLI scaffolder, its skill distribution source, and a Next.js demo app.

The package is intentionally headless:

- it keeps the Casdoor experience inside the host application
- it proxies Casdoor login, signup, callback, logout, and commerce flows through same-origin route shells
- it exposes React hooks and provider wrappers so host apps do not need to import `next-auth/react` directly
- it keeps Casdoor-specific UI and navigation hidden behind the host shell

## What lives here

- `packages/auth-kit`: reusable auth, commerce, React hooks, and host template helpers
- `packages/auth-kit/src/cli.ts`: CLI entry that supports `init`, `update`, and `check`
- `apps/demo`: smoke-test and manual verification app
- `skills/casdoor-next-auth-kit/SKILL.md`: canonical skill copy for host projects
- `scripts/install-skill.mjs`: copier that installs the skill into a target project's `.agents/skills`
- Generated auth route shells live under `app/(auth-kit)` so they stay collocated without changing URLs.
- The shell routes are meant to be same-origin wrappers around Casdoor, not user-visible Casdoor pages.
- CLI managed host files:
  - `app/auth/index-html.ts`
  - `.env`
  - `.env.local`
  - `.env.production`
  - `.env.example`
  - `prisma/auth-kit.prisma`

## CLI

Use the package directly through `npx`:

```bash
npx @foldspace/casdoor-next-auth-kit init
npx @foldspace/casdoor-next-auth-kit update
npx @foldspace/casdoor-next-auth-kit check
```

These commands generate or refresh the host project's managed route shells.
They also keep the managed env files, skill copy, `app/auth/index-html.ts`, and the Prisma schema scaffold in sync.

The generated auth shells should be treated as host-controlled integration points:

- `/login` and `/signup` stay in the host app
- Casdoor API requests are proxied through `/auth/api/*`
- callback and logout remain host routes
- the user should experience a coherent in-app flow, not a direct jump into Casdoor's own UI

## Skill distribution

Install the shared skill into a target project:

```bash
node scripts/install-skill.mjs /path/to/host-project
```

The script writes:

- `/path/to/host-project/.agents/skills/casdoor-next-auth-kit/SKILL.md`

## Host integration model

- The host project imports the package and keeps only thin route wrappers.
- The host project owns Prisma tables and persistence.
- The package owns auth and commerce contracts, route helpers, React hooks, and generated route templates.

## Quick start

```bash
pnpm install
pnpm dev
```

## Notes

The code in this repository is intentionally scaffolded so you can iterate on the actual Casdoor integration, proxy behavior, database contract, and host-project templates.
