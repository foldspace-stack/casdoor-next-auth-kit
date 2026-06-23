import type { AuthIndexHtmlOptions } from '../types';
import { buildPkceAuthorizeBootstrapScript } from './pkce-storage.ts';

// 这个文件生成的是“同源 Casdoor 授权壳”的完整 HTML。
//
// 设计目标：
// 1. 浏览器始终停留在宿主域名，例如 /login/oauth/authorize 或 /signup/oauth/authorize。
// 2. Casdoor SPA 的静态资源从统一 CDN 加载，API 和跳转统一改写到宿主同源 /auth/* 代理。
// 3. 注册完成、登录完成、result 页、footer 替换等行为都在这个壳里兜底处理。
//
// 维护注意：
// - 这里返回的是字符串模板，内部脚本运行在浏览器里，不能直接访问 Node/Next runtime。
// - 大多数逻辑是为了兼容 Casdoor SPA 自己的 history/fetch/XHR/form 行为，不要简化成普通跳转页。
// - 修改后必须跑 packages/auth-kit 的测试；index-html.test.ts 里有多个防回归字符串断言。
//
// 不要随意改动的核心约束：
// - 不要把认证流程改回跳转到 Casdoor 外域。用户必须始终停留在宿主同域。
// - 不要删除 /result/*、/auth/login?redirect=...、/auth/signup?redirect=... 的前端路由 watch。
//   Casdoor 注册/登录完成后的跳转经常是 SPA history 变更，不会触发 Next route handler。
// - 不要把首页跳转改成普通 pushState。auth 壳文档跳到 / 后必须强制刷新，否则地址栏是首页但页面仍是 Casdoor SPA。
// - 不要删除 /login/oauth/* 非 authorize 路径兜底。历史回归里曾出现 /login/oauth/undefined，需要直接脱壳到个人中心。
// - 不要把 footer 替换改成一次性 DOMContentLoaded 写入。Casdoor SPA 会异步重建 footer。
// - 不要把 URL 重写逻辑分散到 route handler。这里必须兜底 fetch/XHR/form/click/history/location/DOM 动态插入。
// - 不要把 history patch 合并或删掉 undefined URL 防护，否则浏览器会生成 /login/oauth/undefined。

const DEFAULT_CASDOOR_STATIC_ORIGIN = 'https://casdoor-static.foldspace.cn';
const DEFAULT_CASDOOR_ORIGIN =
  process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL || process.env.CASDOOR_SERVER_URL || '';

const DEFAULT_ICON_HREF = 'https://cdn.casbin.org/img/favicon.png';
const DEFAULT_MANIFEST_HREF = '/manifest.json';
const DEFAULT_APP_NAME = '创小剧 AI';
const DEFAULT_DESCRIPTION = '创小剧 AI 登录 - 一个支持 OAuth 2.0、OIDC、SAML 和 CAS 的身份与单点登录平台';

function getDefaultIconHref(): string {
  return process.env.DEFAULT_CASDOOR_ICON_HREF || DEFAULT_ICON_HREF;
}

function getDefaultAppName(): string {
  return process.env.DEFAULT_CASDOOR_APP_NAME || DEFAULT_APP_NAME;
}

function getDefaultDescription(): string {
  return process.env.DEFAULT_CASDOOR_DESCRIPTION || DEFAULT_DESCRIPTION;
}

function getPoweredByHtml(): string {
  return process.env.DEFAULT_CASDOOR_POWERED_BY_HTML || '';
}

