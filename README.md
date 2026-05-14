# casdoor-next-auth-kit

Monorepo for the reusable `@foldspace/casdoor-next-auth-kit` package, its CLI scaffolder, its skill distribution source, and a Next.js demo app.

## What lives here

- `packages/auth-kit`: reusable auth, commerce, React hooks, and host template helpers
- `packages/auth-kit/src/cli.ts`: CLI entry that supports `init`, `update`, and `check`
- `apps/demo`: smoke-test and manual verification app
- `skills/casdoor-next-auth-kit/SKILL.md`: canonical skill copy for host projects
- `scripts/install-skill.mjs`: copier that installs the skill into a target project's `.agents/skills`

## CLI

Use the package directly through `npx`:

```bash
npx @foldspace/casdoor-next-auth-kit init
npx @foldspace/casdoor-next-auth-kit update
npx @foldspace/casdoor-next-auth-kit check
```

These commands generate or refresh the host project's managed route shells.

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
