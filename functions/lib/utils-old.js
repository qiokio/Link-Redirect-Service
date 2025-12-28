// Common utility function library

// ==================== HMAC Signature Functions ====================

export function getHMACSecret(env) {
  if (env.HMAC_SECRET) {
    return env.HMAC_SECRET;
  }
  console.warn('Warning: HMAC_SECRET environment variable not set, using default value (insecure in production)');
  return 'default-hmac-secret-key-change-in-production';
}

export function getCHMACSecret(env) {
  if (env.C_HMAC_SECRET) {
    return env.C_HMAC_SECRET;
  }
  console.warn('Warning: C_HMAC_SECRET environment variable not set, falling back to HMAC_SECRET');
  return getHMACSecret(env);
}

export function getRHMACSecret(env) {
  if (env.R_HMAC_SECRET) {
    return env.R_HMAC_SECRET;
  }
  console.warn('Warning: R_HMAC_SECRET environment variable not set, falling back to HMAC_SECRET');
  return getHMACSecret(env);
}

export function getHMACExpiration(env) {
  const expiration = parseInt(env.HMAC_EXPIRATION) || 300;
  return expiration * 1000;
}

export function getRedirectEncryptionKey(env) {
  if (env.REDIRECT_ENCRYPTION_KEY) {
    return env.REDIRECT_ENCRYPTION_KEY;
  }
  console.warn('Warning: REDIRECT_ENCRYPTION_KEY environment variable not set, using default value (insecure in production)');
  return 'default-redirect-encryption-key-change-in-production';
}

export function getCEncryptionKey(env) {
  if (env.C_ENCRYPTION_KEY) {
    return env.C_ENCRYPTION_KEY;
  }
  console.warn('Warning: C_ENCRYPTION_KEY environment variable not set, using default value (insecure in production)');
  return 'default-c-encryption-key-change-in-production';
}

export function getREncryptionKey(env) {
  if (env.R_ENCRYPTION_KEY) {
    return env.R_ENCRYPTION_KEY;
  }
  console.warn('Warning: R_ENCRYPTION_KEY environment variable not set, using default value (insecure in production)');
  return 'default-r-encryption-key-change-in-production';
}

export async function generateHMACSignature(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncodeFromBuffer(signature);
}

export async function verifyHMACSignature(data, signature, secret) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = base64UrlDecodeToBuffer(signature);
    return await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(data));
  } catch (error) {
    console.error('HMAC verification failed:', error);
    return false;
  }
}

// ==================== JWT Session Management ====================

export function getJWTSecret(env) {
  if (env.JWT_SECRET) {
    return env.JWT_SECRET;
  }
  console.warn('Warning: JWT_SECRET environment variable not set, using default value (insecure in production)');
  return 'default-jwt-secret-key-change-in-production';
}

export function getSessionTimeout(env) {
  const timeout = parseInt(env.SESSION_TIMEOUT) || 3600;
  return timeout * 1000;
}

export async function generateJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const expiresAt = Date.now() + getSessionTimeout({});
  payload.exp = Math.floor(expiresAt / 1000);
  payload.iat = Math.floor(Date.now() / 1000);
  
  const encoder = new TextEncoder();
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = base64UrlEncodeFromBuffer(signature);
  
  return `${data}.${encodedSignature}`;
}

export async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const encoder = new TextEncoder();
    const data = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = base64UrlDecodeToBuffer(encodedSignature);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    
    if (!isValid) {
      throw new Error('Invalid JWT signature');
    }
    
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('JWT token expired');
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw error;
  }
}

export async function verifySession(request, env) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log('Session verification failed: Missing Cookie header');
      return false;
    }
    
    const cookies = new Map(cookieHeader.split(';').map(c => {
      const [key, value] = c.trim().split('=');
      return [key, value];
    }));
    
    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
      console.log('Session verification failed: Missing JWT token');
      return false;
    }
    
    const secret = getJWTSecret(env);
    await verifyJWT(jwtToken, secret);
    
    console.log('Session verification successful');
    return true;
  } catch (error) {
    console.log('Session verification failed:', error.message);
    return false;
  }
}