// 这些值会写进 HTML 属性，必须转义，避免 appName/description 里的符号破坏页面结构。
// 注意 footer HTML 不能走这个函数，因为 footer 是明确允许注入 HTML 片段的配置项。
function escapeHtmlAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function createAuthIndexHtml(options: AuthIndexHtmlOptions = {}): string {
  // options 来自 route handler，env 默认值来自包运行环境。
  // 宿主没有传 icon/appName/description 时，允许通过 DEFAULT_CASDOOR_* 环境变量覆盖。
  const staticOrigin = options.staticOrigin || DEFAULT_CASDOOR_STATIC_ORIGIN;
  const casdoorOrigin = options.casdoorOrigin || DEFAULT_CASDOOR_ORIGIN;
  const apiProxyPrefix = options.apiProxyPrefix || '/auth/';
  const appName = options.appName || getDefaultAppName();
  const organizationName = options.organizationName || 'built-in';
  const description = options.description || getDefaultDescription();
  const iconHref = options.iconHref || getDefaultIconHref();
  const manifestHref = options.manifestHref || DEFAULT_MANIFEST_HREF;
  const poweredByHtml = getPoweredByHtml();
  const mainJs = `${staticOrigin}/static/js/main.5ddbc6ff.js`;
  const mainCss = `${staticOrigin}/static/css/main.f35879a1.css`;

  return String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="icon" href="/casdoor_favicon.ico" type="image/x-icon"/>
    <meta name="description" content="${escapeHtmlAttribute(description)}" />
    <link rel="apple-touch-icon" href="/casdoor_favicon.ico" />
    <link rel="manifest" href="${escapeHtmlAttribute(manifestHref)}" />
    <title>${escapeHtmlAttribute(appName)}</title>
    <script>
      (function () {
        // 当前脚本在宿主同源授权壳中执行。
        // currentOrigin 是宿主 origin，casdoorOrigin 是真实 Casdoor origin，cdnOrigin 是 Casdoor 静态资源 origin。
        // 后续所有网络和导航改写都围绕这三个 origin 展开。
        //
        // 不要把 currentOrigin 改成 NEXTAUTH_URL / APP_URL / 固定域名。
        // Coolify、Traefik、多域名部署下，运行时真实访问域名必须从 window.location.origin 得到。
        var cdnOrigin = ${JSON.stringify(staticOrigin)}
        var casdoorOrigin = ${JSON.stringify(casdoorOrigin)}
        var currentOrigin = window.location.origin
        var proxyPrefix = ${JSON.stringify(apiProxyPrefix)}
        var proxyPathPrefix = proxyPrefix.replace(/\/$/, '')
        // Casdoor 前端会请求 get-application；这里强制把应用 id 绑定到宿主配置，
        // 避免 SPA 用默认 built-in/app 或 URL 上残留参数导致登录页加载错误应用。
        var applicationId = ${JSON.stringify((options.organizationName || 'built-in') + '/' + (options.appName || '创小剧 AI'))}

        // 通过全局变量暴露给后续 observer。不能只在初始 DOMContentLoaded 写一次，
        // 因为 Casdoor SPA 会在渲染完成后替换 footer。
        // 这个变量由 DEFAULT_CASDOOR_POWERED_BY_HTML 环境变量生成，允许宿主自定义品牌 footer。
        // 不要把它改回硬编码 "Powered by Casdoor"，也不要把 HTML 片段转成纯文本。
        window.DEFAULT_CASDOOR_POWERED_BY_HTML = ${JSON.stringify(poweredByHtml)}

        // 浏览器会标准化 innerHTML；缓存标准化结果，避免每次 MutationObserver 回调都创建 template。
        var normalizedPoweredByHtml = null

        function getPoweredByHtmlValue() {
          return window.DEFAULT_CASDOOR_POWERED_BY_HTML || ''
        }

        function getNormalizedPoweredByHtml() {
          var poweredByHtml = getPoweredByHtmlValue()
          if (!poweredByHtml) {
            return ''
          }

          if (normalizedPoweredByHtml !== null) {
            return normalizedPoweredByHtml
          }

          // 浏览器会把 env 中的 HTML 片段标准化，例如单引号属性会变成双引号。
          // 比较时必须使用标准化结果，否则 observer 会把自己写入的内容误判为被改坏。
          var template = document.createElement('template')
          template.innerHTML = poweredByHtml
          normalizedPoweredByHtml = template.innerHTML || poweredByHtml
          return normalizedPoweredByHtml
        }

        function isPoweredByFooterCurrent(footer) {
          // 不要改回 footer.innerHTML === window.DEFAULT_CASDOOR_POWERED_BY_HTML。
          // 浏览器会标准化 HTML 属性和空白；必须用标准化后的片段加写入标记共同判断。
          return (
            footer.getAttribute('data-casdoor-powered-by-html') === '1' &&
            footer.innerHTML === getNormalizedPoweredByHtml()
          )
        }

        function writePoweredByFooter(footer) {
          var poweredByHtml = getPoweredByHtmlValue()
          if (!poweredByHtml || !footer) {
            return
          }

          // 这里必须写 raw HTML 配置，不能 textContent。
          // DEFAULT_CASDOOR_POWERED_BY_HTML 明确支持 <a> 等 HTML 片段。
          footer.innerHTML = poweredByHtml
          // 写入标记用于区分“我们已经接管 footer”和 Casdoor SPA 后续重建/覆盖 footer。
          // observer 依赖这个标记避免把自身写入误判成外部改动。
          footer.setAttribute('data-casdoor-powered-by-html', '1')
        }

        function applyPoweredByHtml() {
          // 初始同步：如果 footer 已经在首屏 HTML 或同步渲染中出现，先写一次。
          // SPA 异步替换由 watchPoweredByFooter() 继续兜底。
          if (!getPoweredByHtmlValue()) {
            return
          }

          var footer = document.getElementById('footer')
          if (!footer) {
            return
          }

          if (isPoweredByFooterCurrent(footer)) {
            return
          }

          writePoweredByFooter(footer)
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyPoweredByHtml, { once: true })
        } else {
          applyPoweredByHtml()
        }

        function watchPoweredByFooter() {
          if (!getPoweredByHtmlValue()) {
            return
          }

          // Casdoor may render and later replace #footer through its SPA runtime.
          // Keep content writes scoped to #footer, while a light document observer
          // and a low-frequency poll only recover missed SPA replacements.
          //
          // 三层兜底的原因：
          // 1. footerObserver 只盯当前 #footer，避免全局 observer 写入造成自触发死循环。
          // 2. documentObserver 只负责发现 Casdoor 把整个 footer 节点替换掉。
          // 3. footerPoll 是兜底，处理某些浏览器/框架绕过 observer 或 observer 丢事件的情况。
          //
          // 这块不要“简化”为单个 document MutationObserver：
          // - 全局 observer 监听 characterData/subtree 会显著放大回调次数。
          // - 写入 innerHTML 又会触发 observer，容易造成递归和登录页卡顿。
          // - Casdoor footer 是 SPA 后渲染/后替换的，单次写入无法保证最终内容。
          var footerObserver = null
          var documentObserver = null
          var footerPoll = null
          var watchedFooter = null

          function syncPoweredByFooter() {
            // 同步函数必须是幂等的，observer 和 poll 都会频繁调用它。
            if (!getPoweredByHtmlValue()) {
              return
            }

            var footer = document.getElementById('footer')
            if (!footer) {
              if (footerObserver) {
                footerObserver.disconnect()
                footerObserver = null
              }
              watchedFooter = null
              return
            }

            if (window.MutationObserver && footer !== watchedFooter) {
              // Casdoor SPA 可能重建 footer 节点；节点引用变化时必须重新挂 footerObserver。
              attachFooterObserver(footer)
              return
            }

            if (isPoweredByFooterCurrent(footer)) {
              return
            }

            if (footerObserver) {
              // 写入 footer 前临时断开当前 footer observer，
              // 避免自己写入 innerHTML 后立即触发 observer 递归。
              footerObserver.disconnect()
            }

            writePoweredByFooter(footer)

            if (footerObserver) {
              footerObserver.observe(footer, { childList: true, subtree: true, characterData: true })
            }
          }

          function attachFooterObserver(footer) {
            // 只监听 footer 内部变化，不监听整个 document 的 characterData。
            // 这样既能恢复 Casdoor 改回 "Powered by Casdoor"，也不会拖慢整个登录页。
            if (!footer) {
              return
            }

            if (footerObserver) {
              footerObserver.disconnect()
            }

            watchedFooter = footer
            footerObserver = new MutationObserver(function () {
              syncPoweredByFooter()
            })
            footerObserver.observe(footer, { childList: true, subtree: true, characterData: true })
            syncPoweredByFooter()
          }

          function findAndWatchFooter() {
            var footer = document.getElementById('footer')
            if (footer) {
              if (window.MutationObserver) {
                attachFooterObserver(footer)
              } else {
                syncPoweredByFooter()
              }
              return true
            }

            return false
          }

          function startFooterPoll() {
            // 低频 poll 只作为兜底，不能依赖高频轮询；500ms 已足够覆盖 SPA 异步重绘。
            if (footerPoll) {
              return
            }

            footerPoll = window.setInterval(function () {
              syncPoweredByFooter()
            }, 500)
          }

          if (window.MutationObserver) {
            documentObserver = new MutationObserver(function () {
              syncPoweredByFooter()
            })
            documentObserver.observe(document.documentElement, { childList: true, subtree: true })
          }

          findAndWatchFooter()
          syncPoweredByFooter()
          startFooterPoll()
        }

        function isResultPath(pathname) {
          // 注册成功后 Casdoor 常把页面带到 /result 或 /result/*。
          // 这些路径不是宿主业务页面，必须离开授权壳。
          //
          // 不要删掉 /result/* 支持，也不要改回“登录入口加首页 redirect 参数”的旧方案。
          // 注册成功后用户应该回到宿主首页，避免停在 Casdoor 结果页或重新进入登录入口。
          return pathname === '/result' || pathname.indexOf('/result/') === 0
        }

        function isHomePath(pathname) {
          // 注意：auth 壳里的 SPA 也可能 pushState 到 /。
          // 地址栏是 / 不代表当前文档已经是宿主首页文档。
          return pathname === '/'
        }

        function isAuthEntryPath(pathname) {
          // Casdoor SPA 可能前端路由到 /auth/login 或 /auth/signup。
          // 这些路径有对应 Next route handler，必须通过完整文档请求重新进入后端逻辑。
          //
          // 重点：这是“前端路由变更”场景，不会自动命中服务端 route handler。
          // 所以 watchCurrentLocation() 必须识别这些路径，并用 navigateDocument() 触发真实文档请求。
          return pathname === '/auth/login' || pathname === '/auth/signup'
        }

        function isBrokenLoginOauthPath(pathname) {
          // 登录成功后如果某段 Casdoor SPA 或浏览器 history patch 仍把 undefined 当作 URL，
          // 会落到 /login/oauth/undefined 这类非授权壳路径。它既不是 authorize 页，也不是业务页。
          //
          // 不要把这个兜底删掉：这是线上旧页面状态和浏览器前端路由的最后防线。
          // 真正的授权壳只能是 /login/oauth/authorize；其它 /login/oauth/* 都应脱壳进入个人中心。
          return pathname.indexOf('/login/oauth/') === 0 && pathname !== '/login/oauth/authorize'
        }

        function navigateDocument(url) {
          // 强制完整文档导航，不使用 Next/SPA 的前端路由。
          // 双写 href + assign 是为了规避某些 SPA patch location 后吞掉第一次赋值。
          //
          // 不要替换成 router.push、history.pushState 或只调用 assign。
          // 当前页面是 Casdoor SPA，不是宿主 React 树，只有完整文档导航才能重新进入 Next route handler。
          window.location.href = url
          window.setTimeout(function () {
            window.location.assign(url)
          }, 100)
        }

        function reloadHomeDocument() {
          var homeUrl = currentOrigin + '/'

          // Casdoor 注册成功后可能只用 history.pushState 把 auth 壳前端路由改成 /。
          // 这时地址栏已经是首页，但文档仍是 Casdoor SPA，必须强制刷新才能进入宿主首页。
          //
          // 不要删掉 window.location.reload()。
          // 没有 reload 时，用户会看到 URL 是 /，但页面内容仍停留在 Casdoor 注册结果或登录壳。
          window.location.href = homeUrl
          window.setTimeout(function () {
            if (window.location.pathname === '/') {
              window.location.reload()
              return
            }

            window.location.assign(homeUrl)
          }, 100)
        }

        function getCurrentDocumentUrl() {
          // 当前 URL 会被重新加载，用于让 Next route handler 处理 /auth/login?redirect=...。
          return currentOrigin + window.location.pathname + window.location.search + window.location.hash
        }

        function redirectToHomeRoute() {
          reloadHomeDocument()
        }

        function getCurrentAuthEntryRedirectTarget() {
          // 只接受同源相对路径。外链或 //evil.com 这类 open redirect 必须丢弃。
          //
          // 不要放宽成允许绝对 URL。
          // redirect/returnTo 来自 URL 查询参数，必须防 open redirect。
          try {
            var currentUrl = new URL(window.location.href)
            if (!isAuthEntryPath(currentUrl.pathname)) {
              return null
            }

            var redirect = currentUrl.searchParams.get('redirect') || currentUrl.searchParams.get('returnTo')
            if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
              return redirect
            }
          } catch (error) {
            return null
          }

          return null
        }

        async function hasActiveSession() {
          // 在 auth 壳里检测当前宿主 NextAuth 会话。
          // 如果用户已经登录但仍停留在 /auth/login，则跳到个人中心，避免重复登录。
          //
          // 不要改成读取 Casdoor 页面里的全局状态。
          // 宿主是否已登录以 NextAuth session 为准，Casdoor SPA 状态只能作为上游登录状态。
          try {
            var sessionResponse = await fetch(currentOrigin + '/api/auth/session', {
              credentials: 'include',
              cache: 'no-store',
            })

            if (!sessionResponse.ok) {
              return false
            }

            var sessionData = await sessionResponse.json()
            return Boolean(sessionData && sessionData.user)
          } catch (error) {
            return false
          }
        }

        async function watchCurrentLocation() {
          // 统一处理 Casdoor SPA 前端路由变化后的“脱壳”逻辑。
          // 这个函数会在初始加载、pushState/replaceState、popstate 后执行。
          //
          // 这里的顺序不能随意调整：
          // 1. /result/* 优先回首页，处理注册成功/支付结果等 Casdoor 结果页。
          // 2. / 表示 auth 壳已经被 SPA 改成首页地址，但文档仍不是宿主首页，所以要强刷。
          // 3. /auth/login?redirect=... 需要重新发文档请求，让 Next route handler 做后端跳转。
          // 4. /login/oauth/* 非 authorize 路径是异常授权壳路径，直接脱壳到个人中心。
          // 5. 已登录还在 /auth/login 或 /auth/signup 时，进入个人中心避免循环登录。
          if (isResultPath(window.location.pathname)) {
            redirectToHomeRoute()
            return true
          }

          if (isHomePath(window.location.pathname)) {
            // 如果这个脚本还在运行，说明当前仍是 auth 壳文档，不是真正的宿主首页文档。
            // 因此检测到 SPA 前端路由落到 / 时，要强制 reload 一次。
            reloadHomeDocument()
            return true
          }

          if (isBrokenLoginOauthPath(window.location.pathname)) {
            navigateDocument(currentOrigin + '/user/account')
            return true
          }

          var authEntryRedirectTarget = getCurrentAuthEntryRedirectTarget()
          if (authEntryRedirectTarget) {
            // Casdoor's SPA can push /auth/login?redirect=... without a document request.
            // Reload the current URL so the Next route handler performs the redirect.
            //
            // 注意这里故意没有直接 navigateDocument(currentOrigin + authEntryRedirectTarget)。
            // route handler 里还有清理 cookie、规范化 redirect、区分 login/signup 等后端逻辑，必须让它执行。
            navigateDocument(getCurrentDocumentUrl())
            return true
          }

          if (isAuthEntryPath(window.location.pathname)) {
            if (await hasActiveSession()) {
              navigateDocument(currentOrigin + '/user/account')
              return true
            }
          }

          return false
        }

        watchCurrentLocation()

        function toProxyUrl(input) {
          // 把 Casdoor SPA 产生的 URL 全部收敛到宿主同源或指定静态 CDN。
          // 这里是同源认证体验的核心：浏览器不直接访问 auth.heyaai.com 这类 Casdoor 域名。
          //
          // 这个函数是所有 patch 的公共入口，修改时必须同时考虑：
          // - fetch/XHR 的 API 请求
          // - a/form 的用户点击和提交
          // - script/link/img 的静态资源
          // - location.assign/replace/href 的跳转
          // - history.pushState/replaceState 的前端路由
          //
          // 不要在某个分支里直接返回 casdoorOrigin URL。
          // 一旦浏览器直接访问 Casdoor 域名，就会丢失宿主同源会话、触发跨域 cookie 问题，并破坏站内体验。
          try {
            var url = typeof input === 'string' ? new URL(input, window.location.href) : input instanceof URL ? input : null
            if (!url) {
              return input
            }

            if (url.origin === cdnOrigin && url.pathname.indexOf(proxyPrefix) === 0) {
              // CDN 上的脚本有时会构造 /auth/* 请求；这些请求应回宿主同源代理。
              // 不能让 CDN origin 承载 /auth/*，CDN 只负责静态资源，不具备宿主 cookie 和 Next route handler。
              return currentOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && url.pathname.indexOf('/static/') === 0) {
              // Casdoor 静态资源保持从静态 CDN 取，避免宿主 Next 去处理大量 Casdoor asset。
              // 不要把 /static/* 改成 /auth/static/*。
              // Casdoor 打包产物里的相对静态资源很多，走 CDN 可以减少宿主服务压力和路由误判。
              return cdnOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && (url.pathname === '/auth' || url.pathname.indexOf('/auth/') === 0)) {
              if (url.pathname === '/auth/api/get-application') {
                // 应用信息请求必须带宿主配置的 applicationId。
                // 不要删除这个 set('id', applicationId)。
                // Casdoor SPA 默认可能请求 built-in/app，生产环境会显示错应用或登录配置。
                url.searchParams.set('id', applicationId)
              }
              // /auth/api/* 在浏览器里保持同源，服务端 route handler 再转成 Casdoor /api/*。
              // 不要让前端直接请求 /api/* 或真实 Casdoor /api/*。
              return currentOrigin + proxyPathPrefix + url.pathname.slice('/auth'.length) + url.search + url.hash
            }

            if (
              (url.origin === currentOrigin || url.origin === casdoorOrigin) &&
              (url.pathname === '/result' || url.pathname.indexOf('/result/') === 0)
            ) {
              // Casdoor result 页不是宿主页面。转换成首页 URL，实际跳转由 watchCurrentLocation 强刷处理。
              // 注意这里只返回首页 URL，不在 toProxyUrl 里直接 reload。
              // toProxyUrl 可能被 fetch/XHR/form/history 共用，副作用统一放在 watchCurrentLocation 更安全。
              return currentOrigin + '/'
            }

            if (url.origin === casdoorOrigin) {
              // 真实 Casdoor API/页面 URL 统一变成宿主 /auth/* 代理路径。
              // 这是“永远不跳出站外”的关键分支。
              // 不要按路径白名单放行登录、注册或 get-account 等 Casdoor URL 到外域。
              return currentOrigin + proxyPathPrefix + url.pathname + url.search + url.hash
            }
          } catch (error) {
            return input
          }

          return input
        }

        function applyPatchedHistoryState(originalHistoryState, context, args) {
          // 统一封装 history.pushState / replaceState 的 URL 参数处理。
          // 不能在两个 patch 里直接改 arguments；不同浏览器对 arguments 可写性和 undefined URL 处理不一致。
          //
          // 这个函数解决两个问题：
          // 1. history 的第三个参数如果是真实 URL，要经过 toProxyUrl，防止 SPA 跳到外域或裸 /result。
          // 2. history 的第三个参数如果是 undefined/null，不能原样转发给原生 history。
          //
          // 第二点非常重要：部分浏览器会把显式 undefined 当作字符串 URL，
          // 最终产生 /login/oauth/undefined 或 /signup/oauth/undefined。
          // 因此没有 URL 时必须降级成两参数调用。
          var nextArgs = Array.prototype.slice.call(args)
          if (nextArgs.length > 2) {
            if (typeof nextArgs[2] === 'undefined' || nextArgs[2] === null) {
              // 原生 history.pushState/replaceState 如果显式收到 undefined，
              // 会把它当成字符串 URL，导致 /login/oauth/undefined。
              // 没有真实 URL 时必须按“两参数调用”转发，保持当前地址不变。
              nextArgs = nextArgs.slice(0, 2)
            } else {
              nextArgs[2] = toProxyUrl(nextArgs[2])
            }
          }

          return originalHistoryState.apply(context, nextArgs)
        }

        function rewriteElement(element) {
          // Casdoor SPA 会动态插入 a/form/script/link/img。
          // 静态 HTML 里的 URL 可以靠首屏模板控制，动态插入的节点必须在 DOM API 层重写。
          if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return
          }

          if (element.tagName === 'A' && element.getAttribute('href')) {
            var href = element.getAttribute('href')
            var rewrittenHref = toProxyUrl(href)
            if (rewrittenHref !== href) {
              element.setAttribute('href', rewrittenHref)
            }
          }

          if (element.tagName === 'FORM' && element.getAttribute('action')) {
            var action = element.getAttribute('action')
            var rewrittenAction = toProxyUrl(action)
            if (rewrittenAction !== action) {
              element.setAttribute('action', rewrittenAction)
            }
          }

          if (element.tagName === 'SCRIPT' && element.getAttribute('src')) {
            var scriptSrc = element.getAttribute('src')
            var rewrittenScriptSrc = toProxyUrl(scriptSrc)
            if (rewrittenScriptSrc !== scriptSrc) {
              element.setAttribute('src', rewrittenScriptSrc)
            }
          }

          if (element.tagName === 'LINK' && element.getAttribute('href')) {
            var linkHref = element.getAttribute('href')
            var rewrittenLinkHref = toProxyUrl(linkHref)
            if (rewrittenLinkHref !== linkHref) {
              element.setAttribute('href', rewrittenLinkHref)
            }
          }

          if (element.tagName === 'IMG' && element.getAttribute('src')) {
            var imgSrc = element.getAttribute('src')
            var rewrittenImgSrc = toProxyUrl(imgSrc)
            if (rewrittenImgSrc !== imgSrc) {
              element.setAttribute('src', rewrittenImgSrc)
            }
          }

          if (typeof element.querySelectorAll === 'function') {
            element.querySelectorAll('a[href], form[action], script[src], link[href], img[src]').forEach(rewriteElement)
          }
        }

        if (typeof window.fetch === 'function') {
          // 拦截 fetch，保证 Casdoor 前端的数据请求也走同源代理。
          var originalFetch = window.fetch.bind(window)
          window.fetch = function (input, init) {
            return originalFetch(toProxyUrl(input), init)
          }
        }

        if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
          // Casdoor 旧代码或第三方依赖可能还用 XHR。
          var originalOpen = window.XMLHttpRequest.prototype.open
          window.XMLHttpRequest.prototype.open = function (method, url) {
            var rewrittenUrl = toProxyUrl(url)
            return originalOpen.apply(this, [method, rewrittenUrl].concat(Array.prototype.slice.call(arguments, 2)))
          }
        }

        if (window.open) {
          // 防止 Casdoor 用 window.open 打开外域或裸 /result 页。
          var originalOpenWindow = window.open.bind(window)
          window.open = function (url) {
            return originalOpenWindow(toProxyUrl(url), arguments[1], arguments[2])
          }
        }

        if (window.location && typeof window.location.assign === 'function') {
          // location.assign/replace 是 Casdoor SPA 最常用的跳转方式之一。
          var originalAssign = window.location.assign.bind(window.location)
          window.location.assign = function (url) {
            return originalAssign(toProxyUrl(url))
          }
        }

        if (window.location && typeof window.location.replace === 'function') {
          var originalReplace = window.location.replace.bind(window.location)
          window.location.replace = function (url) {
            return originalReplace(toProxyUrl(url))
          }
        }

        if (window.history && typeof window.history.replaceState === 'function') {
          // 第一层 history patch：只负责 URL 参数重写和 undefined URL 修复。
          // 后面会再包一层 watchCurrentLocation，用于监听前端路由变化后的脱壳逻辑。
          //
          // 不要把第一层和第二层 patch 合并。
          // 第一层保证原生 history 收到安全参数；第二层保证路由变化后执行 watch。
          // 合并后很容易在后续维护中漏掉 undefined 防护或 watch 防护之一。
          try {
            var originalHistoryReplaceState = window.history.replaceState.bind(window.history)
            window.history.replaceState = function () {
              return applyPatchedHistoryState(originalHistoryReplaceState, this, arguments)
            }
          } catch (error) {
            console.warn('[casdoor-next-auth-kit] history.replaceState patch failed', error)
          }
        }

        if (window.history && typeof window.history.pushState === 'function') {
          // 同上，pushState 也必须经过 applyPatchedHistoryState，避免 /login/oauth/undefined。
          // 不要用 arrow function 重写这里；需要保留调用时的 this 和 arguments 语义。
          try {
            var originalHistoryPushState = window.history.pushState.bind(window.history)
            window.history.pushState = function () {
              return applyPatchedHistoryState(originalHistoryPushState, this, arguments)
            }
          } catch (error) {
            console.warn('[casdoor-next-auth-kit] history.pushState patch failed', error)
          }
        }

        try {
          // 尝试 patch Location.prototype.href，用于覆盖 window.location.href = ...
          // 某些浏览器可能不允许重定义，因此必须 catch，失败时依赖 assign/replace/click/submit 兜底。
          var locationDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href')
          if (locationDescriptor && locationDescriptor.configurable && locationDescriptor.set) {
            Object.defineProperty(Location.prototype, 'href', {
              configurable: true,
              enumerable: locationDescriptor.enumerable,
              get: locationDescriptor.get,
              set: function (value) {
                return locationDescriptor.set.call(this, toProxyUrl(value))
              },
            })
          }
        } catch (error) {
          console.warn('[casdoor-next-auth-kit] location href patch failed', error)
        }

