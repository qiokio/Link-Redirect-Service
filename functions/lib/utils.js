// Common utility function library

// ==================== HMAC Signature Functions ====================

export function getHMACSecret(env) {
  if (env.HMAC_SECRET) {
    return env.HMAC_SECRET;
  }
  console.warn('Warning: HMAC_SECRET environment variable not set, using default value (insecure in production)');
  return 'default-hmac-secret-key-change-in-production';
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
      <title>Redirecting</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
        .container { max-width: 600px; margin: 50px auto; padding: 20px; background-color: white; border: 1px solid #ccc; }
        h1 { color: #333; font-size: 20px; }
        .info { margin: 20px 0; }
        .domain { font-family: monospace; background-color: #f9f9f9; padding: 10px; }
        .button { display: inline-block; padding: 8px 16px; background-color: #007bff; color: white; text-decoration: none; border: none; cursor: pointer; }
        .button:hover { background-color: #0056b3; }
        .security { margin-top: 20px; padding: 10px; background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Redirecting</h1>
        <div class="info">
          <p>You are being redirected to:</p>
          <div class="domain">${domain}</div>
        </div>
        <div>
          <a href="${safeTargetUrl}" class="button">Go Now</a>
        </div>
        <div class="security">
          <strong>Notice:</strong> Redirecting to destination...
        </div>
      </div>
      <script>
        setTimeout(() => {
          window.location.href = '${safeTargetUrl}';
        }, ${config.unifiedRedirectDelay});
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
    <html>
    <head>
      <title>Error - ${status}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #f8f9fa;
          color: #212529;
          line-height: 1.5;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
        }
        .error-container {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 30px;
          text-align: center;
        }
        h1 {
          color: #dc3545;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>${status} Error</h1>
        <p>${message}</p>
      </div>
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
      <title>Redirecting</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #f8f9fa;
          color: #212529;
          line-height: 1.5;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
        }
        .container {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 30px;
          text-align: center;
        }
        h1 {
          margin-bottom: 20px;
          font-size: 24px;
        }
        .url {
          background: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          word-break: break-all;
          font-family: monospace;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 10px;
        }
        .btn:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Redirecting</h1>
        <p>Redirecting to the following URL in <strong>${delaySeconds}</strong> seconds:</p>
        <div class="url">${safeTargetUrl}</div>
        ${methodNote}
        <a href="${safeTargetUrl}" class="btn">Redirect Now</a>
      </div>
      
      <script>
        setTimeout(() => {
          window.location.href = '${safeTargetUrl}';
        }, ${delay});
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


