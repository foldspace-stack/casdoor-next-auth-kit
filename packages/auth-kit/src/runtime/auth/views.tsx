import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { buildAuthThemeStyle, mergeClassName, type AuthThemeTokens } from './theme.ts';
import type { AuthUser } from '../shared/types.ts';
import type { AuthUserSummary } from './hooks.ts';
import type {
  BillingItem,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
  BillingProductState,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
  BillingCreditsState,
  BillingCasdoorAccountDetail,
  BillingCasdoorApplicationDetail,
} from '../shared/types.ts';

type BoxProps = HTMLAttributes<HTMLDivElement> & { style?: CSSProperties };

export interface AuthDocumentProps {
  title: string;
  description: string;
  theme?: AuthThemeTokens;
  children: ReactNode;
}

export interface AuthShellProps extends BoxProps {
  theme?: AuthThemeTokens;
}

export interface AuthLoginViewProps {
  appName: string;
  organizationName: string;
  description?: string;
  authorizeHref: string;
  signupHref: string;
  redirect?: string | null;
  application?: BillingCasdoorApplicationDetail | null;
  account?: BillingCasdoorAccountDetail | null;
  session?: AuthUserSummary | AuthUser | null;
  theme?: AuthThemeTokens;
}

export interface AuthSignupViewProps {
  appName: string;
  organizationName: string;
  description?: string;
  authorizeHref: string;
  loginHref: string;
  application?: BillingCasdoorApplicationDetail | null;
  session?: AuthUserSummary | AuthUser | null;
  theme?: AuthThemeTokens;
}

export interface AuthAccountViewProps {
  appName: string;
  organizationName: string;
  loginHref: string;
  signupHref: string;
  logoutHref: string;
  session?: AuthUserSummary | AuthUser | null;
  application?: BillingCasdoorApplicationDetail | null;
  account?: BillingCasdoorAccountDetail | null;
  subscription?: BillingSubscriptionState | null;
  subscriptionHistory?: BillingSubscriptionHistoryItem[] | null;
  subscriptionPlans?: BillingItem[] | null;
  credits?: BillingCreditsState | null;
  products?: BillingProductState[] | null;
  orderHistory?: BillingOrderHistoryItem[] | null;
  paymentHistory?: BillingPaymentHistoryItem[] | null;
  onSubscribePlan?: (planKey: string) => void | Promise<void>;
  onPurchaseProduct?: (productKey: string, providerName?: string) => void | Promise<void>;
  theme?: AuthThemeTokens;
  className?: string;
}