export async function createSessionResponse(env, redirectUrl = '/generate') {
  const payload = {
    sub: 'admin',
    iss: 'link-redirect-service',
    aud: 'link-redirect-service'
  };
  
  const secret = getJWTSecret(env);
  const token = await generateJWT(payload, secret);
  const timeout = getSessionTimeout(env) / 1000;

  console.log('JWT session created successfully');
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': `jwt=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${timeout}`
    }
  });
}

export function clearSessionResponse(redirectUrl = '/login') {
  console.log('Clearing session and redirecting to login page');
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': 'jwt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  });
}

// ==================== Base64Url Encoding Helper Functions ====================

function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

function base64UrlEncodeFromBuffer(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecodeToBuffer(str) {
  const binaryString = base64UrlDecode(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ==================== Encryption/Decryption Functions ====================

export async function encryptAES(params, secretKey) {
  const text = JSON.stringify(params);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey.padEnd(32, '0').slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('fixed-salt'),
      iterations: 1000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function decryptAES(encryptedData, secretKey) {
  try {
    const encoder = new TextEncoder();
    
    let base64 = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) base64 += '='.repeat(4 - padding);
    
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey.padEnd(32, '0').slice(0, 32)),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('fixed-salt'),
        iterations: 1000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );
    
    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text);
  } catch (error) {
    console.log('AES decryption failed', error.message);
    throw new Error('AES decryption failed');
  }
}



// ==================== Configuration and Helper Functions ====================

export function getConfig(env) {
  return {
    allowedDomains: (env.ALLOWED_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    allowedReferers: (env.ALLOWED_REFERERS || '').split(',').map(d => d.trim()).filter(Boolean),
    noRefererCheckDomains: (env.NO_REFERER_CHECK_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    allowEmptyRefererDomains: (env.ALLOW_EMPTY_REFERER_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    defaultDelay: parseDelay(env.DEFAULT_DELAY, 3000),
    enableRefererCheck: env.ENABLE_REFERER_CHECK !== 'false',
    enableDelay: env.ENABLE_DELAY !== 'false',
    enableRiskCheck: env.ENABLE_RISK_CHECK !== 'false',
    riskCheckDelay: parseDelay(env.RISK_CHECK_DELAY, 2000),
    enableUnifiedRedirect: env.ENABLE_UNIFIED_REDIRECT !== 'false',
    unifiedRedirectDelay: parseDelay(env.UNIFIED_REDIRECT_DELAY, 3000),
    webhookUrl: env.WEBHOOK_URL || '',
    kvNamespace: env.REDIRECT_STATS
  };
}

export function parseDelay(value, defaultValue) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < 0) {
    return defaultValue;
  }
  
  return parsed;
}

function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return 'unknown';
  }
}

