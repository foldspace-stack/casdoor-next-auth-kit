# Casdoor 个人操作 API 参考

> 仅包含个人/用户/商品/支付/订阅相关的 API 端点。
> 所有路径均已添加 `/auth/` 部署前缀。
> 基于 Casdoor v1.503.0

## 概览

| 分类 | 端点数 |
|---|---|
| 账户 API | 5 |
| 邺请 API | 5 |
| 登录 API | 11 |
| 多因素认证 API | 5 |
| 订单 API | 4 |
| 支付 API | 5 |
| 计划 API | 2 |
| 定价 API | 2 |
| 商品 API | 3 |
| 资源 API | 3 |
| 会话 API | 2 |
| 订阅 API | 2 |
| 令牌 API | 4 |
| 交易 API | 2 |
| 用户 API | 7 |
| 验证 API | 3 |
| **合计** | **65** |

## 账户 API

### GET `/auth/api/get-account`
**操作**: `ApiController.GetAccount`
**描述**: 获取当前账户详情

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/reset-email-or-phone`
**操作**: `ApiController.ResetEmailOrPhone`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### POST `/auth/api/set-password`
**操作**: `ApiController.SetPassword`
**描述**: 设置密码

**参数**:

- `userOwner` (表单参数, string *(必填)*) — The owner of the user
- `userName` (表单参数, string *(必填)*) — The name of the user
- `oldPassword` (表单参数, string *(必填)*) — The old password of the user
- `newPassword` (表单参数, string *(必填)*) — The new password of the user

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/user`
**操作**: `ApiController.UserInfo2`
**描述**: 返回 Laravel 兼容的用户信息（OAuth 2.0）

**响应**:

- **200**: The Response object

  - `created_at`: string
  - `email`: string
  - `email_verified_at`: string
  - `id`: string
  - `name`: string
  - `updated_at`: string

---

### GET `/auth/api/userinfo`
**操作**: `ApiController.UserInfo`
**描述**: 返回用户信息（OIDC 标准）

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

## 邺请 API

### GET `/auth/api/get-invitation`
**操作**: `ApiController.GetInvitation`
**描述**: 获取邺请信息

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the invitation

**响应**:

- **200**: The Response object

  - `application`: string
  - `code`: string
  - `createdTime`: string
  - `defaultCode`: string
  - `displayName`: string
  - `email`: string
  - `isRegexp`: boolean
  - `name`: string
  - `owner`: string
  - `phone`: string
  - `quota`: integer
  - `signupGroup`: string
  - `state`: string
  - `updatedTime`: string
  - `usedCount`: integer
  - `username`: string

---

### GET `/auth/api/get-invitation-info`
**操作**: `ApiController.GetInvitationCodeInfo`
**描述**: 获取邺请码详情

**参数**:

- `code` (查询参数, string *(必填)*) — Invitation code

**响应**:

- **200**: The Response object

  - `application`: string
  - `code`: string
  - `createdTime`: string
  - `defaultCode`: string
  - `displayName`: string
  - `email`: string
  - `isRegexp`: boolean
  - `name`: string
  - `owner`: string
  - `phone`: string
  - `quota`: integer
  - `signupGroup`: string
  - `state`: string
  - `updatedTime`: string
  - `usedCount`: integer
  - `username`: string

---

### GET `/auth/api/get-invitations`
**操作**: `ApiController.GetInvitations`
**描述**: 获取邺请列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of invitations

**响应**:

- **200**: The Response object
Array&lt;object.Invitation&gt;

---

### POST `/auth/api/send-invitation`
**操作**: `ApiController.VerifyInvitation`
**描述**: 验证邺请码

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the invitation
- `body` (请求体, array *(必填)*) — The details of the invitation

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/verify-invitation`
**操作**: `ApiController.VerifyInvitation`
**描述**: 验证邺请码

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the invitation

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## 登录 API

### GET `/auth/api/faceid-signin-begin`
**操作**: `ApiController.FaceIDSigninBegin`
**描述**: FaceID 登录流程第一阶段

**参数**:

- `owner` (查询参数, string *(必填)*) — owner
- `name` (查询参数, string *(必填)*) — name

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-app-login`
**操作**: `ApiController.GetApplicationLogin`
**描述**: 获取应用登录信息

**参数**:

- `clientId` (查询参数, string *(必填)*) — client id
- `responseType` (查询参数, string *(必填)*) — response type
- `redirectUri` (查询参数, string *(必填)*) — redirect uri
- `scope` (查询参数, string *(必填)*) — scope
- `state` (查询参数, string *(必填)*) — state

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-captcha`
**操作**: `ApiController.GetCaptcha`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### POST `/auth/api/login`
**操作**: `ApiController.Login`
**描述**: 登录

**参数**:

- `clientId` (查询参数, string *(必填)*) — clientId
- `responseType` (查询参数, string *(必填)*) — responseType
- `redirectUri` (查询参数, string *(必填)*) — redirectUri
- `scope` (查询参数, string) — scope
- `state` (查询参数, string) — state
- `nonce` (查询参数, string) — nonce
- `code_challenge_method` (查询参数, string) — code_challenge_method
- `code_challenge` (查询参数, string) — code_challenge
- `form` (请求体, object *(必填)*) — Login information

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/logout`
**操作**: `ApiController.Logout`
**描述**: 注销当前用户

**参数**:

