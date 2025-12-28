// Cloudflare Pages Functions - Generate Page
import { verifySession, clearSessionResponse } from './lib/utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  const isAuthenticated = await verifySession(request, env);
  if (!isAuthenticated) {
    console.log('生成页面访问被拒绝: 未授权');
    return clearSessionResponse('/login');
  }

  console.log('生成页面访问成功');

  return new Response(generateLinkPage(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function generateLinkPage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Generator - Link Redirect Service</title>
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
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
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
          --footer-bg: #000000;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          --success-color: #28a745;
          --error-color: #dc3545;
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-nav: rgba(10, 10, 10, 0.95);
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --text-footer: #ffffff;
          --text-footer-secondary: #999;
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
          --footer-bg: #1a1a1a;
          --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          --success-color: #32d74b;
          --error-color: #ff453a;
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
        }

        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--bg-nav);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          z-index: 1000;
          transition: background 0.3s, border-color 0.3s;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          align-items: center;
        }

        .nav-links a {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .nav-links a:hover {
          opacity: 0.7;
        }

        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .theme-toggle:hover {
          background: var(--border-color);
        }

        .theme-toggle svg {
          width: 24px;
          height: 24px;
          fill: var(--text-primary);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .mobile-menu-btn:hover {
          background: var(--border-color);
        }

        .mobile-menu-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s;
        }

        .hero {
          padding: 160px 0 60px;
          text-align: center;
        }

        .hero h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .hero p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2.5rem;
        }

        .generator-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          margin-bottom: 3rem;
          transition: all 0.3s;
        }

        .generator-icon {
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

        .generator-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .generator-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .generator-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .generator-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        input, select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--bg-card);
          color: var(--text-primary);
          transition: border-color 0.2s, background 0.3s;
        }

        input:focus, select:focus {
          outline: none;
          border-color: var(--btn-primary-bg);
        }

        .radio-group {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.75rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .radio-option input[type="radio"] {
          width: auto;
          padding: 0;
          margin: 0;
        }

        .btn {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border-color: var(--btn-primary-bg);
          width: 100%;
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .btn-secondary {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-text);
          border-color: var(--btn-secondary-text);
        }

        .btn-secondary:hover {
          background: var(--btn-secondary-hover-bg);
          color: var(--btn-secondary-hover-text);
        }

        .loading {
          text-align: center;
          padding: 2rem;
          display: none;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--btn-primary-bg);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .result {
          margin-top: 2rem;
          padding: 2rem;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          display: none;
          transition: all 0.3s;
        }

        .result.success {
          display: block;
          border-left: 4px solid var(--success-color);
        }

        .result.error {
          display: block;
          border-left: 4px solid var(--error-color);
        }

        .result h3 {
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .result p {
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .url-display {
          background: var(--bg-secondary);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          word-break: break-all;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9rem;
          margin: 1.5rem 0;
          transition: background 0.3s;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .action-buttons button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        footer {
          background: var(--footer-bg);
          color: var(--text-footer);
          padding: 3rem 0;
          margin-top: auto;
          transition: background 0.3s;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }

        .footer-links a {
          color: var(--text-footer);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        .copyright {
          color: var(--text-footer-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .container {
            padding: 0 1.5rem;
          }

          .hero h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .nav-content {
            padding: 1rem;
          }

          .logo {
            font-size: 1.25rem;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .nav-links {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-nav);
            border-bottom: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .nav-links.mobile-visible {
            display: flex;
          }

          .nav-links li {
            width: 100%;
          }

          .nav-links a {
            display: block;
            padding: 0.75rem 0;
            width: 100%;
          }

          .theme-toggle {
            align-self: flex-start;
          }

          .hero {
            padding: 140px 0 40px;
          }

          .hero h1 {
            font-size: 2.25rem;
            line-height: 1.2;
          }

          .hero p {
            font-size: 1.1rem;
            margin: 0 auto 2rem;
          }

          .generator-card {
            padding: 2rem 1.5rem;
            margin-bottom: 2rem;
          }

          .generator-header h2 {
            font-size: 1.75rem;
          }

          .radio-group {
            flex-direction: column;
            gap: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          footer {
            padding: 2rem 0;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 120px 0 30px;
          }

          .hero h1 {
            font-size: 1.875rem;
          }

          .hero p {
            font-size: 1rem;
          }

          .generator-card {
            padding: 1.5rem 1rem;
          }
        }
      </style>
    </head>
    <body>
      <nav>
        <div class="nav-content">
          <a href="/" class="logo">Link Redirect</a>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul class="nav-links" id="navLinks">
            <li><a href="/">Home</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#stats">Stats</a></li>
            <li><a href="/#docs">Documentation</a></li>
            <li><a href="/#github">GitHub</a></li>
            <li>
              <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                <svg id="sunIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="display: none;">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000 1.41.996.996 0 001.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z"/>
                </svg>
                <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <section class="hero">
        <div class="container">
          <h1>Link Generator</h1>
          <p>Generate secure and encrypted redirect links with advanced tracking options</p>
        </div>
      </section>

      <div class="container">
        <div class="generator-card">
          <div class="generator-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div class="generator-header">
            <h2>Create Secure Link</h2>
            <p>Fill in the details below to generate your encrypted redirect link</p>
          </div>
          
          <form id="generateForm">
            <div class="form-group">
              <label for="targetUrl">Target URL</label>
              <input type="url" id="targetUrl" required placeholder="https://example.com">
            </div>
            
            <div class="form-group">
              <label for="source">Source Identifier (optional)</label>
              <input type="text" id="source" placeholder="newsletter, campaign, etc.">
            </div>
            
            <div class="form-group">
              <label for="delay">Delay Time (milliseconds, optional)</label>
              <input type="number" id="delay" placeholder="Default 3000" min="0" max="10000">
            </div>
            
            <div class="form-group">
              <label>Encryption Method</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" name="method" value="aes" checked disabled>
                  <span>AES Encryption</span>
                </label>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary">Generate Link</button>
          </form>
          
          <div class="loading" id="loading">
            <div class="loading-spinner"></div>
            <p>Generating link...</p>
          </div>
          
          <div class="result" id="result"></div>
        </div>
      </div>

      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-links">
              <a href="/">Home</a>
              <a href="/#features">Features</a>
              <a href="/#docs">Documentation</a>
              <a href="/#github">GitHub</a>
              <a href="#" id="logoutLink">Logout</a>
            </div>
            <p class="copyright">© 2025 Link Redirect Service. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script>
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

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
          
          if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
          } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
          }
        }

        function toggleTheme() {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          setTheme(newTheme);
        }

        function toggleMobileMenu() {
          mobileMenuBtn.classList.toggle('active');
          navLinks.classList.toggle('mobile-visible');
        }

        function closeMobileMenu() {
          mobileMenuBtn.classList.remove('active');
          navLinks.classList.remove('mobile-visible');
        }

        themeToggle.addEventListener('click', toggleTheme);
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
          if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
          }
        });

        setTheme(getPreferredTheme());

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
          }
        });

        document.getElementById('generateForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const form = e.target;
          const resultDiv = document.getElementById('result');
          const loadingDiv = document.getElementById('loading');
          
          const targetUrl = document.getElementById('targetUrl').value;
          const source = document.getElementById('source').value;
          const delay = document.getElementById('delay').value;
          
          form.style.display = 'none';
          loadingDiv.style.display = 'block';
          resultDiv.style.display = 'none';
          
          try {
            const apiUrl = '/api/generate?to=' + encodeURIComponent(targetUrl) + 
                           '&source=' + encodeURIComponent(source) + 
                           '&delay=' + encodeURIComponent(delay);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success) {
              resultDiv.className = 'result success';
              resultDiv.innerHTML = \`
                <h3>Link Generated Successfully</h3>
                <p><strong>Target URL:</strong> \${data.targetUrl}</p>
                <p><strong>Source:</strong> \${data.source}</p>
                <p><strong>Delay:</strong> \${data.delay}ms</p>
                <div class="url-display">\${data.encryptedUrl}</div>
                <div class="action-buttons">
                  <button class="btn btn-primary" onclick="copyToClipboard('\${data.encryptedUrl}')">Copy Link</button>
                  <button class="btn btn-secondary" onclick="testLink('\${data.encryptedUrl}')">Test Link</button>
                </div>
              \`;
            } else {
              resultDiv.className = 'result error';
              resultDiv.innerHTML = \`<h3>Generation Failed</h3><p>\${data.error}</p>\`;
            }
          } catch (error) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = \`<h3>Network Error</h3><p>\${error.message}</p>\`;
          } finally {
            loadingDiv.style.display = 'none';
            form.style.display = 'block';
            resultDiv.style.display = 'block';
          }
        });
        
        document.getElementById('logoutLink').addEventListener('click', async function(e) {
          e.preventDefault();
          
          try {
            const response = await fetch('/api/logout', {
              method: 'POST'
            });
            
            if (response.ok) {
              window.location.href = '/login';
            }
          } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/login';
          }
        });
        
        function copyToClipboard(url) {
          navigator.clipboard.writeText(url).then(function() {
            // Create a toast notification instead of alert
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = 'var(--success-color)';
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '9999';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '500';
            toast.textContent = 'Link copied to clipboard';
            document.body.appendChild(toast);
            
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 3000);
          });
        }
        
        function testLink(url) {
          window.open(url, '_blank');
        }
      </script>
    </body>
    </html>
  `;
  
  return html;
}
