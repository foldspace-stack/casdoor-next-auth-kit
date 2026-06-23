import type { AuthIndexHtmlOptions } from '../types';
import { buildPkceAuthorizeBootstrapScript } from './pkce-storage.ts';

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

function escapeHtmlAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function createAuthIndexHtml(options: AuthIndexHtmlOptions = {}): string {
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
        var cdnOrigin = ${JSON.stringify(staticOrigin)}
        var casdoorOrigin = ${JSON.stringify(casdoorOrigin)}
        var currentOrigin = window.location.origin
        var proxyPrefix = ${JSON.stringify(apiProxyPrefix)}
        var proxyPathPrefix = proxyPrefix.replace(/\/$/, '')
        var applicationId = ${JSON.stringify((options.organizationName || 'built-in') + '/' + (options.appName || '创小剧 AI'))}

        window.DEFAULT_CASDOOR_POWERED_BY_HTML = ${JSON.stringify(poweredByHtml)}

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

          footer.innerHTML = poweredByHtml
          // 写入标记用于区分“我们已经接管 footer”和 Casdoor SPA 后续重建/覆盖 footer。
          // observer 依赖这个标记避免把自身写入误判成外部改动。
          footer.setAttribute('data-casdoor-powered-by-html', '1')
        }

        function applyPoweredByHtml() {
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
          var footerObserver = null
          var documentObserver = null
          var footerPoll = null
          var watchedFooter = null

          function syncPoweredByFooter() {
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
              attachFooterObserver(footer)
              return
            }

            if (isPoweredByFooterCurrent(footer)) {
              return
            }

            if (footerObserver) {
              footerObserver.disconnect()
            }

            writePoweredByFooter(footer)

            if (footerObserver) {
              footerObserver.observe(footer, { childList: true, subtree: true, characterData: true })
            }
          }

          function attachFooterObserver(footer) {
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
          return pathname === '/result' || pathname.indexOf('/result/') === 0
        }

        function isHomePath(pathname) {
          return pathname === '/'
        }

        function isAuthEntryPath(pathname) {
          return pathname === '/auth/login' || pathname === '/auth/signup'
        }

        function navigateDocument(url) {
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
          return currentOrigin + window.location.pathname + window.location.search + window.location.hash
        }

        function redirectToHomeRoute() {
          reloadHomeDocument()
        }

        function getCurrentAuthEntryRedirectTarget() {
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
          try {
            var url = typeof input === 'string' ? new URL(input, window.location.href) : input instanceof URL ? input : null
            if (!url) {
              return input
            }

            if (url.origin === cdnOrigin && url.pathname.indexOf(proxyPrefix) === 0) {
              return currentOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && url.pathname.indexOf('/static/') === 0) {
              return cdnOrigin + url.pathname + url.search + url.hash
            }

            if (url.origin === currentOrigin && (url.pathname === '/auth' || url.pathname.indexOf('/auth/') === 0)) {
              if (url.pathname === '/auth/api/get-application') {
                url.searchParams.set('id', applicationId)
              }
              return currentOrigin + proxyPathPrefix + url.pathname.slice('/auth'.length) + url.search + url.hash
            }

            if (
              (url.origin === currentOrigin || url.origin === casdoorOrigin) &&
              (url.pathname === '/result' || url.pathname.indexOf('/result/') === 0)
            ) {
              return currentOrigin + '/'
            }

            if (url.origin === casdoorOrigin) {
              return currentOrigin + proxyPathPrefix + url.pathname + url.search + url.hash
            }
          } catch (error) {
            return input
          }

          return input
        }

        function applyPatchedHistoryState(originalHistoryState, context, args) {
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
          var originalFetch = window.fetch.bind(window)
          window.fetch = function (input, init) {
            return originalFetch(toProxyUrl(input), init)
          }
        }

        if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
          var originalOpen = window.XMLHttpRequest.prototype.open
          window.XMLHttpRequest.prototype.open = function (method, url) {
            var rewrittenUrl = toProxyUrl(url)
            return originalOpen.apply(this, [method, rewrittenUrl].concat(Array.prototype.slice.call(arguments, 2)))
          }
        }

        if (window.open) {
          var originalOpenWindow = window.open.bind(window)
          window.open = function (url) {
            return originalOpenWindow(toProxyUrl(url), arguments[1], arguments[2])
          }
        }

        if (window.location && typeof window.location.assign === 'function') {
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
          var originalPushState = window.history.pushState.bind(window.history)
          window.history.pushState = function () {
            var result = originalPushState.apply(this, arguments)
            watchCurrentLocation()
            return result
          }
        }

        if (window.history && typeof window.history.replaceState === 'function') {
          var originalReplaceState = window.history.replaceState.bind(window.history)
          window.history.replaceState = function () {
            var result = originalReplaceState.apply(this, arguments)
            watchCurrentLocation()
            return result
          }
        }

        window.addEventListener('popstate', watchCurrentLocation)

        if (window.HTMLFormElement && window.HTMLFormElement.prototype) {
          var originalSubmit = window.HTMLFormElement.prototype.submit
          window.HTMLFormElement.prototype.submit = function () {
            if (this.action) {
              this.action = toProxyUrl(this.action)
            }
            return originalSubmit.apply(this, arguments)
          }
        }

        document.addEventListener('click', function (event) {
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
          rewriteElement(node)
          return originalAppendChild.call(this, node)
        }

        var originalInsertBefore = Node.prototype.insertBefore
        Node.prototype.insertBefore = function (node, referenceNode) {
          rewriteElement(node)
          return originalInsertBefore.call(this, node, referenceNode)
        }

        if (document.body) {
          rewriteElement(document.body)
        }

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
