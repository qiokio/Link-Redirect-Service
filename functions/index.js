// Cloudflare Pages Functions - 主页
export async function onRequest(context) {
  return showUsagePage();
}

function showUsagePage() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Link Redirect Service</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .header p {
          color: #6c757d;
          font-size: 16px;
        }
        .section {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 25px;
          margin-bottom: 25px;
        }
        .section h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
        }
        .section h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 20px 0 10px 0;
        }
        code {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 14px;
        }
        pre {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 15px 0;
          font-size: 14px;
        }
        ul {
          margin: 15px 0;
          padding-left: 20px;
        }
        li {
          margin: 8px 0;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
        }
        .btn:hover {
          background: #0056b3;
        }
        .method-comparison {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 25px 0;
        }
        .method-card {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 20px;
        }
        .method-card h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Link Redirect Service</h1>
        <p>安全可靠的链接跳转解决方案</p>
      </div>
      
      <div class="section">
        <h2>快速开始</h2>
        <p>选择适合您需求的跳转方式：</p>
        
        <div class="method-comparison">
          <div class="method-card">
            <h4>原始方法</h4>
            <p>参数可见，简单直接</p>
            <code>/redirect?to=URL&source=X&delay=Y</code>
          </div>
          
          <div class="method-card">
            <h4>AES 加密</h4>
            <p>高安全性，参数隐藏</p>
            <code>/e/encrypted-parameters</code>
            <p><a href="/login" class="btn">生成链接</a></p>
          </div>
          
          <div class="method-card">
            <h4>XOR 混淆</h4>
            <p>轻量级，参数隐藏</p>
            <code>/o/obfuscated-parameters</code>
            <p><a href="/login" class="btn">生成链接</a></p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>使用说明</h2>
        
        <h3>原始方法（未加密）</h3>
        <p>直接在 URL 中传递参数：</p>
        <pre>https://your-domain.pages.dev/redirect?to=https://example.com&source=newsletter&delay=5000</pre>
        
        <h3>加密方法</h3>
        <p>需要登录后使用生成工具创建加密链接：</p>
        <p><a href="/login" class="btn">登录生成加密链接</a></p>
        
        <h3>参数说明</h3>
        <ul>
          <li><code>to</code>: 目标 URL（必需）</li>
          <li><code>source</code>: 来源标识，用于统计（可选）</li>
          <li><code>delay</code>: 延迟时间，毫秒（可选，默认 3000）</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>安全特性</h2>
        <ul>
          <li>基于 JWT 的安全会话管理</li>
          <li>域名白名单验证</li>
          <li>Referer 安全检查</li>
          <li>延迟跳转显示目标 URL</li>
          <li>点击统计和日志记录</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Cloudflare Pages Link Redirect Service &copy; 2025</p>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
