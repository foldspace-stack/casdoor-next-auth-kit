import crypto from 'node:crypto';

export const pkceStoragePrefix = 'pkce_code_verifier';

export function getPkceStorageKey(state: string): string {
  const digest = crypto.createHash('sha256').update(state).digest('base64url');
  return `${pkceStoragePrefix}.${digest}`;
}

export function buildPkceAuthorizeBootstrapScript(casdoorOrigin: string): string {
  return String.raw`
        (function () {
          var casdoorOrigin = ${JSON.stringify(casdoorOrigin)}
          var storagePrefix = ${JSON.stringify(pkceStoragePrefix)}

          async function buildStorageKey(state) {
            var digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(state))
            var digestBytes = new Uint8Array(digest)
            var binary = ''
            for (var index = 0; index < digestBytes.length; index++) {
              binary += String.fromCharCode(digestBytes[index])
            }
            return storagePrefix + '.' + btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '')
          }

          async function createVerifierPair() {
            var bytes = new Uint8Array(48)
            crypto.getRandomValues(bytes)
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
            var verifier = Array.from(bytes, function (byte) {
              return chars[byte % chars.length]
            }).join('')
            var digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
            var digestBytes = new Uint8Array(digest)
            var binary = ''
            for (var index = 0; index < digestBytes.length; index++) {
              binary += String.fromCharCode(digestBytes[index])
            }
            var challenge = btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '')
            return { verifier: verifier, challenge: challenge }
          }

          async function savePkceVerifier(state, verifier) {
            var key = await buildStorageKey(state)
            try {
              sessionStorage.setItem(key, verifier)
            } catch (error) {
              localStorage.setItem(key, verifier)
            }
            return key
          }

          async function bootstrapPkceAuthorize() {
            var pathname = window.location.pathname
            if (pathname !== '/login/oauth/authorize' && pathname !== '/signup/oauth/authorize') {
              return
            }

            var searchParams = new URLSearchParams(window.location.search)
            if (searchParams.has('code_challenge')) {
              return
            }

            var state = searchParams.get('state')
            if (!state) {
              return
            }

            var pair = await createVerifierPair()
            await savePkceVerifier(state, pair.verifier)

            var authorizeUrl = new URL(pathname, casdoorOrigin)
            authorizeUrl.search = window.location.search
            authorizeUrl.searchParams.set('code_challenge', pair.challenge)
            authorizeUrl.searchParams.set('code_challenge_method', 'S256')

            window.location.replace(authorizeUrl.toString())
          }

          bootstrapPkceAuthorize().catch(function (error) {
            console.error('[casdoor-next-auth-kit] authorize bootstrap failed', error)
          })
        })();
  `;
}

export function buildCallbackBridgeScript(): string {
  return String.raw`
        (function () {
          var storagePrefix = ${JSON.stringify(pkceStoragePrefix)}

          function buildErrorUrl(title, message, details) {
            var url = new URL('/callback/error', window.location.origin)
            if (title) {
              url.searchParams.set('title', title)
            }
            if (message) {
              url.searchParams.set('message', message)
            }
            if (details) {
              url.searchParams.set('details', details)
            }
            return url.toString()
          }

          async function getStorageKey(state) {
            var digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(state))
            var digestBytes = new Uint8Array(digest)
            var binary = ''
            for (var index = 0; index < digestBytes.length; index++) {
              binary += String.fromCharCode(digestBytes[index])
            }
            return storagePrefix + '.' + btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '')
          }

          async function postVerifier() {
            var params = new URLSearchParams(window.location.search)
            var code = params.get('code')
            var state = params.get('state')

            if (!code) {
              window.location.replace(buildErrorUrl('缺少授权码', 'Casdoor 回调没有带回 code，这通常意味着授权流程未完成。', 'no_code'))
              return
            }

            if (!state) {
              window.location.replace(buildErrorUrl('登录状态校验失败', '回调中没有带回 state，请重新从登录入口发起流程。', 'invalid_state'))
              return
            }

            var key = await getStorageKey(state)
            var verifier = null
            try {
              verifier = sessionStorage.getItem(key) || localStorage.getItem(key)
            } catch (error) {
              verifier = null
            }

            if (!verifier) {
              window.location.replace(buildErrorUrl('缺少 PKCE 校验值', '回调桥接页没有找到浏览器里保存的 verifier，请重新从登录入口开始。', 'missing_pkce_code_verifier'))
              return
            }

            var response = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ code: code, state: state, verifier: verifier }),
            })

            try {
              sessionStorage.removeItem(key)
            } catch (error) {
              // ignore
            }
            try {
              localStorage.removeItem(key)
            } catch (error) {
              // ignore
            }

            if (!response.ok) {
              throw new Error('Callback exchange failed')
            }

            var payload = null
            try {
              payload = await response.json()
            } catch (error) {
              payload = null
            }

            window.location.replace((payload && payload.redirectUrl) || response.url || '/')
          }

          postVerifier().catch(function (error) {
            console.error('[casdoor-next-auth-kit] callback bridge failed', error)
            window.location.replace(buildErrorUrl('回调交换失败', '浏览器桥接页无法完成令牌交换，请重新发起登录。', 'callback_exchange_failed'))
          })
        })();
  `;
}
