// Cloudflare Pages Functions - Generate Link API
import { verifySession, encryptAES } from '../lib/utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  const isAuthenticated = await verifySession(request, env);
  if (!isAuthenticated) {
    console.log('Link generation request denied: Unauthorized access');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('to');
    const source = url.searchParams.get('source') || 'direct';
    const delay = url.searchParams.get('delay');
    const method = 'aes'; // Only AES encryption method supported
    const clientIP = request.headers.get('CF-Connecting-IP');
    
    if (!targetUrl) {
      console.log('Link generation failed: Missing target URL', { ip: clientIP });
      return new Response(JSON.stringify({ error: 'Missing target URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      new URL(targetUrl);
    } catch (error) {
      console.log('Link generation failed: Invalid target URL', { ip: clientIP, targetUrl });
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

    const secretKey = env.ENCRYPTION_KEY;
    if (!secretKey) {
      console.log('AES link generation failed: Encryption key not configured', { ip: clientIP });
      throw new Error('AES encryption key not configured');
    }
    const encrypted = await encryptAES(params, secretKey);
    encryptedUrl = `${baseUrl}/e/${encrypted}`;

    console.log('Link generated successfully', { ip: clientIP, method, targetUrl });

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
    console.log('Link generation failed', { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to generate link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