function ThemeFrame({ children, theme, className, style, ...props }: AuthShellProps) {
  return (
    <div
      {...props}
      className={mergeClassName('auth-kit-shell', className)}
      style={{
        ...buildAuthThemeStyle(theme),
        minHeight: '100dvh',
        background: 'var(--page-backdrop)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-family)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AuthDocument({ title, description, theme, children }: AuthDocumentProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content={description} />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0 }}>
        <ThemeFrame theme={theme}>{children}</ThemeFrame>
      </body>
    </html>
  );
}

export function AuthSurface({ children, theme, className, style, ...props }: AuthShellProps) {
  return (
    <ThemeFrame {...props} theme={theme} className={className} style={style}>
      <div
        style={{
          width: 'min(100%, 1120px)',
          margin: '0 auto',
          padding: '32px 20px 72px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </ThemeFrame>
  );
}

export function Card({
  children,
  className,
  style,
  ...props
}: BoxProps) {
  return (
    <section
      {...props}
      className={mergeClassName('auth-kit-card', className)}
      style={{
        borderRadius: 'calc(var(--radius) + 0.5rem)',
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        backdropFilter: 'blur(10px)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className, style, ...props }: BoxProps) {
  return <header {...props} className={mergeClassName('auth-kit-card-header', className)} style={{ padding: '24px 24px 0', ...style }}>{children}</header>;
}

export function CardBody({ children, className, style, ...props }: BoxProps) {
  return <div {...props} className={mergeClassName('auth-kit-card-body', className)} style={{ padding: 24, ...style }}>{children}</div>;
}

export function CardFooter({ children, className, style, ...props }: BoxProps) {
  return <footer {...props} className={mergeClassName('auth-kit-card-footer', className)} style={{ padding: '0 24px 24px', ...style }}>{children}</footer>;
}

export function Button({
  children,
  href,
  variant = 'default',
  className,
  style,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { href?: string; variant?: 'default' | 'secondary' | 'ghost' | 'outline'; style?: CSSProperties }) {
  const background =
    variant === 'secondary'
      ? 'var(--secondary)'
      : variant === 'ghost'
        ? 'transparent'
        : 'var(--primary)';
  const color =
    variant === 'secondary'
      ? 'var(--secondary-foreground)'
      : variant === 'ghost'
        ? 'var(--foreground)'
        : 'var(--primary-foreground)';

  return (
    <a
      {...props}
      href={href}
      className={mergeClassName('auth-kit-button', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 16px',
        borderRadius: '9999px',
        textDecoration: 'none',
        border: variant === 'outline' ? '1px solid var(--border)' : variant === 'ghost' ? '1px solid transparent' : '1px solid transparent',
        background,
        color,
        transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
        ...style,
      }}
    >
      {children}
    </a>
  );
}

export function Input({
  className,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={mergeClassName('auth-kit-input', className)}
      style={{
        width: '100%',
        minHeight: 44,
        boxSizing: 'border-box',
        padding: '0 14px',
        borderRadius: '9999px',
        border: '1px solid var(--border)',
        background: 'var(--input)',
        color: 'var(--foreground)',
        outline: 'none',
        boxShadow: '0 0 0 0 transparent',
        ...style,
      }}
    />
  );
}

export function Badge({ children, className, style, ...props }: BoxProps) {
  return (
    <span
      {...props}
      className={mergeClassName('auth-kit-badge', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 26,
        padding: '0 10px',
        borderRadius: '9999px',
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.03em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Divider({ className, style, ...props }: BoxProps) {
  return <div {...props} className={mergeClassName('auth-kit-divider', className)} style={{ height: 1, background: 'var(--border)', ...style }} />;
}

export function Stat({ label, value, className, style }: { label: string; value: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={mergeClassName('auth-kit-stat', className)}
      style={{
        padding: 16,
        borderRadius: '1rem',
        background: 'var(--muted)',
        border: '1px solid var(--border)',
        ...style,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

export function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.2 }}>{title}</h2>
          {description ? <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LoginView({
  appName,
  organizationName,
  description,
  authorizeHref,
  signupHref,
  redirect,
  application,
  account,
  session,
  theme,
}: AuthLoginViewProps) {
  return (
    <AuthDocument title={`${appName} - 登录`} description={description || `${appName} 登录入口`} theme={theme}>
      <AuthSurface theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 20, alignItems: 'stretch' }}>
          <Card>
            <CardHeader>
              <Badge>Login</Badge>
              <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.08 }}>{appName}</h1>
                <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                  使用同一套 Casdoor 授权链路进入宿主站点，登录状态、回跳和会话都保留在当前域名内。
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}>登录入口</label>
                  <Input readOnly value={authorizeHref} aria-label="authorize-url" />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Button href={authorizeHref}>继续登录</Button>
                  <Button href={signupHref} variant="outline">去注册</Button>
                </div>
                {redirect ? <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>登录后会回到 {redirect}</p> : null}
              </div>
            </CardBody>
            <CardFooter>
              <div style={{ display: 'grid', gap: 12 }}>
                <Divider />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--muted-foreground)', fontSize: 13 }}>
                  <span>{organizationName}</span>
                  <span>·</span>
                  <span>{session?.email ?? account?.email ?? '未登录'}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Badge>应用信息</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>{application?.displayName || application?.name || appName}</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 12 }}>
                <Stat label="组织" value={application?.organization || organizationName} />
                <Stat label="登录状态" value={session ? '已登录' : '等待授权'} />
                <Stat label="邮箱" value={session?.email ?? account?.email ?? '未连接'} />
                <Stat label="角色" value={(session as AuthUserSummary | AuthUser | null | undefined)?.role ?? 'guest'} />
              </div>
            </CardBody>
          </Card>
        </div>
      </AuthSurface>
    </AuthDocument>
  );
}

export function SignupView({
  appName,
  organizationName,
  description,
  authorizeHref,
  loginHref,
  application,
  session,
  theme,
}: AuthSignupViewProps) {
  return (
    <AuthDocument title={`${appName} - 注册`} description={description || `${appName} 注册入口`} theme={theme}>
      <AuthSurface theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 20, alignItems: 'stretch' }}>
          <Card>
            <CardHeader>
              <Badge>Signup</Badge>
              <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.08 }}>创建 {appName} 账号</h1>
                <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                  保持登录、购买和回跳在同一个站点内完成，避免跳到 Casdoor 原生页面后再回来。
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}>注册入口</label>
                  <Input readOnly value={authorizeHref} aria-label="signup-authorize-url" />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Button href={authorizeHref}>继续注册</Button>
                  <Button href={loginHref} variant="outline">返回登录</Button>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <div style={{ display: 'grid', gap: 12 }}>
                <Divider />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--muted-foreground)', fontSize: 13 }}>
                  <span>{organizationName}</span>
                  <span>·</span>
                  <span>{session?.email ?? '未登录'}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Badge>能力</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>当前应用可用项</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 12 }}>
                <Stat label="应用名" value={application?.displayName || application?.name || appName} />
                <Stat label="组织" value={application?.organization || organizationName} />
                <Stat label="注册状态" value={application?.enableSignUp === false ? '关闭' : '开放'} />
                <Stat label="当前用户" value={session?.email ?? '匿名访问'} />
              </div>
            </CardBody>
          </Card>
        </div>
      </AuthSurface>
    </AuthDocument>
  );
}

function formatMoney(value?: number | null, currency?: string | null): string {
  if (typeof value !== 'number') {
    return '未知';
  }

  if (currency) {
    return `${currency} ${value}`;
  }

  return String(value);
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '未知';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN');
}

