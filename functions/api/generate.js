// Cloudflare Pages Functions - 生成链接 API
import { verifySession, encryptAES, encodeXOR } from '../lib/utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  const isAuthenticated = await verifySession(request, env);
  if (!isAuthenticated) {
    console.log('生成链接请求被拒绝: 未授权访问');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('to');
    const source = url.searchParams.get('source') || 'direct';
    const delay = url.searchParams.get('delay');
    const method = url.searchParams.get('method') || 'aes';
    const clientIP = request.headers.get('CF-Connecting-IP');
    
    if (!targetUrl) {
      console.log('生成链接失败: 缺少目标URL', { ip: clientIP });
      return new Response(JSON.stringify({ error: 'Missing target URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      new URL(targetUrl);
    } catch (error) {
      console.log('生成链接失败: 无效的目标URL', { ip: clientIP, targetUrl });
      return new Response(JSON.stringify({ error: 'Invalid target URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const params = {
      to: targetUrl,
      source: source,
      delay: delay ? parseInt(delay) : 3000,
      method: method,
      createdAt: Date.now()
    };

    let encryptedUrl;
    const baseUrl = new URL(request.url).origin;

    if (method === 'aes') {
      const secretKey = env.ENCRYPTION_KEY;
      if (!secretKey) {
        console.log('生成AES链接失败: 未配置加密密钥', { ip: clientIP });
        throw new Error('AES encryption key not configured');
      }
      const encrypted = await encryptAES(params, secretKey);
      encryptedUrl = `${baseUrl}/e/${encrypted}`;
    } else {
      const obfuscationKey = env.OBFUSCATION_KEY || 'default-obfuscation-key';
      const obfuscated = encodeXOR(params, obfuscationKey);
      encryptedUrl = `${baseUrl}/o/${obfuscated}`;
    }

    console.log('链接生成成功', { ip: clientIP, method, targetUrl });

    return new Response(JSON.stringify({
      success: true,
      encryptedUrl: encryptedUrl,
      method: method,
      targetUrl: targetUrl,
      source: source,
      delay: params.delay
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('生成链接失败', { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to generate link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
