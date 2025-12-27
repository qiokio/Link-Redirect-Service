// Risk check utility functions for Link Redirect Service

// Local blacklist data (loaded from files)
let ipBlacklist = [];
let asnBlacklist = [];

/**
 * Load local blacklists
 */
export function loadBlacklists() {
  // In Cloudflare Workers, we can't read files directly, so we'll embed the blacklist data
  // For local development, we could use fs.readFileSync, but for Cloudflare Workers compatibility,
  // we'll directly embed the data here
  
  // IP blacklist from functions/lib/blacklists/ip.txt
  const ipBlacklistContent = ``;
  
  // ASN blacklist from functions/lib/blacklists/asn.txt
  const asnBlacklistContent = `174 195 209 577 792 793 794 1215 1216 1217 2497 2914 3223 3255 3269 3326 3329 3457 3462 3598 4184 4190 4637 4694 4755 4785 4788 4816 4826 4835 5056 5610 5617 6471 6584 6830 6876 6877 6939 7029 7224 7303 7489 7552 7684 8068 8069 8070 8071 8074 8075 8100 8220 8560 8881 8987 9009 9299 9312 9370 9534 9678 9952 9984 10026 10453 10630 11351 11426 11691 12076 12271 12334 12367 12874 12876 12989 14061 14117 14140 14576 14618 15169 16276 16509 16591 16629 17043 17428 17707 17788 17789 17790 17791 18013 18228 18403 18450 18599 18734 18978 19527 19740 20207 20473 20552 20554 20860 21704 21769 21859 21887 22773 22884 23468 23724 23885 23959 23969 24088 24192 24424 24429 24940 25429 25697 25820 25935 25961 26160 26496 26818 27715 28429 28431 28438 28725 29066 29286 29287 29802 30083 30823 31122 31235 31400 31898 32097 32098 32505 32613 34081 34248 34549 34947 35070 35212 35320 35540 35593 35804 35816 35908 35916 36351 36352 36384 36385 36444 36492 36806 37963 37969 38001 38197 38283 38365 38538 38587 38588 38627 39284 40065 40676 40788 41009 41096 41264 41378 42652 42905 43289 43624 43989 45011 45012 45062 45076 45085 45090 45102 45102 45102 45103 45104 45139 45458 45566 45576 45629 45753 45899 45932 46484 46844 47232 47285 47927 48024 48024 48337 48905 49327 49588 49981 50297 50340 50837 51852 52000 52228 52341 53089 54463 54538 54574 54600 54854 54994 55158 55330 55720 55799 55924 55933 55960 55967 55990 55992 56005 56011 56109 56222 57613 58073 58199 58461 58466 58519 58543 58563 58593 58772 58773 58774 58775 58776 58844 58854 58862 58879 59019 59028 59048 59050 59051 59052 59053 59054 59055 59067 59077 59374 60068 60592 60631 60798 61112 61154 61317 61348 61577 61853 62044 62240 62468 62785 62904 63018 63023 63075 63288 63314 63545 63612 63620 63631 63655 63677 63678 63679 63727 63728 63729 63835 63838 63888 63916 63949 64050 131090 131106 131138 131139 131140 131141 131293 131428 131444 131477 131486 131495 132196 132203 132509 132510 132513 132591 132839 133024 133199 133380 133478 133492 133746 133752 133774 133775 133776 133905 133929 134238 134327 134760 134761 134763 134764 134769 134770 134771 134835 134963 135061 135290 135300 135330 135377 135629 137693 137697 137699 137753 137784 137785 137787 137788 137876 137969 138366 138407 138607 138915 138949 138950 138952 138982 138994 139007 139018 139124 139144 139201 139203 139220 139316 139327 139726 139887 140096 140596 140701 140716 140717 140720 140723 140979 141157 141180 142570 146817 149167 177453 177549 197099 197540 198047 198651 199490 199506 199524 199883 200756 201094 201978 202053 202675 203087 204601 204720 206092 206204 206791 206798 207319 207400 207590 208425 208556 211914 212708 213251 213375 262187 263022 263196 263639 263693 264344 264509 265443 265537 266706 267784 269939 270110 328608 394699 395003 395936 395954 395973 398101 965 6461 7195 7203 7713 7941 8075 8560 8987 9009 9123 11878 13349 13965 14061 14593 14618 15169 16276 18779 18978 19148 19527 19871 20853 21704 21769 22552 22612 22616 25369 26496 28753 30633 34081 36599 37148 37963 39686 43513 44144 44477 45090 45102 46261 46516 46606 47583 49367 49981 50304 50495 50835 51167 51290 51765 52393 52449 52485 53667 54252 54600 55081 55286 55960 55990 59253 60068 60781 62160 62240 62874 63023 64080 64267 64286 132203 132817 133499 133752 133944 134450 135377 137718 139659 141995 142002 149428 150436 152194 200373 201035 201341 202044 202496 202914 203020 203061 203098 203346 203999 204287 205544 205659 205964 206092 207990 209043 209709 210644 210906 212144 212329 212335 212384 215859 216071 263740 394380 394474 394814 39486 395954 396356 396982 397391 397630 398101 398823`;
  
  // Parse blacklists
  ipBlacklist = ipBlacklistContent
    .split(/[\s\n]+/)
    .filter(ip => ip.trim() !== '');
  
  asnBlacklist = asnBlacklistContent
    .split(/[\s\n]+/)
    .filter(asn => asn.trim() !== '');
  
  console.log(`Loaded ${ipBlacklist.length} IPs and ${asnBlacklist.length} ASNs from blacklists`);
}

