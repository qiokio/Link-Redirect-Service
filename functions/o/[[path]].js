// Cloudflare Pages Functions - XOR 混淆跳转
import { 
  decodeXOR, 
  getConfig, 
  errorResponse, 
  createDelayedRedirect,
  parseDelay,
  logClickStatistics,
  logBlockedRequest
} from '../lib/utils.js';

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length < 2) {
    console.log('XOR跳转失败: 路径无效', { path: url.pathname });
    return errorResponse('Invalid redirect path', 400);
  }

  const obfuscatedData = pathSegments[1];
  let params;
  
  try {
    const obfuscationKey = env.OBFUSCATION_KEY || 'default-obfuscation-key';
    params = decodeXOR(obfuscatedData, obfuscationKey);
    params.method = 'xor';
    
    if (params.expires && Date.now() > params.expires) {
      console.log('XOR链接已过期', { expires: new Date(params.expires).toISOString() });
      return errorResponse('Link has expired', 410);
    }
  } catch (error) {
    console.log('XOR解密失败', { error: error.message });
    return errorResponse('Invalid link parameters', 400);
  }

  console.log('XOR解密成功', { targetUrl: params.to, source: params.source });

  return await handleRedirectWithParams(params, request, env, waitUntil);
}

async function handleRedirectWithParams(params, request, env, waitUntil) {
  const targetUrl = params.to;
  const source = params.source || 'direct';
  const delay = params.delay;

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
    source: source,
    ip: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    country: request.headers.get('CF-IPCountry'),
    referer: request.headers.get('Referer'),
    urlParams: params,
    status: 'redirected',
    securityLevel: isNoRefererCheckDomain ? 'no_referer_check' : 
                 isAllowEmptyRefererDomain ? 'allow_empty_referer' : 'standard',
    method: params.method || 'unknown'
  };

  waitUntil(logClickStatistics(clickData, config));

  const finalDelay = parseDelay(delay, config.defaultDelay);

  console.log('加密跳转处理成功', { targetUrl, source, method: params.method, delay: finalDelay });

  if (config.enableDelay && finalDelay > 0) {
    return createDelayedRedirect(targetUrl, finalDelay, clickData);
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
