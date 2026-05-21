# 仓库约定

这是 `@foldspace-fe/casdoor-next-auth-kit` 的独立源仓库，包含：

- 可复用认证包
- CLI 脚手架
- demo 工程
- skill 分发源

本项目的核心价值，是把 Casdoor 原本依赖三方页面和分散接入的能力，整合到宿主工程内部统一管理，保持登录、购买、回跳和状态展示的一致体验，同时把安全边界和可控性留在宿主自己手里。

## 工具使用

- 所有终端命令都请使用 `rtk` 作为前缀。
- 所有手工修改文件都请使用 `apply_patch`。
- 优先使用非破坏性命令。

## 工作流程

- 修改行为前先阅读现有代码。
- 变更只聚焦在当前需求范围内。
- 不要覆盖用户的其他改动。
- 有明显代码变更后，执行 `pnpm lint`、`pnpm type-check` 和 `pnpm build`，确保提交前能正常构建并通过基础静态检查。
- 每次代码修改和调整，都需要同步更新 `skills/casdoor-next-auth-kit/SKILL.md`，让 skill 和实现保持一致。
- 当修改 `packages/auth-kit` 的模板、路由壳、billing 流程或生成文件契约时，必须同时检查 `docs/billing/*`、`AGENTS.md` 和生成结果是否一致，避免文档、skill 和代码三者分叉。
- 当修改 `packages/auth-kit/src/cli/templates.ts`、`packages/auth-kit/src/cli/operations.ts`、`packages/auth-kit/src/billing/*` 或 `packages/auth-kit/src/core/env.ts` 时，要同步确认 `init`、`update`、`check` 三个命令的行为都仍然一致，不能只修单个入口。
- npm 发布流水线使用 GitHub Actions Trusted Publisher / OIDC，不再依赖 `NPM_TOKEN`；发布时优先保留 `id-token: write`、`registry-url` 和 `npm publish` 的组合，避免重新引入长生命周期写权限 token。
- 正式 npm 发布默认打到 `latest`。在纯 Trusted Publisher / OIDC 模式下不要再要求 CI 同步 `next`，如果需要预发布通道，必须单独设计并额外配置认证，不要和正式发布混在同一个 workflow 里。
- 改动 billing 相关模板时，必须同时验证 `app/(auth-kit)/auth-config.ts`、`lib/billing/payment-success.ts`、`lib/billing/payment-finished.ts` 三者的导入关系，没有一个文件能单独缺失。
- 改动 billing 文档时，`docs/billing/README.md`、`docs/billing/INFRO.md`、`docs/billing/CASDOOR-INTEGRATION-TIMELINE.md` 和 `docs/billing/CASDOOR-INTEGRATION-TIMELINE.svg` 要一起更新，不能只改其中一份。
- 改动受管路由壳时，要同时检查 `deprecatedTargets`、`targets`、生成模板和宿主运行结果，确保更新命令不会残留旧文件或生成半套文件。

### 高风险修改前必读

在改下面这些内容之前，先确认当前行为、生成结果和文档说明都已对齐：

- `packages/auth-kit/src/cli/templates.ts`
- `packages/auth-kit/src/cli/operations.ts`
- `packages/auth-kit/src/billing/*`
- `packages/auth-kit/src/core/env.ts`
- `docs/billing/*`
- `skills/casdoor-next-auth-kit/SKILL.md`

如果修改会影响生成文件，必须优先回答这三个问题：

1. `npx @foldspace-fe/casdoor-next-auth-kit init` 还能不能生成完整文件
2. `npx @foldspace-fe/casdoor-next-auth-kit update` 会不会删除旧文件、补齐新文件并保持可编译
3. `pnpm build` 后宿主能不能直接 `next build`

如果任一答案不确定，先停下来补齐实现和文档，再继续改需求。

## 目录职责

