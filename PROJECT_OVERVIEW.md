# 项目概览

## 📋 项目信息

**项目名称**: Link Redirect Service  
**版本**: 2.0.0  
**平台**: Cloudflare Pages Functions  
**语言**: JavaScript (ES Modules)  
**许可证**: MIT

## 🎯 项目目标

提供一个安全、可靠、功能丰富的链接跳转服务，支持多种加密方式和完善的安全特性。

## 📁 项目结构

```
link-redirect-service/
├── functions/                  # Cloudflare Pages Functions
│   ├── api/                   # API 路由
│   │   ├── login.js          # 登录 API
│   │   ├── logout.js         # 登出 API
│   │   └── generate.js       # 生成链接 API
│   ├── e/                    # AES 加密跳转
│   │   └── [[path]].js       # 动态路由处理
│   ├── lib/                  # 工具库
│   │   └── utils.js          # 通用函数（JWT、加密、配置等）
│   ├── index.js              # 首页
│   ├── login.js              # 登录页面
│   ├── generate.js           # 生成页面
│   ├── redirect.js           # 传统跳转
│   └── health.js             # 健康检查
├── public/                    # 静态资源
│   └── index.html            # 静态首页
├── .env.example              # 环境变量示例
├── .gitignore                # Git 忽略文件
├── package.json              # 项目配置
├── wrangler.toml             # Cloudflare 配置
├── test.sh                   # 测试脚本 (Bash)
├── test.ps1                  # 测试脚本 (PowerShell)
├── README.md                 # 项目文档
├── QUICKSTART.md             # 快速开始
├── DEPLOYMENT.md             # 部署指南
├── MIGRATION.md              # 迁移指南
├── FEATURES.md               # 功能特性
└── CHANGELOG.md              # 更新日志
```

## 🚀 核心功能

### 1. 跳转方式
- ✅ 传统 URL 参数跳转
- ✅ AES-256 加密跳转

### 2. 安全特性
- ✅ JWT 会话管理
- ✅ 域名白名单
- ✅ Referer 检查
- ✅ 协议验证
- ✅ 安全响应头

### 3. 用户功能
- ✅ 密码保护的管理界面
- ✅ 可视化链接生成
- ✅ 延迟跳转显示
- ✅ 一键复制链接

### 4. 统计和日志
- ✅ 点击统计
- ✅ KV 存储支持
- ✅ Webhook 集成
- ✅ 阻止日志

## 🔧 技术栈

### 前端
- 原生 HTML/CSS/JavaScript
- 无框架依赖
- 响应式设计

### 后端
- Cloudflare Pages Functions
- ES Modules
- Web Crypto API
- JWT 认证

### 基础设施
- Cloudflare Pages
- Cloudflare KV (可选)
- Cloudflare Workers Runtime

## 📊 路由表

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/` | GET | 首页 | ❌ |
| `/login` | GET | 登录页面 | ❌ |
| `/generate` | GET | 生成页面 | ✅ |
| `/redirect` | GET | 传统跳转 | ❌ |
| `/e/{path}` | GET | AES 加密跳转 | ❌ |
| `/health` | GET | 健康检查 | ❌ |
| `/api/login` | POST | 登录 API | ❌ |
| `/api/logout` | POST | 登出 API | ❌ |
| `/api/generate` | GET | 生成链接 API | ✅ |

## 🔐 安全架构

### 认证流程
```
用户 → 登录页面 → 输入密码 → 验证密码
  ↓
生成 JWT Token → 设置 Cookie → 重定向到生成页面
  ↓
访问受保护页面 → 验证 JWT → 允许/拒绝访问
```

### 跳转流程
```
用户点击链接 → 解密/解析参数 → 安全检查
  ↓
域名验证 → Referer 检查 → 协议验证
  ↓
记录统计 → 延迟跳转 → 重定向到目标
```

## 📈 性能指标

- **冷启动**: ~5ms
- **响应时间**: ~10ms
- **全球分发**: 300+ 数据中心
- **并发处理**: 无限制（自动扩展）

## 🌍 部署选项

### 1. Git 集成部署
- 推送到 GitHub/GitLab
- 自动构建和部署
- 预览环境支持

### 2. CLI 部署
- 使用 Wrangler CLI
- 手动部署控制
- 本地开发支持

### 3. API 部署
- 使用 Cloudflare API
- 自动化部署
- CI/CD 集成

## 🔄 开发流程

### 本地开发
```bash
# 1. 安装依赖
npm install -g wrangler

# 2. 配置环境
cp .env.example .dev.vars

# 3. 启动开发服务器
wrangler pages dev public

# 4. 访问
open http://localhost:8788
```

### 测试
```bash
# Bash
./test.sh http://localhost:8788 test123

# PowerShell
.\test.ps1 -BaseUrl "http://localhost:8788" -Password "test123"
```

### 部署
```bash
# 部署到生产环境
wrangler pages deploy public --project-name=link-redirect-service

# 或通过 Git
git push origin main
```

## 📝 配置管理

### 必需环境变量
```env
GENERATE_PAGE_PASSWORD=your-password
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret
```

### 可选环境变量
```env
SESSION_TIMEOUT=3600
DEFAULT_DELAY=3000
# 更多可选配置变量请参考 README.md
```
ALLOWED_DOMAINS=example.com
ALLOWED_REFERERS=yourdomain.com
```

## 🐛 故障排除

### 常见问题

1. **登录失败**
   - 检查 `GENERATE_PAGE_PASSWORD` 配置
   - 清除浏览器 Cookie

2. **加密链接无法访问**
   - 检查 `ENCRYPTION_KEY` 配置
   - 确保密钥一致

3. **JWT 会话过期**
   - 检查 `JWT_SECRET` 配置
   - 调整 `SESSION_TIMEOUT`

### 调试技巧

1. 查看浏览器控制台
2. 检查 Cloudflare 日志
3. 使用 `/health` 端点
4. 运行测试脚本

## 📚 文档索引

- **[README.md](README.md)** - 项目主文档
- **[QUICKSTART.md](QUICKSTART.md)** - 5 分钟快速开始
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 详细部署指南
- **[MIGRATION.md](MIGRATION.md)** - Workers 迁移指南
- **[FEATURES.md](FEATURES.md)** - 完整功能列表
- **[CHANGELOG.md](CHANGELOG.md)** - 版本更新日志

## 🤝 贡献指南

### 如何贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ES Modules
- 遵循 JavaScript Standard Style
- 添加必要的注释
- 编写测试用例

## 📄 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [JWT 规范](https://jwt.io/)

## 📞 支持

- 提交 Issue: [GitHub Issues](https://github.com/yourusername/link-redirect-service/issues)
- 讨论: [GitHub Discussions](https://github.com/yourusername/link-redirect-service/discussions)
- 邮件: your-email@example.com

## 🎉 致谢

感谢 Cloudflare 提供优秀的 Pages 平台！

---

**最后更新**: 2024-01-01  
**维护者**: Your Name  
**状态**: 活跃开发中
