// Cloudflare Pages Functions - Risk Check Page (Dynamic Route)
import { 
  getConfig, 
  verifyHMACSignature,
  getHMACSecret,
  getCHMACSecret,
  getRHMACSecret,
  generateHMACSignature,
  getRedirectEncryptionKey,
  getCEncryptionKey,
  getREncryptionKey,
  decryptAES,
  encryptAES,
  getHMACExpiration
} from '../lib/utils.js';
import { errorResponse } from '../lib/pages/error-pages.js';
import { assessUrlRisk, createRiskCheckResponse, getRiskLevel } from '../lib/risk-check.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const encryptedUrl = url.searchParams.get('to');
  const timestamp = url.searchParams.get('ts');
  const signature = url.searchParams.get('sig');
  
  if (!encryptedUrl) {
    console.log('Risk check failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
  }
  
  if (!timestamp || !signature) {
    console.log('Risk check failed: Missing HMAC signature parameters');
    return errorResponse('Invalid or missing security parameters', 403);
  }
  
  // Verify HMAC signature
  const secret = getCHMACSecret(env);
  const signatureData = `${encryptedUrl}|${timestamp}`;
  const isValid = await verifyHMACSignature(signatureData, signature, secret);
  
  // Check if timestamp is within valid range
  const now = Date.now();
  const ts = parseInt(timestamp);
  const signatureAge = now - ts;
  const maxSignatureAge = getHMACExpiration(env); // Get expiration from env variable
  
  if (!isValid || isNaN(ts) || signatureAge > maxSignatureAge) {
    console.log('Risk check failed: Invalid HMAC signature or expired timestamp', { isValid, signatureAge, maxSignatureAge });
    return errorResponse('Invalid or expired security parameters', 403);
  }
  
  // Decrypt target URL
  const cEncryptionKey = getCEncryptionKey(env);
  let targetUrl;
  try {
    const decryptedData = await decryptAES(encryptedUrl, cEncryptionKey);
    targetUrl = decryptedData.to;
    if (!targetUrl) {
      throw new Error('Invalid encrypted data: missing target URL');
    }
  } catch (error) {
    console.log('Risk check failed: Failed to decrypt target URL', { error: error.message });
    return errorResponse('Invalid or expired security parameters', 403);
  }
  
  // Perform comprehensive risk assessment using dedicated risk check functions
  const riskResult = await assessUrlRisk(targetUrl, { env });
  const riskResponse = createRiskCheckResponse(riskResult, targetUrl);
  const riskLevel = getRiskLevel(riskResult.reasons);
  
  console.log('Risk assessment completed', {
    targetUrl,
    isRisky: riskResult.isRisky,
    reasons: riskResult.reasons,
    riskLevel,
    domain: riskResult.domain
  });
  
  if (riskResult.isRisky) {
    console.log('Risk check failed', { targetUrl, reasons: riskResult.reasons, riskLevel });
    return errorResponse(`Security check failed: ${riskResult.reasons.join(', ')}`, 403);
  }
  
  // Risk check passed, redirect to unified redirect page /r/ with encrypted target URL
  const newTimestamp = Date.now();
  // Re-encrypt target URL with fresh encryption
  const rEncryptionKey = getREncryptionKey(env);
  const newEncryptedUrl = await encryptAES({ to: targetUrl }, rEncryptionKey);
  const newSignatureData = `${newEncryptedUrl}|${newTimestamp}`;
  const newSignature = await generateHMACSignature(newSignatureData, getRHMACSecret(env));
  
  const unifiedRedirectUrl = new URL('/r/', request.url);
  unifiedRedirectUrl.searchParams.set('to', newEncryptedUrl);
  unifiedRedirectUrl.searchParams.set('ts', newTimestamp.toString());
  unifiedRedirectUrl.searchParams.set('sig', newSignature);
  
  console.log('Risk check passed, redirecting to unified redirect page', { targetUrl, riskLevel });
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': unifiedRedirectUrl.toString(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Risk-Level': riskLevel,
      'X-Risk-Domain': riskResult.domain
    }
  });
}