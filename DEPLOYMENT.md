# 🚀 完整部署指南

本文档提供 Markdown to PDF 服务的完整部署方案。

---

## 📋 目录

- [快速开始](#快速开始)
- [部署方案对比](#部署方案对比)
- [MathMeow 项目集成](#mathmeow-项目集成)
- [独立部署](#独立部署)
- [生产环境部署](#生产环境部署)
- [发布到 Docker Hub](#发布到-docker-hub)
- [故障排查](#故障排查)

---

## 🚀 快速开始

### 方案选择

| 场景 | 推荐方案 | 启动命令 |
|------|---------|---------|
| MathMeow 项目使用 | 集成部署 | `docker-compose up -d` |
| 独立 PDF 服务 | Standalone | `docker-compose -f docker-compose.standalone.yaml up -d` |
| 多项目共用 | Docker Run | `docker run -d -p 3000:3000 markdown-to-pdf` |
| 开发测试 | 本地运行 | `npm start` |

---

## 📊 部署方案对比

### 方案 1: 集成到 MathMeow（推荐用于本项目）

**优点**：
- ✅ 一键启动所有服务
- ✅ 内网通信，性能最优
- ✅ 统一管理和监控
- ✅ 资源共享

**缺点**：
- ❌ 与项目耦合

**适用场景**：MathMeow 项目使用

**配置**：
```yaml
# docker-compose.yaml
services:
  markdown-to-pdf:
    build:
      context: ./remark-pdf
    networks:
      - default
      - shared
    # 不暴露端口，只在内网使用
```

**后端访问**：
```bash
# backend/.env
MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
```

---

### 方案 2: 独立 Docker Compose（推荐用于生产环境）

**优点**：
- ✅ 完全独立部署
- ✅ 可配置资源限制
- ✅ 支持持久化配置
- ✅ 易于监控和维护

**缺点**：
- ❌ 需要单独管理

**适用场景**：独立的 PDF 服务，供多个项目使用

**启动方式**：
```bash
cd remark-pdf
docker-compose -f docker-compose.standalone.yaml up -d
```

---

### 方案 3: Docker Run（推荐用于快速测试）

**优点**：
- ✅ 最简单的部署方式
- ✅ 快速启动和停止
- ✅ 适合临时测试

**缺点**：
- ❌ 没有自动重启
- ❌ 没有资源限制

**适用场景**：开发测试、快速验证

**启动方式**：
```bash
docker build -t markdown-to-pdf ./remark-pdf
docker run -d -p 3000:3000 --name md-to-pdf markdown-to-pdf
```

---

### 方案 4: 宿主机运行（不推荐生产环境）

**优点**：
- ✅ 调试方便

**缺点**：
- ❌ 环境依赖复杂
- ❌ 难以迁移
- ❌ 不易管理

**适用场景**：仅限本地开发

**启动方式**：
```bash
cd remark-pdf
npm install
npm start
```

---

## 🏗️ MathMeow 项目集成

### 1. 启动所有服务

```bash
# 在项目根目录
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看 PDF 服务日志
docker-compose logs -f markdown-to-pdf
```

### 2. 配置后端

```bash
# backend/.env
MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
```

### 3. 测试集成

```bash
# 健康检查（内网访问）
docker exec mathgpt-backend curl http://markdown-to-pdf:3000/health

# 或者从宿主机访问（如果暴露了端口）
curl http://localhost:3000/health
```

### 4. 前端使用

前端已经集成好，直接使用即可：

```typescript
// 导出聊天记录为 PDF
import { downloadChatAsPdfWithServer } from '$lib/utils/pdf';

await downloadChatAsPdfWithServer(chatData);
```

---

## 🔧 独立部署

### 适用场景

- 多个项目共用一个 PDF 服务
- 独立的微服务部署
- 需要单独管理和监控

### 部署步骤

#### 步骤 1: 准备配置文件

```bash
cd remark-pdf

# 使用独立的 docker-compose 配置
cp docker-compose.standalone.yaml docker-compose.yaml
```

#### 步骤 2: 自定义配置（可选）

编辑 `docker-compose.yaml`：

```yaml
services:
  markdown-to-pdf:
    ports:
      - "3000:3000"  # 修改端口
    environment:
      - PORT=3000
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '4'      # 增加 CPU
          memory: 2G     # 增加内存
```

#### 步骤 3: 启动服务

```bash
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### 步骤 4: 验证部署

```bash
# 使用测试脚本
chmod +x test-docker.sh
./test-docker.sh

# 或者手动测试
curl http://localhost:3000/health
```

---

## 🏢 生产环境部署

### 架构设计

```
Internet
    |
    v
[Nginx/Traefik]
    |
    v
[Markdown-to-PDF Service] (内网)
    |
    v
[Backend Services]
```

### 推荐配置

#### 1. Nginx 反向代理

```nginx
# /etc/nginx/sites-available/pdf-service

upstream pdf_backend {
    server localhost:3000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name pdf.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://pdf_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置（PDF 生成可能需要较长时间）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 请求大小限制
        client_max_body_size 10M;

        # 认证（可选）
        auth_basic "PDF Service";
        auth_basic_user_file /etc/nginx/.htpasswd;

        # 限流（可选）
        limit_req zone=pdf_limit burst=10 nodelay;
    }

    location /health {
        proxy_pass http://pdf_backend/health;
        auth_basic off;  # 健康检查不需要认证
    }
}

# 限流配置
http {
    limit_req_zone $binary_remote_addr zone=pdf_limit:10m rate=10r/s;
}
```

#### 2. Docker Compose 生产配置

```yaml
# docker-compose.prod.yaml
version: '3.8'

services:
  markdown-to-pdf:
    image: markdown-to-pdf:latest
    container_name: md-to-pdf-prod
    restart: always
    
    # 只监听 localhost（通过 Nginx 反向代理）
    ports:
      - "127.0.0.1:3000:3000"
    
    environment:
      - PORT=3000
      - NODE_ENV=production
    
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    
    # 增加共享内存
    shm_size: '2gb'
    
    # 健康检查
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # 安全选项
    security_opt:
      - no-new-privileges:true
    
    # 日志配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 3. 监控和告警

**使用 Docker 健康检查**：

```bash
# 检查健康状态
docker inspect --format='{{.State.Health.Status}}' md-to-pdf-prod

# 如果不健康，查看日志
docker logs md-to-pdf-prod
```

**集成 Prometheus（可选）**：

修改 `server.ts` 添加 metrics 端点：

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const pdfGenerationCounter = new promClient.Counter({
  name: 'pdf_generation_total',
  help: 'Total PDF generation requests',
  registers: [register]
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 🌐 发布到 Docker Hub

### 适用场景

- 供其他团队使用
- 开源项目
- 多环境部署

### 发布步骤

#### 1. 登录 Docker Hub

```bash
docker login
```

#### 2. 构建多架构镜像

```bash
# 启用 buildx
docker buildx create --use

# 构建并推送
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourusername/markdown-to-pdf:latest \
  -t yourusername/markdown-to-pdf:1.0.0 \
  --push \
  ./remark-pdf
```

#### 3. 添加 README 和标签

在 Docker Hub 上：
- 添加详细的 README
- 设置标签（latest, stable, 1.0.0 等）
- 配置自动构建（可选）

#### 4. 其他人使用

```bash
# 直接拉取使用
docker run -d -p 3000:3000 yourusername/markdown-to-pdf:latest

# 在 docker-compose 中使用
services:
  pdf-service:
    image: yourusername/markdown-to-pdf:latest
```

---

## 🐛 故障排查

### 问题 1: Chromium 启动失败

**症状**：
```
Error: Failed to launch the browser process
```

**解决方案**：
```yaml
# 增加共享内存
shm_size: '2gb'

# 或者使用 --shm-size
docker run -d --shm-size=2gb markdown-to-pdf
```

### 问题 2: 内存不足

**症状**：服务频繁重启或响应缓慢

**解决方案**：
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # 增加内存限制
```

### 问题 3: 数学公式渲染失败

**症状**：PDF 中数学公式显示为乱码或不显示

**解决方案**：
1. 检查 KaTeX CSS 是否正确加载
2. 检查 LaTeX 语法是否正确
3. 查看服务日志确认错误信息

```bash
docker logs -f md-to-pdf | grep -i katex
```

### 问题 4: 转换超时

**症状**：大文档转换失败

**解决方案**：
```nginx
# 增加 Nginx 超时
proxy_read_timeout 120s;
```

```typescript
// 增加 Puppeteer 超时
await page.goto(url, { timeout: 120000 });
```

### 问题 5: 字体缺失

**症状**：中文或其他语言显示为方块

**解决方案**：
```dockerfile
# 在 Dockerfile 中添加字体
RUN apk add --no-cache \
    ttf-dejavu \
    font-noto-cjk \
    fontconfig
```

---

## 📊 性能优化

### 1. 资源配置建议

| 文档复杂度 | CPU | 内存 | SHM |
|-----------|-----|------|-----|
| 简单文本 | 0.5核 | 512MB | 512MB |
| 含数学公式 | 1核 | 1GB | 1GB |
| 复杂文档 | 2核 | 2GB | 2GB |
| 高并发 | 4核 | 4GB | 2GB |

### 2. 并发控制

服务已内置浏览器实例复用，建议：
- 单实例：3-5 个并发请求
- 多实例：使用负载均衡

### 3. 缓存策略

对于相同内容的重复请求，可以添加 Redis 缓存：

```typescript
import Redis from 'ioredis';
const redis = new Redis();

app.post('/convert', async (req, res) => {
  const cacheKey = hash(req.body.markdown);
  
  let pdf = await redis.getBuffer(cacheKey);
  if (!pdf) {
    pdf = await markdownToPdfBuffer(req.body.markdown);
    await redis.setex(cacheKey, 3600, pdf);
  }
  
  res.end(pdf);
});
```

---

## 📝 总结

- **MathMeow 项目**：使用集成部署方案（`docker-compose up -d`）
- **独立服务**：使用 standalone 配置（`docker-compose -f docker-compose.standalone.yaml up -d`）
- **生产环境**：使用 Nginx 反向代理 + 资源限制 + 监控
- **开源发布**：发布到 Docker Hub 供他人使用

选择合适的方案，享受完美的 PDF 生成体验！🎉

