import type { AuthIndexHtmlOptions } from '../types';

const DEFAULT_CASDOOR_STATIC_ORIGIN = 'https://casdoor-static.foldspace.cn';
const DEFAULT_CASDOOR_ORIGIN = process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL || 'https://auth.heyaai.com';

const DEFAULT_ICON_HREF = 'https://cdn.casbin.org/img/favicon.png';
const DEFAULT_MANIFEST_HREF = '/manifest.json';

function escapeHtmlAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function createAuthIndexHtml(options: AuthIndexHtmlOptions = {}): string {
  const staticOrigin = options.staticOrigin || DEFAULT_CASDOOR_STATIC_ORIGIN;
  const casdoorOrigin = options.casdoorOrigin || DEFAULT_CASDOOR_ORIGIN;
  const apiProxyPrefix = options.apiProxyPrefix || '/auth/';
  const appName = options.appName || '创小剧 AI';
  const organizationName = options.organizationName || 'built-in';
  const description = options.description || '创小剧 AI 登录 - 一个支持 OAuth 2.0、OIDC、SAML 和 CAS 的身份与单点登录平台';
  const iconHref = options.iconHref || DEFAULT_ICON_HREF;
  const manifestHref = options.manifestHref || DEFAULT_MANIFEST_HREF;
  const mainJs = `${staticOrigin}/static/js/main.5ddbc6ff.js`;
  const mainCss = `${staticOrigin}/static/css/main.f35879a1.css`;

  return String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${escapeHtmlAttribute(description)}" />
    <link rel="apple-touch-icon" href="${escapeHtmlAttribute(iconHref)}" />
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

            if (url.origin === casdoorOrigin) {
              return currentOrigin + proxyPathPrefix + url.pathname + url.search + url.hash
            }
          } catch (error) {
            return input
          }

          return input
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

        if (window.MutationObserver) {
          var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              mutation.addedNodes.forEach(rewriteElement)
            })
          })
          observer.observe(document.documentElement, { childList: true, subtree: true })
        }
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
