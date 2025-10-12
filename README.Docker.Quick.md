# 🐳 Docker 快速上手（5分钟）

选择你的使用场景，快速开始！

---

## 🎯 场景 1: 在 MathMeow 项目中使用

**在项目根目录执行**：

```bash
# 启动所有服务（包括 PDF 服务）
docker-compose up -d

# 查看 PDF 服务状态
docker-compose ps markdown-to-pdf

# 查看日志
docker-compose logs -f markdown-to-pdf

# 测试
curl http://localhost:3000/health
```

**配置后端**（`backend/.env`）：
```bash
MD_TO_PDF_API_URL=http://markdown-to-pdf:3000
```

✅ 完成！前端已自动集成，直接使用即可。

---

## 🎯 场景 2: 独立运行（任何项目都可以用）

### 方式 A: 使用 Docker Compose（推荐）

```bash
cd remark-pdf

# 启动服务
docker-compose -f docker-compose.standalone.yaml up -d

# 查看状态
docker-compose -f docker-compose.standalone.yaml ps

# 测试
curl http://localhost:3000/health
```

### 方式 B: 使用 Docker Run

```bash
cd remark-pdf

# 构建镜像
docker build -t markdown-to-pdf .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --name md-to-pdf \
  --restart unless-stopped \
  markdown-to-pdf

# 测试
curl http://localhost:3000/health
```

---

## 🧪 测试部署

### Linux/macOS:

```bash
cd remark-pdf
chmod +x test-docker.sh
./test-docker.sh
```

### Windows PowerShell:

```powershell
cd remark-pdf
.\test-docker.ps1
```

---

## 🔌 从其他项目使用

### Python

```python
import requests

response = requests.post(
    "http://localhost:3000/convert",
    json={"markdown": "# Test\n\n$E = mc^2$"}
)

with open("output.pdf", "wb") as f:
    f.write(response.content)
```

### JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Test\n\n$E = mc^2$' })
});

const blob = await response.blob();
// 下载或保存 PDF
```

### cURL

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o output.pdf
```

---

## 📊 常用命令

```bash
# 查看日志
docker logs -f md-to-pdf

# 重启服务
docker restart md-to-pdf

# 停止服务
docker stop md-to-pdf

# 删除容器
docker rm -f md-to-pdf

# 查看资源使用
docker stats md-to-pdf
```

---

## 🔧 配置选项

### 更改端口

```bash
docker run -d -p 8080:3000 markdown-to-pdf
```

### 限制资源

```bash
docker run -d \
  -p 3000:3000 \
  --cpus=2 \
  --memory=1g \
  --shm-size=1gb \
  markdown-to-pdf
```

---

## 📚 更多文档

- **[完整部署指南](./DEPLOYMENT.md)** - 详细的生产环境部署
- **[Docker 详细使用](./DOCKER_USAGE.md)** - API 使用和集成方案
- **[API 文档](./API_DOCUMENTATION.md)** - 完整的 API 参考

---

## ❓ 遇到问题？

1. **服务启动失败**：检查端口是否被占用 `netstat -an | grep 3000`
2. **内存不足**：增加 `--memory=2g` 参数
3. **Chromium 错误**：增加 `--shm-size=2gb` 参数
4. **查看详细错误**：`docker logs md-to-pdf`

---

**5 分钟部署完成！** 🎉

