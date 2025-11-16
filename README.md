# Link Redirect Service - Cloudflare Pages 版本

这是一个基于 Cloudflare Pages Functions 的安全链接跳转服务，支持多种加密方式和完善的安全特性。

## 主要特性

- ✅ **多种跳转方式**
  - 传统 URL 参数跳转
  - AES-256 加密跳转
  - XOR 混淆跳转

- 🔐 **安全特性**
  - JWT 会话管理
  - 域名白名单验证
  - Referer 安全检查
  - 延迟跳转显示目标 URL
  - 点击统计和日志记录

- 🎨 **用户友好**
  - 简洁的管理界面
  - 一键生成加密链接
  - 支持自定义来源标识
  - 可配置延迟时间

## 快速开始

### 1. 部署到 Cloudflare Pages

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署项目
wrangler pages deploy public --project-name=link-redirect-service
```

### 2. 配置环境变量

在 Cloudflare Pages 项目设置中添加以下环境变量：

#### 必需变量

- `GENERATE_PAGE_PASSWORD`: 生成页面的访问密码
- `ENCRYPTION_KEY`: AES 加密密钥（建议 32 字符以上）
- `JWT_SECRET`: JWT 签名密钥（建议 32 字符以上）

#### 可选变量

- `OBFUSCATION_KEY`: XOR 混淆密钥（默认: default-obfuscation-key）
- `SESSION_TIMEOUT`: 会话超时时间，秒（默认: 3600）
- `DEFAULT_DELAY`: 默认延迟时间，毫秒（默认: 3000）
- `ENABLE_REFERER_CHECK`: 启用 Referer 检查（默认: true）
- `ENABLE_DELAY`: 启用延迟跳转（默认: true）
- `ALLOWED_DOMAINS`: 允许的目标域名，逗号分隔
- `ALLOWED_REFERERS`: 允许的来源域名，逗号分隔
- `NO_REFERER_CHECK_DOMAINS`: 不检查 Referer 的域名，逗号分隔
- `ALLOW_EMPTY_REFERER_DOMAINS`: 允许空 Referer 的域名，逗号分隔
- `WEBHOOK_URL`: 统计数据 Webhook URL

### 3. 配置 KV 命名空间（可选）

如果需要持久化统计数据：

```bash
# 创建 KV 命名空间
wrangler kv:namespace create "REDIRECT_STATS"

# 在 Pages 项目设置中绑定 KV 命名空间
# 变量名: REDIRECT_STATS
# KV 命名空间: 选择刚创建的命名空间
```

## 使用方法

### 1. 传统跳转（未加密）

直接在 URL 中传递参数：

```
https://your-domain.pages.dev/redirect?to=https://example.com&source=newsletter&delay=5000
```

参数说明：
- `to`: 目标 URL（必需）
- `source`: 来源标识（可选）
- `delay`: 延迟时间，毫秒（可选）

### 2. 加密跳转

访问 `/login` 登录后，使用生成工具创建加密链接：

1. 访问 `https://your-domain.pages.dev/login`
2. 输入密码登录
3. 在生成页面填写目标 URL 和参数
4. 选择加密方式（AES 或 XOR）
5. 点击生成链接

生成的链接格式：
- AES: `https://your-domain.pages.dev/e/encrypted-data`
- XOR: `https://your-domain.pages.dev/o/obfuscated-data`

## 项目结构

```
.
├── functions/              # Cloudflare Pages Functions
│   ├── api/               # API 路由
│   │   ├── login.js       # 登录 API
│   │   ├── logout.js      # 登出 API
│   │   └── generate.js    # 生成链接 API
│   ├── e/                 # AES 加密跳转
│   │   └── [[path]].js    # 动态路由
│   ├── o/                 # XOR 混淆跳转
│   │   └── [[path]].js    # 动态路由
│   ├── lib/               # 工具库
│   │   └── utils.js       # 通用函数
│   ├── index.js           # 首页
│   ├── login.js           # 登录页面
│   ├── generate.js        # 生成页面
│   ├── redirect.js        # 传统跳转
│   └── health.js          # 健康检查
├── public/                # 静态文件目录
├── wrangler.toml          # Cloudflare 配置
└── README.md              # 项目文档
```

## API 端点

- `GET /` - 首页和使用说明
- `GET /login` - 登录页面
- `POST /api/login` - 登录 API
- `POST /api/logout` - 登出 API
- `GET /generate` - 生成链接页面（需要登录）
- `GET /api/generate` - 生成链接 API（需要登录）
- `GET /redirect?to=URL` - 传统跳转
- `GET /e/{encrypted}` - AES 加密跳转
- `GET /o/{obfuscated}` - XOR 混淆跳转
- `GET /health` - 健康检查

## 安全建议

1. **强密码**: 使用强密码作为 `GENERATE_PAGE_PASSWORD`
2. **密钥管理**: 定期更换 `ENCRYPTION_KEY` 和 `JWT_SECRET`
3. **域名限制**: 配置 `ALLOWED_DOMAINS` 限制目标域名
4. **Referer 检查**: 配置 `ALLOWED_REFERERS` 限制来源
5. **HTTPS**: 确保使用 HTTPS 访问服务
6. **日志监控**: 定期检查日志，发现异常访问

## 与 Workers 版本的区别

### Cloudflare Pages Functions 优势

1. **文件系统路由**: 更直观的路由结构
2. **静态资源**: 可以直接托管静态文件
3. **自动部署**: 与 Git 集成，自动部署
4. **免费额度**: 更高的免费请求额度

### 主要变化

1. **路由方式**: 从单一入口改为文件系统路由
2. **上下文对象**: 使用 `context` 对象替代 `env` 和 `ctx`
3. **导出方式**: 使用 `onRequest*` 函数导出
4. **模块化**: 更好的代码组织和模块化

## 开发

### 本地开发

```bash
# 安装依赖
npm install wrangler -g

# 本地运行
wrangler pages dev public

# 访问 http://localhost:8788
```

### 部署

```bash
# 部署到生产环境
wrangler pages deploy public --project-name=link-redirect-service

# 部署到预览环境
wrangler pages deploy public --project-name=link-redirect-service --branch=preview
```

## 故障排除

### 1. 登录失败

- 检查 `GENERATE_PAGE_PASSWORD` 环境变量是否正确配置
- 检查浏览器控制台是否有错误信息

### 2. 加密链接无法访问

- 检查 `ENCRYPTION_KEY` 环境变量是否配置
- 确保密钥在生成和访问时一致

### 3. JWT 会话过期

- 检查 `JWT_SECRET` 环境变量是否配置
- 调整 `SESSION_TIMEOUT` 增加会话时长

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