export function AccountView({
  appName,
  organizationName,
  loginHref,
  signupHref,
  logoutHref,
  session,
  application,
  account,
  subscription,
  subscriptionHistory,
  subscriptionPlans,
  credits,
  products,
  orderHistory,
  paymentHistory,
  onSubscribePlan,
  onPurchaseProduct,
  theme,
  className,
}: AuthAccountViewProps) {
  return (
    <AuthSurface theme={theme} className={className}>
      <div style={{ display: 'grid', gap: 20 }}>
        <Card>
          <CardHeader>
            <Badge>Profile</Badge>
            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.08 }}>{session?.name || account?.displayName || appName}</h1>
              <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                账户信息、订阅状态和积分余额都在这里统一展示，方便宿主把 SaaS 体验包起来。
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <Stat label="邮箱" value={session?.email || account?.email || '未登录'} />
              <Stat label="角色" value={(session as AuthUserSummary | AuthUser | null | undefined)?.role || (account?.isAdmin ? 'admin' : 'user')} />
              <Stat label="积分" value={credits?.balance ?? (session as AuthUserSummary | AuthUser | null | undefined)?.tokenBalance ?? account?.balanceCredit ?? 0} />
              <Stat label="状态" value={session ? '在线' : '离线'} />
            </div>
          </CardBody>
          <CardFooter>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button href={logoutHref}>退出登录</Button>
              <Button href={loginHref} variant="outline">重新登录</Button>
              <Button href={signupHref} variant="outline">去注册</Button>
            </div>
          </CardFooter>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Card>
            <CardHeader>
              <Badge>Subscription</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>订阅状态</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 12 }}>
                <Stat label="当前订阅" value={subscription?.planName || subscription?.subscriptionId || '未订阅'} />
                <Stat label="订阅状态" value={subscription?.status || 'inactive'} />
                <Stat label="到期时间" value={formatDate(subscription?.currentPeriodEnd || subscription?.renewAt)} />
              </div>
              {subscriptionPlans?.length ? (
                <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.key} style={{ padding: 16, borderRadius: '1rem', border: '1px solid var(--border)', background: 'var(--muted)', display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <strong>{plan.title}</strong>
                        {plan.priceLabel ? <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{plan.priceLabel}</span> : null}
                      </div>
                      {plan.description ? <div style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{plan.description}</div> : null}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Button
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            void onSubscribePlan?.(plan.key);
                          }}
                        >
                          订阅 {plan.title}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {subscriptionHistory?.length ? (
                <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}>历史记录</div>
                  {subscriptionHistory.slice(0, 4).map((item) => (
                    <div key={`${item.subscriptionId}-${item.updatedAt ?? item.startedAt ?? 'latest'}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                      <span>{item.planName || item.subscriptionId}</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Credits</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>积分购买</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 12 }}>
                <Stat label="余额" value={credits?.balance ?? 0} />
                {products?.length ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {products.map((product) => (
                      <div key={product.productKey} style={{ padding: 16, borderRadius: '1rem', border: '1px solid var(--border)', background: 'var(--muted)', display: 'grid', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <strong>{product.title}</strong>
                          {product.quantity ? <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{product.quantity} 件</span> : null}
                        </div>
                        {product.creditGrant ? (
                          <div style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                            每件可获得 {product.creditGrant.creditsPerUnit} 积分
                          </div>
                        ) : null}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <Button
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              void onPurchaseProduct?.(product.productId || product.productKey);
                            }}
                          >
                            购买 {product.title}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Card>
            <CardHeader>
              <Badge>Application</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>Casdoor 应用</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 12 }}>
                <Stat label="应用名" value={application?.displayName || application?.name || appName} />
                <Stat label="组织" value={application?.organization || organizationName} />
                <Stat label="邮箱" value={account?.email || session?.email || '未连接'} />
                <Stat label="账号" value={account?.name || 'anonymous'} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Activity</Badge>
              <h2 style={{ margin: '14px 0 0', fontSize: 22, lineHeight: 1.2 }}>订单与支付</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 10 }}>订单</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {orderHistory?.length ? orderHistory.slice(0, 4).map((item) => (
                      <div key={item.paymentId || item.orderId || item.productKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                        <span>{item.productTitle || item.productKey || item.orderId || 'order'}</span>
                        <span style={{ color: 'var(--muted-foreground)' }}>{item.status}</span>
                      </div>
                    )) : <div style={{ color: 'var(--muted-foreground)' }}>暂无订单</div>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 10 }}>支付</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {paymentHistory?.length ? paymentHistory.slice(0, 4).map((item) => (
                      <div key={item.paymentId || item.transactionId || item.orderId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                        <span>{item.paymentId || item.orderId || 'payment'}</span>
                        <span style={{ color: 'var(--muted-foreground)' }}>{formatMoney(item.amount, item.currency)}</span>
                      </div>
                    )) : <div style={{ color: 'var(--muted-foreground)' }}>暂无支付记录</div>}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AuthSurface>
  );
}
