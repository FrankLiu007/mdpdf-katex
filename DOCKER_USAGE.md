# 🐳 Docker Usage Guide

本服务是一个**独立、通用**的 Markdown 转 PDF 微服务，可以被任何项目使用。

---

## 🚀 快速开始

### 方式 1: Docker Run（最简单）

```bash
# 构建镜像
docker build -t markdown-to-pdf .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --name md-to-pdf \
  --restart unless-stopped \
  markdown-to-pdf

# 查看日志
docker logs -f md-to-pdf

# 测试健康检查
curl http://localhost:3000/health
```

### 方式 2: Docker Compose（推荐生产环境）

```bash
# 启动服务
docker-compose -f docker-compose.standalone.yaml up -d

# 查看状态
docker-compose -f docker-compose.standalone.yaml ps

# 查看日志
docker-compose -f docker-compose.standalone.yaml logs -f

# 停止服务
docker-compose -f docker-compose.standalone.yaml down
```

---

## 🔧 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `NODE_ENV` | `production` | Node.js 环境 |

**示例**：

```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  --name md-to-pdf \
  markdown-to-pdf
```

### 资源限制

**推荐配置**：

```yaml
deploy:
  resources:
    limits:
      cpus: '2'           # 最多使用 2 个 CPU 核心
      memory: 1G          # 最多使用 1GB 内存
    reservations:
      cpus: '0.5'         # 至少预留 0.5 个核心
      memory: 512M        # 至少预留 512MB 内存
```

---

## 📡 API 使用

### 健康检查

```bash
curl http://localhost:3000/health

# 响应
{
  "status": "ok",
  "service": "markdown-to-pdf",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 转换 Markdown（JSON 格式）

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\n爱因斯坦方程：$E = mc^2$",
    "filename": "output.pdf"
  }' \
  -o output.pdf
```

### 转换 Markdown（纯文本格式）

```bash
echo "# Test\n\n数学公式：$\int_0^1 x^2 dx$" | \
  curl -X POST http://localhost:3000/convert-text \
    -H "Content-Type: text/plain" \
    --data-binary @- \
    -o test.pdf
```

### Web 测试界面

打开浏览器访问：http://localhost:3000

---

## 🔗 集成到其他项目

### Python (FastAPI/Flask)

```python
import requests

def convert_markdown_to_pdf(markdown: str, filename: str = "output.pdf"):
    response = requests.post(
        "http://localhost:3000/convert",
        json={"markdown": markdown, "filename": filename}
    )
    
    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
        return filename
    else:
        raise Exception(f"PDF generation failed: {response.text}")

# 使用
markdown = """
# 数学公式测试

爱因斯坦方程：$E = mc^2$

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
"""

convert_markdown_to_pdf(markdown, "result.pdf")
```

### Node.js (Express)

```javascript
const axios = require('axios');
const fs = require('fs');

async function convertMarkdownToPdf(markdown, filename = 'output.pdf') {
  const response = await axios.post(
    'http://localhost:3000/convert',
    { markdown, filename },
    { responseType: 'arraybuffer' }
  );
  
  fs.writeFileSync(filename, response.data);
  return filename;
}

// 使用
const markdown = `
# Math Test

Einstein's equation: $E = mc^2$
`;

convertMarkdownToPdf(markdown, 'result.pdf');
```

### 前端 JavaScript/TypeScript

```typescript
async function downloadPdf(markdown: string, filename: string) {
  const response = await fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown, filename })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// 使用
const markdown = `# Test\n\n数学公式：$E = mc^2$`;
downloadPdf(markdown, 'output.pdf');
```

---

## 🏗️ 集成到 Docker Compose 项目

### 示例：集成到现有项目

```yaml
# your-project/docker-compose.yaml
version: '3.8'

services:
  # 你的后端服务
  backend:
    image: your-backend:latest
    environment:
      - MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
    depends_on:
      - markdown-to-pdf
    networks:
      - app-network

  # Markdown to PDF 服务
  markdown-to-pdf:
    image: markdown-to-pdf:latest
    # 或者使用 build:
    # build:
    #   context: ./remark-pdf
    #   dockerfile: Dockerfile
    container_name: md-to-pdf
    restart: unless-stopped
    networks:
      - app-network
    # 不需要暴露端口到宿主机，只在内网使用
    # ports:
    #   - "3000:3000"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G

networks:
  app-network:
    driver: bridge
