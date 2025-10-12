# 🐳 Docker 部署方案总结

本文档是 Docker 部署的快速参考指南。详细文档请查看 [DOCKER_USAGE.md](./DOCKER_USAGE.md)。

---

## 🎯 三种部署方式

### 1️⃣ 独立运行（任何项目都可以用）

```bash
# 构建镜像
docker build -t markdown-to-pdf .

# 运行容器
docker run -d -p 3000:3000 --name md-to-pdf markdown-to-pdf

# 测试
curl http://localhost:3000/health
```

**适用场景**：
- 独立的 PDF 服务
- 多个项目共用一个实例
- 快速测试和开发

---

### 2️⃣ 独立 Docker Compose

```bash
# 使用独立配置文件
docker-compose -f docker-compose.standalone.yaml up -d

# 查看日志
docker-compose -f docker-compose.standalone.yaml logs -f

# 停止服务
docker-compose -f docker-compose.standalone.yaml down
```

**适用场景**：
- 需要持久化配置
- 需要资源限制
- 生产环境部署

---

### 3️⃣ 集成到 MathMeow 项目（或其他项目）

```yaml
# 在你的 docker-compose.yaml 中添加：
services:
  markdown-to-pdf:
    build:
      context: ./remark-pdf
      dockerfile: Dockerfile
    container_name: md-to-pdf
    restart: unless-stopped
    networks:
      - your-network
    # 内网访问，不暴露端口
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

**后端配置**：

```bash
# .env 文件
MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
```

**适用场景**：
- 与现有项目集成
- 微服务架构
- 内网通信，不暴露到公网

---

## 📊 性能参数

| 资源 | 推荐值 | 最小值 | 说明 |
|------|--------|--------|------|
| CPU | 2 核 | 0.5 核 | Chromium 渲染需要 |
| 内存 | 1GB | 512MB | 包含 Chromium 和缓存 |
| SHM | 1GB | 512MB | Chromium 共享内存 |
| 磁盘 | 500MB | 350MB | 镜像大小 |

---

## 🔗 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api` | GET | API 信息 |
| `/convert` | POST | JSON 格式转换 |
| `/convert-text` | POST | 纯文本转换 |
| `/` | GET | Web 测试界面 |

---

## 🚀 快速测试

```bash
# 健康检查
curl http://localhost:3000/health

# 转换测试
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n数学公式：$E = mc^2$"}' \
  -o test.pdf

# 查看生成的 PDF
open test.pdf  # macOS
xdg-open test.pdf  # Linux
start test.pdf  # Windows
```

---

## 🔒 生产环境建议

### ✅ 推荐配置

```yaml
markdown-to-pdf:
  image: markdown-to-pdf:latest
  restart: unless-stopped
  networks:
    - internal  # 只在内网使用
  # 不暴露端口到宿主机
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
  shm_size: '1gb'
  security_opt:
    - no-new-privileges:true
```

### ❌ 不推荐（安全风险）

```yaml
# 不要这样配置
ports:
  - "3000:3000"  # ❌ 暴露到公网
```

### ✅ 正确的公网访问方式

**使用 Nginx 反向代理**：

```nginx
location /api/pdf/ {
    proxy_pass http://markdown-to-pdf:3000/;
    proxy_set_header Host $host;
    
    # 添加认证
    auth_basic "PDF Service";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # 限流
    limit_req zone=pdf_limit burst=5 nodelay;
}
```

---

## 🐛 常见问题

### Q: Chromium 启动失败？

**A**: 增加共享内存

```yaml
shm_size: '1gb'
```

### Q: 内存占用过高？

**A**: 添加资源限制

```yaml
deploy:
  resources:
    limits:
      memory: 1G
```

### Q: 字体显示异常？

**A**: 检查 Dockerfile 中的字体安装

```dockerfile
RUN apk add --no-cache ttf-dejavu font-noto-cjk
```

### Q: 如何查看日志？

```bash
docker logs -f md-to-pdf
```

---

## 📚 更多文档

- **[完整 Docker 使用指南](./DOCKER_USAGE.md)** - 详细配置和集成方案
- **[API 文档](./API_DOCUMENTATION.md)** - API 接口说明
- **[快速开始](./QUICK_START.md)** - 快速上手指南

---

## 🎉 特性一览

- ✅ **独立部署** - 不依赖其他服务
- ✅ **通用复用** - 任何项目都可以使用
- ✅ **完美数学公式** - KaTeX 渲染
- ✅ **多语言支持** - 中日韩俄阿等
- ✅ **RESTful API** - 标准接口
- ✅ **健康检查** - 自动监控
- ✅ **优雅关闭** - 安全重启
- ✅ **资源控制** - 防止过载

---

**开始使用吧！** 🚀

