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
- `/auth/login` is the host login entry route.
- `/auth/signup` is the host signup entry route.
- `/login/oauth/authorize` is the in-app Casdoor login authorize shell.
- `/signup/oauth/authorize` is the in-app Casdoor signup authorize shell.
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

- `/auth/login` stays in the host app as the login entry route
- `/auth/signup` stays in the host app as the signup entry route
- `/login/oauth/authorize` stays in the host app as the login authorize shell
- `/signup/oauth/authorize` stays in the host app as the signup authorize shell
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

## Local verification

In the host project, the recommended manual smoke test is:

```bash
pnpm run dev
```

Then verify in the browser:

1. `GET /auth/login?redirect=%2F`
2. `GET /login/oauth/authorize`
3. Login with a test account
4. Confirm the user menu shows the admin action after login
5. `GET /auth/signup`
6. `GET /signup/oauth/authorize`
7. `GET /logout`
8. Confirm `/api/auth/session` returns an empty object after logout

If logout appears stale, refresh the host's generated files first:

```bash
npx @foldspace/casdoor-next-auth-kit update
```

## Notes

The code in this repository is intentionally scaffolded so you can iterate on the actual Casdoor integration, proxy behavior, database contract, and host-project templates.
