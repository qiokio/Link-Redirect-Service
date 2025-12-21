// 通用工具函数库

// ==================== JWT 会话管理 ====================

export function getJWTSecret(env) {
  if (env.JWT_SECRET) {
    return env.JWT_SECRET;
  }
  console.warn('警告: JWT_SECRET环境变量未设置，使用默认值（生产环境不安全）');
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
      console.log('会话验证失败: 缺少Cookie头');
      return false;
    }
    
    const cookies = new Map(cookieHeader.split(';').map(c => {
      const [key, value] = c.trim().split('=');
      return [key, value];
    }));
    
    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
      console.log('会话验证失败: 缺少JWT token');
      return false;
    }
    
    const secret = getJWTSecret(env);
    await verifyJWT(jwtToken, secret);
    
    console.log('会话验证成功');
    return true;
  } catch (error) {
    console.log('会话验证失败:', error.message);
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

  console.log('JWT会话创建成功');
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': `jwt=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${timeout}`
    }
  });
}

export function clearSessionResponse(redirectUrl = '/login') {
  console.log('清除会话并重定向到登录页');
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': 'jwt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  });
}

// ==================== Base64Url 编码辅助函数 ====================

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

// ==================== 加密/解密函数 ====================

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
    console.log('AES解密失败', error.message);
    throw new Error('AES decryption failed');
  }
}



// ==================== 配置和辅助函数 ====================

export function getConfig(env) {
  return {
    allowedDomains: (env.ALLOWED_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    allowedReferers: (env.ALLOWED_REFERERS || '').split(',').map(d => d.trim()).filter(Boolean),
    noRefererCheckDomains: (env.NO_REFERER_CHECK_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    allowEmptyRefererDomains: (env.ALLOW_EMPTY_REFERER_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean),
    defaultDelay: parseDelay(env.DEFAULT_DELAY, 3000),
    enableRefererCheck: env.ENABLE_REFERER_CHECK !== 'false',
    enableDelay: env.ENABLE_DELAY !== 'false',
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

export function errorResponse(message, status = 400) {
  console.log('返回错误响应', { status, message });

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

  const methodNote = clickData.method === 'aes' ? '<p>AES 加密链接</p>' : 
                    clickData.method === 'xor' ? '<p>XOR 混淆链接</p>' : 
                    clickData.method === 'legacy' ? '<p>原始方法链接</p>' : '';

  console.log('创建延迟跳转页面', { targetUrl, delay, method: clickData.method });

  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>正在跳转</title>
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
        <h1>正在跳转</h1>
        <p>将在 <strong>${delaySeconds}</strong> 秒后跳转到以下 URL：</p>
        <div class="url">${safeTargetUrl}</div>
        ${methodNote}
        <a href="${safeTargetUrl}" class="btn">立即跳转</a>
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
