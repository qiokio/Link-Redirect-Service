// Cloudflare Pages Functions - Risk Check Page (Dynamic Route)
import { getConfig, errorResponse } from '../lib/utils.js';
import { assessUrlRisk, createRiskCheckResponse, getRiskLevel } from '../lib/risk-check.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const targetUrl = url.searchParams.get('to');
  
  if (!targetUrl) {
    console.log('Risk check failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
  }
  
  // Perform comprehensive risk assessment using dedicated risk check functions
  const riskResult = assessUrlRisk(targetUrl);
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
  
  // Risk check passed, redirect to unified redirect page /r/
  const unifiedRedirectUrl = new URL('/r/', request.url);
  unifiedRedirectUrl.searchParams.set('to', targetUrl);
  
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