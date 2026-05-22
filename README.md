# casdoor-next-auth-kit

可复用的 `@foldspace-fe/casdoor-next-auth-kit` 包的源码仓库，包含 CLI 脚手架工具、skill 分发源和 Next.js 演示应用。


[![npm version](https://img.shields.io/npm/v/@foldspace-fe/casdoor-next-auth-kit?label=npm)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)
[![npm downloads](https://img.shields.io/npm/dm/@foldspace-fe/casdoor-next-auth-kit?label=downloads)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)

Published package page:

- https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit

Install:

```bash
npm install @foldspace-fe/casdoor-next-auth-kit
```

该包刻意设计为无头（headless）架构：

- 将 Casdoor 认证体验完全内嵌于宿主应用，用户不应感知到跳转
- 通过同源路由壳代理 Casdoor 的登录、注册、回调、注销和电商流程
- 提供 React 钩子和 Provider 包装，宿主应用无需直接导入 `next-auth/react`
- 将 Casdoor 特有的 UI 和导航隐藏在宿主壳之后

## 文档导航

- [Docs Index](./docs/README.md)
- [Auth 文档](./docs/auth/README.md)
- [Billing 文档](./docs/billing/README.md)
- [CLI 文档](./docs/cli/README.md)
- [Skills 文档](./docs/skills/README.md)

## 仓库结构

- `packages/auth-kit`：可复用的认证、电商、React 钩子和宿主模板辅助工具
- `packages/auth-kit/src/cli.ts`：CLI 入口，支持 `init`、`update`、`check` 三条命令
- `apps/demo`：冒烟测试和手动验证用的演示应用
- `skills/casdoor-next-auth-kit/`：供宿主项目使用的规范 skill 目录
- `skills/casdoor-next-auth-kit/references/`：Casdoor 个人操作 API 参考（markdown + swagger）
- `scripts/install-skill.mjs`：将整个 skill 目录安装到目标项目 `.agents/skills` 目录的复制脚本
- 生成的认证路由壳位于 `app/(auth-kit)` 下，保持就近放置但不改变 URL 结构
- `/auth/login` — 宿主项目的登录入口路由
- `/auth/signup` — 宿主项目的注册入口路由
- `/login/oauth/authorize` — 应用内的 Casdoor 登录授权壳
- `/signup/oauth/authorize` — 应用内的 Casdoor 注册授权壳
- 壳路由是同源包装器，用户看到的是宿主应用的统一体验，而非 Casdoor 原始页面
- CLI 管理的宿主文件：
  - `app/auth/index-html.ts`
  - `.env` / `.env.local` / `.env.production` / `.env.example`
  - `prisma/auth-kit.prisma`

## CLI

通过 `npx` 直接使用包：

```bash
npx @foldspace-fe/casdoor-next-auth-kit@latest init     # 初始化：安装 skill、生成路由壳、配置 Next.js
npx @foldspace-fe/casdoor-next-auth-kit@latest update   # 更新：重新生成路由壳、同步 skill 和配置文件
npx @foldspace-fe/casdoor-next-auth-kit@latest check    # 检查：验证宿主项目配置与生成物是否一致
npx @foldspace-fe/casdoor-next-auth-kit@latest --version
```

`npx` 会读取 package 的 `bin` 入口并执行 `casdoor-next-auth-kit` 这个 CLI，所以 `@latest` 形式可以直接调用这些命令。

这些命令生成或刷新宿主项目的受管理路由壳，同时保持受管理的环境文件、skill 副本、`app/auth/index-html.ts` 和 Prisma schema 脚手架同步。

仓库的 npm 发布也由 GitHub Actions 自动处理：

- `push` 到 `main` 时，会同时参考 npm 仓库的最新已发布版本和最近的 `v*` tag，取更高的基线后递增 patch，再发布到 npm `next`
- 发布完成后，GitHub Actions 会把同一个版本提升为 npm `latest`
- `push` `v0.1` 这类 tag 时，会规范化成 `0.1.0` 并发布到 npm `latest`
- 如果最近的 tag 是 `v0.1`，那么下一次 `main` push 会自动发布 `0.1.1`

生成的认证壳应被视为宿主控制的集成点：

- `/auth/login` 作为宿主应用的登录入口路由
- `/auth/signup` 作为宿主应用的注册入口路由
- `/login/oauth/authorize` 作为宿主应用的登录授权壳
- `/signup/oauth/authorize` 作为宿主应用的注册授权壳
- Casdoor API 请求通过 `/auth/api/*` 代理转发
- 回调（callback）和注销（logout）保持为宿主路由
- 用户应体验到连贯的应用内流程，而非直接跳转到 Casdoor 自身的 UI

## Skill 分发

将共享 skill 安装到目标项目：

```bash
node scripts/install-skill.mjs /path/to/host-project
```

脚本将写入：

- `/path/to/host-project/.agents/skills/casdoor-next-auth-kit/`
- `/path/to/host-project/.agents/skills/casdoor-next-auth-kit/references/`

## 宿主集成模型

- 宿主项目导入包后只需保持薄路由壳包装，认证逻辑由包内部处理
- 宿主项目拥有 Prisma 数据表和持久化实现的完全控制权
- 包负责认证和电商契约、路由辅助工具、React 钩子和生成的路由模板

## 快速开始

```bash
pnpm install
pnpm dev
```

## 本地验证

在宿主项目中，推荐的手动冒烟测试流程：

```bash
pnpm run dev
```

然后在浏览器中验证：

1. 访问 `GET /auth/login?redirect=%2F`
2. 访问 `GET /login/oauth/authorize`
3. 使用测试账号登录
4. 确认登录后用户菜单显示管理员操作
5. 访问 `GET /auth/signup`
6. 访问 `GET /signup/oauth/authorize`
7. 访问 `GET /logout`
8. 确认 `/api/auth/session` 注销后返回空对象

如果注销状态异常，先刷新宿主项目的生成文件：

```bash
npx @foldspace-fe/casdoor-next-auth-kit@latest update
```

## 备注

本仓库的代码刻意采用脚手架结构，便于迭代 Casdoor 集成、代理行为、数据库契约和宿主项目模板。
