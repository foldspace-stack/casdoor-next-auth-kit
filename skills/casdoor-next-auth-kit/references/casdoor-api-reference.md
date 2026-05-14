# Casdoor RESTful API Reference

> Personal / User / Product / Payment / Subscription related APIs only.
> All paths have `/auth/` prefix in deployment.
> Based on Casdoor v1.503.0

## Overview

| Category | Endpoints |
|---|---|
| Account API | 5 |
| Invitation API | 5 |
| Login API | 11 |
| MFA API | 5 |
| Order API | 4 |
| Payment API | 5 |
| Plan API | 2 |
| Pricing API | 2 |
| Product API | 3 |
| Resource API | 3 |
| Session API | 2 |
| Subscription API | 2 |
| Token API | 4 |
| Transaction API | 2 |
| User API | 7 |
| Verification API | 3 |
| **Total** | **65** |

## Account API

### GET `/auth/api/get-account`
**Operation**: `ApiController.GetAccount`
**Description**: get the details of the current account

**Responses**:

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
**Operation**: `ApiController.ResetEmailOrPhone`

**Responses**:

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
**Operation**: `ApiController.SetPassword`
**Description**: set password

**Parameters**:

- `userOwner` (formData, string *(required)*) — The owner of the user
- `userName` (formData, string *(required)*) — The name of the user
- `oldPassword` (formData, string *(required)*) — The old password of the user
- `newPassword` (formData, string *(required)*) — The new password of the user

**Responses**:

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
**Operation**: `ApiController.UserInfo2`
**Description**: return Laravel compatible user information according to OAuth 2.0

**Responses**:

- **200**: The Response object

  - `created_at`: string
  - `email`: string
  - `email_verified_at`: string
  - `id`: string
  - `name`: string
  - `updated_at`: string

---

### GET `/auth/api/userinfo`
**Operation**: `ApiController.UserInfo`
**Description**: return user information according to OIDC standards

**Responses**:

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

## Invitation API

### GET `/auth/api/get-invitation`
**Operation**: `ApiController.GetInvitation`
**Description**: get invitation

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the invitation

**Responses**:

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
**Operation**: `ApiController.GetInvitationCodeInfo`
**Description**: get invitation code information

**Parameters**:

- `code` (query, string *(required)*) — Invitation code

**Responses**:

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
**Operation**: `ApiController.GetInvitations`
**Description**: get invitations

**Parameters**:

- `owner` (query, string *(required)*) — The owner of invitations

**Responses**:

- **200**: The Response object
Array&lt;object.Invitation&gt;

---

### POST `/auth/api/send-invitation`
**Operation**: `ApiController.VerifyInvitation`
**Description**: verify invitation

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the invitation
- `body` (body, array *(required)*) — The details of the invitation

**Responses**:

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
**Operation**: `ApiController.VerifyInvitation`
**Description**: verify invitation

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the invitation

**Responses**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## Login API

### GET `/auth/api/faceid-signin-begin`
**Operation**: `ApiController.FaceIDSigninBegin`
**Description**: FaceId Login Flow 1st stage

**Parameters**:

- `owner` (query, string *(required)*) — owner
- `name` (query, string *(required)*) — name

**Responses**:

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
**Operation**: `ApiController.GetApplicationLogin`
**Description**: get application login

**Parameters**:

- `clientId` (query, string *(required)*) — client id
- `responseType` (query, string *(required)*) — response type
- `redirectUri` (query, string *(required)*) — redirect uri
- `scope` (query, string *(required)*) — scope
- `state` (query, string *(required)*) — state

**Responses**:

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
**Operation**: `ApiController.GetCaptcha`

**Responses**:

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
**Operation**: `ApiController.Login`
**Description**: login

**Parameters**:

- `clientId` (query, string *(required)*) — clientId
- `responseType` (query, string *(required)*) — responseType
- `redirectUri` (query, string *(required)*) — redirectUri
- `scope` (query, string) — scope
- `state` (query, string) — state
- `nonce` (query, string) — nonce
- `code_challenge_method` (query, string) — code_challenge_method
- `code_challenge` (query, string) — code_challenge
- `form` (body, object *(required)*) — Login information

**Responses**:

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
**Operation**: `ApiController.Logout`
**Description**: logout the current user

**Parameters**:

- `id_token_hint` (query, string) — id_token_hint
- `post_logout_redirect_uri` (query, string) — post_logout_redirect_uri
- `state` (query, string) — state