- `id_token_hint` (查询参数, string) — id_token_hint
- `post_logout_redirect_uri` (查询参数, string) — post_logout_redirect_uri
- `state` (查询参数, string) — state

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/signup`
**操作**: `ApiController.Signup`
**描述**: 注册新用户

**参数**:

- `username` (表单参数, string *(必填)*) — The username to sign up
- `password` (表单参数, string *(必填)*) — The password

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/sso-logout`
**操作**: `ApiController.SsoLogout`
**描述**: 从所有应用注销当前用户

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/sso-logout`
**操作**: `ApiController.SsoLogout`
**描述**: 从所有应用注销当前用户

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/unlink`
**操作**: `ApiController.Unlink`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### GET `/auth/api/webauthn/signin/begin`
**操作**: `ApiController.WebAuthnSigninBegin`
**描述**: WebAuthn 登录流程第一阶段

**参数**:

- `owner` (查询参数, string *(必填)*) — owner
- `name` (查询参数, string *(必填)*) — name

**响应**:

- **200**: The CredentialAssertion object
object

---

### POST `/auth/api/webauthn/signin/finish`
**操作**: `ApiController.WebAuthnSigninFinish`
**描述**: WebAuthn 登录流程第二阶段

**参数**:

- `body` (请求体, object *(必填)*) — authenticator assertion Response

**响应**:

- **200**: "The Response object"

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## 多因素认证 API

### POST `/auth/api/delete-mfa/`
**操作**: `ApiController.DeleteMfa`
**描述**: 删除多因素认证

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/mfa/setup/enable`
**操作**: `ApiController.MfaSetupEnable`
**描述**: 启用 TOTP

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/mfa/setup/initiate`
**操作**: `ApiController.MfaSetupInitiate`
**描述**: 设置多因素认证

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/mfa/setup/verify`
**操作**: `ApiController.MfaSetupVerify`
**描述**: 验证 TOTP 设置

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/set-preferred-mfa`
**操作**: `ApiController.SetPreferredMfa`
**描述**: 设置首选多因素认证方式

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## 订单 API

### POST `/auth/api/add-order`
**操作**: `ApiController.AddOrder`
**描述**: 新增订单

**参数**:

- `body` (请求体, object *(必填)*) — The details of the order

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-order`
**操作**: `ApiController.GetOrder`
**描述**: 获取订单

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the order

**响应**:

- **200**: The Response object

  - `createdTime`: string
  - `displayName`: string
  - `endTime`: string
  - `message`: string
  - `name`: string
  - `owner`: string
  - `payment`: string
  - `productName`: string
  - `startTime`: string
  - `state`: string
  - `user`: string

---

### GET `/auth/api/get-orders`
**操作**: `ApiController.GetOrders`
**描述**: 获取订单列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of orders

**响应**:

- **200**: The Response object
Array&lt;object.Order&gt;

---

### GET `/auth/api/get-user-orders`
**操作**: `ApiController.GetUserOrders`
**描述**: 获取用户订单

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of orders
- `user` (查询参数, string *(必填)*) — The username of the user

**响应**:

- **200**: The Response object
Array&lt;object.Order&gt;

---

## 支付 API

### GET `/auth/api/get-payment`
**操作**: `ApiController.GetPayment`
**描述**: 获取支付信息

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the payment

**响应**:

- **200**: The Response object

  - `createdTime`: string
  - `currency`: string
  - `detail`: string
  - `displayName`: string
  - `invoiceRemark`: string
  - `invoiceTaxId`: string
  - `invoiceTitle`: string
  - `invoiceType`: string
  - `invoiceUrl`: string
  - `isRecharge`: boolean
  - `message`: string
  - `name`: string
  - `outOrderId`: string
  - `owner`: string
  - `payUrl`: string
  - `personEmail`: string
  - `personIdCard`: string
  - `personName`: string
  - `personPhone`: string
  - `price`: number
  - `productDisplayName`: string
  - `productName`: string
  - `provider`: string
  - `returnUrl`: string
  - `state`: string
  - `successUrl`: string
  - `tag`: string
  - `type`: string
  - `user`: string

---

### GET `/auth/api/get-payments`
**操作**: `ApiController.GetPayments`
**描述**: 获取支付列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of payments

**响应**:

- **200**: The Response object
Array&lt;object.Payment&gt;

---

### GET `/auth/api/get-user-payments`
**操作**: `ApiController.GetUserPayments`
**描述**: 获取用户支付记录

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of payments
- `organization` (查询参数, string *(必填)*) — The organization of the user
- `user` (查询参数, string *(必填)*) — The username of the user

**响应**:

- **200**: The Response object
Array&lt;object.Payment&gt;

---

### POST `/auth/api/invoice-payment`
**操作**: `ApiController.InvoicePayment`
**描述**: 开具发票

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the payment

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### POST `/auth/api/notify-payment`
**操作**: `ApiController.NotifyPayment`
**描述**: 支付通知

**参数**:

- `body` (请求体, object *(必填)*) — The details of the payment

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## 计划 API

### GET `/auth/api/get-plan`
**操作**: `ApiController.GetPlan`
**描述**: 获取计划

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the plan
- `includeOption` (查询参数, boolean) — Should include plan's option

**响应**:

- **200**: The Response object

  - `createdTime`: string
  - `currency`: string
  - `description`: string
  - `displayName`: string
  - `isEnabled`: boolean
  - `name`: string
  - `options`: Array&lt;string&gt;
  - `owner`: string
  - `paymentProviders`: Array&lt;string&gt;
  - `period`: string
  - `price`: number
  - `product`: string
  - `role`: string

---

### GET `/auth/api/get-plans`
**操作**: `ApiController.GetPlans`
**描述**: 获取计划列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of plans

**响应**:

- **200**: The Response object
Array&lt;object.Plan&gt;

---

## 定价 API

### GET `/auth/api/get-pricing`
**操作**: `ApiController.GetPricing`
**描述**: 获取定价

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the pricing

**响应**:

- **200**: The Response object

  - `application`: string
  - `createdTime`: string
  - `description`: string
  - `displayName`: string
  - `isEnabled`: boolean
  - `name`: string
  - `owner`: string
  - `plans`: Array&lt;string&gt;
  - `trialDuration`: integer

---

### GET `/auth/api/get-pricings`
**操作**: `ApiController.GetPricings`
**描述**: 获取定价列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of pricings

**响应**:

- **200**: The Response object
Array&lt;object.Pricing&gt;

---

## 商品 API

### POST `/auth/api/buy-product`
**操作**: `ApiController.BuyProduct`
**描述**: 购买商品

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the product
- `providerName` (查询参数, string *(必填)*) — The name of the provider

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-product`
**操作**: `ApiController.GetProduct`
**描述**: 获取商品

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the product

