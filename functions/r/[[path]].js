// Cloudflare Pages Functions - Unified Redirect Page (Dynamic Route)
import { 
  getConfig, 
  errorResponse, 
  createUnifiedRedirectPage,
  verifyHMACSignature,
  getHMACSecret
} from '../lib/utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const targetUrl = url.searchParams.get('to');
  const timestamp = url.searchParams.get('ts');
  const signature = url.searchParams.get('sig');
  
  if (!targetUrl) {
    console.log('Unified redirect failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
  }
  
  if (!timestamp || !signature) {
    console.log('Unified redirect failed: Missing HMAC signature parameters');
    return errorResponse('Invalid or missing security parameters', 403);
  }
  
  // Verify HMAC signature
  const secret = getHMACSecret(env);
  const signatureData = `${targetUrl}|${timestamp}`;
  const isValid = await verifyHMACSignature(signatureData, signature, secret);
  
  // Check if timestamp is within valid range (5 minutes)
  const now = Date.now();
  const ts = parseInt(timestamp);
  const signatureAge = now - ts;
  const maxSignatureAge = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (!isValid || isNaN(ts) || signatureAge > maxSignatureAge) {
    console.log('Unified redirect failed: Invalid HMAC signature or expired timestamp', { isValid, signatureAge, maxSignatureAge });
    return errorResponse('Invalid or expired security parameters', 403);
  }
  
  try {
    const targetUrlObj = new URL(targetUrl);
    if (!['http:', 'https:'].includes(targetUrlObj.protocol)) {
      console.log('Unified redirect failed: Invalid protocol', { targetUrl });
      return errorResponse('Invalid URL protocol', 400);
    }
  } catch (error) {
    console.log('Unified redirect failed: Invalid URL format', { targetUrl, error: error.message });
    return errorResponse('Invalid target URL', 400);
  }
  
  const config = getConfig(env);
  
  console.log('Generating unified redirect page', { targetUrl });
  
  // Generate secure unified redirect page (only shows domain name)
  return createUnifiedRedirectPage(targetUrl, config);
}