// Cloudflare Pages Functions - Error Page Rendering
export function errorResponse(message, status = 400) {
  console.log('Returning error response', { status, message });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Error - ${status} - Link Redirect Service</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          --error-bg: rgba(220, 53, 69, 0.1);
          --error-border: rgba(220, 53, 69, 0.3);
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
          --error-bg: rgba(229, 115, 115, 0.1);
          --error-border: rgba(229, 115, 115, 0.3);
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

        .error-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--error-border);
          box-shadow: var(--card-shadow);
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: var(--error-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: background 0.3s;
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
          fill: white;
          transition: fill 0.3s;
        }

        .error-code {
          font-size: 4rem;
          font-weight: 800;
          color: var(--error-color);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .error-message {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
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

        .btn-secondary {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-text);
          border: 2px solid var(--btn-secondary-text);
        }

        .btn-secondary:hover {
          background: var(--btn-secondary-hover-bg);
          color: var(--btn-secondary-hover-text);
        }



        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .error-card {
            padding: 2rem 1.5rem;
            margin-bottom: 1.5rem;
          }

          .error-code {
            font-size: 3rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-message {
            font-size: 1.1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
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
        <div class="error-card">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="error-code">${status}</div>
          <h1 class="error-title">Something went wrong</h1>
          <p class="error-message">${message}</p>
          <div class="error-actions">
            <a href="/" class="btn btn-primary">Go Home</a>
            <a href="javascript:history.back()" class="btn btn-secondary">Go Back</a>
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
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}