// Initialize blacklists on module load
loadBlacklists();

/**
 * Perform risk assessment on a target URL
 * @param {string} targetUrl - The target URL to check
 * @param {object} [options] - Additional options
 * @param {object} [options.env] - Environment variables (for API keys)
 * @returns {Promise<object>} Risk assessment result
 */
export async function assessUrlRisk(targetUrl, options = {}) {
  const result = {
    isRisky: false,
    reasons: [],
    domain: 'unknown',
    ip: null,
    asn: null
  };

  try {
    const urlObj = new URL(targetUrl);
    result.domain = urlObj.hostname;

    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.isRisky = true;
      result.reasons.push('invalid_protocol');
    }

    // Check for IP address as domain
    const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$|^\[([0-9a-fA-F:]+)\]$/;
    const isIp = ipPattern.test(result.domain);
    
    if (isIp) {
      result.ip = result.domain;
      result.isRisky = true;
      result.reasons.push('ip_as_domain');
    } else {
      // Resolve domain to IP for further checks
      try {
        // In Cloudflare Workers, we can use DNS API to resolve IP
        // For local development, we'll skip this check
        if (typeof options.env !== 'undefined') {
          const ips = await fetch(`https://dns.google/resolve?name=${result.domain}&type=A`)
            .then(res => res.json())
            .then(data => data.Answer?.map(a => a.data) || []);
          if (ips.length > 0) {
            result.ip = ips[0];
          }
        }
      } catch (dnsError) {
        console.warn('DNS resolution failed:', dnsError.message);
      }
    }

    // Check for known risky domains (expanded list)
    const riskyDomains = [
      'malicious.example',
      'phishing.example',
      'scam.example',
      'fake.example',
      'spoof.example',
      'malware.example',
      'virus.example'
    ];
    if (riskyDomains.includes(result.domain)) {
      result.isRisky = true;
      result.reasons.push('known_risky_domain');
    }

    // Check for suspicious subdomains
    const suspiciousSubdomains = [
      'login',
      'auth',
      'secure',
      'account',
      'banking',
      'payment',
      'verify',
      'update',
      'support'
    ];
    const subdomains = result.domain.split('.');
    if (subdomains.length > 2) {
      const subdomain = subdomains[0].toLowerCase();
      if (suspiciousSubdomains.includes(subdomain)) {
        result.isRisky = true;
        result.reasons.push('suspicious_subdomain');
      }
    }

    // Check for non-standard ports
    const standardPorts = ['80', '443', ''];
    if (!standardPorts.includes(urlObj.port)) {
      result.isRisky = true;
      result.reasons.push('non_standard_port');
    }

    // Check URL length
    if (targetUrl.length > 2048) {
      result.isRisky = true;
      result.reasons.push('url_too_long');
    }

    // Check for suspicious path patterns (expanded)
    const suspiciousPatterns = [
      /\/admin\//i,
      /\/login\//i,
      /\/auth\//i,
      /\/password\//i,
      /\/reset\//i,
      /\/verify\//i,
      /\/update\//i,
      /\/confirm\//i,
      /\/secure\//i,
      /\/account\//i,
      /\/banking\//i,
      /\/payment\//i,
      /\/billing\//i,
      /\/checkout\//i,
      /\/download\//i,
      /\/exe\//i,
      /\/zip\//i,
      /\/rar\//i,
      /\/payload\//i,
      /\/exploit\//i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(urlObj.pathname)) {
        result.isRisky = true;
        result.reasons.push('suspicious_path');
        break;
      }
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = [
      '.exe', '.msi', '.bat', '.cmd', '.ps1', '.vbs', '.js',
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
    ];
    const pathLower = urlObj.pathname.toLowerCase();
    if (suspiciousExtensions.some(ext => pathLower.endsWith(ext))) {
      result.isRisky = true;
      result.reasons.push('suspicious_file_extension');
    }

    // Check for excessive query parameters
    if (urlObj.searchParams.size > 20) {
      result.isRisky = true;
      result.reasons.push('excessive_params');
    }

    // Check for suspicious query parameter names (expanded)
    const suspiciousParamNames = [
      'redirect', 'return', 'next', 'callback', 'url',
      'continue', 'target', 'dest', 'destination',
      'login', 'auth', 'password', 'pass', 'pwd',
      'token', 'session', 'cookie', 'sid',
      'cmd', 'command', 'exec', 'execute',
      'eval', 'shell', 'system', 'proc', 'process'
    ];
    for (const param of urlObj.searchParams.keys()) {
      if (suspiciousParamNames.includes(param.toLowerCase())) {
        result.isRisky = true;
        result.reasons.push('suspicious_param_name');
        break;
      }
    }

    // Check for suspicious query parameter values
    const suspiciousParamValues = [
      /javascript:/i,
      /vbscript:/i,
      /data:/i,
      /file:/i,
      /\<script\>/i,
      /\<iframe\>/i,
      /\<object\>/i,
      /\<embed\>/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i
    ];
    for (const value of urlObj.searchParams.values()) {
      if (suspiciousParamValues.some(pattern => pattern.test(value))) {
        result.isRisky = true;
        result.reasons.push('suspicious_param_value');
        break;
      }
    }

    // Check for encoded characters (potential obfuscation)
    const encodedPattern = /%[0-9a-fA-F]{2}/;
    if (encodedPattern.test(targetUrl) && targetUrl.match(encodedPattern).length > 5) {
      result.isRisky = true;
      result.reasons.push('excessive_encoding');
    }

    // External blacklist checks
    if (result.ip) {
      // Check IP against public blacklists
      await checkIpBlacklists(result);
      
      // Check ASN information
      await checkAsnBlacklist(result);
    }

  } catch (error) {
    result.isRisky = true;
    result.reasons.push('invalid_url_format');
  }

  return result;
}

