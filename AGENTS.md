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
- 登录入口是 `app/(auth-kit)/auth/login` 和 `app/(auth-kit)/auth/signup`，授权壳子是 `app/(auth-kit)/login/oauth/authorize`。

## 对外约定

- `npx @foldspace/casdoor-next-auth-kit init` 生成宿主工程的受管 route shells。
- `npx @foldspace/casdoor-next-auth-kit update` 刷新受管文件。
- `npx @foldspace/casdoor-next-auth-kit check` 校验受管文件是否齐全。
- 生成的登录体验应保持在宿主站点内完成，Casdoor 页面只作为包内部代理的上游，不应直接暴露给最终用户。
- 宿主工程推荐把 `NEXT_PUBLIC_CASDOOR_APP_NAME` 和 `NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME` 视作同一个站点命名空间来配置，例如 `qixiaoju / qixiaoju`。
- 宿主工程通过 `@foldspace/casdoor-next-auth-kit/react` 读取认证状态和动作。
- 宿主工程只负责建表和持久化，数据库字段与同步需求由包定义。

## 明确禁止

- 不要再把 Casdoor 的登录或注册流改回直接暴露到站外页面，`/auth/login` 和 `/auth/signup` 必须先进入宿主站内壳子，再由包发起同源 authorize 跳转。
- 不要再把 `/signup/oauth/authorize` 设计成独立于 `/login/oauth/authorize` 的另一套页面逻辑，它们必须共用同一个 authorize shell 和同一套 `index-html.ts`。
- 不要再新增 `NEXT_PUBLIC_CASDOOR_SIGNUP_PATH` 之类的环境变量，signup 的 authorize 路径由包根据请求类型动态生成。
- 不要再修改 `index-html.ts` 来实现登录/注册切换、资源重写或 JS 注入，`index-html.ts` 保持为现有静态壳子，由包外层 route handler 控制跳转。
- 不要再把 Casdoor API 改回 `/api/casdoor/*` 或其他与主框架冲突的前缀，宿主统一使用 `/auth/api/*`。
- 不要再恢复旧的 `/login`、`/signup`、`/logout` 兼容入口，宿主只保留 `app/(auth-kit)` 下的新路由。
- 不要再把 `NEXTAUTH_URL` 当成公共站点 origin 的来源，公共 origin 由请求头或 `APP_URL` 识别。
- 不要再用 `request.cookies.getAll()` 作为 logout 唯一依据，退出必须按原始 `Cookie` 头和 cookie 前缀清理分片 session。
- 不要再在宿主工程手工 copy 生成文件到别的目录，受管文件只能通过 `npx @foldspace/casdoor-next-auth-kit init|update|check` 维护。
- 不要再尝试向宿主工程的 `.agents/skills` 目录直接写入文件；宿主只通过仓库内 skill 分发脚本安装 skill，写入失败时应跳过并提示，而不是改造宿主仓库权限。
- 不要在未重新构建包产物的情况下判断本地 `file:` 依赖已经生效；修改 `packages/auth-kit` 后必须先 `pnpm build`，宿主再 `pnpm install` 或 `npx ... update`。
- 不要在没有验证 logout/session 的情况下下结论为“已退出”；必须以 `/api/auth/session` 为空对象为准。

## 文档关系

- `AUTH-KIT-PLAN.md` 是本仓库的主方案文档。
- 当前宿主工程的 AGENTS.md 和 skill 文件都引用本仓库作为源头。
