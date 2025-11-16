# 快速开始指南

## 5 分钟部署到 Cloudflare Pages

### 步骤 1: 准备代码

```bash
# 克隆或下载项目
git clone <your-repo-url>
cd link-redirect-service

# 或者如果是新项目
git init
git add .
git commit -m "Initial commit"
```

### 步骤 2: 推送到 Git 仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/yourusername/link-redirect-service.git
git push -u origin main
```

### 步骤 3: 连接到 Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **Create a project**
3. 选择 **Connect to Git**
4. 选择你的仓库
5. 配置：
   - **Project name**: `link-redirect-service`
   - **Build command**: 留空
   - **Build output directory**: `public`
6. 点击 **Save and Deploy**

### 步骤 4: 配置环境变量

在项目设置中添加以下环境变量：

```
GENERATE_PAGE_PASSWORD=MySecurePassword123!
ENCRYPTION_KEY=your-32-char-encryption-key-1234
JWT_SECRET=your-32-char-jwt-secret-key-5678
```

生成安全密钥：
```bash
# 在终端运行
openssl rand -base64 32
```

### 步骤 5: 测试

访问你的部署 URL：
```
https://link-redirect-service.pages.dev
```

测试功能：
1. 访问 `/health` 检查服务状态
2. 访问 `/login` 使用密码登录
3. 在 `/generate` 页面生成测试链接
4. 点击生成的链接测试跳转

---

## 本地开发

### 安装依赖

```bash
npm install -g wrangler
```

### 配置本地环境

创建 `.dev.vars` 文件：

```env
GENERATE_PAGE_PASSWORD=test123
ENCRYPTION_KEY=test-encryption-key-12345678901
JWT_SECRET=test-jwt-secret-key-12345678901
```

### 启动开发服务器

```bash
wrangler pages dev public
```

访问 `http://localhost:8788`

---

## 常见问题

### Q: 如何生成安全的密钥？

```bash
# 方法 1: 使用 OpenSSL
openssl rand -base64 32

# 方法 2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 3: 在线生成
# 访问 https://www.random.org/strings/
```

### Q: 如何更新环境变量？

1. 在 Cloudflare Dashboard 中进入项目设置
2. 找到 **Environment variables**
3. 编辑或添加变量
4. 重新部署项目

### Q: 如何添加自定义域名？

1. 进入项目 **Settings** > **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名并按照提示配置 DNS

### Q: 如何查看日志？

1. 在 Cloudflare Dashboard 中进入项目
2. 点击 **Functions** 标签
3. 查看实时日志

---

## 下一步

- 📖 阅读完整的 [README.md](README.md)
- 🚀 查看详细的 [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔧 配置高级功能（域名白名单、Referer 检查等）
- 📊 设置 KV 命名空间用于统计
- 🔐 配置 Webhook 接收统计数据

---

## 需要帮助？

- 查看 [故障排除](DEPLOYMENT.md#故障排除)
- 提交 [Issue](https://github.com/yourusername/link-redirect-service/issues)
- 阅读 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
