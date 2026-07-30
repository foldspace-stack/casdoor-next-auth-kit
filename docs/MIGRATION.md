# Casdoor Next Auth Kit 迁移说明

本文用于把旧版 Casdoor / NextAuth / billing 接入，迁移到当前这版更内聚的目录和路由约定。

## 迁移目标

- 登录和注册继续使用宿主自己的 UI
- 授权跳转、回调、退出、NextAuth、Casdoor 代理继续由包提供
- billing 相关能力改为 headless hooks + 宿主自己的页面
- 生成文件集中到 `app/(auth-kit)` 子目录，便于复制到其他 Next.js 工程

## 路由变化

旧版常见入口：

- `/login`
- `/signup`
- `/api/casdoor/*`
- 分散在宿主根目录的 `lib/auth-kit/*`

新版入口：

- `/auth/login`
- `/auth/signup`
- `/login/oauth/authorize`
- `/signup/oauth/authorize`
- `/callback`
- `/logout`
- `/auth/api/*`
- `/api/auth/[...nextauth]`

## 宿主需要保留的路由

至少保留这些 route shell：

```text
app/(auth-kit)/auth/login/route.ts
app/(auth-kit)/auth/signup/route.ts
app/(auth-kit)/login/oauth/authorize/route.ts
app/(auth-kit)/signup/oauth/authorize/route.ts
app/(auth-kit)/callback/route.ts
app/(auth-kit)/logout/route.ts
app/(auth-kit)/auth/api/[...path]/route.ts
app/(auth-kit)/api/auth/[...nextauth]/route.ts
```

如果你还要保留 billing 回跳，继续保留：

```text
app/(auth-kit)/auth/payment/success/route.ts
app/(auth-kit)/auth/payment/finished/route.ts
app/(auth-kit)/billing/payment-success.ts
app/(auth-kit)/billing/payment-finished.ts
app/(auth-kit)/billing/order-redirect.ts
```

## 旧实现升级步骤

1. 先升级包版本或本地 workspace 依赖。
2. 重新执行：

```bash
npx @foldspace-fe/casdoor-next-auth-kit update
```

3. 删除旧的兼容入口和旧目录引用：

- 旧的 `/login`、`/signup`、`/logout` 兼容路由
- 旧的 `/api/casdoor/*`
- 旧的 `packages/auth-kit/src/core/*`、`next/*`、`react/*`、`billing/*`、`casdoor/*` 的扁平引用方式

4. 按新入口更新宿主代码：

- 页面组件从 `@foldspace-fe/casdoor-next-auth-kit/auth` 读取
- React hooks / Provider 从 `@foldspace-fe/casdoor-next-auth-kit/react` 读取
- Next 路由 handler 从 `@foldspace-fe/casdoor-next-auth-kit/next` 读取
- Casdoor 代理和登录入口从 `@foldspace-fe/casdoor-next-auth-kit/casdoor` 读取
- billing 类型和运行时从 `@foldspace-fe/casdoor-next-auth-kit/billing` 读取

## 登录链路

当前推荐顺序是：

1. 用户访问 `/auth/login`
2. 宿主自己的 login UI 渲染
3. 点击后进入 `/login/oauth/authorize`
4. authorize 路由继续发起 Casdoor OAuth
5. Casdoor 回调到 `/callback`
6. 宿主完成 session 建立，再跳回站内页面

注册链路与登录类似，只是从 `/auth/signup` 和 `/signup/oauth/authorize` 开始。

## billing 链路

- 订阅和积分购买只保留 headless 数据和动作
- 页面 UI 由宿主工程自己实现
- `useBillingSubscriptionPurchaseOptions` + `useSubscribePlan`
- `useBillingProductPurchaseOptions` + `usePurchaseProduct`

## 校验命令

迁移后建议跑：

```bash
npx @foldspace-fe/casdoor-next-auth-kit check
pnpm type-check
pnpm build
```

如果你是在本仓库本地改包，先跑：

```bash
rtk pnpm build
```

再去宿主工程重新安装或更新依赖。

## 常见问题

### `/login/oauth/authorize` 404

通常表示宿主没有生成对应的 route shell。确认 `app/(auth-kit)/login/oauth/authorize/route.ts` 是否存在。

### 登录跳到错误域名

一般是宿主没有走请求头推导的公共 origin，或者还在直接用 `request.url` 拼跳转地址。

### billing 回跳异常

确认宿主保留了：

- `app/(auth-kit)/billing/payment-success.ts`
- `app/(auth-kit)/billing/payment-finished.ts`
- `app/(auth-kit)/billing/order-redirect.ts`

并且 `auth-config.ts` 直接导入它们，而不是走间接层。
