// Cloudflare Pages Functions - Login Page
export async function onRequestGet(context) {
  return showLoginPage();
}

function showLoginPage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Link Redirect Service</title>
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
          --error-color: #e57373;
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
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

        .login-container {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          width: 100%;
          max-width: 450px;
          margin: 6rem auto 2rem;
          transition: all 0.3s;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon {
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

        .login-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--feature-icon-fill);
          transition: fill 0.3s;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .login-header p {
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

        input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--bg-card);
          color: var(--text-primary);
          transition: border-color 0.2s, background 0.3s;
        }

        input:focus {
          outline: none;
          border-color: var(--btn-primary-bg);
        }

        .btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          border: 2px solid var(--btn-primary-bg);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:hover {
          background: var(--btn-primary-hover);
          border-color: var(--btn-primary-hover);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          color: var(--error-color);
          font-size: 0.9rem;
          margin-top: 1rem;
          text-align: center;
          display: none;
          padding: 0.75rem 1rem;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 8px;
        }

        .footer {
          text-align: center;
          margin-top: 2rem;
        }

        .footer a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer a:hover {
          color: var(--text-primary);
        }

        .footer svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
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

          .login-container {
            padding: 2rem 1.5rem;
            margin: 5rem auto 1.5rem;
          }

          .login-header h1 {
            font-size: 1.75rem;
          }
        }
      </style>
    </head>
    <body>
      <nav>
        <div class="nav-content">
          <a href="/" class="logo">Link Redirect</a>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
            <svg id="sunIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="display: none;">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000 1.41.996.996 0 001.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z"/>
            </svg>
            <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          </button>
        </div>
      </nav>

      <div class="container">
        <div class="login-container">
          <div class="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div class="login-header">
            <h1>Link Generator</h1>
            <p>Please enter your password to access</p>
          </div>
          
          <form id="loginForm">
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
          </form>
          
          <div class="error-message" id="errorMessage">Incorrect password, please try again</div>
          
          <div class="footer">
            <a href="/">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to home
            </a>
          </div>
        </div>
      </div>

      <script>
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');

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

        themeToggle.addEventListener('click', toggleTheme);

        document.getElementById('loginForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const password = document.getElementById('password').value;
          const errorMessage = document.getElementById('errorMessage');
          const submitBtn = this.querySelector('button[type="submit"]');
          
          submitBtn.disabled = true;
          submitBtn.textContent = 'Logging in...';
          errorMessage.style.display = 'none';
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ password: password })
            });
            
            if (response.ok) {
              window.location.href = '/generate';
            } else {
              const errorText = await response.text();
              errorMessage.textContent = \`Login failed (\${response.status}): \${errorText}\`;
              errorMessage.style.display = 'block';
            }
          } catch (error) {
            errorMessage.textContent = 'Network error: ' + error.message;
            errorMessage.style.display = 'block';
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
          }
        });

        setTheme(getPreferredTheme());

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
          }
        });
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}