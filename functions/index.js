// Cloudflare Pages Functions - Home Page
export async function onRequest(context) {
  // 读取 public/index.html 文件内容
  try {
    const indexHtml = await context.env.ASSETS.fetch(context.request);
    const html = await indexHtml.text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    // 如果无法读取 public/index.html，则返回备用页面
    return showUsagePage();
  }
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
        <p>Secure and Reliable Link Redirection Solution</p>
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