**响应**:

- **200**: The Response object

  - `createdTime`: string
  - `currency`: string
  - `description`: string
  - `detail`: string
  - `displayName`: string
  - `image`: string
  - `isRecharge`: boolean
  - `name`: string
  - `owner`: string
  - `price`: number
  - `providerObjs`: Array&lt;object.Provider&gt;
  - `providers`: Array&lt;string&gt;
  - `quantity`: integer
  - `returnUrl`: string
  - `sold`: integer
  - `state`: string
  - `successUrl`: string
  - `tag`: string

---

### GET `/auth/api/get-products`
**操作**: `ApiController.GetProducts`
**描述**: 获取商品列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of products

**响应**:

- **200**: The Response object
Array&lt;object.Product&gt;

---

## 资源 API

### GET `/auth/api/get-resource`
**操作**: `ApiController.GetResource`
**描述**: 获取资源

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of resource

**响应**:

- **200**: The Response object

  - `application`: string
  - `createdTime`: string
  - `description`: string
  - `fileFormat`: string
  - `fileName`: string
  - `fileSize`: integer
  - `fileType`: string
  - `name`: string
  - `owner`: string
  - `parent`: string
  - `provider`: string
  - `tag`: string
  - `url`: string
  - `user`: string

---

### GET `/auth/api/get-resources`
**操作**: `ApiController.GetResources`
**描述**: 获取资源列表

**参数**:

- `owner` (查询参数, string *(必填)*) — Owner
- `user` (查询参数, string *(必填)*) — User
- `pageSize` (查询参数, integer) — Page Size
- `p` (查询参数, integer) — Page Number
- `field` (查询参数, string) — Field
- `value` (查询参数, string) — Value
- `sortField` (查询参数, string) — Sort Field
- `sortOrder` (查询参数, string) — Sort Order

**响应**:

- **200**: The Response object
Array&lt;object.Resource&gt;

---

### POST `/auth/api/upload-resource`
**操作**: `ApiController.UploadResource`

**参数**:

- `owner` (查询参数, string *(必填)*) — Owner
- `user` (查询参数, string *(必填)*) — User
- `application` (查询参数, string *(必填)*) — Application
- `tag` (查询参数, string) — Tag
- `parent` (查询参数, string) — Parent
- `fullFilePath` (查询参数, string *(必填)*) — Full File Path
- `createdTime` (查询参数, string) — Created Time
- `description` (查询参数, string) — Description
- `file` (表单参数, file *(必填)*) — Resource file

**响应**:

- **200**: FileUrl, objectKey

  - `application`: string
  - `createdTime`: string
  - `description`: string
  - `fileFormat`: string
  - `fileName`: string
  - `fileSize`: integer
  - `fileType`: string
  - `name`: string
  - `owner`: string
  - `parent`: string
  - `provider`: string
  - `tag`: string
  - `url`: string
  - `user`: string

---

## 会话 API

### GET `/auth/api/get-session`
**操作**: `ApiController.GetSingleSession`
**描述**: 获取用户在某个应用中的会话

**参数**:

- `sessionPkId` (查询参数, string *(必填)*) — The id(organization/user/application) of session

**响应**:

- **200**: The Response object
Array&lt;string&gt;

---

### GET `/auth/api/is-session-duplicated`
**操作**: `ApiController.IsSessionDuplicated`
**描述**: 检查用户在某个应用中是否存在重复会话

**参数**:

- `sessionPkId` (查询参数, string *(必填)*) — The id(organization/user/application) of session
- `sessionId` (查询参数, string *(必填)*) — sessionId to be checked

**响应**:

- **200**: The Response object
Array&lt;string&gt;

---

## 订阅 API

### GET `/auth/api/get-subscription`
**操作**: `ApiController.GetSubscription`
**描述**: 获取订阅

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the subscription

**响应**:

- **200**: The Response object

  - `createdTime`: string
  - `description`: string
  - `displayName`: string
  - `endTime`: string
  - `name`: string
  - `owner`: string
  - `payment`: string
  - `period`: string
  - `plan`: string
  - `pricing`: string
  - `startTime`: string
  - `state`: string
  - `user`: string

