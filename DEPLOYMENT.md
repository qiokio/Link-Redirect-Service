# 部署指南

## 方式一：通过 Cloudflare Dashboard 部署

### 1. 准备代码仓库

将代码推送到 GitHub、GitLab 或 Bitbucket：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. 连接到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 进入 **Pages** 页面
4. 点击 **Create a project**
5. 选择 **Connect to Git**
6. 授权并选择你的代码仓库
7. 配置构建设置：
   - **Project name**: `link-redirect-service`（或自定义名称）
   - **Production branch**: `main`
   - **Build command**: 留空
   - **Build output directory**: `public`

### 3. 配置环境变量

在项目设置中添加环境变量：

1. 进入项目 **Settings** > **Environment variables**
2. 添加以下变量：

#### 生产环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `GENERATE_PAGE_PASSWORD` | 生成页面密码 | `your-strong-password` |
| `ENCRYPTION_KEY` | AES 加密密钥 | `your-32-char-encryption-key-here` |
| `JWT_SECRET` | JWT 签名密钥 | `your-32-char-jwt-secret-key-here` |
| `OBFUSCATION_KEY` | XOR 混淆密钥 | `your-obfuscation-key` |
| `SESSION_TIMEOUT` | 会话超时（秒） | `3600` |
| `DEFAULT_DELAY` | 默认延迟（毫秒） | `3000` |
| `ALLOWED_DOMAINS` | 允许的目标域名 | `example.com,example.org` |
| `ALLOWED_REFERERS` | 允许的来源域名 | `yourdomain.com` |

### 4. 配置 KV 命名空间（可选）

如果需要持久化统计数据：

1. 在 **Workers & Pages** > **KV** 中创建命名空间
2. 在项目 **Settings** > **Functions** > **KV namespace bindings** 中绑定
   - **Variable name**: `REDIRECT_STATS`
   - **KV namespace**: 选择刚创建的命名空间

### 5. 部署

保存配置后，Cloudflare Pages 会自动部署。每次推送到 main 分支都会触发自动部署。

---

## 方式二：通过 Wrangler CLI 部署

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 .dev.vars 文件（本地开发）

在项目根目录创建 `.dev.vars` 文件：

```env
GENERATE_PAGE_PASSWORD=your-password
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret
OBFUSCATION_KEY=your-obfuscation-key
SESSION_TIMEOUT=3600
DEFAULT_DELAY=3000
```

### 4. 本地测试

```bash
wrangler pages dev public
```

访问 `http://localhost:8788` 测试功能。

### 5. 部署到生产环境

```bash
wrangler pages deploy public --project-name=link-redirect-service
```

### 6. 配置生产环境变量

```bash
# 设置环境变量
wrangler pages secret put GENERATE_PAGE_PASSWORD --project-name=link-redirect-service
wrangler pages secret put ENCRYPTION_KEY --project-name=link-redirect-service
wrangler pages secret put JWT_SECRET --project-name=link-redirect-service
```

或者在 Cloudflare Dashboard 中手动配置。

---

## 环境变量详细说明

### 必需变量

#### GENERATE_PAGE_PASSWORD
- **说明**: 访问生成页面的密码
- **建议**: 使用强密码，至少 16 字符
- **示例**: `MyStr0ng!P@ssw0rd2024`

#### ENCRYPTION_KEY
- **说明**: AES-256 加密密钥
- **建议**: 至少 32 字符的随机字符串
- **生成方法**: 
  ```bash
  openssl rand -base64 32
  ```

#### JWT_SECRET
- **说明**: JWT 签名密钥
- **建议**: 至少 32 字符的随机字符串
- **生成方法**: 
  ```bash
  openssl rand -base64 32
  ```

### 可选变量

#### OBFUSCATION_KEY
- **说明**: XOR 混淆密钥
- **默认值**: `default-obfuscation-key`
- **建议**: 自定义密钥提高安全性

#### SESSION_TIMEOUT
- **说明**: JWT 会话超时时间（秒）
- **默认值**: `3600`（1 小时）
- **建议**: 根据需求调整，如 `7200`（2 小时）

#### DEFAULT_DELAY
- **说明**: 默认跳转延迟时间（毫秒）
- **默认值**: `3000`（3 秒）
- **建议**: 0-10000 之间

#### ENABLE_REFERER_CHECK
- **说明**: 是否启用 Referer 检查
- **默认值**: `true`
- **可选值**: `true` 或 `false`

