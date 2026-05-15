# CLI

CLI 负责管理宿主生成文件，并保持 skill 源同步。

## 命令

- `npx @foldspace-fe/casdoor-next-auth-kit@latest init`
- `npx @foldspace-fe/casdoor-next-auth-kit@latest update`
- `npx @foldspace-fe/casdoor-next-auth-kit@latest check`
- `npx @foldspace-fe/casdoor-next-auth-kit@latest --version`

`npx` 会通过 package 的 `bin` 入口执行 `casdoor-next-auth-kit` 这个 CLI，所以可以直接使用 `@latest` 的写法。

## 发布流程

包通过 GitHub Actions 发布，并自动计算版本号：

- push 到 `main` 时，会读取最新已发布的 npm 版本和最近的 `v*` git tag，取更高的基线后递增 patch，然后发布到 npm `next`
- 发布完成后，会把同一个版本提升为 npm `latest`
- push `v0.1` 这种 tag 时，会规范化成 `0.1.0` 并发布到 npm `latest`
- 包版本从 `0.1.0` 起步，所以 `v0.1` 之后第一次 `main` push 会变成 `0.1.1`

## 受管文件

- `app/auth/index-html.ts`
- `.env`
- `.env.local`
- `.env.production`
- `.env.example`
- `prisma/auth-kit.prisma`

## 参考

- [仓库 README](../../README.md)
- [Skill 源文件](../../skills/casdoor-next-auth-kit/SKILL.md)
- [CLI 实现](../../packages/auth-kit/src/cli/index.ts)