/**
 * Check IP against public blacklist services
 * @param {object} result - Risk assessment result object to update
 */
async function checkIpBlacklists(result) {
  // Check against local IP blacklist
  if (ipBlacklist.includes(result.ip)) {
    result.isRisky = true;
    result.reasons.push('blacklisted_ip_local');
    return;
  }

  // Check against AbuseIPDB (example)
  try {
    // In production, use environment variable for API key
    // const apiKey = options.env.ABUSEIPDB_API_KEY;
    // const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${result.ip}&maxAgeInDays=90`, {
    //   headers: {
    //     'Key': apiKey,
    //     'Accept': 'application/json'
    //   }
    // });
    // const data = await response.json();
    // if (data.data.abuseConfidenceScore > 70) {
    //   result.isRisky = true;
    //   result.reasons.push('blacklisted_ip_abuseipdb');
    // }
  } catch (error) {
    console.warn('AbuseIPDB check failed:', error.message);
  }

  // Check against Spamhaus DBL (example)
  try {
    // For demonstration, we'll use a simple DNS check approach
    // In production, implement proper DNS query
    const spamhausDomains = ['sbl.spamhaus.org', 'xbl.spamhaus.org', 'pbl.spamhaus.org'];
    for (const domain of spamhausDomains) {
      // Simulate DNS lookup - in production use proper DNS API
      // const dnsResult = await fetch(`https://dns.google/resolve?name=${result.ip.split('.').reverse().join('.')}.${domain}&type=A`)
      //   .then(res => res.json());
      // if (dnsResult.Answer?.length > 0) {
      //   result.isRisky = true;
      //   result.reasons.push('blacklisted_ip_spamhaus');
      //   break;
      // }
    }
  } catch (error) {
    console.warn('Spamhaus check failed:', error.message);
  }
}

/**
 * Check ASN information against blacklists
 * @param {object} result - Risk assessment result object to update
 */
async function checkAsnBlacklist(result) {
  try {
    // Get ASN information from ipinfo.io or similar service
    // const response = await fetch(`https://ipinfo.io/${result.ip}/json`);
    // const data = await response.json();
    // result.asn = data.org;
    
    // Example ASN extraction for demonstration
    // In production, this would come from the API response
    let asnNumber = null;
    // Simulate ASN extraction (for testing purposes)
    const testAsnMapping = {
      '1.1.1.1': 'AS13335',
      '8.8.8.8': 'AS15169',
      '93.184.216.34': 'AS15133',
      '185.199.108.153': 'AS54113'
    };
    
    if (testAsnMapping[result.ip]) {
      asnNumber = testAsnMapping[result.ip].replace('AS', '');
      result.asn = testAsnMapping[result.ip];
    }
    
    // Check if ASN is in local blacklist
    if (asnNumber && asnBlacklist.includes(asnNumber)) {
      result.isRisky = true;
      result.reasons.push('blacklisted_asn');
    }
  } catch (error) {
    console.warn('ASN check failed:', error.message);
  }
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
  const highRiskReasons = [
    'invalid_protocol', 
    'invalid_url_format', 
    'known_risky_domain',
    'ip_as_domain',
    'excessive_encoding',
    'blacklisted_ip_local',
    'blacklisted_ip_abuseipdb',
    'blacklisted_ip_spamhaus',
    'blacklisted_asn'
  ];
  if (reasons.some(reason => highRiskReasons.includes(reason))) {
    return 'high';
  }

  // Medium risk reasons
  const mediumRiskReasons = [
    'suspicious_path', 
    'suspicious_param_name',
    'suspicious_param_value',
    'suspicious_subdomain',
    'non_standard_port',
    'url_too_long',
    'suspicious_file_extension'
  ];
  if (reasons.some(reason => mediumRiskReasons.includes(reason))) {
    return 'medium';
  }

  // Low risk reasons
  return 'low';
}