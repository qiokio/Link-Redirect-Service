// Cloudflare Pages Functions - Unified Redirect Page (Dynamic Route)
import { 
  getConfig, 
  verifyHMACSignature,
  getHMACSecret,
  getRHMACSecret,
  getRedirectEncryptionKey,
  getREncryptionKey,
  decryptAES,
  getHMACExpiration
} from '../lib/utils.js';
import { createUnifiedRedirectPage } from '../lib/pages/redirect-pages.js';
import { errorResponse } from '../lib/pages/error-pages.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const encryptedUrl = url.searchParams.get('to');
  const timestamp = url.searchParams.get('ts');
  const signature = url.searchParams.get('sig');
  
  if (!encryptedUrl) {
    console.log('Unified redirect failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
  }
  
  if (!timestamp || !signature) {
    console.log('Unified redirect failed: Missing HMAC signature parameters');
    return errorResponse('Invalid or missing security parameters', 403);
  }
  
  // Verify HMAC signature
  const secret = getRHMACSecret(env);
  const signatureData = `${encryptedUrl}|${timestamp}`;
  const isValid = await verifyHMACSignature(signatureData, signature, secret);
  
  // Check if timestamp is within valid range
  const now = Date.now();
  const ts = parseInt(timestamp);
  const signatureAge = now - ts;
  const maxSignatureAge = getHMACExpiration(env); // Get expiration from env variable
  
  if (!isValid || isNaN(ts) || signatureAge > maxSignatureAge) {
    console.log('Unified redirect failed: Invalid HMAC signature or expired timestamp', { isValid, signatureAge, maxSignatureAge });
    return errorResponse('Invalid or expired security parameters', 403);
  }
  
  // Decrypt target URL and parameters
  const rEncryptionKey = getREncryptionKey(env);
  let decryptedData;
  try {
    decryptedData = await decryptAES(encryptedUrl, rEncryptionKey);
    if (!decryptedData.to) {
      throw new Error('Invalid encrypted data: missing target URL');
    }
  } catch (error) {
    console.log('Unified redirect failed: Failed to decrypt target URL', { error: error.message });
    return errorResponse('Invalid or expired security parameters', 403);
  }
  
  const targetUrl = decryptedData.to;
  
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
  
  // Check if delay is 0, if so redirect immediately
  if (decryptedData.delay === 0) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
  
  // Generate secure unified redirect page with parameters
  return createUnifiedRedirectPage(targetUrl, config, decryptedData);
}