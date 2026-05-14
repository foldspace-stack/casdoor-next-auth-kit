# 仓库约定

这是 `@foldspace/casdoor-next-auth-kit` 的独立源仓库，包含：

- 可复用认证包
- CLI 脚手架
- demo 工程
- skill 分发源

## 工具使用

- 所有终端命令都请使用 `rtk` 作为前缀。
- 所有手工修改文件都请使用 `apply_patch`。
- 优先使用非破坏性命令。

## 工作流程

- 修改行为前先阅读现有代码。
- 变更只聚焦在当前需求范围内。
- 不要覆盖用户的其他改动。
- 有明显代码变更后，执行 `pnpm type-check` 和 `pnpm build`。

## 目录职责

- `packages/auth-kit`：认证、commerce、React hooks、路由 helper、数据库契约和 host 模板。
- `apps/demo`：联调和 smoke test。
- `skills/casdoor-next-auth-kit/SKILL.md`：分发到宿主项目的 skill 源文件。
- `scripts/install-skill.mjs`：把 skill 安装到目标项目 `.agents/skills`。
- 受管的 auth route shells 统一放在 `app/(auth-kit)` route group 下，URL 不变但文件更集中。
- `app/auth/index-html.ts`、`.env*` 和 `prisma/auth-kit.prisma` 由 CLI 受管并可生成到宿主工程。

## 对外约定

- `npx @foldspace/casdoor-next-auth-kit init` 生成宿主工程的受管 route shells。
- `npx @foldspace/casdoor-next-auth-kit update` 刷新受管文件。
- `npx @foldspace/casdoor-next-auth-kit check` 校验受管文件是否齐全。
- 生成的登录体验应保持在宿主站点内完成，Casdoor 页面只作为包内部代理的上游，不应直接暴露给最终用户。
- 宿主工程推荐把 `NEXT_PUBLIC_CASDOOR_APP_NAME` 和 `NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME` 视作同一个站点命名空间来配置，例如 `qixiaoju / qixiaoju`。
- 宿主工程通过 `@foldspace/casdoor-next-auth-kit/react` 读取认证状态和动作。
- 宿主工程只负责建表和持久化，数据库字段与同步需求由包定义。

## 文档关系

- `AUTH-KIT-PLAN.md` 是本仓库的主方案文档。
- 当前宿主工程的 AGENTS.md 和 skill 文件都引用本仓库作为源头。
