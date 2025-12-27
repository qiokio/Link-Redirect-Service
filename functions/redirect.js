// Cloudflare Pages Functions - Traditional Redirect (Unencrypted)
import { 
  getConfig, 
  errorResponse, 
  createDelayedRedirect,
  parseDelay,
  logClickStatistics,
  logBlockedRequest,
  generateHMACSignature,
  getHMACSecret
} from './lib/utils.js';

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('to');
  
  if (!targetUrl) {
    console.log('Legacy redirect failed: Missing target URL parameter');
    return errorResponse('Missing target URL parameter "to"', 400);
  }

  const config = getConfig(env);

  let targetHostname;
  try {
    const targetUrlObj = new URL(targetUrl);
    targetHostname = targetUrlObj.hostname;
    
    if (!['http:', 'https:'].includes(targetUrlObj.protocol)) {
      await logBlockedRequest(request, targetUrl, 'invalid_protocol', config);
      return errorResponse('Invalid URL protocol', 400);
    }
  } catch (error) {
    await logBlockedRequest(request, targetUrl, 'invalid_url', config);
    return errorResponse('Invalid target URL', 400);
  }

  if (config.allowedDomains.length > 0) {
    const isDomainAllowed = config.allowedDomains.some(domain => 
      targetHostname === domain || targetHostname.endsWith('.' + domain)
    );
    
    if (!isDomainAllowed) {
      await logBlockedRequest(request, targetUrl, 'domain_blocked', config);
      return errorResponse('Target domain not allowed', 403);
    }
  }

  const isNoRefererCheckDomain = config.noRefererCheckDomains.some(domain => 
    targetHostname === domain || targetHostname.endsWith('.' + domain)
  );

  const isAllowEmptyRefererDomain = config.allowEmptyRefererDomains.some(domain => 
    targetHostname === domain || targetHostname.endsWith('.' + domain)
  );

  if (config.enableRefererCheck && config.allowedReferers.length > 0 && !isNoRefererCheckDomain) {
    const referer = request.headers.get('Referer');
    
    if (!referer) {
      if (!isAllowEmptyRefererDomain) {
        await logBlockedRequest(request, targetUrl, 'missing_referer', config);
        return errorResponse('Referer required', 403);
      }
    } else {
      const refererHost = new URL(referer).hostname;
      const isRefererAllowed = config.allowedReferers.some(domain => 
        refererHost === domain || refererHost.endsWith('.' + domain)
      );
      
      if (!isRefererAllowed) {
        await logBlockedRequest(request, targetUrl, 'referer_blocked', config);
        return errorResponse('Referer not allowed', 403);
      }
    }
  }

  const clickData = {
    timestamp: new Date().toISOString(),
    target: targetUrl,
    source: url.searchParams.get('source') || 'direct',
    ip: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    country: request.headers.get('CF-IPCountry'),
    referer: request.headers.get('Referer'),
    urlParams: Object.fromEntries(url.searchParams),
    status: 'redirected',
    securityLevel: isNoRefererCheckDomain ? 'no_referer_check' : 
                 isAllowEmptyRefererDomain ? 'allow_empty_referer' : 'standard',
    method: 'legacy'
  };

  waitUntil(logClickStatistics(clickData, config));

  const delayParam = url.searchParams.get('delay');
  const delay = parseDelay(delayParam, config.defaultDelay);

  console.log('Legacy redirect processed successfully', { targetUrl, source: clickData.source, delay });

  if (config.enableRiskCheck) {
    // Redirect to risk check page /c/
    const timestamp = Date.now();
    const secret = getHMACSecret(env);
    const signatureData = `${targetUrl}|${timestamp}`;
    const signature = await generateHMACSignature(signatureData, secret);
    
    const riskCheckUrl = new URL('/c/', request.url);
    riskCheckUrl.searchParams.set('to', targetUrl);
    riskCheckUrl.searchParams.set('ts', timestamp.toString());
    riskCheckUrl.searchParams.set('sig', signature);
    
    console.log('Legacy redirect: redirecting to risk check page', { targetUrl, riskCheckUrl: riskCheckUrl.toString() });
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': riskCheckUrl.toString(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  } else if (config.enableUnifiedRedirect) {
    // Directly redirect to unified redirect page /r/
    const timestamp = Date.now();
    const secret = getHMACSecret(env);
    const signatureData = `${targetUrl}|${timestamp}`;
    const signature = await generateHMACSignature(signatureData, secret);
    
    const unifiedRedirectUrl = new URL('/r/', request.url);
    unifiedRedirectUrl.searchParams.set('to', targetUrl);
    unifiedRedirectUrl.searchParams.set('ts', timestamp.toString());
    unifiedRedirectUrl.searchParams.set('sig', signature);
    
    console.log('Legacy redirect: redirecting to unified redirect page', { targetUrl, unifiedRedirectUrl: unifiedRedirectUrl.toString() });
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': unifiedRedirectUrl.toString(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  } else if (config.enableDelay && delay > 0) {
    return createDelayedRedirect(targetUrl, delay, clickData);
  } else {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
}
