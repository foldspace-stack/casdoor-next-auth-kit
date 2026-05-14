# CLI

The CLI manages generated host files and keeps the skill source in sync.

## Commands

- `npx @foldspace/casdoor-next-auth-kit init`
- `npx @foldspace/casdoor-next-auth-kit update`
- `npx @foldspace/casdoor-next-auth-kit check`

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
