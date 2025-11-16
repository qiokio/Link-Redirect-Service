// Cloudflare Pages Functions - 登录 API
import { createSessionResponse } from '../lib/utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { password } = await request.json();
    const clientIP = request.headers.get('CF-Connecting-IP');
    
    console.log('收到登录请求', { ip: clientIP });
    
    if (password === env.GENERATE_PAGE_PASSWORD) {
      console.log('密码验证成功，创建JWT会话', { ip: clientIP });
      return await createSessionResponse(env, '/generate');
    } else {
      console.log('密码验证失败', { ip: clientIP });
      return new Response('Invalid password', { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.log('登录请求解析错误:', error);
    return new Response('Invalid request', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