```

**关键点**：

1. **内网访问**：服务间通过 Docker 网络通信，无需暴露端口
2. **服务发现**：使用服务名称 `markdown-to-pdf` 作为主机名
3. **依赖管理**：使用 `depends_on` 确保启动顺序

---

## 🚢 发布到 Docker Hub

### 构建并推送

```bash
# 登录 Docker Hub
docker login

# 构建镜像（带标签）
docker build -t your-username/markdown-to-pdf:latest .
docker build -t your-username/markdown-to-pdf:1.0.0 .

# 推送镜像
docker push your-username/markdown-to-pdf:latest
docker push your-username/markdown-to-pdf:1.0.0
```

### 其他人使用你的镜像

```bash
# 直接运行
docker run -d -p 3000:3000 your-username/markdown-to-pdf:latest

# 在 docker-compose.yaml 中使用
services:
  markdown-to-pdf:
    image: your-username/markdown-to-pdf:latest
    ports:
      - "3000:3000"
```

---

## 🔒 安全建议

### 1. 不要暴露到公网

**❌ 不推荐**：

```yaml
ports:
  - "3000:3000"  # 任何人都可以访问
```

**✅ 推荐**（生产环境）：

```yaml
# 只在内网使用，不暴露端口
# ports:
#   - "3000:3000"

# 或者只监听 localhost
ports:
  - "127.0.0.1:3000:3000"
```

### 2. 使用反向代理

```nginx
# Nginx 配置
location /api/pdf/ {
    proxy_pass http://markdown-to-pdf:3000/;
    proxy_set_header Host $host;
    
    # 添加认证
    auth_basic "PDF Service";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # 限流
    limit_req zone=pdf_limit burst=5;
}
```

### 3. 添加认证中间件

修改 `server.ts` 添加 API Key 认证：

```typescript
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 4. 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
```

---

## 🧪 测试和监控

### 健康检查

```bash
# 简单检查
curl http://localhost:3000/health

# 完整测试
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test"}' \
  -o /dev/null \
  -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n"
```

### 性能测试

```bash
# 使用 ab (Apache Bench)
ab -n 100 -c 10 \
  -p test.json \
  -T application/json \
  http://localhost:3000/convert
```

### 日志监控

```bash
# 实时查看日志
docker logs -f md-to-pdf

# 查看最近 100 行
docker logs --tail 100 md-to-pdf

# 导出日志
docker logs md-to-pdf > logs.txt
```

---

## 🐛 故障排查

### 问题 1: Chromium 启动失败

**错误信息**：
```
Error: Failed to launch the browser process
```

**解决方案**：
```bash
# 增加共享内存
docker run -d \
  -p 3000:3000 \
  --shm-size=1gb \
  markdown-to-pdf
```

### 问题 2: 内存不足

**解决方案**：
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # 增加内存限制
```

### 问题 3: 字体缺失

**解决方案**：
```dockerfile
# 在 Dockerfile 中添加更多字体
RUN apk add --no-cache \
    ttf-dejavu \
    fontconfig \
    font-noto-cjk
```

---

## 📊 性能优化

### 1. 浏览器实例复用

服务已内置浏览器实例复用，无需额外配置。

### 2. 并发控制

修改 `server.ts` 添加并发限制：

```typescript
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 3 });

app.post('/convert', async (req, res) => {
  await queue.add(async () => {
    // 原有处理逻辑
  });
});
```

### 3. 缓存策略

对于相同的 Markdown 内容，可以添加缓存：

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });

app.post('/convert', async (req, res) => {
  const cacheKey = crypto.createHash('md5').update(req.body.markdown).digest('hex');
  
  let pdf = cache.get(cacheKey);
  if (!pdf) {
    pdf = await markdownToPdfBuffer(req.body.markdown);
    cache.set(cacheKey, pdf);
  }
  
  res.end(pdf);
});
```

---

## 📦 镜像信息

- **基础镜像**: `node:22-alpine`
- **镜像大小**: ~350MB（包含 Chromium）
- **支持架构**: `linux/amd64`, `linux/arm64`
- **Node.js 版本**: 22.x
- **Chromium 版本**: Alpine 仓库最新版本

---

## 📝 更新日志

### v1.0.0 (2025-01-15)

- ✅ 初始版本
- ✅ 支持 KaTeX 数学公式
- ✅ 支持多语言（中文、日文、韩文等）
- ✅ RESTful API
- ✅ 健康检查
- ✅ Docker 支持
- ✅ 优雅关闭

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

**享受完美的 PDF 生成体验！** 🎉

