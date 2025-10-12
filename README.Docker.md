# 🐳 Docker 部署指南

Markdown to PDF 服务的 Docker 部署详细说明。

---

## 🎯 部署方式

### 1. Docker Compose（推荐）

```bash
docker-compose -f docker-compose.standalone.yaml up -d
```

**优点**：
- 配置持久化
- 资源限制
- 健康检查
- 自动重启

### 2. Docker Run

```bash
docker build -t markdown-to-pdf .
docker run -d -p 4000:3000 --name md-to-pdf markdown-to-pdf
```

**优点**：
- 灵活的端口配置
- 单命令启动
- 适合快速测试

### 3. 集成到现有项目

在你的 `docker-compose.yaml` 中添加：

```yaml
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
```

后端配置（`.env`）：

```bash
MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
```

---

## 🔧 端口配置

### 默认配置

- **容器内部**：始终使用 `3000`
- **主机端口**：可自定义（默认 `4000`）

### 修改端口

编辑 `docker-compose.standalone.yaml`：

```yaml
ports:
  - "8080:3000"  # 主机:容器
```

或使用环境变量：

```bash
docker run -d -p ${HOST_PORT}:3000 markdown-to-pdf
```

---

## 📊 资源配置

### 推荐配置

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M

shm_size: '1gb'  # Chromium 需要
```

### 最小配置

| 资源 | 最小值 | 推荐值 |
|------|--------|--------|
| CPU | 0.5 核 | 2 核 |
| 内存 | 512MB | 1GB |
| SHM | 512MB | 1GB |

---

## 🔒 生产环境

### 安全配置

```yaml
services:
  markdown-to-pdf:
    # 只在内网使用，不暴露端口
    networks:
      - internal
    
    # 安全选项
    security_opt:
      - no-new-privileges:true
    
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    
    # 共享内存
    shm_size: '1gb'
```

### Nginx 反向代理

```nginx
location /api/pdf/ {
    proxy_pass http://markdown-to-pdf:3000/;
    proxy_set_header Host $host;
    
    # 认证
    auth_basic "PDF Service";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # 限流
    limit_req zone=pdf_limit burst=5;
}
```

---

## 🧪 测试部署

### 健康检查

```bash
curl http://localhost:4000/health
```

期望输出：

```json
{"status":"ok","service":"markdown-to-pdf","timestamp":"..."}
```

### 生成 PDF

```bash
curl -X POST http://localhost:4000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o test.pdf
```

---

## 📝 常用命令

```bash
# 启动
docker-compose -f docker-compose.standalone.yaml up -d

# 查看日志
docker-compose -f docker-compose.standalone.yaml logs -f

# 重启
docker-compose -f docker-compose.standalone.yaml restart

# 停止
docker-compose -f docker-compose.standalone.yaml down

# 查看状态
docker-compose -f docker-compose.standalone.yaml ps

# 查看资源
docker stats markdown-to-pdf
```

---

## 🐛 故障排查

### Q: Chromium 启动失败？

**A**: 增加共享内存

```yaml
shm_size: '1gb'
```

### Q: 端口冲突？

**A**: 修改主机端口

```yaml
ports:
  - "8080:3000"
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

**A**: 检查 Dockerfile 中的字体安装（已预装 ttf-dejavu）

### Q: 如何查看详细错误？

```bash
docker logs -f md-to-pdf
```

---

## 🎉 完成

现在你的 PDF 服务已经运行了！

**测试一下**：

```bash
curl http://localhost:4000/health
```

**更多文档**：
- [DEPLOYMENT.md](DEPLOYMENT.md) - 构建与部署详解
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API 接口文档