export function createRiskCheckPage(targetUrl, params, config) {
  const domain = getDomainFromUrl(targetUrl);
  const delaySeconds = config.riskCheckDelay / 1000;
  
  const unifiedRedirectUrl = new URL('/r/', 'http://localhost');
  unifiedRedirectUrl.searchParams.set('to', targetUrl);
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Check</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${unifiedRedirectUrl}">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
        .container { max-width: 600px; margin: 50px auto; padding: 20px; background-color: white; border: 1px solid #ccc; }
        h1 { color: #333; font-size: 20px; }
        .info { margin: 20px 0; }
        .domain { font-family: monospace; background-color: #f9f9f9; padding: 10px; }
        .button { display: inline-block; padding: 8px 16px; background-color: #4CAF50; color: white; text-decoration: none; border: none; cursor: pointer; }
        .button:hover { background-color: #45a049; }
        .security { margin-top: 20px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Security Check</h1>
        <div class="info">
          <p>Checking destination:</p>
          <div class="domain">${domain}</div>
        </div>
        <div>
          <a href="${unifiedRedirectUrl}" class="button">Continue</a>
        </div>
        <div class="security">
          <strong>Security Notice:</strong> Verifying destination safety...
        </div>
      </div>
      <script>
        setTimeout(() => {
          window.location.href = '${unifiedRedirectUrl}';
        }, ${config.riskCheckDelay});
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

export function createUnifiedRedirectPage(targetUrl, config) {
  const domain = getDomainFromUrl(targetUrl);
  const delaySeconds = config.unifiedRedirectDelay / 1000;
  const safeTargetUrl = targetUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting - Link Redirect Service</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #fafafa;
          --bg-nav: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --text-primary: #000000;
          --text-secondary: #666;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #e5e5e5;
          --btn-primary-bg: #000000;
          --btn-primary-text: #ffffff;
          --btn-primary-hover: #333;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #000000;
          --btn-secondary-hover-bg: #000000;
          --btn-secondary-hover-text: #ffffff;
          --feature-icon-bg: #000000;
          --feature-icon-fill: #ffffff;
          --footer-bg: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #333;
          --btn-primary-bg: #ffffff;
          --btn-primary-text: #000000;
          --btn-primary-hover: #e0e0e0;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #ffffff;
          --btn-secondary-hover-bg: #ffffff;
          --btn-secondary-hover-text: #000000;
          --feature-icon-bg: #ffffff;
          --feature-icon-fill: #000000;
          --footer-bg: #1a1a1a;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .redirect-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .redirect-icon {
          width: 64px;
          height: 64px;
          background: var(--feature-icon-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .redirect-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .redirect-card h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .redirect-info {
          margin: 2rem 0;
        }

        .redirect-info p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .domain {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: var(--bg-secondary);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          word-break: break-all;
          margin: 1.5rem 0;
          transition: background 0.3s;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-block;
          margin-top: 1rem;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .security-notice {
          margin-top: 2rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.3);
          color: #0c5460;
          border-radius: 8px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .security-notice svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .countdown {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0;
          color: var(--text-primary);
        }

        footer {
          background: var(--footer-bg);
          color: var(--text-footer);
          padding: 2rem 0;
          margin-top: auto;
          transition: background 0.3s;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-links a {
          color: var(--text-footer);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        .copyright {
          color: var(--text-footer-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .redirect-card {
            padding: 2rem 1.5rem;
            margin-bottom: 1.5rem;
          }

          .redirect-card h1 {
            font-size: 2rem;
          }

          .redirect-info p {
            font-size: 1.1rem;
          }

          .domain {
            font-size: 1rem;
            padding: 0.875rem 1.25rem;
          }

          .btn {
            width: 100%;
            max-width: 280px;
          }

          footer {
            padding: 1.5rem 0;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="redirect-card">
          <div class="redirect-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1>Redirecting</h1>
          <div class="redirect-info">
            <p>You are being redirected to:</p>
            <div class="domain">${domain}</div>
            <div class="countdown">Redirecting in <span id="countdown">${delaySeconds}</span> seconds...</div>
          </div>
          <a href="${safeTargetUrl}" class="btn btn-primary">Go Now</a>
          <div class="security-notice">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>This is a secure redirect. The destination has been verified for your safety.</span>
          </div>
        </div>
      </div>

      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-links">
              <a href="/">Home</a>
              <a href="#">Documentation</a>
              <a href="#">Support</a>
            </div>
            <p class="copyright">© 2025 Link Redirect Service. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script>
        // Theme detection and application
        function getPreferredTheme() {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
            return savedTheme;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        // Apply theme on page load
        setTheme(getPreferredTheme());

        // Countdown timer
        let countdown = ${delaySeconds};
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
          countdown--;
          if (countdownElement) {
            countdownElement.textContent = countdown;
          }
          
          if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = '${safeTargetUrl}';
          }
        }, 1000);

        // Redirect immediately if user clicks the button
        document.querySelector('.btn-primary').addEventListener('click', function(e) {
          e.preventDefault();
          clearInterval(timer);
          window.location.href = '${safeTargetUrl}';
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

export function errorResponse(message, status = 400) {
  console.log('Returning error response', { status, message });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Error - ${status} - Link Redirect Service</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #fafafa;
          --bg-nav: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --text-primary: #000000;
          --text-secondary: #666;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #e5e5e5;
          --btn-primary-bg: #000000;
          --btn-primary-text: #ffffff;
          --btn-primary-hover: #333;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #000000;
          --btn-secondary-hover-bg: #000000;
          --btn-secondary-hover-text: #ffffff;
          --feature-icon-bg: #000000;
          --feature-icon-fill: #ffffff;
          --footer-bg: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          --error-color: #dc3545;
          --error-bg: rgba(220, 53, 69, 0.1);
          --error-border: rgba(220, 53, 69, 0.3);
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #333;
          --btn-primary-bg: #ffffff;
          --btn-primary-text: #000000;
          --btn-primary-hover: #e0e0e0;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #ffffff;
          --btn-secondary-hover-bg: #ffffff;
          --btn-secondary-hover-text: #000000;
          --feature-icon-bg: #ffffff;
          --feature-icon-fill: #000000;
          --footer-bg: #1a1a1a;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          --error-color: #e57373;
          --error-bg: rgba(229, 115, 115, 0.1);
          --error-border: rgba(229, 115, 115, 0.3);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .error-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--error-border);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: var(--error-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
          fill: white;
          transition: fill 0.3s;
        }

        .error-code {
          font-size: 4rem;
          font-weight: 800;
          color: var(--error-color);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .error-message {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-block;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .btn-secondary {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-text);
          border: 2px solid var(--btn-secondary-text);
        }

        .btn-secondary:hover {
          background: var(--btn-secondary-hover-bg);
          color: var(--btn-secondary-hover-text);
        }

        footer {
          background: var(--footer-bg);
          color: var(--text-footer);
          padding: 2rem 0;
          margin-top: auto;
          transition: background 0.3s;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-links a {
          color: var(--text-footer);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        .copyright {
          color: var(--text-footer-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .error-card {
            padding: 2rem 1.5rem;
            margin-bottom: 1.5rem;
          }

          .error-code {
            font-size: 3rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-message {
            font-size: 1.1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 280px;
          }

          footer {
            padding: 1.5rem 0;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-card">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="error-code">${status}</div>
          <h1 class="error-title">Something went wrong</h1>
          <p class="error-message">${message}</p>
          <div class="error-actions">
            <a href="/" class="btn btn-primary">Go Home</a>
            <a href="javascript:history.back()" class="btn btn-secondary">Go Back</a>
          </div>
        </div>
      </div>

      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-links">
              <a href="/">Home</a>
              <a href="#">Documentation</a>
              <a href="#">Support</a>
            </div>
            <p class="copyright">© 2025 Link Redirect Service. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script>
        // Theme detection and application
        function getPreferredTheme() {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
            return savedTheme;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        // Apply theme on page load
        setTheme(getPreferredTheme());
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export function createDelayedRedirect(targetUrl, delay, clickData) {
  const safeTargetUrl = targetUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const delaySeconds = delay / 1000;

  const methodNote = clickData.method === 'aes' ? '<p>AES Encrypted Link</p>' : 
                    clickData.method === 'xor' ? '<p>XOR Obfuscated Link</p>' : 
                    clickData.method === 'legacy' ? '<p>Legacy Method Link</p>' : '';

  console.log('Creating delayed redirect page', { targetUrl, delay, method: clickData.method });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting - Link Redirect Service</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #fafafa;
          --bg-nav: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --text-primary: #000000;
          --text-secondary: #666;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #e5e5e5;
          --btn-primary-bg: #000000;
          --btn-primary-text: #ffffff;
          --btn-primary-hover: #333;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #000000;
          --btn-secondary-hover-bg: #000000;
          --btn-secondary-hover-text: #ffffff;
          --feature-icon-bg: #000000;
          --feature-icon-fill: #ffffff;
          --footer-bg: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
          --border-color: #333;
          --btn-primary-bg: #ffffff;
          --btn-primary-text: #000000;
          --btn-primary-hover: #e0e0e0;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #ffffff;
          --btn-secondary-hover-bg: #ffffff;
          --btn-secondary-hover-text: #000000;
          --feature-icon-bg: #ffffff;
          --feature-icon-fill: #000000;
          --footer-bg: #1a1a1a;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .redirect-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .redirect-icon {
          width: 64px;
          height: 64px;
          background: var(--feature-icon-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .redirect-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .redirect-card h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .redirect-info {
          margin: 2rem 0;
        }

        .redirect-info p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .url {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: var(--bg-secondary);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          word-break: break-all;
          margin: 1.5rem 0;
          transition: background 0.3s;
        }

        .method-note {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 1rem 0;
          font-style: italic;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-block;
          margin-top: 1rem;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .countdown {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0;
          color: var(--text-primary);
        }

        footer {
          background: var(--footer-bg);
          color: var(--text-footer);
          padding: 2rem 0;
          margin-top: auto;
          transition: background 0.3s;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-links a {
          color: var(--text-footer);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        .copyright {
          color: var(--text-footer-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .redirect-card {
            padding: 2rem 1.5rem;
            margin-bottom: 1.5rem;
          }

          .redirect-card h1 {
            font-size: 2rem;
          }

          .redirect-info p {
            font-size: 1.1rem;
          }

          .url {
            font-size: 0.8rem;
            padding: 0.875rem 1.25rem;
          }

          .btn {
            width: 100%;
            max-width: 280px;
          }

          footer {
            padding: 1.5rem 0;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="redirect-card">
          <div class="redirect-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1>Redirecting</h1>
          <div class="redirect-info">
            <p>Redirecting to the following URL in <strong>${delaySeconds}</strong> seconds:</p>
            <div class="url">${safeTargetUrl}</div>
            <div class="countdown">Redirecting in <span id="countdown">${delaySeconds}</span> seconds...</div>
            ${methodNote}
          </div>
          <a href="${safeTargetUrl}" class="btn btn-primary">Redirect Now</a>
        </div>
      </div>

      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-links">
              <a href="/">Home</a>
              <a href="#">Documentation</a>
              <a href="#">Support</a>
            </div>
            <p class="copyright">© 2025 Link Redirect Service. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script>
        // Theme detection and application
        function getPreferredTheme() {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
            return savedTheme;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        // Apply theme on page load
        setTheme(getPreferredTheme());

        // Countdown timer
        let countdown = ${delaySeconds};
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
          countdown--;
          if (countdownElement) {
            countdownElement.textContent = countdown;
          }
          
          if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = '${safeTargetUrl}';
          }
        }, 1000);

        // Redirect immediately if user clicks the button
        document.querySelector('.btn-primary').addEventListener('click', function(e) {
          e.preventDefault();
          clearInterval(timer);
          window.location.href = '${safeTargetUrl}';
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function logClickStatistics(clickData, config) {
  try {
    console.log('Redirect click:', JSON.stringify(clickData));
    
    if (config.kvNamespace) {
      const key = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await config.kvNamespace.put(key, JSON.stringify(clickData), {
        expirationTtl: 60 * 60 * 24 * 30
      });
    }
    
    if (config.webhookUrl) {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clickData)
      });
    }
  } catch (error) {
    console.error('Failed to log click statistics:', error);
  }
}

export async function logBlockedRequest(request, targetUrl, reason, config) {
  const blockData = {
    timestamp: new Date().toISOString(),
    target: targetUrl,
    reason: reason,
    ip: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    referer: request.headers.get('Referer'),
    url: request.url
  };
  
  console.log('Blocked request:', JSON.stringify(blockData));
  
  if (config.kvNamespace) {
    const key = `blocked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await config.kvNamespace.put(key, JSON.stringify(blockData), {
      expirationTtl: 60 * 60 * 24 * 7
    });
  }
}


