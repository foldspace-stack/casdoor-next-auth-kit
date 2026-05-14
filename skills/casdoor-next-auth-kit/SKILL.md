---
name: casdoor-next-auth-kit
description: Use when maintaining the shared Casdoor auth kit, generated route shells, React auth hooks, or the host-project skill installation flow.
metadata:
  short-description: Shared Casdoor auth kit source of truth
---

# Casdoor Next Auth Kit

Use this skill for the reusable `@foldspace/casdoor-next-auth-kit` repository and for host projects that consume it.

## Source of truth

- Repository: `/root/projects/foldspace-stack/casdoor-next-auth-kit`
- Package: `@foldspace/casdoor-next-auth-kit`
- Host copy: `.agents/skills/casdoor-next-auth-kit/SKILL.md`

## Supported commands

```bash
npx @foldspace/casdoor-next-auth-kit init
npx @foldspace/casdoor-next-auth-kit update
npx @foldspace/casdoor-next-auth-kit check
```

## What the package provides

- `AuthProvider`
- `useAuthSession`
- `useAuthUser`
- `useAuthRole`
- `useAuthActions`
- Casdoor login / signup entry handlers
- callback / logout / nextauth route handlers
- headless commerce proxy handlers
- host route shell templates
- database contract and sync interfaces

## Route model

- `/auth/login` is the host login entry route.
- `/auth/signup` is the host signup entry route.
- `/login/oauth/authorize` is the same-origin login authorize shell rendered by the host.
- `/signup/oauth/authorize` is the same-origin signup authorize shell rendered by the host.
- `/callback` and `/logout` remain host routes.
- `/auth/api/*` carries the Casdoor API proxy traffic.

## UX boundary

- Keep the Casdoor experience inside the host application.
- Prefer same-origin route shells and proxy handlers over direct browser navigation to Casdoor pages.
- The host user should experience one cohesive app, not a visible split between host UI and Casdoor UI.

## Database boundary

- The package defines required fields, sync behavior, and adapter interfaces.
- The host project owns Prisma schema, migration, and persistence implementation.
- Keep business-specific tables and writes in the host project.

## Skill distribution workflow

1. Update this canonical skill file in the standalone repo.
2. Use `scripts/install-skill.mjs` to copy it into a host project.
3. Re-run the host project's checks if the generated route shells changed.

## Host integration reminders

- Prefer the package React hooks instead of importing `next-auth/react` directly.
- Keep host route wrappers thin.
- Use the package CLI to manage generated files.
- Keep the host project's AGENTS.md pointing back to this repository.
