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
          return pathname === '/auth/login' || pathname === '/auth/signup'
        }

        function navigateDocument(url) {
          // 强制完整文档导航，不使用 Next/SPA 的前端路由。
          // 双写 href + assign 是为了规避某些 SPA patch location 后吞掉第一次赋值。
          window.location.href = url
          window.setTimeout(function () {
            window.location.assign(url)
          }, 100)
        }

        function reloadHomeDocument() {
          var homeUrl = currentOrigin + '/'

          // Casdoor 注册成功后可能只用 history.pushState 把 auth 壳前端路由改成 /。
          // 这时地址栏已经是首页，但文档仍是 Casdoor SPA，必须强制刷新才能进入宿主首页。
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

          var authEntryRedirectTarget = getCurrentAuthEntryRedirectTarget()
          if (authEntryRedirectTarget) {
            // Casdoor's SPA can push /auth/login?redirect=... without a document request.
            // Reload the current URL so the Next route handler performs the redirect.
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
          try {
            var url = typeof input === 'string' ? new URL(input, window.location.href) : input instanceof URL ? input : null
            if (!url) {
              return input
            }

            if (url.origin === cdnOrigin && url.pathname.indexOf(proxyPrefix) === 0) {
              // CDN 上的脚本有时会构造 /auth/* 请求；这些请求应回宿主同源代理。
              return currentOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && url.pathname.indexOf('/static/') === 0) {
              // Casdoor 静态资源保持从静态 CDN 取，避免宿主 Next 去处理大量 Casdoor asset。
              return cdnOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && (url.pathname === '/auth' || url.pathname.indexOf('/auth/') === 0)) {
              if (url.pathname === '/auth/api/get-application') {
                // 应用信息请求必须带宿主配置的 applicationId。
                url.searchParams.set('id', applicationId)
              }
              return currentOrigin + proxyPathPrefix + url.pathname.slice('/auth'.length) + url.search + url.hash
            }

            if (
              (url.origin === currentOrigin || url.origin === casdoorOrigin) &&
              (url.pathname === '/result' || url.pathname.indexOf('/result/') === 0)
            ) {
              // Casdoor result 页不是宿主页面。转换成首页 URL，实际跳转由 watchCurrentLocation 强刷处理。
              return currentOrigin + '/'
            }

            if (url.origin === casdoorOrigin) {
              // 真实 Casdoor API/页面 URL 统一变成宿主 /auth/* 代理路径。
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
          var originalPushState = window.history.pushState.bind(window.history)
          window.history.pushState = function () {
            var result = originalPushState.apply(this, arguments)
            watchCurrentLocation()
            return result
          }
        }

        if (window.history && typeof window.history.replaceState === 'function') {
          // replaceState 也要触发 watchCurrentLocation，Casdoor 经常用 replaceState 切 result/auth 路由。
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
