# 功能特性

## 核心功能

### 1. 多种跳转方式

#### 传统跳转
- URL 参数可见
- 简单直接
- 适合公开场景

```
https://your-domain.pages.dev/redirect?to=https://example.com&source=email&delay=3000
```

#### AES-256 加密跳转
- 高安全性
- 参数完全隐藏
- 适合敏感链接

```
https://your-domain.pages.dev/e/encrypted-data-here
```


---

## 安全特性

### 1. JWT 会话管理

- ✅ 基于 JWT 的无状态认证
- ✅ 可配置会话超时
- ✅ 安全的 HttpOnly Cookie
- ✅ 自动过期检查

```javascript
// 会话配置
SESSION_TIMEOUT=3600  // 1 小时
JWT_SECRET=your-secret-key
```

### 2. 域名白名单

限制允许跳转的目标域名：

```env
ALLOWED_DOMAINS=example.com,trusted-site.org
```

特性：
- 支持子域名匹配
- 支持多个域名
- 留空表示允许所有

### 3. Referer 检查

验证请求来源：

```env
ALLOWED_REFERERS=yourdomain.com,app.yourdomain.com
ENABLE_REFERER_CHECK=true
```

高级配置：
- `NO_REFERER_CHECK_DOMAINS`: 特定域名不检查
- `ALLOW_EMPTY_REFERER_DOMAINS`: 允许空 Referer

### 4. 协议验证

- ✅ 只允许 HTTP/HTTPS 协议
- ✅ 阻止 javascript:、data: 等危险协议
- ✅ URL 格式验证

### 5. 安全响应头

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## 用户功能

### 1. 管理界面

#### 登录页面 (`/login`)
- 密码保护
- 简洁的 UI
- 错误提示
- 自动跳转

#### 生成页面 (`/generate`)
- 需要登录访问
- 表单验证
- 实时预览
- 一键复制

### 2. 链接生成

支持的参数：
- **目标 URL**: 必需，跳转目的地
- **来源标识**: 可选，用于统计
- **延迟时间**: 可选，0-10000 毫秒
- **加密方式**: AES 或 XOR

### 3. 延迟跳转

特性：
- 显示目标 URL
- 倒计时提示
- 立即跳转按钮
- 可配置延迟时间

```env
DEFAULT_DELAY=3000  # 默认 3 秒
ENABLE_DELAY=true   # 启用延迟
```

---

## 统计和日志

### 1. 点击统计

记录的信息：
- 时间戳
- 目标 URL
- 来源标识
- IP 地址
- User-Agent
- 国家/地区
- Referer
- 安全级别
- 加密方式

### 2. KV 存储

可选的持久化存储：

```toml
[[kv_namespaces]]
binding = "REDIRECT_STATS"
id = "your-kv-namespace-id"
```

特性：
- 点击数据保存 30 天
- 阻止记录保存 7 天
- 自动过期清理

### 3. Webhook 集成

实时推送统计数据：

```env
WEBHOOK_URL=https://your-webhook.com/api/stats
```

推送的数据：
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "target": "https://example.com",
  "source": "email",
  "ip": "1.2.3.4",
  "country": "US",
  "method": "aes",
  "status": "redirected"
}
```

### 4. 阻止日志

记录被阻止的请求：
- 无效的 URL
- 不允许的域名
- Referer 检查失败
- 协议验证失败

---

## 开发功能

### 1. 健康检查

```bash
curl https://your-domain.pages.dev/health
```

响应：
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "link-redirect-service"
}
```

### 2. 详细日志

控制台输出：
- 请求信息
- 验证结果
- 错误详情
- 性能指标

### 3. 错误处理

友好的错误页面：
- 400: 请求错误
- 401: 未授权
- 403: 禁止访问
- 404: 未找到
- 410: 链接过期
- 500: 服务器错误

---

## 高级功能

### 1. 链接过期

可选的链接过期时间：

```javascript
const params = {
  to: targetUrl,
  expires: Date.now() + 24 * 60 * 60 * 1000  // 24 小时
};
```

### 2. 自定义延迟

每个链接可以有不同的延迟：

```
/redirect?to=https://example.com&delay=5000
```

### 3. 来源追踪

通过 source 参数追踪来源：

```
/redirect?to=https://example.com&source=newsletter-2024-01
```

### 4. 批量生成

通过 API 批量生成链接：

```javascript
const links = await Promise.all(
  urls.map(url => 
    fetch('/api/generate?to=' + encodeURIComponent(url))
  )
);
```

---

## 性能特性

### 1. 边缘计算

- ✅ 全球 300+ 数据中心
- ✅ 低延迟响应
- ✅ 自动负载均衡

### 2. 缓存优化

- 静态资源自动缓存
- 动态内容智能缓存
- CDN 加速

### 3. 并发处理

- 支持高并发请求
- 无服务器架构
- 自动扩展

---

## 兼容性

### 浏览器支持

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ 移动浏览器

### API 兼容

- ✅ Web Crypto API
- ✅ Fetch API
- ✅ URL API
- ✅ TextEncoder/Decoder

---

## 配置选项

### 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `GENERATE_PAGE_PASSWORD` | string | - | 生成页面密码（必需） |
| `ENCRYPTION_KEY` | string | - | AES 加密密钥（必需） |
| `JWT_SECRET` | string | - | JWT 签名密钥（必需） |
| `OBFUSCATION_KEY` | string | default-key | XOR 混淆密钥 |
| `SESSION_TIMEOUT` | number | 3600 | 会话超时（秒） |
| `DEFAULT_DELAY` | number | 3000 | 默认延迟（毫秒） |
| `ENABLE_REFERER_CHECK` | boolean | true | 启用 Referer 检查 |
| `ENABLE_DELAY` | boolean | true | 启用延迟跳转 |
| `ALLOWED_DOMAINS` | string | - | 允许的域名 |
| `ALLOWED_REFERERS` | string | - | 允许的来源 |
| `NO_REFERER_CHECK_DOMAINS` | string | - | 不检查的域名 |
| `ALLOW_EMPTY_REFERER_DOMAINS` | string | - | 允许空 Referer |
| `WEBHOOK_URL` | string | - | Webhook URL |

---

## 使用场景

### 1. 邮件营销

- 隐藏真实链接
- 追踪点击来源
- 统计转化率

### 2. 社交媒体

- 短链接生成
- 防止链接被封
- 统计分享效果

### 3. 广告投放

- 追踪广告效果
- 防止恶意点击
- 多渠道统计

### 4. 内部系统

- 安全的跳转
- 访问控制
- 审计日志

---

## 扩展性

### 1. 自定义加密

可以添加新的加密方式：

```javascript
// functions/lib/utils.js
export async function encryptCustom(params, key) {
  // 自定义加密逻辑
}
```

### 2. 自定义验证

添加额外的安全检查：

```javascript
function customValidation(request, targetUrl) {
  // 自定义验证逻辑
  return true;
}
```

### 3. 自定义统计

扩展统计数据：

```javascript
const clickData = {
  ...defaultData,
  customField: 'custom-value'
};
```

---

## 限制

### Cloudflare Pages 限制

- 请求大小: 100 MB
- 响应大小: 25 MB
- CPU 时间: 50ms (免费) / 无限 (付费)
- 内存: 128 MB

### 功能限制

- 不支持 WebSocket
- 不支持长连接
- 不支持文件上传（大文件）

---

## 未来计划

- [ ] 批量导入/导出
- [ ] 统计仪表板
- [ ] 二维码生成
- [ ] 短链接服务
- [ ] API 密钥管理
- [ ] 多用户支持
- [ ] 链接分组管理
- [ ] A/B 测试支持