---

### GET `/auth/api/get-subscriptions`
**操作**: `ApiController.GetSubscriptions`
**描述**: 获取订阅列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of subscriptions

**响应**:

- **200**: The Response object
Array&lt;object.Subscription&gt;

---

## 令牌 API

### GET `/auth/api/get-captcha-status`
**操作**: `ApiController.GetCaptchaStatus`
**描述**: 获取登录错误次数

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of user

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-token`
**操作**: `ApiController.GetToken`
**描述**: 获取令牌

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of token

**响应**:

- **200**: The Response object

  - `accessToken`: string
  - `accessTokenHash`: string
  - `application`: string
  - `code`: string
  - `codeChallenge`: string
  - `codeExpireIn`: integer
  - `codeIsUsed`: boolean
  - `createdTime`: string
  - `expiresIn`: integer
  - `name`: string
  - `organization`: string
  - `owner`: string
  - `refreshToken`: string
  - `refreshTokenHash`: string
  - `scope`: string
  - `tokenType`: string
  - `user`: string

---

### POST `/auth/api/login/oauth/access_token`
**操作**: `ApiController.GetOAuthToken`
**描述**: 获取 OAuth 访问令牌

**参数**:

- `grant_type` (查询参数, string *(必填)*) — OAuth grant type
- `client_id` (查询参数, string *(必填)*) — OAuth client id
- `client_secret` (查询参数, string *(必填)*) — OAuth client secret
- `code` (查询参数, string *(必填)*) — OAuth code

**响应**:

- **200**: The Response object

  - `access_token`: string
  - `expires_in`: integer
  - `id_token`: string
  - `refresh_token`: string
  - `scope`: string
  - `token_type`: string
- **400**: The Response object

  - `error`: string
  - `error_description`: string
- **401**: The Response object

  - `error`: string
  - `error_description`: string

---

### POST `/auth/api/login/oauth/refresh_token`
**操作**: `ApiController.RefreshToken`
**描述**: 刷新 OAuth 访问令牌

**参数**:

- `grant_type` (查询参数, string *(必填)*) — OAuth grant type
- `refresh_token` (查询参数, string *(必填)*) — OAuth refresh token
- `scope` (查询参数, string *(必填)*) — OAuth scope
- `client_id` (查询参数, string *(必填)*) — OAuth client id
- `client_secret` (查询参数, string) — OAuth client secret

**响应**:

- **200**: The Response object

  - `access_token`: string
  - `expires_in`: integer
  - `id_token`: string
  - `refresh_token`: string
  - `scope`: string
  - `token_type`: string
- **400**: The Response object

  - `error`: string
  - `error_description`: string
- **401**: The Response object

  - `error`: string
  - `error_description`: string

---

## 交易 API

### GET `/auth/api/get-transaction`
**操作**: `ApiController.GetTransaction`
**描述**: 获取交易

**参数**:

- `id` (查询参数, string *(必填)*) — The id ( owner/name ) of the transaction

**响应**:

- **200**: The Response object

  - `amount`: number
  - `application`: string
  - `category`: string
  - `createdTime`: string
  - `currency`: string
  - `displayName`: string
  - `domain`: string
  - `name`: string
  - `owner`: string
  - `payment`: string
  - `provider`: string
  - `state`: string
  - `subtype`: string
  - `tag`: string
  - `type`: string
  - `user`: string

---

### GET `/auth/api/get-transactions`
**操作**: `ApiController.GetTransactions`
**描述**: 获取交易列表

**参数**:

- `owner` (查询参数, string *(必填)*) — The owner of transactions

**响应**:

- **200**: The Response object
Array&lt;object.Transaction&gt;

---

## 用户 API

### POST `/auth/api/add-user-keys`
**操作**: `ApiController.AddUserKeys`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### POST `/auth/api/check-user-password`
**操作**: `ApiController.CheckUserPassword`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### GET `/auth/api/get-email-and-phone`
**操作**: `ApiController.GetEmailAndPhone`
**描述**: 通过用户名获取邮箱和手机号

**参数**:

- `username` (表单参数, string *(必填)*) — The username of the user
- `organization` (表单参数, string *(必填)*) — The organization of the user

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/get-user`
**操作**: `ApiController.GetUser`
**描述**: 获取用户

**参数**:

- `id` (查询参数, string) — The id ( owner/name ) of the user
- `owner` (查询参数, string) — The owner of the user
- `email` (查询参数, string) — The email of the user
- `phone` (查询参数, string) — The phone of the user
- `userId` (查询参数, string) — The userId of the user

**响应**:

- **200**: The Response object

  - `accessKey`: string
  - `accessSecret`: string
  - `accessToken`: string
  - `address`: Array&lt;string&gt;
  - `adfs`: string
  - `affiliation`: string
  - `alipay`: string
  - `amazon`: string
  - `apple`: string
  - `auth0`: string
  - `avatar`: string
  - `avatarType`: string
  - `azuread`: string
  - `azureadb2c`: string
  - `baidu`: string
  - `balance`: number
  - `balanceCredit`: number
  - `balanceCurrency`: string
  - `battlenet`: string
  - `bilibili`: string
  - `bio`: string
  - `birthday`: string
  - `bitbucket`: string
  - `box`: string
  - `casdoor`: string
  - `cloudfoundry`: string
  - `countryCode`: string
  - `createdIp`: string
  - `createdTime`: string
  - `currency`: string
  - `custom`: string
  - `custom10`: string
  - `custom2`: string
  - `custom3`: string
  - `custom4`: string
  - `custom5`: string
  - `custom6`: string
  - `custom7`: string
  - `custom8`: string
  - `custom9`: string
  - `dailymotion`: string
  - `deezer`: string
  - `deletedTime`: string
  - `digitalocean`: string
  - `dingtalk`: string
  - `discord`: string
  - `displayName`: string
  - `douyin`: string
  - `dropbox`: string
  - `education`: string
  - `email`: string
  - `emailVerified`: boolean
  - `eveonline`: string
  - `externalId`: string
  - `faceIds`: Array&lt;object.FaceId&gt;
  - `facebook`: string
  - `firstName`: string
  - `fitbit`: string
  - `gender`: string
  - `gitea`: string
  - `gitee`: string
  - `github`: string
  - `gitlab`: string
  - `google`: string
  - `groups`: Array&lt;string&gt;
  - `hash`: string
  - `heroku`: string
  - `homepage`: string
  - `id`: string
  - `idCard`: string
  - `idCardType`: string
  - `influxcloud`: string
  - `infoflow`: string
  - `instagram`: string
  - `intercom`: string
  - `invitation`: string
  - `invitationCode`: string
  - `ipWhitelist`: string
  - `isAdmin`: boolean
  - `isDefaultAvatar`: boolean
  - `isDeleted`: boolean
  - `isForbidden`: boolean
  - `isOnline`: boolean
  - `kakao`: string
  - `karma`: integer
  - `kwai`: string
  - `language`: string
  - `lark`: string
  - `lastChangePasswordTime`: string
  - `lastName`: string
  - `lastSigninIp`: string
  - `lastSigninTime`: string
  - `lastSigninWrongTime`: string
  - `lastfm`: string
  - `ldap`: string
  - `line`: string
  - `linkedin`: string
  - `location`: string
  - `mailru`: string
  - `managedAccounts`: Array&lt;object.ManagedAccount&gt;
  - `meetup`: string
  - `metamask`: string
  - `mfaAccounts`: Array&lt;object.MfaAccount&gt;
  - `mfaEmailEnabled`: boolean
  - `mfaItems`: Array&lt;object.MfaItem&gt;
  - `mfaPhoneEnabled`: boolean
  - `mfaPushEnabled`: boolean
  - `mfaPushProvider`: string
  - `mfaPushReceiver`: string
  - `mfaRadiusEnabled`: boolean
  - `mfaRadiusProvider`: string
  - `mfaRadiusUsername`: string
  - `mfaRememberDeadline`: string
  - `microsoftonline`: string
  - `multiFactorAuths`: Array&lt;object.MfaProps&gt;
  - `name`: string
  - `naver`: string
  - `needUpdatePassword`: boolean
  - `nextcloud`: string
  - `okta`: string
  - `onedrive`: string
  - `originalToken`: string
  - `oura`: string
  - `owner`: string
  - `password`: string
  - `passwordSalt`: string
  - `passwordType`: string
  - `patreon`: string
  - `paypal`: string
  - `permanentAvatar`: string
  - `permissions`: Array&lt;object.Permission&gt;
  - `phone`: string
  - `preHash`: string
  - `preferredMfaType`: string
  - `properties`: object
  - `qq`: string
  - `ranking`: integer
  - `recoveryCodes`: Array&lt;string&gt;
  - `region`: string
  - `registerSource`: string
  - `registerType`: string
  - `roles`: Array&lt;object.Role&gt;
  - `salesforce`: string
  - `score`: integer
  - `shopify`: string
  - `signinWrongTimes`: integer
  - `signupApplication`: string
  - `slack`: string
  - `soundcloud`: string
  - `spotify`: string
  - `steam`: string
  - `strava`: string
  - `stripe`: string
  - `tag`: string
  - `tiktok`: string
  - `title`: string
  - `totpSecret`: string
  - `tumblr`: string
  - `twitch`: string
  - `twitter`: string
  - `type`: string
  - `typetalk`: string
  - `uber`: string
  - `updatedTime`: string
  - `vk`: string
  - `web3onboard`: string
  - `webauthnCredentials`: Array&lt;webauthn.Credential&gt;
  - `wechat`: string
  - `wecom`: string
  - `weibo`: string
  - `wepay`: string
  - `xero`: string
  - `yahoo`: string
  - `yammer`: string
  - `yandex`: string
  - `zoom`: string

---

### POST `/auth/api/update-user`
**操作**: `ApiController.UpdateUser`
**描述**: 更新用户

**参数**:

- `id` (查询参数, string) — The id ( owner/name ) of the user
- `userId` (查询参数, string) — The userId (UUID) of the user
- `owner` (查询参数, string) — The owner of the user (required when using userId)
- `body` (请求体, object *(必填)*) — The details of the user

**响应**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

### GET `/auth/api/webauthn/signup/begin`
**操作**: `ApiController.WebAuthnSignupBegin`
**描述**: WebAuthn 注册流程第一阶段

**响应**:

- **200**: The CredentialCreationOptions object
object

---

### POST `/auth/api/webauthn/signup/finish`
**操作**: `ApiController.WebAuthnSignupFinish`
**描述**: WebAuthn 注册流程第二阶段

**参数**:

