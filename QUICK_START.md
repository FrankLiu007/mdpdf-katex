# 快速开始指南

## 🚀 三种使用方式

### 1️⃣ HTTP Server + Web 界面（推荐）⭐

**最简单的方式，适合测试和生产使用**

```bash
# 安装依赖
npm install

# 启动服务器
npm run server
```

打开浏览器访问：**http://localhost:3000**

你会看到一个漂亮的 Web 界面，可以：
- 输入 Markdown 内容
- 实时预览
- 一键生成 PDF
- 测试数学公式和多语言

### 2️⃣ HTTP API（生产环境）

**适合集成到你的应用中**

```bash
# JSON 格式
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\n$E = mc^2$",
    "filename": "output.pdf",
    "options": {
      "pageFormat": "A4",
      "margin": {
        "top": "20mm",
        "right": "15mm",
        "bottom": "20mm",
        "left": "15mm"
      }
    }
  }' \
  -o output.pdf

# 纯文本格式（更简单）
curl -X POST http://localhost:3000/convert-text \
  -H "Content-Type: text/plain" \
  --data-binary "# Hello\n\n$E = mc^2$" \
  -o output.pdf
```

**Python 客户端示例：**

```python
import requests

markdown = """
# 测试文档

爱因斯坦质能方程：$E = mc^2$

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$
"""

response = requests.post('http://localhost:3000/convert', json={
    'markdown': markdown,
    'filename': 'output.pdf'
})

with open('output.pdf', 'wb') as f:
    f.write(response.content)

print(f"✅ PDF 生成成功！大小: {len(response.content)} bytes")
```

### 3️⃣ 作为库使用（Node.js）

**直接在你的 Node.js 代码中使用**

```typescript
import { markdownToPdf, markdownToPdfBuffer } from './pdf-generator-lib.js';

const markdown = `
# 测试文档

Einstein's equation: $E = mc^2$

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$
`;

// 方式 1: 生成文件
await markdownToPdf(markdown, 'output.pdf', {
  pageFormat: 'A4',
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  }
});

// 方式 2: 生成 Buffer（适合 HTTP 响应）
const pdfBuffer = await markdownToPdfBuffer(markdown);
res.send(pdfBuffer);
```

---

## 📐 Markdown 语法示例

### 数学公式

**行内公式：**
```markdown
Einstein's equation: $E = mc^2$
```

**块级公式：**
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**矩阵：**
```markdown
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$
```

### 表格

```markdown
| 特性 | 状态 | 说明 |
|------|------|------|
| 数学公式 | ✅ | KaTeX 完美支持 |
| 多语言 | ✅ | 中日韩俄等 |
| 表格 | ✅ | GitHub 风格 |
```

### 代码高亮

```markdown
\`\`\`javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
\`\`\`
```

### 多语言

```markdown
# 中文标题

质能方程：$E = mc^2$

## 日本語

オイラーの公式：$e^{i\pi} + 1 = 0$

## 한국어

피타고라스 정리：$a^2 + b^2 = c^2$
```

---

## 🎨 自定义配置

### PDF 选项

```typescript
interface PdfOptions {
  pageFormat?: 'A4' | 'Letter';  // 页面格式
  margin?: {                       // 页边距
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  displayHeaderFooter?: boolean;   // 是否显示页眉页脚
  headerTemplate?: string;          // 页眉 HTML
  footerTemplate?: string;          // 页脚 HTML
}
```

### 样式自定义

编辑 `pdf-generator-lib.ts` 中的 CSS：

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Microsoft YaHei', 'SimSun', Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #333;
}

h1 {
  font-size: 28pt;
  color: #2c3e50;
}
```

---

## ⚡ 性能优化

### 服务器会自动优化

- ✅ **重用 Browser 实例**：首次启动慢（~3-5s），后续快速（~1-3s）
- ✅ **资源拦截**：只加载必要资源，减小 PDF 文件大小
- ✅ **优雅关闭**：`Ctrl+C` 正确关闭浏览器

### 预期性能

- **简单文档**（< 100 字符）：~1-2 秒，< 50 KB
- **中等文档**（~500 字符）：~2-3 秒，50-200 KB
- **复杂文档**（> 1000 字符）：~3-5 秒，200-500 KB

参考：[PDF_OPTIMIZATION.md](PDF_OPTIMIZATION.md)

---

## 🐳 Docker 部署

```dockerfile
FROM node:22-alpine

# 安装 Chromium 依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-dejavu \
    ttf-liberation \
    font-noto-cjk

# 配置 Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "--loader", "tsx", "server.ts"]
```

**构建和运行：**

```bash
docker build -t markdown-pdf-api .
docker run -p 3000:3000 markdown-pdf-api
```

---

## 🔧 故障排查

### 服务器无法启动

**错误**：`tsx: command not found`

**解决**：
```bash
npm install
npm run server
```

### PDF 文件过大

**原因**：包含大量数学公式或复杂内容

**解决**：参考 [PDF_OPTIMIZATION.md](PDF_OPTIMIZATION.md)

### PDF 无法打开

**原因**：数据传输损坏（已修复）

**验证**：查看服务器日志和浏览器控制台

### Chromium 下载失败

**中国大陆用户**：

```bash
npm config set puppeteer_download_host=https://registry.npmmirror.com/-/binary/chromium-browser-snapshots/
npm install puppeteer
```

---

## 📚 更多文档

- **[API 文档](API_DOCUMENTATION.md)** - 完整的 API 参考
- **[优化指南](PDF_OPTIMIZATION.md)** - PDF 文件大小优化
- **[CHANGELOG](CHANGELOG.md)** - 版本变更历史
- **[Puppeteer vs pdfmake](PUPPETEER_VS_PDFMAKE.md)** - 技术选型对比

---

## ❓ 常见问题

**Q: 为什么选择 Puppeteer 而不是 pdfmake？**

A: Puppeteer 提供完美的数学公式渲染（KaTeX）和内置的多语言支持。虽然包体积大（300MB），但对于服务器端 API 完全可接受。

**Q: 支持哪些 Markdown 语法？**

A: 支持 GitHub Flavored Markdown (GFM)，包括表格、任务列表、删除线等。

**Q: 数学公式支持哪些？**

A: 支持所有 KaTeX 函数。参考：https://katex.org/docs/supported.html

**Q: 如何添加页眉页脚？**

A: 使用 `displayHeaderFooter` 和 `headerTemplate`/`footerTemplate` 选项。参考 API 文档。

---

**需要帮助？** 查看 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) 或提交 Issue。

