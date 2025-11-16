# 从 Workers 迁移到 Pages Functions

## 主要变化

### 1. 项目结构

#### Workers (旧)
```
.
└── index.js (单一入口文件)
```

#### Pages Functions (新)
```
.
├── functions/              # Functions 目录
│   ├── api/               # API 路由
│   ├── e/                 # AES 加密路由
│   ├── o/                 # XOR 混淆路由
│   ├── lib/               # 工具库
│   └── *.js               # 页面路由
└── public/                # 静态资源
```

### 2. 路由方式

#### Workers (旧)
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/':
        return showUsagePage();
      case '/login':
        return showLoginPage();
      // ...
    }
  }
}
```

#### Pages Functions (新)
```javascript
// functions/index.js
export async function onRequest(context) {
  return showUsagePage();
}

// functions/login.js
export async function onRequestGet(context) {
  return showLoginPage();
}
```

### 3. 上下文对象

#### Workers (旧)
```javascript
async fetch(request, env, ctx) {
  // request: Request 对象
  // env: 环境变量和绑定
  // ctx: 执行上下文
}
```

#### Pages Functions (新)
```javascript
async onRequest(context) {
  const { request, env, waitUntil, next, data } = context;
  // context 包含所有需要的对象
}
```

### 4. HTTP 方法处理

#### Workers (旧)
```javascript
if (request.method === 'GET') {
  // 处理 GET
} else if (request.method === 'POST') {
  // 处理 POST
}
```

#### Pages Functions (新)
```javascript
// 自动根据方法名路由
export async function onRequestGet(context) {
  // 处理 GET
}

export async function onRequestPost(context) {
  // 处理 POST
}
```

### 5. 动态路由

#### Workers (旧)
```javascript
if (url.pathname.startsWith('/e/')) {
  const encryptedData = url.pathname.split('/')[2];
  // 处理
}
```

#### Pages Functions (新)
```javascript
// functions/e/[[path]].js
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const encryptedData = pathSegments[1];
  // 处理
}
```

### 6. 模块导入

#### Workers (旧)
```javascript
// 所有代码在一个文件中
function encryptAES() { }
function decryptAES() { }
```

#### Pages Functions (新)
```javascript
// functions/lib/utils.js
export async function encryptAES() { }
export async function decryptAES() { }

// functions/api/generate.js
import { encryptAES, decryptAES } from '../lib/utils.js';
```

---

## 功能对比

| 功能 | Workers | Pages Functions | 说明 |
|------|---------|-----------------|------|
| 路由方式 | 手动 switch | 文件系统路由 | Pages 更直观 |
| 静态资源 | 需要额外配置 | 原生支持 | Pages 直接托管 |
| 部署方式 | CLI 或 API | Git 集成 | Pages 自动部署 |
| 免费额度 | 100k 请求/天 | 无限请求 | Pages 更慷慨 |
| 冷启动 | 较快 | 较快 | 性能相当 |
| 开发体验 | 需要 wrangler | wrangler 或 Git | Pages 更灵活 |

---

## 迁移步骤

### 1. 创建新的项目结构

```bash
mkdir -p functions/{api,e,o,lib}
mkdir public
```

### 2. 拆分路由

将原来的 switch 语句拆分为独立文件：

```javascript
// 原来: case '/login'
// 现在: functions/login.js

export async function onRequestGet(context) {
  return showLoginPage();
}
```

### 3. 提取工具函数

将通用函数移到 `functions/lib/utils.js`：

```javascript
export async function encryptAES() { }
export async function decryptAES() { }
export function getConfig() { }
```

### 4. 更新导入语句

在需要的地方导入工具函数：

```javascript
import { encryptAES, getConfig } from '../lib/utils.js';
```

### 5. 更新上下文使用

```javascript
// 旧
async function handler(request, env, ctx) {
  ctx.waitUntil(logStats());
}

// 新
async function onRequest(context) {
  const { request, env, waitUntil } = context;
  waitUntil(logStats());
}
```

### 6. 测试功能

```bash
wrangler pages dev public
```

### 7. 部署

```bash
git push origin main
# 或
wrangler pages deploy public
```

---

## 注意事项

### 1. 文件命名

- 使用小写字母和连字符
- 动态路由使用 `[[path]].js`
- API 路由放在 `api/` 目录

### 2. 导出方式

必须使用 `export async function onRequest*`：

```javascript
// ✅ 正确
export async function onRequestGet(context) { }

// ❌ 错误
export default async function(context) { }
```

### 3. 模块类型

在 `package.json` 中设置：

```json
{
  "type": "module"
}
```

### 4. 环境变量

- 开发: 使用 `.dev.vars` 文件
- 生产: 在 Dashboard 中配置

### 5. KV 绑定

在 `wrangler.toml` 中配置：

```toml
[[kv_namespaces]]
binding = "REDIRECT_STATS"
id = "your-kv-namespace-id"
```

---

## 优势总结

### Pages Functions 的优势

1. **更好的组织**: 文件系统路由更直观
2. **静态资源**: 原生支持静态文件托管
3. **Git 集成**: 自动部署，无需手动操作
4. **更高额度**: 免费计划提供更多请求
5. **开发体验**: 更好的本地开发体验

### Workers 的优势

1. **更灵活**: 完全控制路由逻辑
2. **更简单**: 单文件部署
3. **更成熟**: 更长的历史和更多文档

---

## 兼容性

### 保持兼容的功能

- ✅ Web Crypto API
- ✅ Fetch API
- ✅ KV 存储
- ✅ 环境变量
- ✅ 所有 Cloudflare 特性

### 需要调整的部分

- 🔄 路由结构
- 🔄 导出方式
- 🔄 上下文对象
- 🔄 模块导入

---

## 回滚方案

如果需要回滚到 Workers：

1. 保留原 Workers 代码
2. 在 DNS 层面切换
3. 或使用 Cloudflare Load Balancer

---

## 性能对比

| 指标 | Workers | Pages Functions |
|------|---------|-----------------|
| 冷启动 | ~5ms | ~5ms |
| 响应时间 | ~10ms | ~10ms |
| 全球分发 | ✅ | ✅ |
| 边缘计算 | ✅ | ✅ |

性能基本相同，因为底层技术相同。

---

## 推荐做法

1. **新项目**: 优先使用 Pages Functions
2. **现有项目**: 评估迁移成本和收益
3. **混合使用**: 可以同时使用 Workers 和 Pages
4. **渐进迁移**: 逐步迁移功能，降低风险

---

## 资源链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Pages Functions 指南](https://developers.cloudflare.com/pages/platform/functions/)
- [Workers 文档](https://developers.cloudflare.com/workers/)
- [迁移指南](https://developers.cloudflare.com/pages/migrations/)