- `body` (请求体, object *(必填)*) — authenticator attestation Response

**响应**:

- **200**: "The Response object"

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## 验证 API

### POST `/auth/api/send-verification-code`
**操作**: `ApiController.SendVerificationCode`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### POST `/auth/api/verify-captcha`
**操作**: `ApiController.VerifyCaptcha`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

### POST `/auth/api/verify-code`
**操作**: `ApiController.VerifyCode`

**响应**:

- **200**: The Response object

  - `address`: string
  - `aud`: string
  - `email`: string
  - `email_verified`: boolean
  - `groups`: Array&lt;string&gt;
  - `iss`: string
  - `name`: string
  - `permissions`: Array&lt;string&gt;
  - `phone`: string
  - `picture`: string
  - `preferred_username`: string
  - `roles`: Array&lt;string&gt;
  - `sub`: string

---

## 数据模型

### `controllers.AuthForm`
类型: object

---

### `controllers.LaravelResponse`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `created_at` | string |  |
| `email` | string |  |
| `email_verified_at` | string |  |
| `id` | string |  |
| `name` | string |  |
| `updated_at` | string |  |

---

### `controllers.Response`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `data` | object |  |
| `data2` | object |  |
| `data3` | object |  |
| `msg` | string |  |
| `name` | string |  |
| `status` | string |  |
| `sub` | string |  |

---

### `object.FaceId`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `ImageUrl` | string |  |
| `faceIdData` | array |  |
| `name` | string |  |

---

### `object.Invitation`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `application` | string |  |
| `code` | string |  |
| `createdTime` | string |  |
| `defaultCode` | string |  |
| `displayName` | string |  |
| `email` | string |  |
| `isRegexp` | boolean |  |
| `name` | string |  |
| `owner` | string |  |
| `phone` | string |  |
| `quota` | integer |  |
| `signupGroup` | string |  |
| `state` | string |  |
| `updatedTime` | string |  |
| `usedCount` | integer |  |
| `username` | string |  |

---

### `object.ManagedAccount`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `application` | string |  |
| `password` | string |  |
| `signinUrl` | string |  |
| `username` | string |  |

---

### `object.MfaAccount`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `accountName` | string |  |
| `issuer` | string |  |
| `origin` | string |  |
| `secretKey` | string |  |

---

### `object.MfaItem`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string |  |
| `rule` | string |  |

---

### `object.MfaProps`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `countryCode` | string |  |
| `enabled` | boolean |  |
| `isPreferred` | boolean |  |
| `mfaRememberInHours` | integer |  |
| `mfaType` | string |  |
| `recoveryCodes` | array |  |
| `secret` | string |  |
| `url` | string |  |

---

### `object.Order`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `displayName` | string |  |
| `endTime` | string |  |
| `message` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `payment` | string |  |
| `productName` | string |  |
| `startTime` | string |  |
| `state` | string |  |
| `user` | string |  |

---

### `object.Payment`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `currency` | string |  |
| `detail` | string |  |
| `displayName` | string |  |
| `invoiceRemark` | string |  |
| `invoiceTaxId` | string |  |
| `invoiceTitle` | string |  |
| `invoiceType` | string |  |
| `invoiceUrl` | string |  |
| `isRecharge` | boolean |  |
| `message` | string |  |
| `name` | string |  |
| `outOrderId` | string |  |
| `owner` | string |  |
| `payUrl` | string |  |
| `personEmail` | string |  |
| `personIdCard` | string |  |
| `personName` | string |  |
| `personPhone` | string |  |
| `price` | number |  |
| `productDisplayName` | string |  |
| `productName` | string |  |
| `provider` | string |  |
| `returnUrl` | string |  |
| `state` | pp.PaymentState |  |
| `successUrl` | string |  |
| `tag` | string |  |
| `type` | string |  |
| `user` | string |  |

---

### `object.Permission`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `actions` | array |  |
| `adapter` | string |  |
| `approveTime` | string |  |
| `approver` | string |  |
| `createdTime` | string |  |
| `description` | string |  |
| `displayName` | string |  |
| `domains` | array |  |
| `effect` | string |  |
| `groups` | array |  |
| `isEnabled` | boolean |  |
| `model` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `resourceType` | string |  |
| `resources` | array |  |
| `roles` | array |  |
| `state` | string |  |
| `submitter` | string |  |
| `users` | array |  |

---

### `object.Plan`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `currency` | string |  |
| `description` | string |  |
| `displayName` | string |  |
| `isEnabled` | boolean |  |
| `name` | string |  |
| `options` | array |  |
| `owner` | string |  |
| `paymentProviders` | array |  |
| `period` | string |  |
| `price` | number |  |
| `product` | string |  |
| `role` | string |  |

---

### `object.Pricing`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `application` | string |  |
| `createdTime` | string |  |
| `description` | string |  |
| `displayName` | string |  |
| `isEnabled` | boolean |  |
| `name` | string |  |
| `owner` | string |  |
| `plans` | array |  |
| `trialDuration` | integer |  |

---

### `object.Product`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `currency` | string |  |
| `description` | string |  |
| `detail` | string |  |
| `displayName` | string |  |
| `image` | string |  |
| `isRecharge` | boolean |  |
| `name` | string |  |
| `owner` | string |  |
| `price` | number |  |
| `providerObjs` | Array&lt;object.Provider&gt; |  |
| `providers` | array |  |
| `quantity` | integer |  |
| `returnUrl` | string |  |
| `sold` | integer |  |
| `state` | string |  |
| `successUrl` | string |  |
| `tag` | string |  |