**Responses**:

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
**Operation**: `ApiController.Signup`
**Description**: sign up a new user

**Parameters**:

- `username` (formData, string *(required)*) — The username to sign up
- `password` (formData, string *(required)*) — The password

**Responses**:

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
**Operation**: `ApiController.SsoLogout`
**Description**: logout the current user from all applications

**Responses**:

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
**Operation**: `ApiController.SsoLogout`
**Description**: logout the current user from all applications

**Responses**:

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
**Operation**: `ApiController.Unlink`

**Responses**:

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
**Operation**: `ApiController.WebAuthnSigninBegin`
**Description**: WebAuthn Login Flow 1st stage

**Parameters**:

- `owner` (query, string *(required)*) — owner
- `name` (query, string *(required)*) — name

**Responses**:

- **200**: The CredentialAssertion object
object

---

### POST `/auth/api/webauthn/signin/finish`
**Operation**: `ApiController.WebAuthnSigninFinish`
**Description**: WebAuthn Login Flow 2nd stage

**Parameters**:

- `body` (body, object *(required)*) — authenticator assertion Response

**Responses**:

- **200**: "The Response object"

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## MFA API

### POST `/auth/api/delete-mfa/`
**Operation**: `ApiController.DeleteMfa`
**Description**: : Delete MFA

**Responses**:

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
**Operation**: `ApiController.MfaSetupEnable`
**Description**: enable totp

**Responses**:

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
**Operation**: `ApiController.MfaSetupInitiate`
**Description**: setup MFA

**Responses**:

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
**Operation**: `ApiController.MfaSetupVerify`
**Description**: setup verify totp

**Responses**:

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
**Operation**: `ApiController.SetPreferredMfa`
**Description**: : Set specific Mfa Preferred

**Responses**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## Order API

### POST `/auth/api/add-order`
**Operation**: `ApiController.AddOrder`
**Description**: add order

**Parameters**:

- `body` (body, object *(required)*) — The details of the order

**Responses**:

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
**Operation**: `ApiController.GetOrder`
**Description**: get order

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the order

**Responses**:

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
**Operation**: `ApiController.GetOrders`
**Description**: get orders

**Parameters**:

- `owner` (query, string *(required)*) — The owner of orders

**Responses**:

- **200**: The Response object
Array&lt;object.Order&gt;

---

### GET `/auth/api/get-user-orders`
**Operation**: `ApiController.GetUserOrders`
**Description**: get orders for a user

**Parameters**:

- `owner` (query, string *(required)*) — The owner of orders
- `user` (query, string *(required)*) — The username of the user

**Responses**:

- **200**: The Response object
Array&lt;object.Order&gt;

---

## Payment API

### GET `/auth/api/get-payment`
**Operation**: `ApiController.GetPayment`
**Description**: get payment

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the payment

**Responses**:

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
**Operation**: `ApiController.GetPayments`
**Description**: get payments

**Parameters**:

- `owner` (query, string *(required)*) — The owner of payments

**Responses**:

- **200**: The Response object
Array&lt;object.Payment&gt;

---

### GET `/auth/api/get-user-payments`
**Operation**: `ApiController.GetUserPayments`
**Description**: get payments for a user

**Parameters**:

- `owner` (query, string *(required)*) — The owner of payments
- `organization` (query, string *(required)*) — The organization of the user
- `user` (query, string *(required)*) — The username of the user

**Responses**:

- **200**: The Response object
Array&lt;object.Payment&gt;

---

### POST `/auth/api/invoice-payment`
**Operation**: `ApiController.InvoicePayment`
**Description**: invoice payment

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the payment

**Responses**:

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
**Operation**: `ApiController.NotifyPayment`
**Description**: notify payment

**Parameters**:

- `body` (body, object *(required)*) — The details of the payment

**Responses**:

- **200**: The Response object

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## Plan API

### GET `/auth/api/get-plan`
**Operation**: `ApiController.GetPlan`
**Description**: get plan

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the plan
- `includeOption` (query, boolean) — Should include plan's option

**Responses**:

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
**Operation**: `ApiController.GetPlans`
**Description**: get plans

**Parameters**:

- `owner` (query, string *(required)*) — The owner of plans

**Responses**:

- **200**: The Response object
Array&lt;object.Plan&gt;

---

## Pricing API

### GET `/auth/api/get-pricing`
**Operation**: `ApiController.GetPricing`
**Description**: get pricing

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the pricing

