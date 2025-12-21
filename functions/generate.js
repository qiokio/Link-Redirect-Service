// Cloudflare Pages Functions - 生成页面
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
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Generator</title>
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
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .header p {
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
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 16px;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #007bff;
        }
        .radio-group {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn {
          padding: 12px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background: #0056b3;
        }
        .btn-secondary {
          background: #6c757d;
        }
        .btn-secondary:hover {
          background: #545b62;
        }
        .result {
          margin-top: 30px;
          padding: 20px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          display: none;
        }
        .result.success {
          display: block;
          border-left: 4px solid #28a745;
        }
        .result.error {
          display: block;
          border-left: 4px solid #dc3545;
        }
        .result h3 {
          margin-bottom: 10px;
          font-size: 18px;
        }
        .url-display {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
          margin: 15px 0;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        .action-buttons button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
          margin: 0;
        }
        .loading {
          text-align: center;
          margin: 20px 0;
          display: none;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #6c757d;
        }
        .footer a {
          color: #6c757d;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Link Generator</h1>
        <p>生成安全的跳转链接</p>
      </div>
      
      <form id="generateForm">
        <div class="form-group">
          <label for="targetUrl">目标 URL</label>
          <input type="url" id="targetUrl" required placeholder="https://example.com">
        </div>
        
        <div class="form-group">
          <label for="source">来源标识（可选）</label>
          <input type="text" id="source" placeholder="newsletter, campaign, etc.">
        </div>
        
        <div class="form-group">
          <label for="delay">延迟时间（毫秒，可选）</label>
          <input type="number" id="delay" placeholder="默认 3000" min="0" max="10000">
        </div>
        
        <div class="form-group">
          <label>加密方法</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="method" value="aes" checked disabled>
              <span>AES 加密</span>
            </label>
          </div>
        </div>
        
        <button type="submit" class="btn">生成链接</button>
      </form>
      
      <div class="loading" id="loading">
        <p>正在生成链接...</p>
      </div>
      
      <div class="result" id="result"></div>
      
      <div class="footer">
        <a href="/">首页</a>
        <a href="#" id="logoutLink">登出</a>
      </div>

      <script>
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
                <h3>链接生成成功</h3>
                <p><strong>目标 URL:</strong> \${data.targetUrl}</p>
                <p><strong>来源:</strong> \${data.source}</p>
                <p><strong>延迟:</strong> \${data.delay}ms</p>
                <div class="url-display">\${data.encryptedUrl}</div>
                <div class="action-buttons">
                  <button class="btn" onclick="copyToClipboard('\${data.encryptedUrl}')">复制链接</button>
                  <button class="btn btn-secondary" onclick="testLink('\${data.encryptedUrl}')">测试链接</button>
                </div>
              \`;
            } else {
              resultDiv.className = 'result error';
              resultDiv.innerHTML = \`<h3>生成失败</h3><p>\${data.error}</p>\`;
            }
          } catch (error) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = \`<h3>网络错误</h3><p>\${error.message}</p>\`;
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
            alert('链接已复制到剪贴板');
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
