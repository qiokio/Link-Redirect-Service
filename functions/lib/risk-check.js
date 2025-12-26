// Risk check utility functions for Link Redirect Service

/**
 * Perform risk assessment on a target URL
 * @param {string} targetUrl - The target URL to check
 * @returns {object} Risk assessment result
 */
export function assessUrlRisk(targetUrl) {
  const result = {
    isRisky: false,
    reasons: [],
    domain: 'unknown'
  };

  try {
    const urlObj = new URL(targetUrl);
    result.domain = urlObj.hostname;

    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.isRisky = true;
      result.reasons.push('invalid_protocol');
    }

    // Check for known risky domains (example implementation)
    const riskyDomains = ['malicious.example', 'phishing.example'];
    if (riskyDomains.includes(result.domain)) {
      result.isRisky = true;
      result.reasons.push('known_risky_domain');
    }

    // Check for suspicious path patterns
    const suspiciousPatterns = [
      /\/admin\//i,
      /\/login\//i,
      /\/auth\//i,
      /\/password\//i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(urlObj.pathname)) {
        result.isRisky = true;
        result.reasons.push('suspicious_path');
        break;
      }
    }

    // Check for excessive query parameters
    if (urlObj.searchParams.size > 20) {
      result.isRisky = true;
      result.reasons.push('excessive_params');
    }

    // Check for suspicious query parameter names
    const suspiciousParams = ['redirect', 'return', 'next', 'callback', 'url'];
    for (const param of urlObj.searchParams.keys()) {
      if (suspiciousParams.includes(param.toLowerCase())) {
        result.isRisky = true;
        result.reasons.push('suspicious_param');
        break;
      }
    }

  } catch (error) {
    result.isRisky = true;
    result.reasons.push('invalid_url_format');
  }

  return result;
}

/**
 * Create a risk check response based on assessment result
 * @param {object} riskResult - The risk assessment result from assessUrlRisk
 * @param {string} targetUrl - The original target URL
 * @returns {object} Formatted risk check response
 */
export function createRiskCheckResponse(riskResult, targetUrl) {
  return {
    targetUrl: targetUrl,
    domain: riskResult.domain,
    isRisky: riskResult.isRisky,
    reasons: riskResult.reasons,
    timestamp: new Date().toISOString(),
    status: riskResult.isRisky ? 'blocked' : 'approved',
    message: riskResult.isRisky 
      ? `Security check failed: ${riskResult.reasons.join(', ')}` 
      : 'Security check passed'
  };
}

/**
 * Get risk level based on reasons
 * @param {string[]} reasons - Array of risk reasons
 * @returns {string} Risk level (low, medium, high)
 */
export function getRiskLevel(reasons) {
  if (reasons.length === 0) {
    return 'low';
  }

  // High risk reasons
  const highRiskReasons = ['invalid_protocol', 'invalid_url_format', 'known_risky_domain'];
  if (reasons.some(reason => highRiskReasons.includes(reason))) {
    return 'high';
  }

  // Medium risk reasons
  const mediumRiskReasons = ['suspicious_path', 'suspicious_param'];
  if (reasons.some(reason => mediumRiskReasons.includes(reason))) {
    return 'medium';
  }

  // Low risk reasons
  return 'low';
}