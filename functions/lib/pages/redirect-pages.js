// Cloudflare Pages Functions - Redirect Pages Rendering
import { getDomainFromUrl } from '../utils.js';

export function createUnifiedRedirectPage(targetUrl, config, params = {}) {
  const domain = getDomainFromUrl(targetUrl);
  // Use delay from params if available, otherwise use default delay from config
  const delay = params.delay || config.unifiedRedirectDelay;
  
  // If delay is 0, redirect immediately without showing a page
  if (delay === 0) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
  
  const delaySeconds = delay / 1000;
  const safeTargetUrl = targetUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting - Link Redirect Service</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #fafafa;
          --bg-nav: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --text-primary: #000000;
          --text-secondary: #666;
          --border-color: #e5e5e5;
          --btn-primary-bg: #000000;
          --btn-primary-text: #ffffff;
          --btn-primary-hover: #333;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #000000;
          --btn-secondary-hover-bg: #000000;
          --btn-secondary-hover-text: #ffffff;
          --feature-icon-bg: #000000;
          --feature-icon-fill: #ffffff;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --border-color: #333;
          --btn-primary-bg: #ffffff;
          --btn-primary-text: #000000;
          --btn-primary-hover: #e0e0e0;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #ffffff;
          --btn-secondary-hover-bg: #ffffff;
          --btn-secondary-hover-text: #000000;
          --feature-icon-bg: #ffffff;
          --feature-icon-fill: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .redirect-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .redirect-icon {
          width: 64px;
          height: 64px;
          background: var(--feature-icon-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .redirect-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .redirect-card h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .redirect-info {
          margin: 2rem 0;
        }

        .redirect-info p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .domain {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: var(--bg-secondary);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          word-break: break-all;
          margin: 1.5rem 0;
          transition: background 0.3s;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-block;
          margin-top: 1rem;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .security-notice {
          margin-top: 2rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.3);
          color: #0c5460;
          border-radius: 8px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .security-notice svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .countdown {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0;
          color: var(--text-primary);
        }



        @media (max-width: 768px) {
            .container {
              padding: 0 1rem;
            }

            .redirect-card {
              padding: 2rem 1.5rem;
              margin-bottom: 1.5rem;
            }

            .redirect-card h1 {
              font-size: 2rem;
            }

            .redirect-info p {
              font-size: 1.1rem;
            }

            .domain {
              font-size: 1rem;
              padding: 0.875rem 1.25rem;
            }

            .btn {
              width: 100%;
              max-width: 280px;
            }
          }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="redirect-card">
          <div class="redirect-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1>Redirecting</h1>
          <div class="redirect-info">
            <p>You are being redirected to:</p>
            <div class="domain">${domain}</div>
            <div class="countdown">Redirecting in <span id="countdown">${delaySeconds}</span> seconds...</div>
          </div>
          <a href="${safeTargetUrl}" class="btn btn-primary">Go Now</a>
          <div class="security-notice">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>This is a secure redirect. The destination has been verified for your safety.</span>
          </div>
        </div>
      </div>

      <script>
        // Theme detection and application
        function getPreferredTheme() {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
            return savedTheme;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        // Apply theme on page load
        setTheme(getPreferredTheme());

        // Countdown timer
        let countdown = ${delaySeconds};
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
          countdown--;
          if (countdownElement) {
            countdownElement.textContent = countdown;
          }
          
          if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = '${safeTargetUrl}';
          }
        }, 1000);

        // Redirect immediately if user clicks the button
        document.querySelector('.btn-primary').addEventListener('click', function(e) {
          e.preventDefault();
          clearInterval(timer);
          window.location.href = '${safeTargetUrl}';
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

export function createDelayedRedirect(targetUrl, delay, clickData) {
  // If delay is 0, redirect immediately without showing a page
  if (delay === 0) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
  
  const safeTargetUrl = targetUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const delaySeconds = delay / 1000;

  const methodNote = clickData.method === 'aes' ? '<p>AES Encrypted Link</p>' : 
                    clickData.method === 'xor' ? '<p>XOR Obfuscated Link</p>' : 
                    clickData.method === 'legacy' ? '<p>Legacy Method Link</p>' : '';

  console.log('Creating delayed redirect page', { targetUrl, delay, method: clickData.method });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting - Link Redirect Service</title>
      <meta http-equiv="refresh" content="${delaySeconds};url=${safeTargetUrl}">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #fafafa;
          --bg-nav: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --text-primary: #000000;
          --text-secondary: #666;
          --border-color: #e5e5e5;
          --btn-primary-bg: #000000;
          --btn-primary-text: #ffffff;
          --btn-primary-hover: #333;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #000000;
          --btn-secondary-hover-bg: #000000;
          --btn-secondary-hover-text: #ffffff;
          --feature-icon-bg: #000000;
          --feature-icon-fill: #ffffff;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --border-color: #333;
          --btn-primary-bg: #ffffff;
          --btn-primary-text: #000000;
          --btn-primary-hover: #e0e0e0;
          --btn-secondary-bg: transparent;
          --btn-secondary-text: #ffffff;
          --btn-secondary-hover-bg: #ffffff;
          --btn-secondary-hover-text: #000000;
          --feature-icon-bg: #ffffff;
          --feature-icon-fill: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .redirect-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .redirect-icon {
          width: 64px;
          height: 64px;
          background: var(--feature-icon-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .redirect-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .redirect-card h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .redirect-info {
          margin: 2rem 0;
        }

        .redirect-info p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .url {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: var(--bg-secondary);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          word-break: break-all;
          margin: 1.5rem 0;
          transition: background 0.3s;
        }

        .method-note {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 1rem 0;
          font-style: italic;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-block;
          margin-top: 1rem;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .countdown {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0;
          color: var(--text-primary);
        }



        @media (max-width: 768px) {
            .container {
              padding: 0 1rem;
            }

            .redirect-card {
              padding: 2rem 1.5rem;
              margin-bottom: 1.5rem;
            }

            .redirect-card h1 {
              font-size: 2rem;
            }

            .redirect-info p {
              font-size: 1.1rem;
            }

            .url {
              font-size: 0.8rem;
              padding: 0.875rem 1.25rem;
            }

            .btn {
              width: 100%;
              max-width: 280px;
            }
          }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="redirect-card">
          <div class="redirect-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1>Redirecting</h1>
          <div class="redirect-info">
            <p>Redirecting to the following URL in <strong>${delaySeconds}</strong> seconds:</p>
            <div class="url">${safeTargetUrl}</div>
            <div class="countdown">Redirecting in <span id="countdown">${delaySeconds}</span> seconds...</div>
            ${methodNote}
          </div>
          <a href="${safeTargetUrl}" class="btn btn-primary">Redirect Now</a>
        </div>
      </div>

      <script>
        // Theme detection and application
        function getPreferredTheme() {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
            return savedTheme;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
        }

        // Apply theme on page load
        setTheme(getPreferredTheme());

        // Countdown timer
        let countdown = ${delaySeconds};
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
          countdown--;
          if (countdownElement) {
            countdownElement.textContent = countdown;
          }
          
          if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = '${safeTargetUrl}';
          }
        }, 1000);

        // Redirect immediately if user clicks button
        document.querySelector('.btn-primary').addEventListener('click', function(e) {
          e.preventDefault();
          clearInterval(timer);
          window.location.href = '${safeTargetUrl}';
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}