---

### `object.Provider`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `appId` | string |  |
| `bucket` | string |  |
| `category` | string |  |
| `cert` | string |  |
| `clientId` | string |  |
| `clientId2` | string |  |
| `clientSecret` | string |  |
| `clientSecret2` | string |  |
| `content` | string |  |
| `createdTime` | string |  |
| `customAuthUrl` | string |  |
| `customLogo` | string |  |
| `customTokenUrl` | string |  |
| `customUserInfoUrl` | string |  |
| `disableSsl` | boolean |  |
| `displayName` | string |  |
| `domain` | string |  |
| `emailRegex` | string |  |
| `enableProxy` | boolean |  |
| `enableSignAuthnRequest` | boolean |  |
| `endpoint` | string |  |
| `host` | string |  |
| `httpHeaders` | object |  |
| `idP` | string |  |
| `intranetEndpoint` | string |  |
| `issuerUrl` | string |  |
| `metadata` | string |  |
| `method` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `pathPrefix` | string |  |
| `port` | integer |  |
| `providerUrl` | string |  |
| `receiver` | string |  |
| `regionId` | string |  |
| `scopes` | string |  |
| `signName` | string |  |
| `subType` | string |  |
| `templateCode` | string |  |
| `title` | string |  |
| `type` | string |  |
| `userMapping` | object |  |

---

### `object.Resource`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `application` | string |  |
| `createdTime` | string |  |
| `description` | string |  |
| `fileFormat` | string |  |
| `fileName` | string |  |
| `fileSize` | integer |  |
| `fileType` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `parent` | string |  |
| `provider` | string |  |
| `tag` | string |  |
| `url` | string |  |
| `user` | string |  |

---

### `object.Role`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `description` | string |  |
| `displayName` | string |  |
| `domains` | array |  |
| `groups` | array |  |
| `isEnabled` | boolean |  |
| `name` | string |  |
| `owner` | string |  |
| `roles` | array |  |
| `users` | array |  |

---

### `object.Subscription`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `createdTime` | string |  |
| `description` | string |  |
| `displayName` | string |  |
| `endTime` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `payment` | string |  |
| `period` | string |  |
| `plan` | string |  |
| `pricing` | string |  |
| `startTime` | string |  |
| `state` | object.SubscriptionState |  |
| `user` | string |  |

---

### `object.SubscriptionState`
类型: string

---

### `object.Token`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `accessToken` | string |  |
| `accessTokenHash` | string |  |
| `application` | string |  |
| `code` | string |  |
| `codeChallenge` | string |  |
| `codeExpireIn` | integer |  |
| `codeIsUsed` | boolean |  |
| `createdTime` | string |  |
| `expiresIn` | integer |  |
| `name` | string |  |
| `organization` | string |  |
| `owner` | string |  |
| `refreshToken` | string |  |
| `refreshTokenHash` | string |  |
| `scope` | string |  |
| `tokenType` | string |  |
| `user` | string |  |

---

### `object.TokenError`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `error` | string |  |
| `error_description` | string |  |

---

### `object.TokenWrapper`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `access_token` | string |  |
| `expires_in` | integer |  |
| `id_token` | string |  |
| `refresh_token` | string |  |
| `scope` | string |  |
| `token_type` | string |  |

---

### `object.Transaction`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `amount` | number |  |
| `application` | string |  |
| `category` | string |  |
| `createdTime` | string |  |
| `currency` | string |  |
| `displayName` | string |  |
| `domain` | string |  |
| `name` | string |  |
| `owner` | string |  |
| `payment` | string |  |
| `provider` | string |  |
| `state` | pp.PaymentState |  |
| `subtype` | string |  |
| `tag` | string |  |
| `type` | string |  |
| `user` | string |  |

---

