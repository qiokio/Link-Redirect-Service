// Cloudflare Pages Functions - 登录页面
export async function onRequestGet(context) {
  return showLoginPage();
}

function showLoginPage() {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>登录 - Link Generator</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #f8f9fa;
          color: #212529;
          line-height: 1.5;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-container {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-header h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #6c757d;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 16px;
        }
        input:focus {
          outline: none;
          border-color: #007bff;
        }
        .btn {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .btn:hover {
          background: #0056b3;
        }
        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-top: 10px;
          text-align: center;
          display: none;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="login-header">
          <h1>Link Generator</h1>
          <p>请输入密码以访问</p>
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="btn">登录</button>
        </form>
        
        <div class="error-message" id="errorMessage">密码错误，请重试</div>
        
        <div class="footer">
          <a href="/" style="color: #6c757d; text-decoration: none;">← 返回首页</a>
        </div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const password = document.getElementById('password').value;
          const errorMessage = document.getElementById('errorMessage');
          const submitBtn = this.querySelector('button[type="submit"]');
          
          submitBtn.disabled = true;
          submitBtn.textContent = '登录中...';
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
              errorMessage.textContent = \`登录失败 (\${response.status}): \${errorText}\`;
              errorMessage.style.display = 'block';
            }
          } catch (error) {
            errorMessage.textContent = '网络错误: ' + error.message;
            errorMessage.style.display = 'block';
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '登录';
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
