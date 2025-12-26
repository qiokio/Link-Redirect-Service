// Cloudflare Pages Functions - Unified Redirect Page (Dynamic Route)
import { getConfig, errorResponse, createUnifiedRedirectPage } from '../lib/utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const targetUrl = url.searchParams.get('to');
  
  if (!targetUrl) {
    console.log('Unified redirect failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
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