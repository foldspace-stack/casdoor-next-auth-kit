# CLI

The CLI manages generated host files and keeps the skill source in sync.

## Commands

- `npx @foldspace-fe/casdoor-next-auth-kit init`
- `npx @foldspace-fe/casdoor-next-auth-kit update`
- `npx @foldspace-fe/casdoor-next-auth-kit check`

## Publish Flow

The package is published from GitHub Actions with automatic version calculation:

- Push to `main` increments the patch version from the latest `v*` tag and publishes the result to npm `next`
- Push a `v0.1`-style tag normalizes to `0.1.0` and publishes to npm `latest`
- The package starts from `0.1.0`, so the first `main` push after `v0.1` becomes `0.1.1`

## Managed Files

- `app/auth/index-html.ts`
- `.env`
- `.env.local`
- `.env.production`
- `.env.example`
- `prisma/auth-kit.prisma`

## References

- [Root README](../../README.md)
- [Skill Source](../../skills/casdoor-next-auth-kit/SKILL.md)
- [CLI implementation](../../packages/auth-kit/src/cli/index.ts)
