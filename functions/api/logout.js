// Cloudflare Pages Functions - 登出 API
export async function onRequestPost(context) {
  const { request } = context;
  const clientIP = request.headers.get('CF-Connecting-IP');
  
  console.log('用户登出', { ip: clientIP });
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'jwt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      'Access-Control-Allow-Origin': '*'
    }
  });
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