### `object.User`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `accessKey` | string |  |
| `accessSecret` | string |  |
| `accessToken` | string |  |
| `address` | array |  |
| `adfs` | string |  |
| `affiliation` | string |  |
| `alipay` | string |  |
| `amazon` | string |  |
| `apple` | string |  |
| `auth0` | string |  |
| `avatar` | string |  |
| `avatarType` | string |  |
| `azuread` | string |  |
| `azureadb2c` | string |  |
| `baidu` | string |  |
| `balance` | number |  |
| `balanceCredit` | number |  |
| `balanceCurrency` | string |  |
| `battlenet` | string |  |
| `bilibili` | string |  |
| `bio` | string |  |
| `birthday` | string |  |
| `bitbucket` | string |  |
| `box` | string |  |
| `casdoor` | string |  |
| `cloudfoundry` | string |  |
| `countryCode` | string |  |
| `createdIp` | string |  |
| `createdTime` | string |  |
| `currency` | string |  |
| `custom` | string |  |
| `custom10` | string |  |
| `custom2` | string |  |
| `custom3` | string |  |
| `custom4` | string |  |
| `custom5` | string |  |
| `custom6` | string |  |
| `custom7` | string |  |
| `custom8` | string |  |
| `custom9` | string |  |
| `dailymotion` | string |  |
| `deezer` | string |  |
| `deletedTime` | string |  |
| `digitalocean` | string |  |
| `dingtalk` | string |  |
| `discord` | string |  |
| `displayName` | string |  |
| `douyin` | string |  |
| `dropbox` | string |  |
| `education` | string |  |
| `email` | string |  |
| `emailVerified` | boolean |  |
| `eveonline` | string |  |
| `externalId` | string |  |
| `faceIds` | Array&lt;object.FaceId&gt; |  |
| `facebook` | string |  |
| `firstName` | string |  |
| `fitbit` | string |  |
| `gender` | string |  |
| `gitea` | string |  |
| `gitee` | string |  |
| `github` | string |  |
| `gitlab` | string |  |
| `google` | string |  |
| `groups` | array |  |
| `hash` | string |  |
| `heroku` | string |  |
| `homepage` | string |  |
| `id` | string |  |
| `idCard` | string |  |
| `idCardType` | string |  |
| `influxcloud` | string |  |
| `infoflow` | string |  |
| `instagram` | string |  |
| `intercom` | string |  |
| `invitation` | string |  |
| `invitationCode` | string |  |
| `ipWhitelist` | string |  |
| `isAdmin` | boolean |  |
| `isDefaultAvatar` | boolean |  |
| `isDeleted` | boolean |  |
| `isForbidden` | boolean |  |
| `isOnline` | boolean |  |
| `kakao` | string |  |
| `karma` | integer |  |
| `kwai` | string |  |
| `language` | string |  |
| `lark` | string |  |
| `lastChangePasswordTime` | string |  |
| `lastName` | string |  |
| `lastSigninIp` | string |  |
| `lastSigninTime` | string |  |
| `lastSigninWrongTime` | string |  |
| `lastfm` | string |  |
| `ldap` | string |  |
| `line` | string |  |
| `linkedin` | string |  |
| `location` | string |  |
| `mailru` | string |  |
| `managedAccounts` | Array&lt;object.ManagedAccount&gt; |  |
| `meetup` | string |  |
| `metamask` | string |  |
| `mfaAccounts` | Array&lt;object.MfaAccount&gt; |  |
| `mfaEmailEnabled` | boolean |  |
| `mfaItems` | Array&lt;object.MfaItem&gt; |  |
| `mfaPhoneEnabled` | boolean |  |
| `mfaPushEnabled` | boolean |  |
| `mfaPushProvider` | string |  |
| `mfaPushReceiver` | string |  |
| `mfaRadiusEnabled` | boolean |  |
| `mfaRadiusProvider` | string |  |
| `mfaRadiusUsername` | string |  |
| `mfaRememberDeadline` | string |  |
| `microsoftonline` | string |  |
| `multiFactorAuths` | Array&lt;object.MfaProps&gt; |  |
| `name` | string |  |
| `naver` | string |  |
| `needUpdatePassword` | boolean |  |
| `nextcloud` | string |  |
| `okta` | string |  |
| `onedrive` | string |  |
| `originalToken` | string |  |
| `oura` | string |  |
| `owner` | string |  |
| `password` | string |  |
| `passwordSalt` | string |  |
| `passwordType` | string |  |
| `patreon` | string |  |
| `paypal` | string |  |
| `permanentAvatar` | string |  |
| `permissions` | Array&lt;object.Permission&gt; |  |
| `phone` | string |  |
| `preHash` | string |  |
| `preferredMfaType` | string |  |
| `properties` | object |  |
| `qq` | string |  |
| `ranking` | integer |  |
| `recoveryCodes` | array |  |
| `region` | string |  |
| `registerSource` | string |  |
| `registerType` | string |  |
| `roles` | Array&lt;object.Role&gt; |  |
| `salesforce` | string |  |
| `score` | integer |  |
| `shopify` | string |  |
| `signinWrongTimes` | integer |  |
| `signupApplication` | string |  |
| `slack` | string |  |
| `soundcloud` | string |  |
| `spotify` | string |  |
| `steam` | string |  |
| `strava` | string |  |
| `stripe` | string |  |
| `tag` | string |  |
| `tiktok` | string |  |
| `title` | string |  |
| `totpSecret` | string |  |
| `tumblr` | string |  |
| `twitch` | string |  |
| `twitter` | string |  |
| `type` | string |  |
| `typetalk` | string |  |
| `uber` | string |  |
| `updatedTime` | string |  |
| `vk` | string |  |
| `web3onboard` | string |  |
| `webauthnCredentials` | Array&lt;webauthn.Credential&gt; |  |
| `wechat` | string |  |
| `wecom` | string |  |
| `weibo` | string |  |
| `wepay` | string |  |
| `xero` | string |  |
| `yahoo` | string |  |
| `yammer` | string |  |
| `yandex` | string |  |
| `zoom` | string |  |

---

### `object.Userinfo`
类型: object

| 字段 | 类型 | 说明 |
|---|---|---|
| `address` | string |  |
| `aud` | string |  |
| `email` | string |  |
| `email_verified` | boolean |  |
| `groups` | array |  |
| `iss` | string |  |
| `name` | string |  |
| `permissions` | array |  |
| `phone` | string |  |
| `picture` | string |  |
| `preferred_username` | string |  |
| `roles` | array |  |
| `sub` | string |  |

---

### `pp.PaymentState`
类型: string

---

### `protocol.CredentialAssertion`
类型: object

---

### `protocol.CredentialAssertionResponse`
类型: object

---

### `protocol.CredentialCreation`
类型: object

---

### `protocol.CredentialCreationResponse`
类型: object

---

### `webauthn.Credential`
类型: object

---