#### ENABLE_DELAY
- **说明**: 是否启用延迟跳转
- **默认值**: `true`
- **可选值**: `true` 或 `false`

#### ALLOWED_DOMAINS
- **说明**: 允许跳转的目标域名白名单
- **格式**: 逗号分隔的域名列表
- **示例**: `example.com,example.org,subdomain.example.com`
- **注意**: 留空表示允许所有域名

#### ALLOWED_REFERERS
- **说明**: 允许的来源域名白名单
- **格式**: 逗号分隔的域名列表
- **示例**: `yourdomain.com,app.yourdomain.com`
- **注意**: 留空表示不检查 Referer

#### NO_REFERER_CHECK_DOMAINS
- **说明**: 不检查 Referer 的目标域名
- **格式**: 逗号分隔的域名列表
- **示例**: `public-site.com,open-api.com`

#### ALLOW_EMPTY_REFERER_DOMAINS
- **说明**: 允许空 Referer 的目标域名
- **格式**: 逗号分隔的域名列表
- **示例**: `direct-access.com`

#### WEBHOOK_URL
- **说明**: 统计数据 Webhook URL
- **格式**: 完整的 HTTPS URL
- **示例**: `https://your-webhook.com/api/stats`

---

## 自定义域名

### 1. 添加自定义域名

1. 在项目 **Settings** > **Custom domains** 中点击 **Set up a custom domain**
2. 输入你的域名，如 `redirect.yourdomain.com`
3. 按照提示添加 DNS 记录

### 2. DNS 配置

在你的 DNS 提供商处添加 CNAME 记录：

```
Type: CNAME
Name: redirect
Target: link-redirect-service.pages.dev
```

### 3. SSL/TLS

Cloudflare 会自动为自定义域名配置 SSL 证书。

---

## 验证部署

### 1. 检查健康状态

```bash
curl https://your-domain.pages.dev/health
```

应该返回：
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "link-redirect-service"
}
```

### 2. 测试登录

访问 `https://your-domain.pages.dev/login` 并使用配置的密码登录。

### 3. 测试生成链接

登录后访问 `/generate` 页面，生成一个测试链接并验证跳转功能。

---

## 故障排除

### 部署失败

1. 检查 `public` 目录是否存在
2. 确保 `functions` 目录结构正确
3. 查看部署日志获取详细错误信息

### 环境变量不生效

1. 确保在正确的环境（Production/Preview）中配置
2. 重新部署项目使环境变量生效
3. 检查变量名是否拼写正确

### 功能异常

1. 检查浏览器控制台错误
2. 查看 Cloudflare Pages 日志
3. 使用 `/health` 端点检查服务状态

---

## 更新部署

### Git 方式

```bash
git add .
git commit -m "Update features"
git push
```

Cloudflare Pages 会自动检测并部署。

### Wrangler 方式

```bash
wrangler pages deploy public --project-name=link-redirect-service
```

---

## 回滚

在 Cloudflare Dashboard 中：

1. 进入项目 **Deployments** 页面
2. 找到之前的成功部署
3. 点击 **Rollback to this deployment**

---

## 监控和日志

### 查看日志

1. 在 Cloudflare Dashboard 中进入项目
2. 点击 **Functions** 标签
3. 查看实时日志和错误信息

### 设置告警

1. 在 **Analytics** 中查看请求统计
2. 配置 Webhook 接收统计数据
3. 使用第三方监控服务（如 UptimeRobot）

---

## 安全建议

1. **定期更换密钥**: 每 3-6 个月更换一次加密密钥
2. **限制域名**: 配置 `ALLOWED_DOMAINS` 限制目标域名
3. **监控日志**: 定期检查异常访问
4. **使用 KV**: 启用 KV 存储以便审计
5. **配置 WAF**: 在 Cloudflare 中配置 Web Application Firewall

---

## 性能优化

1. **启用缓存**: 对静态资源启用 Cloudflare 缓存
2. **优化代码**: 减少不必要的计算和 I/O 操作
3. **使用 KV**: 合理使用 KV 存储减少计算
4. **监控性能**: 使用 Cloudflare Analytics 监控响应时间

---

## 成本估算

Cloudflare Pages 免费计划包括：
- 无限请求
- 500 次构建/月
- 100 GB 带宽/月
- 20,000 个 Functions 请求/天

对于大多数个人和小型项目，免费计划已经足够。