**Responses**:

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
**Operation**: `ApiController.GetPricings`
**Description**: get pricings

**Parameters**:

- `owner` (query, string *(required)*) — The owner of pricings

**Responses**:

- **200**: The Response object
Array&lt;object.Pricing&gt;

---

## Product API

### POST `/auth/api/buy-product`
**Operation**: `ApiController.BuyProduct`
**Description**: buy product

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the product
- `providerName` (query, string *(required)*) — The name of the provider

**Responses**:

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
**Operation**: `ApiController.GetProduct`
**Description**: get product

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the product

**Responses**:

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
**Operation**: `ApiController.GetProducts`
**Description**: get products

**Parameters**:

- `owner` (query, string *(required)*) — The owner of products

**Responses**:

- **200**: The Response object
Array&lt;object.Product&gt;

---

## Resource API

### GET `/auth/api/get-resource`
**Operation**: `ApiController.GetResource`
**Description**: get resource

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of resource

**Responses**:

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
**Operation**: `ApiController.GetResources`
**Description**: get resources

**Parameters**:

- `owner` (query, string *(required)*) — Owner
- `user` (query, string *(required)*) — User
- `pageSize` (query, integer) — Page Size
- `p` (query, integer) — Page Number
- `field` (query, string) — Field
- `value` (query, string) — Value
- `sortField` (query, string) — Sort Field
- `sortOrder` (query, string) — Sort Order

**Responses**:

- **200**: The Response object
Array&lt;object.Resource&gt;

---

### POST `/auth/api/upload-resource`
**Operation**: `ApiController.UploadResource`

**Parameters**:

- `owner` (query, string *(required)*) — Owner
- `user` (query, string *(required)*) — User
- `application` (query, string *(required)*) — Application
- `tag` (query, string) — Tag
- `parent` (query, string) — Parent
- `fullFilePath` (query, string *(required)*) — Full File Path
- `createdTime` (query, string) — Created Time
- `description` (query, string) — Description
- `file` (formData, file *(required)*) — Resource file

**Responses**:

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

## Session API

### GET `/auth/api/get-session`
**Operation**: `ApiController.GetSingleSession`
**Description**: Get session for one user in one application.

**Parameters**:

- `sessionPkId` (query, string *(required)*) — The id(organization/user/application) of session

**Responses**:

- **200**: The Response object
Array&lt;string&gt;

---

### GET `/auth/api/is-session-duplicated`
**Operation**: `ApiController.IsSessionDuplicated`
**Description**: Check if there are other different sessions for one user in one application.

**Parameters**:

- `sessionPkId` (query, string *(required)*) — The id(organization/user/application) of session
- `sessionId` (query, string *(required)*) — sessionId to be checked

**Responses**:

- **200**: The Response object
Array&lt;string&gt;

---

## Subscription API

### GET `/auth/api/get-subscription`
**Operation**: `ApiController.GetSubscription`
**Description**: get subscription

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the subscription

**Responses**:

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
**Operation**: `ApiController.GetSubscriptions`
**Description**: get subscriptions

**Parameters**:

- `owner` (query, string *(required)*) — The owner of subscriptions

**Responses**:

- **200**: The Response object
Array&lt;object.Subscription&gt;

---

## Token API

### GET `/auth/api/get-captcha-status`
**Operation**: `ApiController.GetCaptchaStatus`
**Description**: Get Login Error Counts

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of user

**Responses**:

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
**Operation**: `ApiController.GetToken`
**Description**: get token

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of token

**Responses**:

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
**Operation**: `ApiController.GetOAuthToken`
**Description**: get OAuth access token

**Parameters**:

- `grant_type` (query, string *(required)*) — OAuth grant type
- `client_id` (query, string *(required)*) — OAuth client id
- `client_secret` (query, string *(required)*) — OAuth client secret
- `code` (query, string *(required)*) — OAuth code

**Responses**:

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
**Operation**: `ApiController.RefreshToken`
**Description**: refresh OAuth access token

**Parameters**:

- `grant_type` (query, string *(required)*) — OAuth grant type
- `refresh_token` (query, string *(required)*) — OAuth refresh token
- `scope` (query, string *(required)*) — OAuth scope
- `client_id` (query, string *(required)*) — OAuth client id
- `client_secret` (query, string) — OAuth client secret

**Responses**:

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

## Transaction API

