# `@foldspace/casdoor-next-auth-kit`

这是独立仓库的主方案文档，作为认证包、demo、CLI 和 skill 分发的 source of truth。

## 目标

- 将 Casdoor 登录、PKCE、回调、退出、React auth hooks、commerce 转发做成可复用的包。
- 主工程只保留薄路由壳、业务用户同步和 Prisma 持久化。
- 先支持本地 `link:` 依赖，后续切到 npm 发布版。
- 用 `npx @foldspace/casdoor-next-auth-kit init` 和 `update` 管理宿主工程生成文件。
- 用 skill 文件把这套用法同步到宿主项目的 `.agents/skills`。

## 模块边界

### 包负责

- Casdoor 授权入口
- OAuth callback
- logout
- React auth hooks
- commerce/headless 接口转发
- host route shell 模板
- 数据库契约和同步需求
- skill 的源码和分发脚本

### 宿主负责

- Prisma schema 和表结构
- 用户、订单、订阅、积分等业务数据的存储
- 业务级跳转和页面内容
- `@next-auth/prisma-adapter` 或同类存储适配依赖

## 数据库契约

包只定义“需要什么”，不接管宿主的建表实现。

建议对外暴露：

- auth user / profile / membership 相关记录的字段需求
- commerce order / subscription / invoice 的最小字段需求
- 与 Casdoor 同步相关的用户身份字段
- 可复用的 adapter 接口和同步回调类型

宿主工程只实现：

- schema
- migration
- upsert / sync / query

## React 层

宿主工程不要再直接从 `next-auth/react` 读取状态，统一改用包导出的 hooks：

- `AuthProvider`
- `useAuthSession`
- `useAuthUser`
- `useAuthRole`
- `useAuthActions`

## CLI

CLI 约定如下：

```bash
npx @foldspace/casdoor-next-auth-kit init
npx @foldspace/casdoor-next-auth-kit update
npx @foldspace/casdoor-next-auth-kit check
```

- `init`：首次生成 route shells 和 `.env.example`
- `update`：刷新包管理的受管文件
- `check`：只校验，不改文件

## Skill 分发

仓库内的 skill 是 canonical 版本。

安装到目标项目时，写入：

- `TARGET/.agents/skills/casdoor-next-auth-kit/SKILL.md`

建议通过 `scripts/install-skill.mjs` 完成复制。

## Demo 工程

`apps/demo` 负责：

- 验证 login / callback / logout
- 验证 React hooks
- 验证 commerce 转发
- 验证更新后的 route shell 是否仍然可运行

## 发布顺序

1. 完成本仓库开发
2. 在 demo 中跑通
3. 用 `npx` 方式在宿主工程接入
4. 再发布到 npm
5. 最后把宿主工程依赖切到 npm 版本
