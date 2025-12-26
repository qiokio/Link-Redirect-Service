// Cloudflare Pages Functions - Health Check
export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'link-redirect-service'
  }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}