### GET `/auth/api/get-transaction`
**Operation**: `ApiController.GetTransaction`
**Description**: get transaction

**Parameters**:

- `id` (query, string *(required)*) — The id ( owner/name ) of the transaction

**Responses**:

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
**Operation**: `ApiController.GetTransactions`
**Description**: get transactions

**Parameters**:

- `owner` (query, string *(required)*) — The owner of transactions

**Responses**:

- **200**: The Response object
Array&lt;object.Transaction&gt;

---

## User API

### POST `/auth/api/add-user-keys`
**Operation**: `ApiController.AddUserKeys`

**Responses**:

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
**Operation**: `ApiController.CheckUserPassword`

**Responses**:

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
**Operation**: `ApiController.GetEmailAndPhone`
**Description**: get email and phone by username

**Parameters**:

- `username` (formData, string *(required)*) — The username of the user
- `organization` (formData, string *(required)*) — The organization of the user

**Responses**:

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
**Operation**: `ApiController.GetUser`
**Description**: get user

**Parameters**:

- `id` (query, string) — The id ( owner/name ) of the user
- `owner` (query, string) — The owner of the user
- `email` (query, string) — The email of the user
- `phone` (query, string) — The phone of the user
- `userId` (query, string) — The userId of the user

**Responses**:

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
**Operation**: `ApiController.UpdateUser`
**Description**: update user

**Parameters**:

- `id` (query, string) — The id ( owner/name ) of the user
- `userId` (query, string) — The userId (UUID) of the user
- `owner` (query, string) — The owner of the user (required when using userId)
- `body` (body, object *(required)*) — The details of the user

**Responses**:

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
**Operation**: `ApiController.WebAuthnSignupBegin`
**Description**: WebAuthn Registration Flow 1st stage

**Responses**:

- **200**: The CredentialCreationOptions object
object

---

### POST `/auth/api/webauthn/signup/finish`
**Operation**: `ApiController.WebAuthnSignupFinish`
**Description**: WebAuthn Registration Flow 2nd stage

**Parameters**:

- `body` (body, object *(required)*) — authenticator attestation Response

**Responses**:

- **200**: "The Response object"

  - `data`: object
  - `data2`: object
  - `data3`: object
  - `msg`: string
  - `name`: string
  - `status`: string
  - `sub`: string

---

## Verification API

### POST `/auth/api/send-verification-code`
**Operation**: `ApiController.SendVerificationCode`

**Responses**:

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
**Operation**: `ApiController.VerifyCaptcha`

**Responses**:

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
**Operation**: `ApiController.VerifyCode`

**Responses**:

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

## Data Models

### `controllers.AuthForm`
Type: object

---

### `controllers.LaravelResponse`
Type: object

| Field | Type | Description |
|---|---|---|
| `created_at` | string |  |
| `email` | string |  |
| `email_verified_at` | string |  |
| `id` | string |  |
| `name` | string |  |
| `updated_at` | string |  |

---

### `controllers.Response`
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
|---|---|---|
| `ImageUrl` | string |  |
| `faceIdData` | array |  |
| `name` | string |  |

---

### `object.Invitation`
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
|---|---|---|
| `application` | string |  |
| `password` | string |  |
| `signinUrl` | string |  |
| `username` | string |  |

---

### `object.MfaAccount`
Type: object

| Field | Type | Description |
|---|---|---|
| `accountName` | string |  |
| `issuer` | string |  |
| `origin` | string |  |
| `secretKey` | string |  |

---

### `object.MfaItem`
Type: object

| Field | Type | Description |
|---|---|---|
| `name` | string |  |
| `rule` | string |  |

---

### `object.MfaProps`
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: string

---

### `object.Token`
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
|---|---|---|
| `error` | string |  |
| `error_description` | string |  |

---

### `object.TokenWrapper`
Type: object

| Field | Type | Description |
|---|---|---|
| `access_token` | string |  |
| `expires_in` | integer |  |
| `id_token` | string |  |
| `refresh_token` | string |  |
| `scope` | string |  |
| `token_type` | string |  |

---

### `object.Transaction`
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: object

| Field | Type | Description |
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
Type: string

---

### `protocol.CredentialAssertion`
Type: object

---

### `protocol.CredentialAssertionResponse`
Type: object

---

### `protocol.CredentialCreation`
Type: object

---

### `protocol.CredentialCreationResponse`
Type: object

---

### `webauthn.Credential`
Type: object

---