- `packages/auth-kit`：认证、commerce、React hooks、路由 helper、数据库契约和 host 模板。
- `apps/demo`：联调和 smoke test。
- `skills/casdoor-next-auth-kit/`：分发到宿主项目的 skill 源目录。
- `scripts/install-skill.mjs`：把 skill 安装到目标项目 `.agents/skills`。
- 受管的 auth route shells 统一放在 `app/(auth-kit)` route group 下，URL 不变但文件更集中。
- `app/auth/index-html.ts`、`.env*` 和 `prisma/auth-kit.prisma` 由 CLI 受管并可生成到宿主工程。
- 受管 env 模板里的 `NEXT_PUBLIC_BILLING_PURCHASABLE_IDS` 默认示例值会写成 `membership-monthly,credits-50`，方便宿主在接入时直接看到订阅项和商品项各一个的白名单写法。
- `app/(auth-kit)/callback/error/page.tsx` 和 `app/(auth-kit)/callback/error/clear-domain-cookies-button.tsx` 也是受管内容，默认错误页必须带“清空当前域 Cookie”按钮，不要让宿主手工补这个能力。
- `app/(auth-kit)/auth-config.ts` 必须显式导出 `authKitConfig`、`adapter`、`persistence`、`paymentSuccessHandler` 和 `paymentFinishedHandler`，不要只保留局部变量让 route 再去间接取值。
- billing 默认就是受管内容，CLI 必须同时生成 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`，`auth-config.ts` 直接导入这两个默认文件，不要要求宿主手工创建 `@/lib/billing/*`。
- 默认生成的 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts` 是宿主定制 billing 收尾逻辑的唯一入口，后续如果要改订单补全、Webhook 或跳转逻辑，优先改这两个默认文件的 custom block，不要把业务塞回路由壳。
- 默认生成的 billing handler 文件必须保持“拿来就能编译”，文件里如果没有业务逻辑，也要保留可运行的空实现和明确日志，不允许生成只写注释或只留导入的半成品。
- billing 的购买页、二维码扫描区和支付状态面板都属于宿主工程自己的 UI，套件只提供 headless hooks、Casdoor 适配器、支付回调 handler 和纯数据模型，不要再把 `/qrcode` 或 `/payments/.../result` 当成套件内置页面能力。
- billing 的 headless hooks 现在还包括 `useBillingPricing`、`useBillingPlan`、`useBillingPricingPlans`、`useBillingSubscriptionPurchaseOptions`、`useBillingSubscriptionRecord`、`useBillingSubscriptions`、`useBillingOrder` 和 `useBillingOrders`，宿主应该优先用这些 hooks 把 Casdoor 的定价、计划、订阅和订单查询结果渲染成自己的 UI，而不是自己再拼一层查询封装。
- 订阅购买的基础交互也应优先走 `useBillingSubscriptionPurchaseOptions` + `useSubscribePlan`，商品购买优先走 `useBillingProductPurchaseOptions` + `usePurchaseProduct`；这样宿主可以自己渲染页面，但不需要自己重新实现订阅计划列表、商品 provider 选择和查询状态管理。
- `BillingCasdoorAccountResponse`、`BillingCasdoorApplicationResponse`、`BillingCasdoorPaymentResponse` 是宿主对接 `get-account`、`get-application`、`get-payment` 的标准类型，浏览器侧 loader 默认走 `/auth/api/*` 同域代理；只有服务端或明确放开 CORS 的特殊场景，才考虑直接连 `NEXT_PUBLIC_CASDOOR_SERVER_URL` origin 的 `/api/*` 路径。
- SaaS 订阅状态要以 Casdoor 的 `get-pricing` / `get-plan` / `get-subscription` / `get-subscriptions` 为准，产品购买后的订单列表和订单状态要以 Casdoor 的 `get-order` / `get-orders` / `get-payment` 为准，宿主本地状态只做归一化视图，不要反过来当真相源。
- 订阅域和商品域要继续保持分离：`kind: 'subscription'` 的条目只负责定价、计划和订阅状态，`kind: 'product'` 的条目只负责商品、订单和支付状态；同一个 catalog 可以同时包含两类条目，但不要把它们合并成一套通用购买对象。
- 订阅 / 商品分域的回归测试已经加在 `packages/auth-kit/test/billing-subscription-domain.test.ts`，如果以后改 billing 结构、catalog 语义或购买 payload，优先更新这个测试来锁住订阅和商品仍然是两条独立链路。
- 如果宿主已有自己的会员计划 rows，但想少写映射样板，可以先用 `buildBillingSubscriptionCatalog()` 把计划数组转成 auth-kit 的 subscription catalog，再交给 `BillingProvider` 和 `useSubscribePlan`。
- 生成的 `auth-config.ts` 必须同时兼容 `npx ... init` 和 `npx ... update`，不要让第一次生成能过、更新时却因为保留块或导入变化而编译失败。
- 登录入口是 `app/(auth-kit)/auth/login` 和 `app/(auth-kit)/auth/signup`，授权壳子是 `app/(auth-kit)/login/oauth/authorize`。

## 对外约定

- `npx @foldspace-fe/casdoor-next-auth-kit init` 生成宿主工程的受管 route shells。
- `npx @foldspace-fe/casdoor-next-auth-kit update` 刷新受管文件。
- `npx @foldspace-fe/casdoor-next-auth-kit check` 校验受管文件是否齐全。
- 生成的登录体验应保持在宿主站点内完成，Casdoor 页面只作为包内部代理的上游，不应直接暴露给最终用户。
- 宿主工程推荐把 `NEXT_PUBLIC_CASDOOR_APP_NAME` 和 `NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME` 视作同一个站点命名空间来配置，例如 `qixiaoju / qixiaoju`。
- 宿主工程通过 `@foldspace-fe/casdoor-next-auth-kit/react` 读取认证状态和动作。
- 宿主工程只负责建表和持久化，数据库字段与同步需求由包定义。

## 明确禁止

- 不要再把 Casdoor 的登录或注册流改回直接暴露到站外页面，`/auth/login` 和 `/auth/signup` 必须先进入宿主站内壳子，再由包发起同源 authorize 跳转。
- 不要再把 `/signup/oauth/authorize` 设计成独立于 `/login/oauth/authorize` 的另一套页面逻辑，它们必须共用同一个 authorize shell 和同一套 `index-html.ts`。
- 不要再新增 `NEXT_PUBLIC_CASDOOR_SIGNUP_PATH` 之类的环境变量，signup 的 authorize 路径由包根据请求类型动态生成。
- 不要再修改 `index-html.ts` 来实现登录/注册切换、资源重写或 JS 注入，`index-html.ts` 保持为现有静态壳子，由包外层 route handler 控制跳转。
- 不要再把 Casdoor API 改回 `/api/casdoor/*` 或其他与主框架冲突的前缀，宿主统一使用 `/auth/api/*`。
- 不要再恢复旧的 `/login`、`/signup`、`/logout` 兼容入口，宿主只保留 `app/(auth-kit)` 下的新路由。
- 不要再把 `NEXTAUTH_URL` 当成公共站点 origin 的来源，公共 origin 由请求头或 `APP_URL` 识别。
- 不要再把 billing 回调设计成依赖 `.env` 里的 handler 模块路径；默认生成的 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts` 就是宿主侧接入点，`auth-config.ts` 负责直接导入并导出对应 handler。
- 不要再把 `/auth/payment/success` 和 `/auth/payment/finished` 退回成页面文件，它们必须保持为固定回调路径，由默认生成的 billing handler 文件承接业务逻辑和跳转。
- 不要再让 billing 回调缺省成“静默空操作”；如果没有宿主业务逻辑，至少要保留日志和默认回退，方便排查 Casdoor 回跳链路是否真的走到了宿主。
- 不要再把 `lib/billing/*` 当成宿主可选文件；这两个文件属于套件必须生成并维护的宿主接入层，缺失就意味着 `update` 不完整。
- 不要再在 billing 模板里引入宿主工程不存在的 `@/lib/*`，除了默认生成的 `@/lib/billing/payment-success` 和 `@/lib/billing/payment-finished` 之外，不允许再加新的宿主硬依赖。
- 不要再把 `app/(auth-kit)/auth-config.ts` 做成依赖多层间接导出的形式，route 文件必须能直接从这个文件拿到所需 handler 和配置对象。
- 不要再把 `app/(auth-kit)/callback/error/page.tsx` 做成纯文本错误页，默认错误页必须提供本地清 cookie 按钮，帮助用户清掉当前域下残留的 auth cookie。
- 不要再把 billing 的默认生成文件改成“只在文档里提到、代码里不生成”的状态；文档、skill、AGENTS 和 CLI 生成结果必须同时存在。
- 不要再把 billing 页面层补回套件内置路由壳，`/qrcode`、`/payments/.../result` 和其他购买结果页面都应该由宿主自己实现。
- 不要再把 Casdoor 的 `get-account`、`get-application`、`get-payment` 响应类型写成宽泛的 `unknown` 或裸对象，宿主侧 loader 和测试都要使用明确的响应 envelope。
- 不要再用 `request.cookies.getAll()` 作为 logout 唯一依据，退出必须按原始 `Cookie` 头和 cookie 前缀清理分片 session。
- 不要再在宿主工程手工 copy 生成文件到别的目录，受管文件只能通过 `npx @foldspace-fe/casdoor-next-auth-kit init|update|check` 维护。
- 不要再尝试向宿主工程的 `.agents/skills` 目录直接写入文件；宿主只通过仓库内 skill 分发脚本安装 skill，写入失败时应跳过并提示，而不是改造宿主仓库权限。
- 不要在未重新构建包产物的情况下判断本地 `file:` 依赖已经生效；修改 `packages/auth-kit` 后必须先 `pnpm build`，宿主再 `pnpm install` 或 `npx ... update`。
- 不要在没有验证 logout/session 的情况下下结论为“已退出”；必须以 `/api/auth/session` 为空对象为准。

## 文档关系

- 当前宿主工程的 AGENTS.md 和 skill 文件都引用本仓库作为源头。
- 以 `AGENTS.md`、`skills/casdoor-next-auth-kit/SKILL.md` 和 `docs/billing/*` 作为当前有效的对外约定来源；不要再依赖已删除的方案草案文件。
- 对外 README、docs 和 skill 源文件默认使用中文描述，保留英文内容时只写必要的包名、命令、API 名称和代码标识符。