${buildPkceAuthorizeBootstrapScript(casdoorOrigin)}

        if (window.history && typeof window.history.pushState === 'function') {
          // 第二层 history patch：在 URL 已被第一层 patch 处理后，监听 SPA 路由变化。
          // 不能合并到第一层里，否则后续维护时容易漏掉 undefined URL 防护。
          //
          // Casdoor 登录/注册完成后经常不刷新页面，只 pushState 到 /result/*、/ 或 /auth/login?redirect=...
          // 没有这一层 watch，服务端路由不会执行，用户会卡在 auth 壳。
          var originalPushState = window.history.pushState.bind(window.history)
          window.history.pushState = function () {
            var result = originalPushState.apply(this, arguments)
            watchCurrentLocation()
            return result
          }
        }

        if (window.history && typeof window.history.replaceState === 'function') {
          // replaceState 也要触发 watchCurrentLocation，Casdoor 经常用 replaceState 切 result/auth 路由。
          // 这里同样不能省略，注册成功和结果页跳转不一定使用 pushState。
          var originalReplaceState = window.history.replaceState.bind(window.history)
          window.history.replaceState = function () {
            var result = originalReplaceState.apply(this, arguments)
            watchCurrentLocation()
            return result
          }
        }

        window.addEventListener('popstate', watchCurrentLocation)

        if (window.HTMLFormElement && window.HTMLFormElement.prototype) {
          // 原生 form.submit() 不会触发 submit 事件，所以需要 patch prototype。
          var originalSubmit = window.HTMLFormElement.prototype.submit
          window.HTMLFormElement.prototype.submit = function () {
            if (this.action) {
              this.action = toProxyUrl(this.action)
            }
            return originalSubmit.apply(this, arguments)
          }
        }

        document.addEventListener('click', function (event) {
          // 捕获阶段拦截链接点击，先改写 URL，再交给完整文档导航。
          var target = event.target instanceof Element ? event.target.closest('a[href]') : null
          if (!target) {
            return
          }

          var href = target.getAttribute('href')
          var rewritten = toProxyUrl(href)
          if (rewritten !== href) {
            event.preventDefault()
            window.location.href = rewritten
          }
        }, true)

        document.addEventListener('submit', function (event) {
          // 用户提交表单时也要确保 action 走同源代理。
          var form = event.target instanceof HTMLFormElement ? event.target : null
          if (!form || !form.action) {
            return
          }

          var rewritten = toProxyUrl(form.action)
          if (rewritten !== form.action) {
            event.preventDefault()
            form.action = rewritten
            form.submit()
          }
        }, true)

        var originalAppendChild = Node.prototype.appendChild
        Node.prototype.appendChild = function (node) {
          // 动态 append 的节点在插入前改写，避免浏览器先请求外域资源。
          rewriteElement(node)
          return originalAppendChild.call(this, node)
        }

        var originalInsertBefore = Node.prototype.insertBefore
        Node.prototype.insertBefore = function (node, referenceNode) {
          // React/AntD 等运行时常用 insertBefore 插入 script/link/img。
          rewriteElement(node)
          return originalInsertBefore.call(this, node, referenceNode)
        }

        if (document.body) {
          // 首屏已经存在的 DOM 也要扫一遍，覆盖服务端 HTML 和同步脚本写入的元素。
          rewriteElement(document.body)
        }

        // footer watcher 放在最后启动，确保基础 URL patch 已就绪。
        watchPoweredByFooter()
      })()
    </script>
    <script defer="defer" src="${escapeHtmlAttribute(mainJs)}"></script>
    <link href="${escapeHtmlAttribute(mainCss)}" rel="stylesheet" />
  </head>
  <body>
    <noscript>你需要启用 JavaScript 才能继续。</noscript>
    <div id="root"></div>
      </body>
</html>
`;
}

export const AUTH_INDEX_HTML = createAuthIndexHtml();
